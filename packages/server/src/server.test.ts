import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { createQueue, type Job } from "./queue.ts";
import { constants, generateKeyPairSync, publicEncrypt } from "node:crypto";
import { chooseKey, ownerOf, seal, sealedKeyOf, unseal } from "./model-key.ts";
import { failedDeliveries } from "./github-app.ts";
import { allowedRepo, toJob, verify } from "./webhook.ts";

const repository = { full_name: "me/app", owner: { login: "me" } };
const installation = { id: 7 };
const pr = (over: object = {}) => ({
  action: "synchronize",
  installation,
  repository,
  pull_request: { number: 3, draft: false, user: { login: "me", type: "User" }, head: { repo: { full_name: "me/app" } }, ...over },
});
const comment = (body: string, association = "OWNER") => ({
  action: "created",
  installation,
  repository,
  issue: { number: 3, state: "open", pull_request: {} },
  comment: { body, author_association: association, user: { login: "me" } },
});

test("verify accepts only GitHub's HMAC of the exact body", () => {
  const body = Buffer.from('{"a":1}');
  const sig = `sha256=${createHmac("sha256", "s3cret").update(body).digest("hex")}`;
  assert.equal(verify("s3cret", body, sig), true);
  assert.equal(verify("other", body, sig), false);
  assert.equal(verify("s3cret", Buffer.from('{"a":2}'), sig), false);
  assert.equal(verify("s3cret", body, undefined), false);
});

test("toJob reviews non-draft, non-fork PRs by people, and /review from maintainers", () => {
  assert.deepEqual(toJob("pull_request", pr()), { repo: "me/app", number: 3, installation: 7, event: "pull_request", payload: pr(), debounce: true });
  assert.equal(toJob("pull_request", pr({ draft: true })), undefined);
  assert.equal(toJob("pull_request", pr({ user: { login: "teammate", type: "User" } }))?.repo, "me/app");
  assert.equal(toJob("pull_request", pr({ user: { login: "dependabot[bot]", type: "Bot" } })), undefined);
  assert.equal(toJob("pull_request", pr({ head: { repo: { full_name: "fork/app" } } })), undefined);
  assert.equal(toJob("pull_request", { ...pr(), action: "closed" }), undefined);
  assert.equal(toJob("issue_comment", comment("/review"))?.debounce, false);
  assert.equal(toJob("issue_comment", comment("/reviewer")), undefined);
  assert.equal(toJob("issue_comment", comment("/review", "COLLABORATOR"))?.repo, "me/app");
  assert.equal(toJob("issue_comment", comment("/review", "CONTRIBUTOR")), undefined);
  assert.equal(toJob("ping", {}), undefined);
});

test("allowedRepo matches owner/repo and owner/* entries, empty for all", () => {
  assert.equal(allowedRepo(new Set(), "me/app"), true);
  assert.equal(allowedRepo(new Set(["me/app"]), "Me/App"), true);
  assert.equal(allowedRepo(new Set(["me/*"]), "me/app"), true);
  assert.equal(allowedRepo(new Set(["me/other", "other/*"]), "me/app"), false);
});

const me = { login: "me", id: 42 };
const keys = () => generateKeyPairSync("rsa", { modulusLength: 2048 });

test("a sealed key opens only on its server, for its account id, toward a plain https provider", () => {
  const { publicKey, privateKey } = keys();
  const sealFor = (over: object = {}) => seal(publicKey, { v: 1, owner: "me", owner_id: 42, key: "sk-1", base_url: "https://api.example.com/v1", ...over });
  assert.deepEqual(unseal(privateKey, sealFor(), me), { key: "sk-1", baseUrl: "https://api.example.com/v1" });
  // A renamed account keeps its id; a new account that takes the old login does not.
  assert.equal("key" in unseal(privateKey, sealFor(), { login: "me-renamed", id: 42 }), true);
  assert.match(String(Object.values(unseal(privateKey, sealFor(), { login: "me", id: 7 }))[0]), /a different account that was named me/);
  assert.match(String(Object.values(unseal(privateKey, sealFor(), { login: "you", id: 7 }))[0]), /belongs to me, not you/);
  // The claimed login is sealer-written: it cannot smuggle line breaks into logs or checks.
  assert.match(String(Object.values(unseal(privateKey, sealFor({ owner: "x\n[me/app#1] cloned" }), { login: "you", id: 7 }))[0]), /belongs to xmeapp1cloned, not you/);
  assert.deepEqual(unseal(privateKey, seal(publicKey, { v: 1, owner: "me", owner_id: 42, key: "sk-1" }), me), { key: "sk-1" });
  assert.ok("missing" in unseal(keys().privateKey, sealFor(), me));
  assert.ok("missing" in unseal(privateKey, "not base64 at all", me));
  for (const base_url of ["http://api.example.com", "https://api.example.com@evil.test/v1", "https://u:p@evil.test", "not a url"]) {
    assert.ok("missing" in unseal(privateKey, sealFor({ base_url }), me), base_url);
  }
  const raw = (text: string) => publicEncrypt({ key: publicKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" }, Buffer.from(text)).toString("base64");
  assert.match(String(Object.values(unseal(privateKey, raw("not json"), me))[0]), /expected format/);
  assert.match(String(Object.values(unseal(privateKey, raw('{"v":1,"owner":"me","key":"sk-1"}'), me))[0]), /expected format/);
});

test("chooseKey: a sealed key wins, a refused one never falls back, REPOS gates the server key", () => {
  const { publicKey, privateKey } = keys();
  const sealed = seal(publicKey, { v: 1, owner: "me", owner_id: 42, key: "sk-own" });
  const base = { sealKey: privateKey, apiKey: "sk-server", repos: new Set(["me/*"]), repo: "me/app", owner: me };
  assert.deepEqual(chooseKey({ ...base, sealed }), { key: "sk-own" });
  assert.ok("missing" in chooseKey({ ...base, sealed, sealKey: undefined }));
  // A broken sealed_key never falls back to the server's key, even in a REPOS repo.
  assert.match(String(Object.values(chooseKey({ ...base, sealed: { unreadable: "broken" } }))[0]), /broken/);
  assert.ok("missing" in chooseKey({ ...base, sealed: seal(keys().publicKey, { v: 1, owner: "me", owner_id: 42, key: "x" }) }));
  assert.deepEqual(chooseKey({ ...base, sealed: undefined }), { key: "sk-server" });
  assert.ok("missing" in chooseKey({ ...base, sealed: undefined, repo: "stranger/app", owner: { login: "stranger", id: 9 } }));
  assert.ok("missing" in chooseKey({ ...base, sealed: undefined, apiKey: undefined }));
});

test("failedDeliveries picks recent deliveries that only ever timed out or got a 5xx", () => {
  const at = (min: number) => new Date(Date.UTC(2026, 0, 1, 0, min)).toISOString();
  const d = (id: string, guid: string, status_code: number, min: number, event = "pull_request") => ({ id, guid, status_code, event, delivered_at: at(min) });
  const since = Date.parse(at(10));
  const picked = failedDeliveries(
    [
      d("3853587865764110336", "a", 500, 12), // timed out once: redeliver
      d("2", "b", 502, 12), d("3", "b", 202, 13), // failed, then a redelivery worked: skip
      d("3853587865764110400", "c", 502, 12), d("3853587865764110401", "c", 0, 14), // failed twice: newest attempt, ids beyond 2^53
      d("6", "e", 502, 5), // too old
      d("7", "f", 502, 12, "installation"), // not an event we act on
      d("8", "g", 202, 12, "issue_comment"), // delivered
      d("9", "h", 401, 12), // refused on purpose (bad signature): never resent
      d("10", "i", 202, 5), d("11", "i", 502, 12), // got through before the window: done
      d("12", "j", 502, 11), d("13", "j", 502, 12), d("14", "j", 0, 13), d("15", "j", 502, 14), // failed 4 times: left alone
    ],
    since,
  );
  assert.deepEqual(picked.map((p) => p.id).sort(), ["3853587865764110336", "3853587865764110401"]);
});

test("ownerOf reads the repo owner's login and id from a webhook payload", () => {
  assert.deepEqual(ownerOf({ repository: { full_name: "me/app", owner: { login: "me", id: 42, type: "User" } } }), { login: "me", id: 42 });
  assert.equal(ownerOf({ repository: { full_name: "me/app", owner: { login: "me" } } }), undefined);
  assert.equal(ownerOf({}), undefined);
});

test("sealedKeyOf reads sealed_key from the config, ignoring line breaks", () => {
  assert.equal(sealedKeyOf("sealed_key: |\n  abc\n  def\nreview:\n  scope: all\n"), "abcdef");
  assert.equal(sealedKeyOf("review:\n  scope: all\n"), undefined);
  // Present but unreadable is null, so it is reported rather than treated as missing.
  assert.match(String(Object.values(sealedKeyOf("sealed_key: [1]") ?? {})[0]), /not a sealed key/);
  assert.match(String(Object.values(sealedKeyOf("sealed_key:\n") ?? {})[0]), /not a sealed key/);
  assert.match(String(Object.values(sealedKeyOf("sealed_key: |\n  abc\n bad: [indent") ?? {})[0]), /not valid YAML/);
  assert.equal(sealedKeyOf(": not yaml : :"), undefined);
  assert.match(String(Object.values(sealedKeyOf(`sealed_key: ${"A".repeat(2000)}`) ?? {})[0]), /not a sealed key/);
  assert.match(String(Object.values(sealedKeyOf(`sealed_key: x\npad: "${"a".repeat(300_000)}"`) ?? {})[0]), /too large/);
  assert.match(String(Object.values(sealedKeyOf(`pad: "${"a".repeat(300_000)}"\nsealed_key: x`) ?? {})[0]), /too large/);
  // Only a top-level sealed_key counts when the file cannot be parsed.
  assert.equal(sealedKeyOf(`instructions: |\n  sealed_key: is a field\n bad: [indent`), undefined);
  assert.equal(sealedKeyOf(undefined), undefined);
});

const job = (number: number, debounce = true, repo = "me/app"): Job => ({ repo, number, installation: 7, event: "pull_request", payload: {}, debounce });
const tick = () => new Promise((r) => setImmediate(r));

test("pushes inside the debounce collapse into one run, and a push during a run stops it", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const log: string[] = [];
  const finish = new Map<number, () => void>();
  let n = 0;
  const queue = createQueue({
    debounceMs: 1000,
    maxRuns: 2,
    run: () => {
      const id = ++n;
      log.push(`start ${id}`);
      const done = new Promise<void>((r) => finish.set(id, r));
      return { done, stop: () => (log.push(`stop ${id}`), finish.get(id)?.()) };
    },
  });

  queue.schedule(job(3));
  t.mock.timers.tick(500);
  queue.schedule(job(3));
  t.mock.timers.tick(999);
  assert.deepEqual(log, []);
  t.mock.timers.tick(1);
  assert.deepEqual(log, ["start 1"]);

  queue.schedule(job(3));
  assert.deepEqual(log, ["start 1", "stop 1"]);
  await tick();
  t.mock.timers.tick(1000);
  assert.deepEqual(log, ["start 1", "stop 1", "start 2"]);
  finish.get(2)?.();
  await tick();
  assert.equal(queue.idle(), true);
});

test("one review per repo at a time; /review skips the debounce", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const started: number[] = [];
  const finish: (() => void)[] = [];
  const queue = createQueue({
    debounceMs: 1000,
    maxRuns: 3,
    run: (j) => {
      started.push(j.number);
      return { done: new Promise<void>((r) => finish.push(r)), stop: () => {} };
    },
  });
  queue.schedule(job(1, false));
  queue.schedule(job(2, false));
  queue.schedule(job(9, false, "me/lib"));
  t.mock.timers.tick(0);
  assert.deepEqual(started, [1, 9]);
  finish[0]?.();
  await tick();
  assert.deepEqual(started, [1, 9, 2]);
});

test("a push never downgrades a pending or running /review to a changed-files review", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const started: Job[] = [];
  const finish: (() => void)[] = [];
  const queue = createQueue({
    debounceMs: 1000,
    maxRuns: 2,
    run: (j) => {
      started.push(j);
      return { done: new Promise<void>((r) => finish.push(r)), stop: () => finish.at(-1)?.() };
    },
  });
  const review: Job = { ...job(3, false), event: "issue_comment" };
  queue.schedule({ ...job(9, false, "me/busy") });
  queue.schedule({ ...job(8, false, "me/busy2") });
  queue.schedule(review);
  t.mock.timers.tick(0);
  // /review is waiting for a slot; a push arrives and replaces it, but stays a full review.
  queue.schedule(job(3));
  t.mock.timers.tick(1000);
  finish[0]?.();
  await tick();
  assert.equal(started.at(-1)?.event, "issue_comment");
  assert.equal(started.at(-1)?.number, 3);
  // A push during that running /review restarts it, still as a full review.
  queue.schedule(job(3));
  await tick();
  t.mock.timers.tick(1000);
  finish[1]?.();
  await tick();
  assert.equal(started.at(-1)?.event, "issue_comment");
});
