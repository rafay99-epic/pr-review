// GitHub App auth: a short-lived JWT signed with the App's private key for /app endpoints,
// and a fresh installation token for each review run.

import { createSign } from "node:crypto";
import { type } from "arktype";

const Token = type({ token: "string" });
const App = type({ slug: "string" });

const b64url = (text: string) => Buffer.from(text).toString("base64url");

export function createApp(appId: string, privateKey: string) {
  function jwt() {
    const now = Math.floor(Date.now() / 1000);
    // Backdated a minute for clock drift; GitHub caps the lifetime at ten minutes.
    const unsigned = `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId }))}`;
    return `${unsigned}.${createSign("RSA-SHA256").update(unsigned).sign(privateKey, "base64url")}`;
  }

  async function call<S extends type.Any>(schema: S, method: string, path: string): Promise<S["infer"]> {
    const res = await fetch(`https://api.github.com${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${jwt()}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "reviewpilot",
      },
      signal: AbortSignal.timeout(30_000),
    });
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
  };
}
