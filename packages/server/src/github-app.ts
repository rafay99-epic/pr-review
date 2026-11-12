// GitHub App auth: a short-lived JWT signed with the App's private key for /app endpoints,
// and a fresh installation token for each review run.

import { createSign } from "node:crypto";
import { type } from "arktype";

const Token = type({ token: "string" });
const App = type({ slug: "string" });
/** `id` stays a string: delivery ids are past Number.MAX_SAFE_INTEGER (see redeliverFailed). */
const Delivery = type({ id: "string", guid: "string", delivered_at: "string", status_code: "number", event: "string" });
export type Delivery = typeof Delivery.infer;

/** Events the server acts on; failed deliveries of others are not worth redelivering. */
const EVENTS = new Set(["pull_request", "issue_comment"]);

/**
 * Deliveries to ask GitHub for again: the newest attempt of each delivery (by guid) of an event
 * we act on, sent since `since`, whose every attempt timed out (status 0) or got a 5xx. One the
 * server answered with a 2xx or 4xx was handled or refused on purpose. GitHub never retries.
 */
export function failedDeliveries(list: readonly Delivery[], since: number): Delivery[] {
  // Every attempt of a delivery counts, even ones before the window: one that ever got through
  // or was refused is done. The window only limits which deliveries are still worth resending.
  const attempts = new Map<string, Delivery[]>();
  for (const d of list) {
    if (EVENTS.has(d.event)) attempts.set(d.guid, [...(attempts.get(d.guid) ?? []), d]);
  }
  return [...attempts.values()]
    .filter((tries) => tries.every((t) => t.status_code === 0 || t.status_code >= 500))
    .map((tries) => tries.reduce((a, b) => (BigInt(a.id) > BigInt(b.id) ? a : b)))
    .filter((newest) => Date.parse(newest.delivered_at) >= since);
}

const b64url = (text: string) => Buffer.from(text).toString("base64url");

export function createApp(appId: string, privateKey: string) {
  function jwt() {
    const now = Math.floor(Date.now() / 1000);
    // Backdated a minute for clock drift; GitHub caps the lifetime at ten minutes.
    const unsigned = `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId }))}`;
    return `${unsigned}.${createSign("RSA-SHA256").update(unsigned).sign(privateKey, "base64url")}`;
  }

  const request = (method: string, path: string) =>
    fetch(`https://api.github.com${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${jwt()}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "reviewpilot",
      },
      signal: AbortSignal.timeout(30_000),
    });

  async function call<S extends type.Any>(schema: S, method: string, path: string): Promise<S["infer"]> {
    const res = await request(method, path);
    if (!res.ok) throw new Error(`GitHub ${method} ${path}: ${res.status} ${(await res.text()).slice(0, 300)}`);
    return schema.assert(await res.json());
  }

  let login: string | undefined;

  return {
    /** A fresh installation token for one run. It lives an hour, so runs are capped below that. */
    token: async (installation: number) => (await call(Token, "POST", `/app/installations/${installation}/access_tokens`)).token,

    /** The login the App posts as, e.g. `reviewpilot[bot]`. */
    async login(): Promise<string> {
      login ??= `${(await call(App, "GET", "/app")).slug}[bot]`;
      return login;
    },

    /**
     * Asks GitHub to send again the deliveries that failed since `since`, such as the one that
     * woke a stopped machine before the server was listening. Returns how many were resent and
     * how many GitHub refused (a refused one is tried again next round).
     */
    async redeliverFailed(since: number): Promise<{ resent: number; refused: number }> {
      // Newest first, a page at a time, back to `since` (capped: a busier window than this has
      // bigger problems than a lost delivery).
      const list: Delivery[] = [];
      let path: string | undefined = "/app/hook/deliveries?per_page=100";
      for (let page = 0; path && page < 10; page++) {
        const res = await request("GET", path);
        if (!res.ok) throw new Error(`GitHub GET deliveries: ${res.status}`);
        // Ids are read from the JSON source text: as numbers they would round to another delivery.
        const raw: unknown = JSON.parse(await res.text(), (k, v: unknown, ctx?: { source?: string }) => (k === "id" && typeof v === "number" ? (ctx?.source ?? String(v)) : v));
        const batch = Delivery.array().assert(raw);
        list.push(...batch);
        const oldest = batch.at(-1);
        const next = /<https:\/\/api\.github\.com([^>]+)>;\s*rel="next"/.exec(res.headers.get("link") ?? "")?.[1];
        path = oldest && Date.parse(oldest.delivered_at) >= since ? next : undefined;
      }
      // One refused resend does not stop the others; each is tried again next round.
      const failed = failedDeliveries(list, since);
      const results = await Promise.all(failed.map((d) => request("POST", `/app/hook/deliveries/${d.id}/attempts`).then((r) => r.ok, () => false)));
      const refused = results.filter((ok) => !ok).length;
      return { resent: failed.length - refused, refused };
    },
  };
}

const Pull = type({ head: { sha: "string" } });

/** Repo calls the server makes itself with an installation token, before any review runs. */
export function repoApi(token: string, repo: string) {
  const request = (method: string, path: string, init: { accept?: string; body?: unknown } = {}) =>
    fetch(`https://api.github.com/repos/${repo}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: init.accept ?? "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "reviewpilot",
      },
      ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
      signal: AbortSignal.timeout(30_000),
    });

  return {
    /** A file on the default branch, or undefined when it does not exist. */
    async file(path: string): Promise<string | undefined> {
      const res = await request("GET", `/contents/${path}`, { accept: "application/vnd.github.raw+json" });
      if (res.status === 404) return undefined;
      if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status}`);
      return res.text();
    },

    headSha: async (number: number) => {
      const res = await request("GET", `/pulls/${number}`);
      if (!res.ok) throw new Error(`GitHub GET pull ${number}: ${res.status}`);
      return Pull.assert(await res.json()).head.sha;
    },

    /** Marks the commit as blocked on setup: the ReviewPilot check, finished as action required. */
    async blocked(sha: string, title: string, summary: string, detailsUrl: string) {
      const res = await request("POST", "/check-runs", {
        body: { name: "ReviewPilot", head_sha: sha, status: "completed", conclusion: "action_required", details_url: detailsUrl, output: { title, summary } },
      });
      if (!res.ok) throw new Error(`GitHub POST check-runs: ${res.status}`);
    },
  };
}
