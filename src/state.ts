// Findings, the 1-5 score, and the state ReviewPilot keeps between runs. State lives in a
// hidden marker inside its summary comment, so a PR carries its own history and no
// database is needed.

import { createHash } from "node:crypto";
import { type } from "arktype";

export const SEVERITIES = ["critical", "major", "minor"] as const;
export type Severity = (typeof SEVERITIES)[number];

const FindingSchema = type({
  file: "string",
  line: "number.integer",
  endLine: "number.integer",
  severity: type.enumerated(...SEVERITIES),
  title: "string",
  body: "string",
  /** Exact lines that prove the finding, as `file:line` with the code. */
  evidence: "string[]",
  "rule?": "string",
});

const TrackedSchema = FindingSchema.and({
  fp: "string",
  status: "'open' | 'fixed' | 'dismissed'",
  /** Review comment id of the inline comment, once posted. */
  "commentId?": "number",
});

/** The state stored in the summary comment. It is read back as untrusted input. */
const StateSchema = type({ head: "string", score: "1 | 2 | 3 | 4 | 5", findings: TrackedSchema.array() });

export type Finding = typeof FindingSchema.infer;
export type Tracked = typeof TrackedSchema.infer;
export type State = typeof StateSchema.infer;
export type Score = State["score"];

/**
 * The score is derived from verified findings, never asked of the model, so it only moves
 * when findings change: 5 none, 4 minor only, 3 a major, 2 a critical, 1 several criticals.
 */
export function score(findings: readonly Pick<Finding, "severity">[]): Score {
  const critical = findings.filter((f) => f.severity === "critical").length;
  if (critical >= 2) return 1;
  if (critical === 1) return 2;
  if (findings.some((f) => f.severity === "major")) return 3;
  return findings.length > 0 ? 4 : 5;
}

/** Stable id for a finding: same file and title is the same finding across runs. */
export function fingerprint(f: Pick<Finding, "file" | "title">): string {
  const title = f.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return createHash("sha1").update(`${f.file}\n${title}`).digest("hex").slice(0, 12);
}

/** A new finding near an earlier one in the same file is treated as the same finding. */
export function sameIssue(a: Pick<Finding, "file" | "line">, b: Pick<Finding, "file" | "line">): boolean {
  return a.file === b.file && Math.abs(a.line - b.line) <= 5;
}

const MARKER = /<!-- reviewpilot:state (.+?) -->/s;

export function readState(body: string): State | undefined {
  const json = body.match(MARKER)?.[1];
  if (!json) return undefined;
  try {
    const out = StateSchema(JSON.parse(Buffer.from(json, "base64").toString("utf8")));
    return out instanceof type.errors ? undefined : out;
  } catch {
    return undefined;
  }
}

/**
 * Fixed and dismissed findings keep only what matching needs, and only the latest 100 of
 * them, so the summary stays under GitHub's 65,536-character comment limit on long PRs.
 */
export function writeState(state: State): string {
  const open = state.findings
    .filter((f) => f.status === "open")
    .map((f) => ({ ...f, body: f.body.slice(0, 1500), evidence: f.evidence.slice(0, 6).map((e) => e.slice(0, 300)) }));
  const closed = state.findings
    .filter((f) => f.status !== "open")
    .slice(-100)
    .map((f) => ({ ...f, body: "", evidence: [] }));
  const json = JSON.stringify({ ...state, findings: [...open, ...closed] });
  return `<!-- reviewpilot:state ${Buffer.from(json).toString("base64")} -->`;
}

export const SUMMARY_TAG = "<!-- reviewpilot:summary -->";
export const findingTag = (fp: string) => `<!-- reviewpilot:fp=${fp} -->`;
export const FINDING_TAG = /<!-- reviewpilot:fp=([0-9a-f]{12}) -->/;
