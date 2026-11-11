// Turns GitHub App webhook deliveries into review jobs. The gate matches the documented
// workflow: non-draft PRs from branches in the repo itself (so their authors can push), never
// from bots, and `/review` comments from owners, members and collaborators.

import { createHmac, timingSafeEqual } from "node:crypto";
import { type } from "arktype";
import type { Job } from "./queue.ts";

/** True when `signature` (X-Hub-Signature-256) is GitHub's HMAC of exactly this body. */
export function verify(secret: string, body: Buffer, signature: string | undefined): boolean {
  if (!signature?.startsWith("sha256=")) return false;
  const want = Buffer.from(`sha256=${createHmac("sha256", secret).update(body).digest("hex")}`);
  const got = Buffer.from(signature);
  return got.length === want.length && timingSafeEqual(got, want);
}

const Base = type({
  action: "string",
  installation: { id: "number" },
  repository: { full_name: "string" },
});

const PullRequestEvent = Base.and({
  pull_request: {
    number: "number",
    draft: "boolean",
    user: { login: "string", type: "string" },
    head: { repo: type({ full_name: "string" }).or("null") },
  },
});

const CommentEvent = Base.and({
  issue: { number: "number", state: "string", "pull_request?": "unknown" },
  comment: { body: "string", author_association: "string" },
});

/** Who may run `/review`: it spends the server's model key. */
const MAINTAINERS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

const PR_ACTIONS = new Set(["opened", "reopened", "ready_for_review", "synchronize"]);

/**
 * The job for a delivery, or undefined when it should not start a review. `repos` holds
 * lowercase `owner/repo` or `owner/*` entries; empty allows every installed repo.
 */
export function toJob(event: string, payload: unknown, repos: ReadonlySet<string>): Job | undefined {
  const allowed = (repo: string) => {
    const name = repo.toLowerCase();
    return repos.size === 0 || repos.has(name) || repos.has(`${name.split("/")[0]}/*`);
  };

  if (event === "pull_request") {
    const e = PullRequestEvent(payload);
    if (e instanceof type.errors) return undefined;
    const { pull_request: pr, repository: repo } = e;
    // A fork PR's author may have no access at all; bot PRs (Dependabot and friends) are skipped.
    const inRepo = pr.head.repo?.full_name === repo.full_name;
    if (!PR_ACTIONS.has(e.action) || pr.draft || !inRepo || pr.user.type === "Bot" || !allowed(repo.full_name)) return undefined;
    // Pushes come in bursts; opened and ready_for_review wait too, so a quick follow-up push folds in.
    return { repo: repo.full_name, number: pr.number, installation: e.installation.id, event, payload, debounce: true };
  }

  if (event === "issue_comment") {
    const e = CommentEvent(payload);
    if (e instanceof type.errors) return undefined;
    const { issue, comment, repository: repo } = e;
    const command = /^\/review(\s|$)/.test(comment.body.trim());
    const ok = e.action === "created" && command && issue.pull_request !== undefined && issue.state === "open";
    if (!ok || !MAINTAINERS.has(comment.author_association) || !allowed(repo.full_name)) return undefined;
    return { repo: repo.full_name, number: issue.number, installation: e.installation.id, event, payload, debounce: false };
  }

  return undefined;
}
