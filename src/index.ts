// ReviewPilot entry point, run as a GitHub Action (or locally with REVIEWPILOT_DRY_RUN=1).
// One run: resolve the PR, check out its head, find and verify issues, then post new
// findings inline and refresh the single summary comment with the score and the delta.

import { appendFile, readFile } from "node:fs/promises";
import { ignored, loadConfig, rulesFor } from "./config.ts";
import { anchor, parseDiff } from "./diff.ts";
import { checkoutPr, diff, fetchRef, readAt } from "./git.ts";
import { createGitHub, type InlineComment } from "./github.ts";
import { createLlm } from "./llm.ts";
import { bySeverity, inlineBody, progressBody, summaryBody } from "./render.ts";
import { dedupe, review, settle } from "./review.ts";
import {
  FINDING_TAG,
  fingerprint,
  readState,
  sameIssue,
  score,
  SEVERITIES,
  type State,
  SUMMARY_TAG,
  type Tracked,
  writeState,
} from "./state.ts";

const MAX_DIFF_CHARS = 400_000;
const GUIDANCE_CHARS = 12_000;

const input = (name: string) => process.env[`INPUT_${name.toUpperCase()}`]?.trim() || undefined;
const log = (line: string) => console.log(line);

type Event = {
  pull_request?: { number: number };
  issue?: { number: number; pull_request?: unknown };
  comment?: { id: number; body: string };
};

async function main() {
  const started = Date.now();
  const repo = process.env.GITHUB_REPOSITORY ?? "";
  const root = process.env.GITHUB_WORKSPACE ?? process.cwd();
  const dryRun = process.env.REVIEWPILOT_DRY_RUN === "1";
  const token = input("github_token") ?? process.env.GITHUB_TOKEN ?? "";
  const apiKey = input("api_key") ?? process.env.REVIEWPILOT_API_KEY ?? "";
  if (!repo || !token || !apiKey) throw new Error("Needs GITHUB_REPOSITORY, a GitHub token and api_key.");

  const event: Event = process.env.GITHUB_EVENT_PATH
    ? (JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8")) as Event)
    : {};
  const comment = event.comment;
  if (comment && !/^\/review\b/.test(comment.body.trim())) return log("Comment is not /review, nothing to do.");
  if (comment && !event.issue?.pull_request) return log("Comment is not on a pull request, nothing to do.");
  const number = Number(process.env.REVIEWPILOT_PR) || event.pull_request?.number || event.issue?.number;
  if (!number) return log("No pull request in this event.");

  const gh = createGitHub(token, repo);
  const pr = await gh.pr(number);
  // A local run (REVIEWPILOT_PR) may review a merged PR, which is how the test set works.
  if (pr.state !== "open" && !process.env.REVIEWPILOT_PR) return log(`PR #${number} is ${pr.state}, skipping.`);
  if (!comment && pr.draft) return log(`PR #${number} is a draft, skipping.`);
  if (comment && !dryRun) await gh.react(comment.id, "eyes").catch(() => undefined);

  // Show progress right away in the summary comment, keeping the previous state in it.
  const existing = (await gh.issueComments(number)).find((c) => c.body.includes(SUMMARY_TAG));
  const prev = existing ? readState(existing.body) : undefined;
  let summaryId = existing?.id;
  if (!dryRun) {
    const body = progressBody(pr.head.sha, prev ? writeState(prev) : undefined);
    summaryId = summaryId ? (await gh.editComment(summaryId, body)).id : (await gh.comment(number, body)).id;
  }

  try {
    const mergeBase = await checkoutPr(root, number, pr.head.sha, pr.base.sha);
    const trusted = await fetchRef(root, pr.base.repo.default_branch);
    const { config, warning } = loadConfig(await readAt(root, trusted, ".reviewpilot.yml"));
    if (warning) log(warning);
    const model = input("model") ?? config.model.name;
    const verifyModel = input("verify_model") ?? config.model.verify;
    const baseUrl = input("base_url") ?? process.env.REVIEWPILOT_BASE_URL ?? "https://api.commandcode.ai/provider/v1";

    const reviewable = parseDiff(await diff(root, mergeBase, pr.head.sha, config.review.ignore)).filter((d) => !ignored(config, d.path));
    // Fill the budget file by file; a file that does not fit is skipped, later ones still get in.
    let size = 0;
    const diffs = reviewable.filter((d) => {
      if (size + d.numbered.length > MAX_DIFF_CHARS) return false;
      size += d.numbered.length;
      return true;
    });
    const skipped = reviewable.length - diffs.length;

    const guidance = (
      await Promise.all(config.context_files.map(async (f) => {
        const text = await readAt(root, trusted, f);
        return text ? `--- ${f} ---\n${text}` : "";
      }))
    ).join("\n").slice(0, GUIDANCE_CHARS);

    // Earlier findings: a thread the author resolved or replied to counts as dismissed.
    const previous: Tracked[] = (prev?.findings ?? []).map((f) => ({ ...f }));
    const threads = await gh.threads(number).catch(() => []);
    for (const t of threads) {
      const fp = t.comments[0]?.body.match(FINDING_TAG)?.[1];
      const tracked = previous.find((p) => p.fp === fp && p.status === "open");
      const replied = t.comments.slice(1).some((c) => !c.author.endsWith("[bot]"));
      if (tracked && (t.resolved || replied)) tracked.status = "dismissed";
    }

    const llm = (m: string) => createLlm({ baseUrl, apiKey, model: m, effort: config.model.effort });
    const find = llm(model);
    const verify = verifyModel === model ? find : llm(verifyModel);
    const { checked, candidates } = await review({
      find,
      verify,
      root,
      config,
      rules: rulesFor(config, diffs.map((d) => d.path)),
      guidance,
      pr: { title: pr.title, body: pr.body ?? "" },
      diffs,
      previous,
      log,
    });

    // Merge: earlier open findings stay open, become fixed, or stay as they were when the check failed.
    const findings: Tracked[] = previous.map((p) => {
      if (p.status !== "open") return p;
      const c = checked.find((x) => x.previous?.fp === p.fp);
      if (!c?.verdict) return p;
      return c.verdict.verdict === "confirmed" ? { ...p, ...settle(p, c.verdict), fp: p.fp } : { ...p, status: "fixed" as const };
    });
    const minRank = SEVERITIES.indexOf(config.review.min_severity);
    const confirmed = checked
      .flatMap((c) => (!c.previous && c.verdict?.verdict === "confirmed" ? [settle(c.finding, c.verdict)] : []))
      .filter((f) => SEVERITIES.indexOf(f.severity) <= minRank)
      .sort(bySeverity);
    // Drop findings that repeat each other or an earlier open or dismissed one. A finding
    // that matches a fixed one was reintroduced: it replaces the fixed entry and posts again.
    const known = findings.filter((t) => t.status !== "fixed");
    const fresh: Tracked[] = [];
    for (const f of await dedupe(find, root, confirmed, known, log)) {
      const fp = fingerprint(f);
      if ([...known, ...fresh].some((t) => t.fp === fp || sameIssue(t, f))) continue;
      if (fresh.length >= config.review.max_findings) break;
      const reopened = findings.findIndex((t) => t.fp === fp && t.status === "fixed");
      if (reopened >= 0) findings.splice(reopened, 1);
      fresh.push({ ...f, fp, status: "open" });
    }
    findings.push(...fresh);

    const open = findings.filter((f) => f.status === "open");
    const state: State = { head: pr.head.sha, score: score(open), findings };

    // New findings go inline where the diff allows; the rest go to the summary.
    const byPath = new Map(diffs.map((d) => [d.path, d]));
    const inline: InlineComment[] = [];
    const outside: Tracked[] = [];
    for (const f of fresh) {
      const at = anchor(byPath.get(f.file), f.line, f.endLine);
      if (at) inline.push({ path: f.file, line: at.line, ...(at.startLine ? { start_line: at.startLine } : {}), body: inlineBody(f) });
      else outside.push(f);
    }
    const fixedNow = findings.filter((f) => f.status === "fixed" && f.commentId && prev?.findings.some((p) => p.fp === f.fp && p.status === "open"));

    const warningText = [warning, skipped > 0 ? `${skipped} files did not fit in the review budget and were not reviewed.` : ""].filter(Boolean).join(" ");
    const run = {
      repo,
      head: pr.head.sha,
      model: verifyModel === model ? model : `${model} (verify: ${verifyModel})`,
      files: diffs.length,
      candidates,
      seconds: Math.round((Date.now() - started) / 1000),
      ...(warningText ? { warning: warningText } : {}),
    };
    const usage = verify === find ? find.usage : { calls: find.usage.calls + verify.usage.calls, prompt: find.usage.prompt + verify.usage.prompt, completion: find.usage.completion + verify.usage.completion };
    log(`score ${state.score}/5: ${fresh.length} new, ${open.length} open, ${fixedNow.length} fixed; ${usage.calls} calls, ${usage.prompt} in / ${usage.completion} out tokens`);

    if (dryRun) {
      for (const c of inline) log(`\n--- inline ${c.path}:${c.start_line ? `${c.start_line}-` : ""}${c.line}\n${c.body}`);
      log(`\n--- summary\n${summaryBody(state, prev, outside, run)}`);
      return;
    }

    if (inline.length) {
      try {
        await gh.review(number, pr.head.sha, inline);
      } catch (e) {
        log(`Inline review failed, moving findings to the summary: ${String(e)}`);
        outside.push(...fresh.filter((f) => !outside.includes(f)));
      }
      const posted = await gh.reviewComments(number);
      for (const f of fresh) {
        const c = posted.find((p) => p.body.match(FINDING_TAG)?.[1] === f.fp && !p.in_reply_to_id);
        if (c) f.commentId = c.id;
      }
    }
    // Paced: GitHub's secondary rate limit rejects bursts of new comments.
    for (const f of fixedNow) {
      if (!f.commentId) continue;
      await gh.reply(number, f.commentId, `Fixed in ${pr.head.sha.slice(0, 7)}.`).catch((e: unknown) => log(`Reply on ${f.fp} failed: ${String(e)}`));
      await new Promise((r) => setTimeout(r, 1500));
    }
    const body = summaryBody(state, prev, outside, run);
    if (summaryId) await gh.editComment(summaryId, body);
    else await gh.comment(number, body);
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `${body}\n`);
  } catch (e) {
    // Put the previous summary back so a failed run never wipes the PR's history; on a
    // first run, say it failed instead of leaving "reviewing..." up.
    if (!dryRun && summaryId) {
      const runUrl = `${process.env.GITHUB_SERVER_URL ?? "https://github.com"}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID ?? ""}`;
      const body = existing?.body ?? `## ReviewPilot: review failed for ${pr.head.sha.slice(0, 7)}\n\nSee the [workflow run](${runUrl}). Comment \`/review\` to retry.\n${SUMMARY_TAG}`;
      await gh.editComment(summaryId, body).catch(() => undefined);
    }
    throw e;
  }
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.stack ?? e.message : String(e));
  process.exitCode = 1;
});
