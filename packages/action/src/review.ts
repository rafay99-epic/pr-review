// The two passes. Find: one agent per part of the diff reads it, pulls whatever context it
// needs and lists candidate defects. Verify: a fresh agent per candidate tries to disprove it
// against the code, and only what survives is posted.

import { type } from "arktype";
import type { Submit } from "./agent.ts";
import { runAgent } from "./agent.ts";
import type { Config, Rule } from "./config.ts";
import type { FileDiff } from "./diff.ts";
import type { Llm, ToolSpec } from "./llm.ts";
import { bySeverity } from "./render.ts";
import { diffHash, type Finding, SEVERITIES, type Severity, type Tracked } from "./state.ts";
import { inside } from "./tools.ts";

const Severity = type.enumerated(...SEVERITIES);

// Each schema below is both the validator for what the model submits and, through
// toJsonSchema(), the tool definition the model sees, so the two cannot drift apart.
const Candidate = type({
  file: type("string > 0").describe("Repository-relative path"),
  line: type("number.integer > 0").describe("First line of the defect at the PR head"),
  "end_line?": type("number.integer > 0").describe("Last line, if it spans several"),
  severity: Severity,
  title: type("string > 0").describe("A few words stating the defect"),
  body: type("string > 0").describe("What breaks, the trigger, and the result. 2-4 plain sentences."),
  evidence: type("string[] > 0").describe('Lines that prove it, each "path:line: code"'),
  "rule?": type("string").describe("Repository rule id, if the finding breaks one"),
});

const Findings = type({
  checked_files: type("string[]").describe("Every changed file you checked"),
  findings: Candidate.array(),
});

const Verdict = type({
  verdict: "'confirmed' | 'rejected'",
  reason: type("string > 0").describe("One or two sentences"),
  evidence: type("string[]").describe('Lines you checked, each "path:line: code"'),
  severity: Severity,
  "title?": type("string").describe("Corrected title, if confirmed and the original is off"),
  "body?": type("string").describe("Corrected body, if confirmed and the original overstates or misdescribes it"),
  "line?": type("number.integer > 0").describe("Corrected first line at the PR head, if the cited one is wrong"),
  "end_line?": type("number.integer > 0").describe("Corrected last line, if the cited one is wrong"),
});

/** A tool definition whose parameters are generated from an ArkType schema. */
function toolSpec(name: string, description: string, schema: type.Any): ToolSpec {
  const parameters = Object.fromEntries(Object.entries(schema.toJsonSchema()).filter(([key]) => key !== "$schema"));
  return { type: "function", function: { name, description, parameters } };
}

/** A find agent's answer: its candidates, and the files it says it checked. */
type FindResult = { findings: Finding[]; checked: Set<string> };

function submitFindings(changed: readonly string[]): Submit<FindResult> {
  return {
    spec: toolSpec("submit_findings", "Submit the review. Call once, after checking every changed file.", Findings),
    parse(args, final) {
      const out = Findings(args);
      if (out instanceof type.errors) return { ok: false, error: out.summary };
      // Coverage is enforced until the budget runs out; then a partial review beats none.
      const checked = new Set(out.checked_files.map((f) => f.replace(/^\.\//, "")));
      const missed = changed.filter((f) => !checked.has(f));
      if (missed.length && !final) return { ok: false, error: `you have not checked: ${missed.join(", ")}` };
      return {
        ok: true,
        value: {
          // A forced answer means the agent ran out of budget, so its list is not trusted:
          // none of the part's files count as reviewed and the next push reads them again.
          checked: final ? new Set<string>() : checked,
          findings: out.findings.map((c) => ({
          file: c.file.replace(/^\.\//, ""),
          line: c.line,
          endLine: Math.max(c.line, c.end_line ?? c.line),
          severity: c.severity,
          title: c.title.trim(),
          body: c.body.trim(),
          evidence: c.evidence,
          ...(c.rule ? { rule: c.rule } : {}),
          })),
        },
      };
    },
  };
}

export type VerdictResult = typeof Verdict.infer;

const submitVerdict: Submit<VerdictResult> = {
  spec: toolSpec("submit_verdict", "Submit the verdict on the finding.", Verdict),
  parse(args) {
    const out = Verdict(args);
    return out instanceof type.errors ? { ok: false, error: out.summary } : { ok: true, value: out };
  },
};

const FIND_SYSTEM = `You are ReviewPilot, a senior engineer reviewing a pull request. Find the defects this PR introduces.
You are the first of two passes. You find candidates; a separate verifier then checks each one in depth against the code and throws out anything it cannot prove. So your job is recall: a real bug you skip is lost for good, while a candidate the verifier rejects costs little. List every specific, concrete suspicion.

You get part of the diff (other parts go to other reviewers), and you can read any file at the PR head, search the repository and list directories. Use them briefly to understand the code: open a caller, type or helper when you need it to see whether something is a problem. You have a small tool budget, so do not try to prove everything; leave deep checking to the verifier. Drop a candidate only when the code you have seen clearly rules it out, such as a guard or early return that already handles the case.

Go through every changed file in your part. Look for:
- logic bugs: wrong conditions, off-by-one, inverted checks, wrong variable, stale state, broken async ordering
- unhandled cases: null or empty input, error paths, retries, races, partial failure
- security and privacy: injection, XSS, SSRF, path traversal, missing auth or ownership checks, secrets in code or logs, one user's data reaching another, trusting client input
- data: schema or stored-data changes without a migration or backfill, data loss, breaking existing records or older clients
- what the change misses: a caller, type, config or code path that the new behaviour should have updated but did not
- inconsistency with how the same thing is done elsewhere in this repository
- the repository rules, if any are given

Do not report: formatting, naming or style; "add tests" or "add logging" as generic advice; problems that existed before this PR in code it does not touch; behaviour that a test in the diff or a code comment says is intended. That last exemption never covers security or privacy: if the intended behaviour itself lets one user's data reach another user, skips an auth or ownership check, or exposes a secret, report it.

Severity:
- critical: security or privacy hole, data loss or corruption, crash or broken build on a main path
- major: wrong behaviour real users will hit
- minor: a real but narrow edge case, or an inconsistency that will cause bugs later

Finish by calling submit_findings once. List every changed file in your part that you checked. For each candidate give file and line (new-side numbers from the diff, or the file's own numbering for code you opened), a title of a few words, a body of 2-4 plain sentences (what breaks, the input or sequence that triggers it, the result, and what the verifier should check), and evidence: the lines involved, each as "path:line: code". Be specific: "X is null when Y, so Z throws" is a candidate; "this could have edge cases" is not. An empty list is right only when you found nothing specific.`;

const VERIFY_SYSTEM = `You verify one code review finding on a pull request. Assume it is wrong until the code proves it right. You can read any file at the PR head, search the repository and list directories.

Check, in order:
1. The cited lines exist at the PR head and say what the finding claims.
2. Trace the trigger: follow the input through the actual code to the wrong result. Open every function, type and caller on the way. Do not assume what any of them do.
3. Look for anything that already prevents it: a guard, early return, validation, type constraint, a caller that never passes that input, or a test or comment in the PR showing the behaviour is intended. Intent does not clear a security or privacy problem: if the intended behaviour lets one user's data reach another user, skips an auth or ownership check, or exposes a secret, it still counts.
4. The PR introduced it: the lines are added or changed in the diff, or the diff changed something they depend on.

Claims about external tools, package versions, APIs or platform behaviour are only provable when the repository itself shows the problem (a lockfile, a test, docs or code in the repo). Your memory of a tool's current version or config keys can be out of date: reject such a claim if the repository cannot confirm it.

Confirm only if every step holds. Reject if any step fails or you cannot finish the check. Confirming a false finding costs more than rejecting a real one.

Exception: for a finding reported on an earlier commit, the only question is whether the problem is still in the code. A rejection marks it fixed, so reject only when you can show the current code no longer has it; if you cannot finish the check, confirm it.

Call submit_verdict with the verdict, a one or two sentence reason, the evidence lines you checked ("path:line: code"), and the severity you would give it. When confirming, also give a corrected title and body if the original overstates or misdescribes the problem.`;

function repoSection(config: Config, rules: readonly Rule[], guidance: string): string {
  const parts: string[] = [];
  if (rules.length) {
    parts.push(
      "Repository rules (cite the id in `rule` when a finding breaks one):\n" +
        rules.map((r) => `- ${r.id} [${r.severity ?? "major"}]: ${r.rule}`).join("\n"),
    );
  }
  if (config.instructions.trim()) parts.push(`Repository instructions:\n${config.instructions.trim()}`);
  if (guidance.trim()) parts.push(`Repository guidance (from its agent docs, default branch):\n${guidance.trim()}`);
  return parts.length ? `\n\n${parts.join("\n\n")}` : "";
}

export const pool = async <T, R>(items: readonly T[], size: number, fn: (item: T, index: number) => Promise<R>) => {
  const results: R[] = new Array(items.length);
  const queue = items.entries();
  // Workers share one iterator, so each item is taken exactly once.
  const worker = async () => {
    for (const [i, item] of queue) results[i] = await fn(item, i);
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
  return results;
};

/** Groups files into parts of about `size` characters; a file larger than that is its own part. */
export function chunk(diffs: readonly FileDiff[], size: number): FileDiff[][] {
  const parts: FileDiff[][] = [];
  let current: FileDiff[] = [];
  let length = 0;
  for (const d of diffs) {
    if (current.length && length + d.numbered.length > size) {
      parts.push(current);
      current = [];
      length = 0;
    }
    current.push(d);
    length += d.numbered.length;
  }
  if (current.length) parts.push(current);
  return parts;
}

/**
 * The files the find pass reads: those whose diff changed since the last review (`seen` maps
 * path to diffHash). With no record, every file is read.
 */
export const focus = (diffs: readonly FileDiff[], seen: Readonly<Record<string, string>> | undefined) =>
  seen ? diffs.filter((d) => seen[d.path] !== diffHash(d.numbered)) : [...diffs];

/**
 * Whether an earlier finding needs the verifier again: only when its file, or a file its
 * evidence cites, is among the changed files. Otherwise its last verdict stands.
 */
export function stale(f: Pick<Finding, "file" | "evidence">, changed: ReadonlySet<string>): boolean {
  // Evidence is model text ("path:line: code" by request), so every path-like token in it is
  // compared by whole segments: `b.ts` matches `src/b.ts`, `a.ts` never matches `a.tsx`.
  const cited = [f.file, ...f.evidence.flatMap((e) => e.match(PATH_TOKEN) ?? [])].map((p) => p.replace(/^\.\//, ""));
  return cited.some((c) => [...changed].some((p) => c === p || p.endsWith(`/${c}`) || c.endsWith(`/${p}`)));
}

const PATH_TOKEN = /[\w@.-]+(?:\/[\w@.-]+)*\.\w+/g;

/** Diff characters per find agent. Smaller parts mean shorter contexts and closer reading. */
const CHUNK_CHARS = 25_000;
/** Candidates sent to verification, most severe first. */
const MAX_VERIFY = 25;
/** Agents running at once in each pass. Model calls are network-bound, so this sets the wall time. */
const FIND_AGENTS = 6;
const VERIFY_AGENTS = 8;
/**
 * Time each agent gets before it must submit. The defaults fit a workflow's job timeout; the
 * server has no such cap and gives more (REVIEWPILOT_FIND_SECONDS, REVIEWPILOT_VERIFY_SECONDS),
 * so a slow provider does not cost whole parts of the diff.
 */
const seconds = (name: string, fallback: number) => (Number(process.env[name]) || fallback) * 1000;
const FIND_MS = seconds("REVIEWPILOT_FIND_SECONDS", 240);
const VERIFY_MS = seconds("REVIEWPILOT_VERIFY_SECONDS", 180);

export type ReviewInput = {
  find: Llm;
  verify: Llm;
  root: string;
  config: Config;
  rules: readonly Rule[];
  guidance: string;
  pr: { title: string; body: string };
  diffs: readonly FileDiff[];
  /** The part of `diffs` the find pass reads (see focus); earlier findings are re-checked against all of `diffs`. */
  scope: readonly FileDiff[];
  /** Findings from earlier runs: open ones are re-checked, dismissed ones are not raised again. */
  previous: readonly Tracked[];
  log: (line: string) => void;
};

/** `verdict` is undefined when the check itself failed (timeout, API error): not posted, not marked fixed. */
export type Checked = { finding: Finding; verdict?: VerdictResult; previous?: Tracked };

export async function review(
  input: ReviewInput,
): Promise<{ checked: Checked[]; candidates: number; verified: number; failedParts: number; parts: number; reviewed: string[]; findMs: number; verifyMs: number }> {
  const { config, diffs, previous, log } = input;
  const changed = input.scope.filter((d) => d.status !== "deleted").map((d) => d.path);
  const open = previous.filter((p) => p.status === "open");
  const dismissed = previous.filter((p) => p.status === "dismissed");

  const history = [
    open.length &&
      "Already reported and still being tracked (do not report again, in any wording):\n" +
        open.map((p) => `- ${p.file}:${p.line} ${p.title}`).join("\n"),
    dismissed.length &&
      "Dismissed by the author (do not raise again):\n" + dismissed.map((p) => `- ${p.file}:${p.line} ${p.title}`).join("\n"),
  ].filter(Boolean);

  const all = diffs.map((d) => `- ${d.path} (${d.status})`).join("\n");
  const chunks = chunk(input.scope, CHUNK_CHARS);
  log(`find: ${changed.length} of ${diffs.length} files in ${chunks.length} parts`);

  const findStart = Date.now();
  const parts = await pool(chunks, FIND_AGENTS, async (part, i) => {
    const mine = part.filter((d) => d.status !== "deleted").map((d) => d.path);
    const user = [
      `PR title: ${input.pr.title}`,
      `PR description:\n${input.pr.body.slice(0, 4000) || "(none)"}`,
      ...history,
      `All files changed in the PR:\n${all}`,
      `Your part (${i + 1} of ${chunks.length}). Diff, left column is the line number at the PR head; + added, - removed:\n\n${part
        .map((d) => `## ${d.path} (${d.status})\n${d.numbered}`)
        .join("\n\n")}`,
    ].join("\n\n");
    return runAgent({
      llm: input.find,
      root: input.root,
      system: FIND_SYSTEM + repoSection(config, input.rules, input.guidance),
      user,
      submit: submitFindings(mine),
      maxTurns: 12,
      deadline: Date.now() + FIND_MS,
      log: (line) => log(`[part ${i + 1}] ${line}`),
    }).catch((e: unknown) => {
      log(`[part ${i + 1}] find failed: ${e instanceof Error ? e.message : String(e)}`);
      return undefined;
    });
  });
  const findMs = Date.now() - findStart;
  const failedParts = parts.filter((p) => p === undefined).length;
  // Files the agents checked. A failed part's files, and any a part ran out of budget on,
  // are read again on the next run.
  const reviewed = chunks.flatMap((part, i) => {
    const p = parts[i];
    return p ? part.filter((d) => p.checked.has(d.path)).map((d) => d.path) : [];
  });
  // A candidate must point at a file that exists in the checkout (a model steered by the PR
  // could otherwise put arbitrary text in a link), and may only cite rules that exist.
  const ruleIds = new Set(input.rules.map((r) => r.id));
  const candidates = parts.flatMap((p) => p?.findings ?? []);
  const exists = await Promise.all(candidates.map((c) => inside(input.root, c.file).then(Boolean)));
  const found = candidates
    .filter((_, i) => exists[i])
    .map(({ rule, ...c }) => (rule && ruleIds.has(rule) ? { ...c, rule } : c))
    .sort(bySeverity);
  if (found.length < candidates.length) log(`find: dropped ${candidates.length - found.length} candidates citing files not in the repo`);
  log(`find: ${found.length} candidates${found.length > MAX_VERIFY ? `, verifying the ${MAX_VERIFY} most severe` : ""}`);

  // An earlier finding is re-checked only when its file is in the PR's diff (without it the
  // verifier cannot tell, and a rejection would wrongly mark it fixed) and its code changed.
  const changedPaths = new Set(input.scope.map((d) => d.path));
  const recheck = open.filter((p) => diffs.some((d) => d.path === p.file));
  const due = recheck.filter((p) => stale(p, changedPaths));
  if (due.length < recheck.length) log(`verify: ${recheck.length - due.length} earlier findings kept as they were, their code did not change`);
  const jobs: { finding: Finding; previous?: Tracked }[] = [
    ...found.slice(0, MAX_VERIFY).map((finding) => ({ finding })),
    ...due.map((p) => ({ finding: p, previous: p })),
  ];

  const patchOf = (file: string) =>
    diffs.find((d) => d.path === file)?.numbered ?? "(This file is not changed in the PR. Open it with read_file, and check what in the diff it depends on.)";
  const verifyStart = Date.now();
  const checked = await pool(jobs, VERIFY_AGENTS, async ({ finding, previous: prev }) => {
    const verdict = await runAgent({
      llm: input.verify,
      root: input.root,
      system: VERIFY_SYSTEM,
      user: [
        prev
          ? "This finding was reported on an earlier commit. Check whether it is still present at the current PR head (see the exception for earlier findings)."
          : "",
        `Finding:\n${JSON.stringify(
          { file: finding.file, line: finding.line, end_line: finding.endLine, severity: finding.severity, title: finding.title, body: finding.body, evidence: finding.evidence },
          null,
          2,
        )}`,
        `Diff of ${finding.file}:\n${patchOf(finding.file)}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
      submit: submitVerdict,
      maxTurns: 12,
      deadline: Date.now() + VERIFY_MS,
      log: () => {},
    }).catch((e: unknown) => {
      log(`verify error: ${finding.file}:${finding.line} ${e instanceof Error ? e.message : String(e)}`);
      return undefined;
    });
    if (verdict) log(`verify ${verdict.verdict}: ${finding.file}:${finding.line} ${finding.title} (${verdict.reason.slice(0, 160)})`);
    return { finding, ...(verdict ? { verdict } : {}), ...(prev ? { previous: prev } : {}) };
  });

  return { checked, candidates: found.length, verified: jobs.length, failedParts, parts: chunks.length, reviewed, findMs, verifyMs: Date.now() - verifyStart };
}

const Groups = type({ duplicates: "string[][]" });

/**
 * Drops findings that describe the same defect as an earlier one in the list (the find
 * parts overlap, so one bug can arrive twice in different words). One small call.
 */
export async function dedupe(
  llm: Llm,
  root: string,
  findings: readonly Finding[],
  /** Findings already tracked on the PR: anything matching one of them is dropped. */
  known: readonly Finding[],
  log: (l: string) => void,
): Promise<Finding[]> {
  if (!findings.length || findings.length + known.length < 2) return [...findings];
  const list = [...known, ...findings];
  const groups = await runAgent({
    llm,
    root,
    system:
      "You group code review findings that describe the same underlying defect (same root cause, even if worded differently or cited at different lines). Findings that only share a file or a topic are not duplicates. Answer with submit_groups right away; you do not need the other tools.",
    user: list.map((f, i) => `[f${i}] ${f.file}:${f.line} [${f.severity}] ${f.title}\n   ${f.body}`).join("\n"),
    submit: {
      spec: {
        type: "function",
        function: {
          name: "submit_groups",
          description: "Submit groups of duplicate finding numbers. Omit findings that have no duplicate.",
          parameters: {
            type: "object",
            properties: {
              duplicates: { type: "array", items: { type: "array", items: { type: "string" } }, description: 'Groups of ids exactly as listed, e.g. [["f0", "f3"]]' },
            },
            required: ["duplicates"],
          },
        },
      },
      parse(args) {
        const out = Groups(args);
        return out instanceof type.errors ? { ok: false, error: out.summary } : { ok: true, value: out.duplicates };
      },
    },
    maxTurns: 2,
    deadline: Date.now() + 60_000,
    log: () => {},
  }).catch((): string[][] => []);
  // Indices below known.length are tracked findings. In each group keep the first entry
  // (a tracked one if present, else the most severe new one) and drop the rest.
  const drop = new Set<number>();
  for (const group of groups) {
    const ids = group.map((id) => Number(/^f(\d+)$/.exec(id.trim())?.[1] ?? NaN));
    const [, ...rest] = [...new Set(ids)].filter((i) => Number.isInteger(i) && i >= 0 && i < list.length).sort((a, b) => a - b);
    for (const i of rest) drop.add(i);
  }
  const kept = findings.filter((_, i) => !drop.has(i + known.length));
  if (kept.length < findings.length) log(`dedupe: dropped ${findings.length - kept.length} duplicate finding(s)`);
  return kept;
}

/** Applies the verifier's corrections to a confirmed finding. */
export const settle = (finding: Finding, verdict: VerdictResult): Finding => ({
  ...finding,
  line: verdict.line ?? finding.line,
  endLine: Math.max(verdict.line ?? finding.line, verdict.end_line ?? (verdict.line ? verdict.line : finding.endLine)),
  severity: verdict.severity satisfies Severity,
  title: verdict.title?.trim() || finding.title,
  body: verdict.body?.trim() || finding.body,
  evidence: verdict.evidence.length ? verdict.evidence : finding.evidence,
});
