import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULTS, ignored, loadConfig, rulesFor } from "./config.ts";
import { anchor, type FileDiff, parseDiff, unquote } from "./diff.ts";
import { checkResult, clean } from "./render.ts";
import { chunk, focus, settle, stale } from "./review.ts";
import { diffHash, findingTag, fingerprint, postedOnHead, readState, score, STATE_BUDGET, writeState } from "./state.ts";

const DIFF = `diff --git a/src/a.ts b/src/a.ts
index 1..2 100644
--- a/src/a.ts
+++ b/src/a.ts
@@ -10,3 +10,4 @@ export function a() {
 const x = 1;
-const y = 2;
+const y = 3;
+const z = 4;
 return x;
@@ -40,2 +41,2 @@
 keep();
+tail();
diff --git a/old.ts b/new.ts
similarity index 90%
rename from old.ts
rename to new.ts
`;

test("parseDiff tracks new-side lines and hunks", () => {
  const [a, renamed] = parseDiff(DIFF);
  assert.equal(a?.path, "src/a.ts");
  assert.deepEqual([...(a?.commentable ?? [])], [10, 11, 12, 13, 41, 42]);
  assert.equal(a?.hunkOf.get(13), 0);
  assert.equal(a?.hunkOf.get(41), 1);
  assert.match(a?.numbered ?? "", /^\s+11 \+ const y = 3;$/m);
  assert.match(a?.numbered ?? "", /^\s+- const y = 2;$/m);
  assert.equal(renamed?.path, "new.ts");
  assert.equal(renamed?.status, "renamed");
});

test("anchor keeps comments inside one hunk and drops lines outside the diff", () => {
  const [a] = parseDiff(DIFF);
  assert.deepEqual(anchor(a, 11, 12), { line: 12, startLine: 11 });
  assert.deepEqual(anchor(a, 12, 41), { line: 41 });
  assert.deepEqual(anchor(a, 30, 30), undefined);
  assert.deepEqual(anchor(a, 30, 41), { line: 41 });
  // A range ending on unchanged code anchors on its last changed line.
  assert.deepEqual(anchor(a, 11, 20), { line: 13, startLine: 11 });
});

test("score comes from severities only", () => {
  assert.equal(score([]), 5);
  assert.equal(score([{ severity: "minor" }]), 4);
  assert.equal(score([{ severity: "minor" }, { severity: "major" }]), 3);
  assert.equal(score([{ severity: "critical" }, { severity: "major" }]), 2);
  assert.equal(score([{ severity: "critical" }, { severity: "critical" }]), 1);
});

test("fingerprint ignores case and punctuation in the title", () => {
  assert.equal(
    fingerprint({ file: "a.ts", title: "Draft leaks across accounts!" }),
    fingerprint({ file: "a.ts", title: "draft leaks  across accounts" }),
  );
  assert.notEqual(fingerprint({ file: "a.ts", title: "x" }), fingerprint({ file: "b.ts", title: "x" }));
});

test("state round-trips through the summary marker", () => {
  const state = { head: "abc", score: 4 as const, findings: [] };
  assert.deepEqual(readState(`# Summary\n${writeState(state)}\n`), state);
  assert.equal(readState("no marker"), undefined);
});

test("config falls back to defaults and reports errors", () => {
  assert.deepEqual(loadConfig(undefined).config, DEFAULTS);
  const bad = loadConfig("review:\n  max_findings: -1\n");
  assert.deepEqual(bad.config, DEFAULTS);
  assert.match(bad.warning ?? "", /max_findings/);
  const { config } = loadConfig(
    "model:\n  name: zai-org/glm-5.3\nreview:\n  ignore: ['docs/**']\nrules:\n  - id: types\n    rule: no any\n    paths: ['apps/**']\n",
  );
  assert.equal(config.model.name, "zai-org/glm-5.3");
  assert.equal(config.model.verify, DEFAULTS.model.verify);
  assert.ok(ignored(config, "docs/a.md") && ignored(config, "pnpm-lock.yaml") && !ignored(config, "src/a.ts"));
  assert.equal(rulesFor(config, ["apps/mobile/x.ts"]).length, 1);
  assert.equal(rulesFor(config, ["packages/x.ts"]).length, 0);
});

test("chunk packs files up to the size and keeps a large file on its own", () => {
  const file = (path: string, n: number): FileDiff => ({ path, status: "modified", commentable: new Set(), hunkOf: new Map(), numbered: "x".repeat(n) });
  const parts = chunk([file("a", 40), file("b", 40), file("big", 500), file("c", 10)], 100);
  assert.deepEqual(parts.map((p) => p.map((f) => f.path)), [["a", "b"], ["big"], ["c"]]);
});

test("settle moves the whole range when the verifier corrects the line", () => {
  const finding = { file: "a.ts", line: 100, endLine: 105, severity: "major" as const, title: "t", body: "b", evidence: ["a.ts:100: x"] };
  const verdict = { verdict: "confirmed" as const, reason: "r", evidence: [], severity: "minor" as const };
  assert.deepEqual([settle(finding, { ...verdict, line: 30 }).line, settle(finding, { ...verdict, line: 30 }).endLine], [30, 30]);
  assert.deepEqual([settle(finding, { ...verdict, line: 30, end_line: 34 }).line, settle(finding, { ...verdict, line: 30, end_line: 34 }).endLine], [30, 34]);
  assert.deepEqual([settle(finding, verdict).line, settle(finding, verdict).endLine], [100, 105]);
  assert.deepEqual(settle(finding, verdict).evidence, finding.evidence);
});

test("parseDiff takes the path from the +++ line, spaces included", () => {
  const [f] = parseDiff("diff --git a/my file.ts b/my file.ts\nindex 1..2 100644\n--- a/my file.ts\n+++ b/my file.ts\n@@ -1 +1 @@\n-a\n+b\n");
  assert.equal(f?.path, "my file.ts");
});

test("parseDiff keeps hunk lines that look like file headers", () => {
  const [f] = parseDiff("diff --git a/q.sql b/q.sql\n--- a/q.sql\n+++ b/q.sql\n@@ -1,2 +1,2 @@\n--- old comment\n+++ new comment\n select 1;\n");
  assert.equal(f?.path, "q.sql");
  assert.match(f?.numbered ?? "", /^\s+1 \+ \+\+ new comment$/m);
  assert.match(f?.numbered ?? "", /^\s+- -- old comment$/m);
  assert.deepEqual([...(f?.commentable ?? [])], [1, 2]);
});

test("model text cannot plant a state marker, and only the last marker is read", () => {
  const forged = writeState({ head: "evil", score: 5, findings: [] });
  const real = { head: "abc", score: 3 as const, findings: [] };
  assert.equal(clean(`see ${forged} here`).includes("<!--"), false);
  // Even if a marker slipped in earlier in the body, the real one at the end wins.
  assert.deepEqual(readState(`${forged}\n| row |\n${writeState(real)}`), real);
});

test("writeState stays inside its budget however many findings there are", () => {
  const finding = (i: number) => ({
    file: `src/f${i}.ts`, line: i + 1, endLine: i + 1, severity: "major" as const, title: "t".repeat(300),
    body: "b".repeat(5000), evidence: Array.from({ length: 10 }, () => "e".repeat(500)), fp: i.toString(16).padStart(12, "0"),
    status: (i % 2 ? "open" : "fixed") as "open" | "fixed",
  });
  // Far past any real PR (max_findings is capped at 50): the budget holds and the newest open findings survive.
  const marker = writeState({ head: "abc", score: 3, findings: Array.from({ length: 400 }, (_, i) => finding(i)) });
  assert.ok(marker.length <= STATE_BUDGET + 40, `${marker.length}`);
  const kept = readState(marker)?.findings ?? [];
  assert.ok(kept.length > 100 && kept.at(-1)?.fp === finding(399).fp);
  // A realistic 50 open findings (2-4 sentence bodies, a few evidence lines) keep their bodies.
  const realistic = (i: number) => ({ ...finding(i), title: "Draft leaks across accounts", body: "b".repeat(500), evidence: ["e".repeat(120), "e".repeat(120)], status: "open" as const });
  const real = writeState({ head: "abc", score: 3, findings: Array.from({ length: 50 }, (_, i) => realistic(i)) });
  assert.ok(real.length <= STATE_BUDGET + 40);
  assert.ok((readState(real)?.findings[0]?.body.length ?? 0) > 0);
});

test("unquote undoes git's C-style path quoting", () => {
  assert.equal(unquote('"we\\"ird\\tname.ts"'), 'we"ird\tname.ts');
  assert.equal(unquote("plain.ts"), "plain.ts");
  const [f] = parseDiff('diff --git "a/q\\"x.ts" "b/q\\"x.ts"\n--- "a/q\\"x.ts"\n+++ "b/q\\"x.ts"\n@@ -1 +1 @@\n-a\n+b\n');
  assert.equal(f?.path, 'q"x.ts');
});

test("config rejects unknown keys so typos are reported", () => {
  const { config, warning } = loadConfig("review:\n  min_severty: major\n");
  assert.deepEqual(config, DEFAULTS);
  assert.match(warning ?? "", /min_severty/);
});

test("focus re-reads only files whose diff changed since the last review", () => {
  const file = (path: string, numbered: string): FileDiff => ({ path, status: "modified", commentable: new Set(), hunkOf: new Map(), numbered });
  const diffs = [file("a.ts", "1 + a"), file("b.ts", "1 + b"), file("c.ts", "1 + c")];
  const seen = { "a.ts": diffHash("1 + a"), "b.ts": diffHash("1 + old b") };
  assert.deepEqual(focus(diffs, seen).map((d) => d.path), ["b.ts", "c.ts"]);
  assert.deepEqual(focus(diffs, undefined).map((d) => d.path), ["a.ts", "b.ts", "c.ts"]);
});

test("reviewed file hashes survive the state round trip", () => {
  const state = { head: "abc", score: 5 as const, findings: [], files: { "a.ts": diffHash("x") } };
  assert.deepEqual(readState(writeState(state))?.files, state.files);
});

test("a huge file-hash map is dropped so the state stays in budget", () => {
  const files = Object.fromEntries(Array.from({ length: 3000 }, (_, i) => [`packages/some/deep/path/file-${i}.ts`, diffHash(String(i))]));
  const out = writeState({ head: "abc", score: 5, findings: [], files });
  assert.ok(out.length <= STATE_BUDGET + 40);
  assert.equal(readState(out)?.files, undefined);
});

test("postedOnHead finds our root finding comments made on this head only", () => {
  const ours = (login: string | undefined) => login === "bot[bot]";
  const c = (id: number, fp: string, over: object = {}) => ({ id, body: `x\n${findingTag(fp)}`, original_commit_id: "head", user: { login: "bot[bot]" }, ...over });
  const posted = postedOnHead(
    [
      c(1, "aaaaaaaaaaaa"),
      c(2, "bbbbbbbbbbbb", { original_commit_id: "older" }),
      c(3, "cccccccccccc", { user: { login: "someone" } }),
      c(4, "dddddddddddd", { in_reply_to_id: 1 }),
    ],
    "head",
    ours,
  );
  assert.deepEqual([...posted], [["aaaaaaaaaaaa", 1]]);
});

test("review.scope picks changed files or the whole PR on a push", () => {
  assert.equal(loadConfig(undefined).config.review.scope, "changed");
  assert.equal(loadConfig("review:\n  scope: all\n").config.review.scope, "all");
  assert.match(loadConfig("review:\n  scope: everything\n").warning ?? "", /scope/);
});

test("an earlier finding is re-verified only when its file or cited code changed", () => {
  const f = { file: "a.ts", evidence: ["a.ts:3: x()", "lib/b.ts:10: y()"] };
  assert.equal(stale(f, new Set(["a.ts"])), true);
  assert.equal(stale(f, new Set(["lib/b.ts"])), true);
  assert.equal(stale(f, new Set(["c.ts"])), false);
});

test("the check passes only at 5/5 and annotates each open finding", () => {
  const run = { repo: "o/r", head: "abcdef0", model: "m", files: 3, reviewed: 1, candidates: 2, verified: 2, seconds: 75, timing: "find 1s", tokens: { prompt: 2_000_000, cached: 1_500_000 } };
  const finding = (n: number, severity: "major" | "minor", status: "open" | "fixed" = "open") =>
    ({ file: "a.ts", line: n, endLine: n, severity, title: `t${n}`, body: "b <!-- x -->", evidence: [], fp: `fp${n}`, status });
  const clean5 = checkResult({ head: "abcdef0", score: 5, findings: [finding(1, "major", "fixed")] }, run, "u");
  assert.equal(clean5.conclusion, "success");
  assert.deepEqual(clean5.output?.annotations, []);
  const four = checkResult({ head: "abcdef0", score: 3, findings: [finding(2, "minor"), finding(1, "major")] }, run, "u");
  assert.equal(four.conclusion, "failure");
  assert.equal(four.output?.title, "3/5 · 2 open · 1m 15s");
  assert.deepEqual(four.output?.annotations?.map((a) => [a.start_line, a.annotation_level, a.message]), [[1, "failure", "b  x "], [2, "warning", "b  x "]]);
  assert.match(four.output?.summary ?? "", /1 of 3 files changed since last review.*75% cached/);
  const many = checkResult({ head: "h", score: 4, findings: Array.from({ length: 60 }, (_, i) => finding(i + 1, "minor")) }, run, "u");
  assert.equal(many.output?.annotations?.length, 50);
});
