// Dry-runs ReviewPilot on a real PR from this machine: nothing is posted.
// Usage: REVIEWPILOT_API_KEY=... node scripts/local.ts owner/repo <pr> [model]
// Clones the repo once into $TMPDIR/reviewpilot and reuses it.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [repo, pr, model] = process.argv.slice(2);
if (!repo || !pr) throw new Error("usage: node scripts/local.ts owner/repo <pr> [model]");

const dir = join(tmpdir(), "reviewpilot", repo.replace("/", "__"));
if (!existsSync(dir)) execFileSync("gh", ["repo", "clone", repo, dir, "--", "--filter=blob:none", "--quiet"], { stdio: "inherit" });

const token = process.env.GITHUB_TOKEN ?? execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
const { status } = spawnSync(process.execPath, [join(import.meta.dirname, "..", "src", "index.ts")], {
  stdio: "inherit",
  env: {
    ...process.env,
    GITHUB_REPOSITORY: repo,
    GITHUB_WORKSPACE: dir,
    GITHUB_TOKEN: token,
    REVIEWPILOT_PR: pr,
    REVIEWPILOT_DRY_RUN: "1",
    ...(model ? { INPUT_MODEL: model, INPUT_VERIFY_MODEL: model } : {}),
  },
});
process.exit(status ?? 1);
