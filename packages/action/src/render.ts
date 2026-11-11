// Markdown for the inline comments and the one summary comment ReviewPilot keeps per PR.

import type { Annotation, CheckUpdate } from "./github.ts";
import type { Finding, State, Tracked } from "./state.ts";
import { findingTag, SUMMARY_TAG, writeState } from "./state.ts";

const ORDER = { critical: 0, major: 1, minor: 2 } as const;
export const bySeverity = <T extends Pick<Finding, "severity">>(a: T, b: T) => ORDER[a.severity] - ORDER[b.severity];

/**
 * Model text is untrusted (a PR can steer it), so it never carries an HTML comment into a
 * posted comment: that is where ReviewPilot keeps its state markers. Other HTML is left to
 * GitHub's sanitiser, and `<` stays as is so code like `Array<string>` renders right.
 */
export const clean = (text: string) => text.replace(/<!--|-->/g, "");

/** Clean model text on one line, safe inside a table cell or list item. */
const flat = (text: string) => clean(text).replace(/\s+/g, " ").trim();

/** Markdown link text without brackets that could close the link early. */
const linkText = (text: string) => flat(text).replace(/[[\]()]/g, "");

const fence = (lines: readonly string[]) => `\`\`\`text\n${lines.join("\n").replaceAll("```", "'''")}\n\`\`\``;

export function inlineBody(f: Tracked): string {
  const tag = f.rule ? ` · rule \`${linkText(f.rule)}\`` : "";
  return [
    `**${flat(f.title)}** · ${f.severity}${tag}`,
    "",
    clean(f.body),
    "",
    `<details><summary>Evidence</summary>\n\n${fence(f.evidence.map(clean))}\n</details>`,
    findingTag(f.fp),
  ].join("\n");
}

export type Run = {
  repo: string;
  head: string;
  model: string;
  files: number;
  /** Files the find agents checked; the rest were unchanged since the last review, or are retried next run. */
  reviewed: number;
  candidates: number;
  verified: number;
  seconds: number;
  /** Where the time went, e.g. `find 2m 1s, verify 48.0s`. */
  timing: string;
  /** Input tokens, and how many of them the provider served from its prompt cache. */
  tokens: { prompt: number; cached: number };
  warning?: string;
};

export const duration = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);

const count = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(n));

const tokens = (t: Run["tokens"]) => {
  if (!t.prompt) return "no model calls";
  const share = Math.floor((t.cached / t.prompt) * 100);
  return `${count(t.prompt)} tokens in${share > 0 ? `, ${share}% cached` : ""}`;
};

/**
 * The ReviewPilot check's result: passes only at a full 5/5, the score in its title, and each
 * open finding as an annotation on its lines (GitHub takes up to 50 per update). A partial
 * review (files skipped, parts or checks that failed) is never green: 5/5 there is neutral.
 */
export function checkResult(state: State, run: Run, summaryUrl: string, partial: boolean): CheckUpdate {
  const open = state.findings.filter((f) => f.status === "open").sort(bySeverity);
  const annotations: Annotation[] = open.slice(0, 50).map((f) => ({
    path: f.file,
    // GitHub rejects the whole update for one bad annotation, so lines start at 1 and
    // messages stay well under its 64 KB limit.
    start_line: Math.max(1, f.line),
    end_line: Math.max(1, f.line, f.endLine),
    annotation_level: f.severity === "minor" ? "warning" : "failure",
    title: `${f.severity}: ${flat(f.title)}`.slice(0, 255),
    message: clean(f.body).slice(0, 4000),
  }));
  return {
    conclusion: state.score < 5 ? "failure" : partial ? "neutral" : "success",
    details_url: summaryUrl,
    output: {
      title: `${state.score}/5${partial ? " (partial)" : ""} · ${open.length} open · ${duration(run.seconds)}`,
      summary: [
        `**${state.score}/5** on ${run.head.slice(0, 7)}. [Full summary](${summaryUrl}).`,
        ...(run.warning ? ["", `> ${run.warning}`] : []),
        ...(open.length > annotations.length ? ["", `${open.length - annotations.length} more open findings are in the summary.`] : []),
        "",
        `${run.reviewed === run.files ? `${run.files} files` : `${run.reviewed} of ${run.files} files read`} · ${run.candidates} candidates, ${run.verified} checks · ${duration(run.seconds)} (${run.timing}) · ${tokens(run.tokens)}`,
      ].join("\n"),
      annotations,
    },
  };
}

export function summaryBody(state: State, prev: State | undefined, outside: readonly Tracked[], run: Run): string {
  const open = state.findings.filter((f) => f.status === "open").sort(bySeverity);
  const fixed = state.findings.filter((f) => f.status === "fixed" && prev?.findings.some((p) => p.fp === f.fp && p.status === "open"));
  const fresh = open.filter((f) => !prev?.findings.some((p) => p.fp === f.fp && p.status === "open"));
  const link = (f: Finding) =>
    `[${linkText(f.file.split("/").pop() ?? f.file)}:${f.line}](https://github.com/${run.repo}/blob/${run.head}/${f.file.split("/").map(encodeURIComponent).join("/")}#L${f.line})`;

  const lines = [`## ReviewPilot: ${state.score}/5`];
  if (prev && prev.head !== state.head) {
    const move: string = prev.score === state.score ? `${state.score}/5` : `${prev.score}/5 → ${state.score}/5`;
    lines.push(`<sub>Since ${prev.head.slice(0, 7)}: ${move} · ${fixed.length} fixed · ${fresh.length} new · ${open.length} open</sub>`);
  }
  lines.push("");

  if (open.length) {
    lines.push("| Severity | Finding | Where |", "| --- | --- | --- |");
    for (const f of open.filter((o) => !outside.includes(o))) lines.push(`| ${f.severity} | ${flat(f.title).replaceAll("|", "\\|")} | ${link(f)} |`);
  } else {
    lines.push("No verified issues.");
  }

  if (outside.length) {
    lines.push("", "**Outside the changed lines**", "");
    for (const f of outside) lines.push(`- **${flat(f.title)}** (${link(f)}, ${f.severity}): ${flat(f.body)}`);
  }
  if (fixed.length) {
    lines.push("", `<details><summary>Fixed since last review (${fixed.length})</summary>\n`);
    for (const f of fixed) lines.push(`- ${flat(f.title)} (${f.file}:${f.line})`);
    lines.push("\n</details>");
  }
  if (run.warning) lines.push("", `> ${run.warning}`);

  lines.push(
    "",
    `<sub>Reviewed ${run.head.slice(0, 7)} with ${run.model} · ${run.reviewed === run.files ? `${run.files} files` : `${run.reviewed} of ${run.files} files read`} · ${run.candidates} candidates, ${run.verified} checks · ${duration(run.seconds)} (${run.timing}) · ${tokens(run.tokens)}. Every finding was re-checked against the code before posting.</sub>`,
    SUMMARY_TAG,
    writeState(state),
  );
  return lines.join("\n");
}

/** How a summary in progress starts. A stopped run never restores one of these. */
export const PROGRESS = "## ReviewPilot: reviewing";

export const progressBody = (head: string, prev: string | undefined) =>
  [
    `${PROGRESS} ${head.slice(0, 7)}`,
    "",
    "Reading the diff and the code around it, then re-checking each finding. This usually takes a few minutes.",
    SUMMARY_TAG,
    prev ?? "",
  ].join("\n");

