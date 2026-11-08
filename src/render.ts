// Markdown for the inline comments and the one summary comment ReviewPilot keeps per PR.

import type { Finding, State, Tracked } from "./state.ts";
import { findingTag, SUMMARY_TAG, writeState } from "./state.ts";

const ORDER = { critical: 0, major: 1, minor: 2 } as const;
export const bySeverity = <T extends Pick<Finding, "severity">>(a: T, b: T) => ORDER[a.severity] - ORDER[b.severity];

const fence = (lines: readonly string[]) => `\`\`\`text\n${lines.join("\n").replaceAll("```", "'''")}\n\`\`\``;

export function inlineBody(f: Tracked): string {
  const tag = f.rule ? ` · rule \`${f.rule}\`` : "";
  return [
    `**${f.title}** · ${f.severity}${tag}`,
    "",
    f.body,
    "",
    `<details><summary>Evidence</summary>\n\n${fence(f.evidence)}\n</details>`,
    findingTag(f.fp),
  ].join("\n");
}

export type Run = {
  repo: string;
  head: string;
  model: string;
  files: number;
  candidates: number;
  seconds: number;
  warning?: string;
};

export function summaryBody(state: State, prev: State | undefined, outside: readonly Tracked[], run: Run): string {
  const open = state.findings.filter((f) => f.status === "open").sort(bySeverity);
  const fixed = state.findings.filter((f) => f.status === "fixed" && prev?.findings.some((p) => p.fp === f.fp && p.status === "open"));
  const fresh = open.filter((f) => !prev?.findings.some((p) => p.fp === f.fp));
  const link = (f: Finding) => `[${f.file.split("/").pop()}:${f.line}](https://github.com/${run.repo}/blob/${run.head}/${f.file}#L${f.line})`;

  const lines = [`## ReviewPilot: ${state.score}/5`];
  if (prev && prev.head !== state.head) {
    const move: string = prev.score === state.score ? `${state.score}/5` : `${prev.score}/5 → ${state.score}/5`;
    lines.push(`<sub>Since ${prev.head.slice(0, 7)}: ${move} · ${fixed.length} fixed · ${fresh.length} new · ${open.length} open</sub>`);
  }
  lines.push("");

  if (open.length) {
    lines.push("| Severity | Finding | Where |", "| --- | --- | --- |");
    for (const f of open) lines.push(`| ${f.severity} | ${f.title.replaceAll("|", "\\|")} | ${link(f)} |`);
  } else {
    lines.push("No verified issues.");
  }

  if (outside.length) {
    lines.push("", "**Outside the changed lines**", "");
    for (const f of outside) lines.push(`- **${f.title}** (${link(f)}, ${f.severity}): ${f.body}`);
  }
  if (fixed.length) {
    lines.push("", `<details><summary>Fixed since last review (${fixed.length})</summary>\n`);
    for (const f of fixed) lines.push(`- ${f.title} (${f.file}:${f.line})`);
    lines.push("\n</details>");
  }
  if (run.warning) lines.push("", `> ${run.warning}`);

  const time = run.seconds >= 60 ? `${Math.floor(run.seconds / 60)}m ${run.seconds % 60}s` : `${run.seconds}s`;
  lines.push(
    "",
    `<sub>Reviewed ${run.head.slice(0, 7)} with ${run.model} · ${run.files} files · ${run.candidates} candidates checked · ${time}. Every finding was re-checked against the code before posting.</sub>`,
    SUMMARY_TAG,
    writeState(state),
  );
  return lines.join("\n");
}

export const progressBody = (head: string, prev: string | undefined) =>
  [
    `## ReviewPilot: reviewing ${head.slice(0, 7)}`,
    "",
    "Reading the diff and the code around it, then re-checking each finding. This usually takes a few minutes.",
    SUMMARY_TAG,
    prev ?? "",
  ].join("\n");

