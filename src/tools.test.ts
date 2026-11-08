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
