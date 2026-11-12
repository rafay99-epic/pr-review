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
