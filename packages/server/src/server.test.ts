import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { createQueue, type Job } from "./queue.ts";
import { toJob, verify } from "./webhook.ts";

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
  const all = new Set<string>();
  assert.deepEqual(toJob("pull_request", pr(), all), { repo: "me/app", number: 3, installation: 7, event: "pull_request", payload: pr(), debounce: true });
  assert.equal(toJob("pull_request", pr({ draft: true }), all), undefined);
  assert.equal(toJob("pull_request", pr({ user: { login: "teammate", type: "User" } }), all)?.repo, "me/app");
  assert.equal(toJob("pull_request", pr({ user: { login: "dependabot[bot]", type: "Bot" } }), all), undefined);
  assert.equal(toJob("pull_request", pr({ head: { repo: { full_name: "fork/app" } } }), all), undefined);
  assert.equal(toJob("pull_request", { ...pr(), action: "closed" }, all), undefined);
  assert.equal(toJob("issue_comment", comment("/review"), all)?.debounce, false);
  assert.equal(toJob("issue_comment", comment("/reviewer"), all), undefined);
  assert.equal(toJob("issue_comment", comment("/review", "COLLABORATOR"), all)?.repo, "me/app");
  assert.equal(toJob("issue_comment", comment("/review", "CONTRIBUTOR"), all), undefined);
  assert.equal(toJob("pull_request", pr(), new Set(["me/other"])), undefined);
  assert.equal(toJob("pull_request", pr(), new Set(["me/app"]))?.repo, "me/app");
  assert.equal(toJob("pull_request", pr(), new Set(["me/*"]))?.repo, "me/app");
  assert.equal(toJob("pull_request", pr(), new Set(["other/*"])), undefined);
  assert.equal(toJob("ping", {}, all), undefined);
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
