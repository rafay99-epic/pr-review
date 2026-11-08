import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULTS, ignored, loadConfig, rulesFor } from "./config.ts";
import { anchor, type FileDiff, parseDiff } from "./diff.ts";
import { chunk } from "./review.ts";
import { fingerprint, readState, score, writeState } from "./state.ts";

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
