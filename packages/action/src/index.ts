// ReviewPilot entry point, run as a GitHub Action (or locally with REVIEWPILOT_DRY_RUN=1).
// One run: resolve the PR, check out its head, find and verify issues, then post new
// findings inline and refresh the single summary comment with the score and the delta.

import { readFile } from "node:fs/promises";
import { type } from "arktype";
import { ignored, loadConfig, rulesFor } from "./config.ts";
import { anchor, parseDiff } from "./diff.ts";
import { checkoutPr, diff, fetchRef, readAt } from "./git.ts";
import { type CheckUpdate, createGitHub, type InlineComment, type Thread } from "./github.ts";
import { createLlm } from "./llm.ts";
import { createLog, seconds } from "./log.ts";
import { bySeverity, checkResult, inlineBody, PROGRESS, progressBody, summaryBody } from "./render.ts";
import { dedupe, focus, pool, review, settle } from "./review.ts";
import {
  diffHash,
  FINDING_TAG,
  fingerprint,
  lastMarker,
  postedOnHead,
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

/**
 * A newer push makes this run stale, and the server stops it with SIGTERM (also used for its
 * time limit). Before posting that is safe: the summary is put back as it was and the next
 * run starts from the same state. Once posting starts the run finishes it.
 */
let posting = false;
/** Set on SIGTERM before posting: the run must not start posting while its summary is put back. */
let stopping = false;
/** Restores the summary this run replaced with "reviewing"; set once it has done so. */
let putBack: (() => Promise<unknown>) | undefined;
process.on("SIGTERM", () => {
  if (posting || stopping) return;
  stopping = true;
  // Bounded, so a hung GitHub call cannot keep a stopped run alive.
  void Promise.race([putBack?.(), new Promise((r) => setTimeout(r, 10_000))]).finally(() => process.exit(143));
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
    if (!/^\/review(\s|$)/.test(comment.body.trim())) return log.line("Comment is not /review, nothing to do.");
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

  // The ReviewPilot check: live on the PR's checks while the review runs, then the score with
  // each open finding as an annotation. Without Checks write on the token there is no check.
  const checkId = dryRun
    ? undefined
    : await gh
      .createCheck(pr.head.sha, {
        status: "in_progress",
        started_at: new Date(started).toISOString(),
        output: { title: "Reviewing", summary: `Reviewing ${pr.head.sha.slice(0, 7)}. The score and findings appear here when it is done.` },
      })
      .then((c) => c.id, (e: unknown) => {
        log.warn(`No ReviewPilot check, the token needs Checks write: ${String(e).slice(0, 200)}`);
        return undefined;
      });
  // A run killed outright (SIGKILL, a crash) leaves its check in progress; the next run on
  // the same commit closes those so the commit never shows a review that is not running.
  if (checkId !== undefined) {
    const leftover = await gh.runningChecks(pr.head.sha).catch(() => []);
    for (const id of leftover.filter((id) => id !== checkId)) {
      await gh
        .updateCheck(id, { status: "completed", conclusion: "cancelled", completed_at: new Date().toISOString(), output: { title: "Replaced", summary: "A newer review run replaced this one." } })
        .catch(() => undefined);
    }
  }
  const finishCheck = (body: CheckUpdate) =>
    checkId === undefined
      ? Promise.resolve()
      : gh.updateCheck(checkId, { status: "completed", completed_at: new Date().toISOString(), ...body })
        .then(() => undefined, (e: unknown) => log.warn(`Could not finish the ReviewPilot check: ${String(e).slice(0, 200)}`));

  // Puts the previous summary back so a failed or stopped run never wipes the PR's history;
  // on a first run, says what happened instead of leaving "reviewing..." up. Runs once, even
  // when a stop and a failure both reach it. Never after the new summary is saved.
  let restoring: Promise<void> | undefined;
  let stateSaved = false;
  const restoreSummary = (what: "failed" | "stopped") => (restoring ??= putBackSummary(what));
  const putBackSummary = async (what: "failed" | "stopped") => {
    if (dryRun || summaryId === undefined || stateSaved) return;
    await finishCheck({
      conclusion: what === "stopped" ? "cancelled" : "neutral",
      output: { title: what === "stopped" ? "Stopped" : "Review failed", summary: what === "stopped" ? "A newer push or the time limit stopped this review." : "The review failed. Comment `/review` to retry." },
    });
    const runUrl = `${process.env.GITHUB_SERVER_URL ?? "https://github.com"}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID ?? ""}`;
    // A "reviewing" summary left by a killed run is not worth restoring: it would claim a
    // review that is not running. The stopped or failed note below carries the same state.
    const restore = existing?.id === summaryId && !existing.body.startsWith(PROGRESS) ? existing.body : undefined;
    const why = what === "stopped"
      ? "A newer push or the time limit stopped it."
      : process.env.GITHUB_RUN_ID ? `See the [workflow run](${runUrl}).` : "See the ReviewPilot server logs.";
    const body = restore ?? `## ReviewPilot: review ${what} for ${pr.head.sha.slice(0, 7)}\n\n${why} Comment \`/review\` to retry.\n${SUMMARY_TAG}${prev ? `\n${writeState(prev)}` : ""}`;
    await gh.editComment(summaryId, body).catch(() => undefined);
  };
  putBack = () => restoreSummary("stopped");

  try {
    const { config, warning, mergeBase, defaultRef } = await log.phase("Checkout", async () => {
      const mergeBase = await checkoutPr(root, number, pr.head.sha, pr.base);
      const defaultRef = await fetchRef(root, pr.base.repo.default_branch);
      return { mergeBase, defaultRef, ...loadConfig(await readAt(root, defaultRef, ".reviewpilot.yml")) };
    });
    if (warning) log.warn(warning);
    const model = input("model") ?? config.model.name;
    const verifyModel = input("verify_model") ?? config.model.verify;
    const baseUrl = input("base_url") ?? process.env.REVIEWPILOT_BASE_URL ?? "https://api.commandcode.ai/provider/v1";

    const { diffs, skipped, guidance, threads, touched } = await log.phase("Diff and context", async () => {
      const all = parseDiff(await diff(root, mergeBase, pr.head.sha, config.review.ignore));
      // Files without hunks (binary, mode-only changes) have nothing to review.
      const reviewable = all.filter((d) => !ignored(config, d.path) && d.commentable.size > 0);
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
      return { diffs, skipped: reviewable.length - diffs.length, guidance, threads, touched: new Set(all.map((d) => d.path)) };
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
      // The PR no longer changes this file (reverted, or now ignored): nothing left to check.
      if (!touched.has(p.file)) {
        p.status = "fixed";
        continue;
      }
      const t = threadOf(p);
      const replied = t?.comments.slice(1).some((c) => c.author === pr.user.login || MAINTAINERS.has(c.association));
      const resolved = t?.resolved && !ours(t.resolvedBy);
      if (resolved || replied || SEVERITIES.indexOf(p.severity) > minRank) p.status = "dismissed";
    }

    const llm = (m: string) => createLlm({ baseUrl, apiKey, model: m, effort: config.model.effort });
    const find = llm(model);
    const verify = verifyModel === model ? find : llm(verifyModel);
    // A push re-reads only files whose diff moved since the last review, unless the repo's
    // config says `scope: all`; `/review` reads everything.
    const seen = comment || config.review.scope === "all" ? undefined : prev?.files;
    const scope = focus(diffs, seen);
    const { checked, candidates, verified, failedParts, parts, reviewed, findMs, verifyMs } = await log.phase("Review", () =>
      review({
        find,
        verify,
        root,
        config,
        rules: rulesFor(config, diffs.map((d) => d.path)),
        guidance,
        pr: { title: pr.title, body: pr.body ?? "" },
        diffs,
        scope,
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
    const done = new Set(reviewed);
    const files: Record<string, string> = {};
    for (const d of diffs) {
      const hash = done.has(d.path) ? diffHash(d.numbered) : seen?.[d.path];
      if (hash) files[d.path] = hash;
    }
    const state: State = { head: pr.head.sha, score: score(open), findings, files };

    // A run stopped mid-post (deploy, kill) may have posted some of these on this head
    // already: they keep that comment instead of getting a second one.
    const comments = !dryRun && fresh.length
      ? await gh.reviewComments(number).catch((e: unknown) => {
        log.warn(`Could not read review comments, so already posted findings may post again: ${String(e)}`);
        return [];
      })
      : [];
    const posted = postedOnHead(comments, pr.head.sha, ours);

    // New findings go inline where the diff allows; the rest go to the summary.
    const byPath = new Map(diffs.map((d) => [d.path, d]));
    const inline: InlineComment[] = [];
    const outside: Tracked[] = [];
    for (const f of fresh) {
      const id = posted.get(f.fp);
      if (id !== undefined) {
        f.commentId = id;
        continue;
      }
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
    const usage = verify === find
      ? find.usage
      : {
        calls: find.usage.calls + verify.usage.calls,
        prompt: find.usage.prompt + verify.usage.prompt,
        completion: find.usage.completion + verify.usage.completion,
        cached: find.usage.cached + verify.usage.cached,
      };
    const elapsed = Date.now() - started;
    const run = {
      repo,
      head: pr.head.sha,
      model: modelLabel,
      files: diffs.length,
      reviewed: reviewed.length,
      candidates,
      verified,
      seconds: Math.round(elapsed / 1000),
      timing: `find ${seconds(findMs)}, verify ${seconds(verifyMs)}, rest ${seconds(Math.max(0, elapsed - findMs - verifyMs))}`,
      tokens: { prompt: usage.prompt, cached: usage.cached },
      ...(warningText ? { warning: warningText } : {}),
    };
    log.line(`Score ${state.score}/5: ${fresh.length} new, ${open.length} open, ${fixedNow.length} fixed. ${usage.calls} model calls, ${usage.prompt.toLocaleString("en")} in (${usage.cached.toLocaleString("en")} cached) / ${usage.completion.toLocaleString("en")} out tokens.`);

    if (dryRun) {
      for (const c of inline) log.line(`\n--- inline ${c.path}:${c.start_line ? `${c.start_line}-` : ""}${c.line}\n${c.body}`);
      log.line(`\n--- summary\n${summaryBody(state, prev, outside, run)}`);
      return;
    }

    // Stopped meanwhile: the SIGTERM handler is restoring the summary and exits when done.
    if (stopping) return;
    posting = true;
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
      stateSaved = true;
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

      // Files skipped, parts that failed, or candidates whose check failed: not a full review.
      const partial = skipped > 0 || failedParts > 0 || checked.some((c) => !c.verdict);
      const result = checkResult(state, run, `https://github.com/${repo}/pull/${number}#issuecomment-${summaryId}`, partial);
      // One bad annotation fails the whole update; the check must not stay "in progress".
      const finished = checkId !== undefined && (await gh.updateCheck(checkId, { status: "completed", completed_at: new Date().toISOString(), ...result }).then(() => true, () => false));
      if (checkId !== undefined && !finished && result.output) await finishCheck({ ...result, output: { ...result.output, annotations: [] } });
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
    // After the new summary is saved, the review is posted: only the check says a later step failed.
    if (stateSaved) {
      await finishCheck({ conclusion: "neutral", output: { title: "Posted, then a later step failed", summary: "The review and its summary are posted. A later step failed; see the logs." } });
    } else {
      await restoreSummary("failed");
    }
    throw e;
  }
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? (e.stack ?? e.message) : String(e));
  process.exitCode = 1;
});
