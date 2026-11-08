// ReviewPilot entry point, run as a GitHub Action (or locally with REVIEWPILOT_DRY_RUN=1).
// One run: resolve the PR, check out its head, find and verify issues, then post new
// findings inline and refresh the single summary comment with the score and the delta.

import { readFile } from "node:fs/promises";
import { type } from "arktype";
import { ignored, loadConfig, rulesFor } from "./config.ts";
import { anchor, parseDiff } from "./diff.ts";
import { checkoutPr, diff, fetchRef, readAt } from "./git.ts";
import { createGitHub, type InlineComment, type Thread } from "./github.ts";
import { createLlm } from "./llm.ts";
import { createLog } from "./log.ts";
import { bySeverity, inlineBody, progressBody, summaryBody } from "./render.ts";
import { dedupe, pool, review, settle } from "./review.ts";
import {
  FINDING_TAG,
  fingerprint,
  lastMarker,
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
const GUIDANCE_CHARS = 10_000;
/** Who may run /review and whose replies can dismiss a finding (besides the PR author). */
const MAINTAINERS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

const input = (name: string) => process.env[`INPUT_${name.toUpperCase()}`]?.trim() || undefined;
const log = createLog(process.env.GITHUB_ACTIONS === "true");

/** The parts of the workflow event payload ReviewPilot reads; everything else is ignored. */
const Event = type({
  "pull_request?": { number: "number" },
  "issue?": { number: "number", "pull_request?": "unknown" },
  "comment?": { id: "number", body: "string", author_association: "string", user: { login: "string" } },
});

async function main() {
  const started = Date.now();
  const repo = process.env.GITHUB_REPOSITORY ?? "";
  const root = process.env.GITHUB_WORKSPACE ?? process.cwd();
  const dryRun = process.env.REVIEWPILOT_DRY_RUN === "1";
  const token = input("github_token") ?? process.env.GITHUB_TOKEN ?? "";
  const apiKey = input("api_key") ?? process.env.REVIEWPILOT_API_KEY ?? "";
  if (!repo || !token || !apiKey) throw new Error("Needs GITHUB_REPOSITORY, a GitHub token and api_key.");

  // Comments from these accounts are ReviewPilot's own: anyone can paste the hidden markers
  // into a comment, but only this repo's workflows post as these. github-actions[bot] stays
  // trusted so a summary from before an App was set up can be taken over.
  const botLogin = input("bot_login") ?? "github-actions[bot]";
  const ours = (login: string | undefined) => login === botLogin || login === "github-actions[bot]";

  const event = Event.assert(process.env.GITHUB_EVENT_PATH ? JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8")) : {});
  const comment = event.comment;
  if (comment) {
    if (!/^\/review\b/.test(comment.body.trim())) return log.line("Comment is not /review, nothing to do.");
    if (!event.issue?.pull_request) return log.line("Comment is not on a pull request, nothing to do.");
    // Checked here too, not only in the caller's workflow: a run spends the owner's key.
    if (!MAINTAINERS.has(comment.author_association)) {
      return log.line(`/review from ${comment.user.login} (${comment.author_association}) ignored: only owners, members and collaborators can run it.`);
    }
  }
  const number = Number(process.env.REVIEWPILOT_PR) || event.pull_request?.number || event.issue?.number;
  if (!number) return log.line("No pull request in this event.");

  const gh = createGitHub(token, repo);
  const pr = await gh.pr(number);
  // A local run (REVIEWPILOT_PR) may review a merged PR, which is how the test set works.
  if (pr.state !== "open" && !process.env.REVIEWPILOT_PR) return log.line(`PR #${number} is ${pr.state}, skipping.`);
  if (!comment && pr.draft) return log.line(`PR #${number} is a draft, skipping.`);
  if (comment && !dryRun) await gh.react(comment.id, "eyes").catch(() => undefined);
  log.line(`Reviewing ${repo}#${number} at ${pr.head.sha.slice(0, 7)} as ${botLogin}`);

  // The newest summary from the bot itself wins; a github-actions[bot] one is only adopted
  // when there is none, and is retired once the bot has posted its own.
  const summaries = (await gh.issueComments(number)).filter((c) => c.body.includes(SUMMARY_TAG) && ours(c.user?.login));
  const existing = summaries.findLast((c) => c.user?.login === botLogin) ?? summaries.at(-1);
  const prev = existing ? readState(existing.body) : undefined;
  let summaryId = existing?.user?.login === botLogin ? existing.id : undefined;
  if (!dryRun) {
    const body = progressBody(pr.head.sha, prev ? writeState(prev) : undefined);
    const edited = summaryId ? await gh.editComment(summaryId, body).catch(() => undefined) : undefined;
    summaryId = edited?.id ?? (await gh.comment(number, body)).id;
  }

  try {
    const { config, warning, mergeBase, defaultRef } = await log.phase("Checkout", async () => {
      const mergeBase = await checkoutPr(root, number, pr.head.sha, pr.base.sha);
      const defaultRef = await fetchRef(root, pr.base.repo.default_branch);
      return { mergeBase, defaultRef, ...loadConfig(await readAt(root, defaultRef, ".reviewpilot.yml")) };
    });
    if (warning) log.warn(warning);
    const model = input("model") ?? config.model.name;
    const verifyModel = input("verify_model") ?? config.model.verify;
    const baseUrl = input("base_url") ?? process.env.REVIEWPILOT_BASE_URL ?? "https://api.commandcode.ai/provider/v1";

    const { diffs, skipped, guidance, threads } = await log.phase("Diff and context", async () => {
      // Files without hunks (binary, mode-only changes) have nothing to review.
      const reviewable = parseDiff(await diff(root, mergeBase, pr.head.sha, config.review.ignore)).filter(
        (d) => !ignored(config, d.path) && d.commentable.size > 0,
      );
      // Fill the budget file by file; a file that does not fit is skipped, later ones still get in.
      let size = 0;
      const diffs = reviewable.filter((d) => {
        if (size + d.numbered.length > MAX_DIFF_CHARS) return false;
        size += d.numbered.length;
        return true;
      });
      const [guidance, threads] = await Promise.all([
        Promise.all(config.context_files.map(async (f) => {
          const text = await readAt(root, defaultRef, f);
          return text ? `--- ${f} ---\n${text}` : "";
        })).then((parts) => parts.join("\n").slice(0, GUIDANCE_CHARS)),
        gh.threads(number).catch((e: unknown): Thread[] => {
          log.warn(`Could not read review threads, so dismissals and closing are skipped this run: ${String(e)}`);
          return [];
        }),
      ]);
      log.line(`${diffs.length} files, ${size.toLocaleString("en")} characters of diff, ${threads.length} review threads`);
      return { diffs, skipped: reviewable.length - diffs.length, guidance, threads };
    });

    // A finding's thread is the one whose first comment is the finding's own inline comment.
    // Older state without comment ids falls back to the fingerprint tag, from our comments only.
    const threadOf = (f: Tracked) =>
      threads.find((t) =>
        f.commentId !== undefined
          ? t.comments[0]?.databaseId === f.commentId
          : ours(t.comments[0]?.author) && lastMarker(t.comments[0]?.body ?? "", FINDING_TAG) === f.fp,
      );

    // Earlier findings. One counts as dismissed when someone other than ReviewPilot resolved
    // its thread (only the PR author and people with write access can), or when the PR author
    // or a maintainer replied to it. Findings now below min_severity are dropped too.
    const minRank = SEVERITIES.indexOf(config.review.min_severity);
    const previous: Tracked[] = (prev?.findings ?? []).map((f) => ({ ...f }));
    for (const p of previous.filter((f) => f.status === "open")) {
      const t = threadOf(p);
      const replied = t?.comments.slice(1).some((c) => c.author === pr.user.login || MAINTAINERS.has(c.association));
      const resolved = t?.resolved && !ours(t.resolvedBy);
      if (resolved || replied || SEVERITIES.indexOf(p.severity) > minRank) p.status = "dismissed";
    }

    const llm = (m: string) => createLlm({ baseUrl, apiKey, model: m, effort: config.model.effort });
    const find = llm(model);
    const verify = verifyModel === model ? find : llm(verifyModel);
    const { checked, candidates, verified, failedParts, parts } = await log.phase("Review", () =>
      review({
        find,
        verify,
        root,
        config,
        rules: rulesFor(config, diffs.map((d) => d.path)),
        guidance,
        pr: { title: pr.title, body: pr.body ?? "" },
        diffs,
        previous,
        log: log.line,
      }),
    );

    const { findings, fresh, overCap } = await log.phase("Merge", async () => {
      // Earlier open findings stay open, become fixed, or stay as they were when the check failed.
      const findings: Tracked[] = previous.map((p) => {
        if (p.status !== "open") return p;
        const c = checked.find((x) => x.previous === p);
        if (!c?.verdict) return p;
        if (c.verdict.verdict !== "confirmed") return { ...p, status: "fixed" as const };
        // Keep the original wording so the summary matches the inline thread; only the
        // location and severity follow the current code.
        const { line, endLine, severity } = settle(p, c.verdict);
        return { ...p, line, endLine, severity };
      });
      const confirmed = checked
        .flatMap((c) => (!c.previous && c.verdict?.verdict === "confirmed" ? [settle(c.finding, c.verdict)] : []))
        .filter((f) => SEVERITIES.indexOf(f.severity) <= minRank)
        .sort(bySeverity);
      // Drop findings that repeat each other or an earlier open or dismissed one. A finding
      // that matches a fixed one was reintroduced: it replaces the fixed entry and posts again.
      const known = findings.filter((t) => t.status !== "fixed");
      const fresh: Tracked[] = [];
      let overCap = 0;
      for (const f of await dedupe(find, root, confirmed, known, log.line)) {
        // Same title, same file, far apart: two different defects, so the fingerprint gets the line.
        const base = fingerprint(f);
        const clash = [...findings, ...fresh].find((t) => t.fp === base && t.status !== "fixed" && Math.abs(t.line - f.line) > 20);
        const fp = clash ? fingerprint({ file: f.file, title: `${f.title}@${f.line}` }) : base;
        if ([...known, ...fresh].some((t) => t.fp === fp || sameIssue(t, f))) continue;
        if (fresh.length >= config.review.max_findings) {
          overCap += 1;
          continue;
        }
        const reopened = findings.findIndex((t) => t.fp === fp && t.status === "fixed");
        if (reopened >= 0) findings.splice(reopened, 1);
        fresh.push({ ...f, fp, status: "open" });
      }
      findings.push(...fresh);
      return { findings, fresh, overCap };
    });

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
    const wasOpen = new Set(prev?.findings.filter((p) => p.status === "open").map((p) => p.fp));
    const fixedNow = findings.filter((f) => f.status === "fixed" && wasOpen.has(f.fp));

    const warningText = [
      warning,
      skipped > 0 ? `${skipped} files did not fit in the review budget and were not reviewed.` : "",
      overCap > 0 ? `${overCap} more confirmed findings were over max_findings (${config.review.max_findings}) and are not shown.` : "",
      failedParts > 0 ? `${failedParts} of ${parts} parts of the diff could not be reviewed this run, so this review is partial. Comment \`/review\` to retry.` : "",
    ].filter(Boolean).join(" ");
    const modelLabel = verifyModel === model ? model : `${model} (verify: ${verifyModel})`;
    const run = {
      repo,
      head: pr.head.sha,
      model: modelLabel,
      files: diffs.length,
      candidates,
      verified,
      seconds: Math.round((Date.now() - started) / 1000),
      ...(warningText ? { warning: warningText } : {}),
    };
    const usage = verify === find
      ? find.usage
      : { calls: find.usage.calls + verify.usage.calls, prompt: find.usage.prompt + verify.usage.prompt, completion: find.usage.completion + verify.usage.completion };
    log.line(`Score ${state.score}/5: ${fresh.length} new, ${open.length} open, ${fixedNow.length} fixed. ${usage.calls} model calls, ${usage.prompt.toLocaleString("en")} in / ${usage.completion.toLocaleString("en")} out tokens.`);

    if (dryRun) {
      for (const c of inline) log.line(`\n--- inline ${c.path}:${c.start_line ? `${c.start_line}-` : ""}${c.line}\n${c.body}`);
      log.line(`\n--- summary\n${summaryBody(state, prev, outside, run)}`);
      return;
    }

    await log.phase("Post", async () => {
      if (inline.length) {
        const posted = await gh.review(number, pr.head.sha, inline).then(() => true, (e: unknown) => {
          log.warn(`Inline review failed, findings go to the summary instead: ${String(e)}`);
          return false;
        });
        if (posted) {
          // Remember each finding's comment id: it ties the finding to its thread from now on.
          const comments = await gh.reviewComments(number).catch(() => []);
          for (const f of fresh) {
            const id = comments.findLast((c) => !c.in_reply_to_id && ours(c.user?.login) && lastMarker(c.body, FINDING_TAG) === f.fp)?.id;
            if (id !== undefined) f.commentId = id;
          }
        } else {
          outside.push(...fresh.filter((f) => !outside.includes(f)));
        }
      }

      // Save the new state right away. If the edit fails, a fresh summary beats losing the
      // state, which would make the next run post the same inline comments again.
      const body = summaryBody(state, prev, outside, run);
      const saved = summaryId !== undefined && (await gh.editComment(summaryId, body).then(() => true, () => false));
      if (!saved) summaryId = (await gh.comment(number, body)).id;
      for (const old of summaries) {
        if (old.id !== summaryId) await gh.retire(old).catch((e: unknown) => log.warn(`Could not retire summary ${old.id}: ${String(e)}`));
      }

      // Close what got fixed: a "Fixed in" reply, then collapse the comment and resolve the
      // thread. Two at a time stays under GitHub's secondary rate limit on new comments.
      let unresolved = 0;
      await pool(fixedNow, 2, async (f) => {
        if (f.commentId !== undefined) {
          await gh.reply(number, f.commentId, `Fixed in ${pr.head.sha.slice(0, 7)}.`).catch((e: unknown) => log.warn(`Reply on ${f.fp} failed: ${String(e)}`));
        }
        const t = threadOf(f);
        if (!t || t.resolved) return;
        const resolved = await gh.close(t).catch((e: unknown) => {
          log.warn(`Closing ${f.fp} failed: ${String(e)}`);
          return true;
        });
        if (!resolved) unresolved += 1;
      });
      if (unresolved) log.line(`${unresolved} fixed threads collapsed but left unresolved: resolving needs Contents write on the token.`);
    });

    await log.report({
      score: state.score,
      findings: { new: fresh.length, open: open.length, fixed: fixedNow.length },
      candidates,
      verified,
      usage,
      model: modelLabel,
    });
  } catch (e) {
    // Put the previous summary back so a failed run never wipes the PR's history; on a
    // first run, say it failed instead of leaving "reviewing..." up.
    if (!dryRun && summaryId !== undefined) {
      const runUrl = `${process.env.GITHUB_SERVER_URL ?? "https://github.com"}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID ?? ""}`;
      const restore = existing?.id === summaryId ? existing.body : undefined;
      const body = restore ?? `## ReviewPilot: review failed for ${pr.head.sha.slice(0, 7)}\n\nSee the [workflow run](${runUrl}). Comment \`/review\` to retry.\n${SUMMARY_TAG}${prev ? `\n${writeState(prev)}` : ""}`;
      await gh.editComment(summaryId, body).catch(() => undefined);
    }
    throw e;
  }
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? (e.stack ?? e.message) : String(e));
  process.exitCode = 1;
});
