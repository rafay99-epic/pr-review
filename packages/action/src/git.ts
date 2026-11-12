// Git plumbing on the checkout (Actions, or the server's warm clone): get the PR head and base, diff them the way GitHub
// does (from the merge base), and read trusted files from the default branch.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { unquote } from "./diff.ts";

const exec = promisify(execFile);

const git = async (root: string, ...args: string[]) =>
  (await exec("git", args, { cwd: root, maxBuffer: 256 * 1024 * 1024 })).stdout;

/**
 * Checks out the PR head detached and returns its merge base with the PR's base commit
 * (not the branch tip, so an already merged PR still diffs to its own changes). The base
 * branch is fetched too: a warm clone has not seen base commits made since its last run.
 * The checkout is forced so a run killed mid-checkout cannot leave the clone unusable.
 */
export async function checkoutPr(root: string, pr: number, head: string, base: { ref: string; sha: string }): Promise<string> {
  if ((await git(root, "rev-parse", "--is-shallow-repository")).trim() === "true") {
    await git(root, "fetch", "--no-tags", "--unshallow", "origin");
  }
  await git(root, "fetch", "--no-tags", "origin", `+refs/pull/${pr}/head:refs/reviewpilot/head`);
  // Separate, and allowed to fail: a deleted base branch must not stop a review whose base
  // commit is already in the clone. merge-base below fails if it is not.
  await git(root, "fetch", "--no-tags", "origin", `+refs/heads/${base.ref}:refs/reviewpilot/base`).catch(() => undefined);
  await git(root, "checkout", "--quiet", "--force", "--detach", head);
  return (await git(root, "merge-base", base.sha, head)).trim();
}

/** The diff between two commits, with ignored globs excluded by git itself so huge lockfiles never load. */
export const diff = (root: string, from: string, to: string, ignore: readonly string[]) =>
  git(root, "-c", "core.quotePath=off", "diff", "--no-color", "--no-ext-diff", "-M", "--unified=5", from, to, "--", ".",
    ...ignore.map((g) => `:(glob,exclude)${g}`));

/**
 * New-side lines (at `to`) each file changed between two commits: added lines, and for a pure
 * deletion the line where the removed code was. Throws when `from` is not in the clone.
 */
export async function changedSince(root: string, from: string, to: string, ignore: readonly string[]): Promise<Map<string, Set<number>>> {
  const raw = await git(root, "-c", "core.quotePath=off", "diff", "--no-color", "--no-ext-diff", "-M", "--unified=0", from, to, "--", ".",
    ...ignore.map((g) => `:(glob,exclude)${g}`));
  const lines = new Map<string, Set<number>>();
  let file: Set<number> | undefined;
  for (const text of raw.split("\n")) {
    if (text.startsWith("+++ ")) {
      const path = text.slice(4);
      file = path === "/dev/null" ? undefined : new Set();
      if (file) lines.set(unquote(path).replace(/^b\//, ""), file);
      continue;
    }
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(text);
    if (!hunk || !file) continue;
    const start = Number(hunk[1]);
    const count = hunk[2] === undefined ? 1 : Number(hunk[2]);
    if (count === 0) file.add(Math.max(1, start));
    for (let n = start; n < start + count; n++) file.add(n);
  }
  return lines;
}

/** A file's content on a ref, or undefined if it does not exist there. Any other git failure throws. */
export const readAt = (root: string, ref: string, path: string) =>
  git(root, "show", `${ref}:${path}`).catch((e: { stderr?: string }) => {
    if (/does not exist in|exists on disk, but not in/.test(e.stderr ?? "")) return undefined;
    throw e;
  });

export async function fetchRef(root: string, branch: string): Promise<string> {
  await git(root, "fetch", "--no-tags", "origin", `+refs/heads/${branch}:refs/reviewpilot/default`);
  return "refs/reviewpilot/default";
}
