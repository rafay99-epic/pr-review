// Git plumbing on the Actions checkout: get the PR head and base, diff them the way GitHub
// does (from the merge base), and read trusted files from the default branch.

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

const git = async (root: string, ...args: string[]) =>
  (await exec("git", args, { cwd: root, maxBuffer: 64 * 1024 * 1024 })).stdout;

/**
 * Checks out the PR head detached and returns its merge base with the PR's base commit
 * (not the branch tip, so an already merged PR still diffs to its own changes).
 */
export async function checkoutPr(root: string, pr: number, head: string, baseSha: string): Promise<string> {
  if ((await git(root, "rev-parse", "--is-shallow-repository")).trim() === "true") {
    await git(root, "fetch", "--no-tags", "--unshallow", "origin");
  }
  await git(root, "fetch", "--no-tags", "origin", `+refs/pull/${pr}/head:refs/reviewpilot/head`);
  await git(root, "checkout", "--quiet", "--detach", head);
  return (await git(root, "merge-base", baseSha, head)).trim();
}

export const diff = (root: string, from: string, to: string) =>
  git(root, "diff", "--no-color", "--no-ext-diff", "-M", "--unified=5", from, to);

/** A file's content on a ref, or undefined if it does not exist there. */
export const readAt = (root: string, ref: string, path: string) =>
  git(root, "show", `${ref}:${path}`).catch(() => undefined);

export async function fetchRef(root: string, branch: string): Promise<string> {
  await git(root, "fetch", "--no-tags", "origin", `+refs/heads/${branch}:refs/reviewpilot/default`);
  return "refs/reviewpilot/default";
}
