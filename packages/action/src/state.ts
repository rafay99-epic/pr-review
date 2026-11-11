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

/**
 * The state stored in the summary comment. It is read back as untrusted input. `files` maps
 * each reviewed path to the diffHash it had then, so a push only re-reads what changed.
 */
const StateSchema = type({
  head: "string",
  score: "1 | 2 | 3 | 4 | 5",
  findings: TrackedSchema.array(),
  "files?": "Record<string, string>",
});

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

/** Hash of one file's PR diff: unchanged across pushes means nothing new to find in it. */
export const diffHash = (numbered: string) => createHash("sha1").update(numbered).digest("hex").slice(0, 12);

/** A new finding within two lines of an earlier one in the same file is treated as the same finding. */
export function sameIssue(a: Pick<Finding, "file" | "line">, b: Pick<Finding, "file" | "line">): boolean {
  return a.file === b.file && Math.abs(a.line - b.line) <= 2;
}

/** The last match of a marker in a body: ReviewPilot writes its own markers at the end. */
export const lastMarker = (body: string, marker: RegExp) => [...body.matchAll(marker)].at(-1)?.[1];

const MARKER = /<!-- reviewpilot:state ([A-Za-z0-9+/=]+) -->/g;

export function readState(body: string): State | undefined {
  const json = lastMarker(body, MARKER);
  if (!json) return undefined;
  try {
    const out = StateSchema(JSON.parse(Buffer.from(json, "base64").toString("utf8")));
    return out instanceof type.errors ? undefined : out;
  } catch {
    return undefined;
  }
}

/** JSON characters the reviewed-file hashes may take, about 300 files. */
const FILES_BUDGET = 20_000;

/** Encoded state never exceeds this, leaving room for the markdown in a 65,536-character comment. */
export const STATE_BUDGET = 48_000;

/**
 * Encodes state within STATE_BUDGET. Closed findings keep only what matching needs (latest
 * 100); open ones are trimmed in steps (evidence, then bodies, then the oldest closed) until
 * it fits, so a long-lived PR can never push the summary past GitHub's comment limit.
 */
export function writeState(full: State): string {
  // Past FILES_BUDGET the hashes are dropped: the next push re-reads every file, and the
  // findings keep the room.
  const { files, ...rest } = full;
  const state = files && JSON.stringify(files).length <= FILES_BUDGET ? { ...rest, files } : rest;
  const open = state.findings.filter((f) => f.status === "open");
  let closed = state.findings.filter((f) => f.status !== "open").slice(-100).map((f) => ({ ...f, body: "", evidence: [] }));
  const steps = [
    (f: Tracked) => ({ ...f, title: f.title.slice(0, 200), body: f.body.slice(0, 1500), evidence: f.evidence.slice(0, 6).map((e) => e.slice(0, 300)) }),
    (f: Tracked) => ({ ...f, title: f.title.slice(0, 200), body: f.body.slice(0, 600), evidence: f.evidence.slice(0, 2).map((e) => e.slice(0, 200)) }),
    (f: Tracked) => ({ ...f, title: f.title.slice(0, 160), body: f.body.slice(0, 300), evidence: f.evidence.slice(0, 1).map((e) => e.slice(0, 160)) }),
    (f: Tracked) => ({ ...f, title: f.title.slice(0, 120), body: "", evidence: [] }),
    (f: Tracked) => ({ ...f, title: f.title.slice(0, 60), body: "", evidence: [] }),
  ];
  const encode = (findings: Tracked[]) => Buffer.from(JSON.stringify({ ...state, findings })).toString("base64");
  let out = "";
  for (const step of steps) {
    out = encode([...open.map(step), ...closed]);
    if (out.length <= STATE_BUDGET) break;
  }
  // Still too big: closed findings go first, then the oldest open ones (a last resort no
  // real PR should reach; the newest findings are the ones a reader is acting on).
  let kept = open.map(steps.at(-1) ?? ((f: Tracked) => f));
  while (out.length > STATE_BUDGET && closed.length) {
    closed = closed.slice(Math.ceil(closed.length / 2));
    out = encode([...kept, ...closed]);
  }
  while (out.length > STATE_BUDGET && kept.length) {
    kept = kept.slice(Math.ceil(kept.length / 10));
    out = encode(kept);
  }
  return `<!-- reviewpilot:state ${out} -->`;
}

export const SUMMARY_TAG = "<!-- reviewpilot:summary -->";
export const findingTag = (fp: string) => `<!-- reviewpilot:fp=${fp} -->`;
export const FINDING_TAG = /<!-- reviewpilot:fp=([0-9a-f]{12}) -->/g;
