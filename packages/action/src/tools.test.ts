import assert from "node:assert/strict";
import { mkdir, mkdtemp, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { runTool } from "./tools.ts";

test("read_file stays inside the checkout, symlinks included", async () => {
  const outside = await mkdtemp(join(tmpdir(), "rp-outside-"));
  await writeFile(join(outside, "secret"), "token");
  const root = await mkdtemp(join(tmpdir(), "rp-root-"));
  await mkdir(join(root, ".git"));
  await writeFile(join(root, ".git", "config"), "extraheader = token");
  await writeFile(join(root, "a.ts"), "const a = 1;");
  await symlink(join(outside, "secret"), join(root, "escape"));
  await symlink(join(root, ".git", "config"), join(root, "creds"));

  assert.match(await runTool(root, "read_file", { path: "a.ts" }), /const a = 1;/);
  await writeFile(join(root, "img.bin"), Buffer.from([0x89, 0x50, 0x00, 0x01]));
  assert.match(await runTool(root, "read_file", { path: "img.bin" }), /binary file/);
  for (const path of ["escape", "creds", ".git/config", "../" + outside.split("/").pop() + "/secret"]) {
    assert.doesNotMatch(await runTool(root, "read_file", { path }), /token/, path);
  }
});

test("changedSince lists the new-side lines changed between two commits", async () => {
  const { execFileSync } = await import("node:child_process");
  const { changedSince } = await import("./git.ts");
  const root = await mkdtemp(join(tmpdir(), "rp-git-"));
  const git = (...args: string[]) => execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], { cwd: root }).toString().trim();
  git("init", "-q");
  await writeFile(join(root, "a.ts"), "one\ntwo\nthree\nfour\n");
  await writeFile(join(root, "b.ts"), "x\ny\nz\n");
  git("add", "."), git("commit", "-qm", "1");
  const first = git("rev-parse", "HEAD");
  await writeFile(join(root, "a.ts"), "one\nTWO\nthree\nfour\nfive\n");
  await writeFile(join(root, "b.ts"), "x\nz\n");
  // An added line that starts with "++ " reads "+++ ..." in the diff; it is not a file header.
  await writeFile(join(root, "c.sql"), "++ new comment\n");
  git("add", "."), git("commit", "-qm", "2");
  const lines = await changedSince(root, first, git("rev-parse", "HEAD"), []);
  assert.deepEqual([...(lines.get("a.ts") ?? [])].sort(), [2, 5]);
  assert.deepEqual([...(lines.get("b.ts") ?? [])].sort(), [1, 2]); // a pure deletion marks both sides of where the code was
  assert.deepEqual([...(lines.get("c.sql") ?? [])], [1]);
  assert.deepEqual([...lines.keys()].sort(), ["a.ts", "b.ts", "c.sql"]);
  await assert.rejects(changedSince(root, "0000000000000000000000000000000000000000", "HEAD", []));
});

test("a turn cut off at the deadline still ends in a submission, not a lost part", async () => {
  const { runAgent } = await import("./agent.ts");
  const forced: (string | undefined)[] = [];
  const llm = {
    model: "m",
    usage: { prompt: 0, completion: 0, calls: 0, cached: 0 },
    async chat(_messages: unknown, _tools: unknown, force?: string) {
      forced.push(force);
      // The normal turn runs past the deadline and times out; the forced one answers.
      if (!force) {
        await new Promise((r) => setTimeout(r, 120));
        throw new Error("HTTP 0 TimeoutError");
      }
      return { role: "assistant" as const, content: null, tool_calls: [{ id: "1", type: "function" as const, function: { name: "submit_x", arguments: '{"n":1}' } }] };
    },
  };
  const submit = {
    spec: { type: "function" as const, function: { name: "submit_x", description: "", parameters: {} } },
    parse: (args: unknown) => ({ ok: true as const, value: args }),
  };
  const out = await runAgent({ llm, root: ".", system: "", user: "", submit, maxTurns: 5, deadline: Date.now() + 50, log: () => {} });
  assert.deepEqual(out, { n: 1 });
  assert.deepEqual(forced, [undefined, "submit_x"]);
  // Before the deadline the same failure is a real error.
  await assert.rejects(runAgent({ llm, root: ".", system: "", user: "", submit, maxTurns: 5, deadline: Date.now() + 60_000, log: () => {} }));
});
