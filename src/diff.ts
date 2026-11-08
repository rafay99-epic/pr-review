// Parses `git diff` output into per-file patches. Each file keeps the new-side line numbers
// GitHub accepts inline comments on, and a numbered rendering the model can cite lines from.

export type FileDiff = {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
  /** New-side lines inside a hunk (added or context). Inline comments must land on these. */
  commentable: Set<number>;
  /** Hunk index per commentable line, since a multi-line comment cannot span hunks. */
  hunkOf: Map<number, number>;
  /** The patch with new-side line numbers in front of each line, for the prompt. */
  numbered: string;
};

const HUNK = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

export function parseDiff(raw: string): FileDiff[] {
  const files: FileDiff[] = [];
  let file: FileDiff | undefined;
  let out: string[] = [];
  let line = 0;
  let hunk = -1;

  const flush = () => {
    if (file) files.push({ ...file, numbered: out.join("\n") });
  };

  for (const text of raw.split("\n")) {
    if (text.startsWith("diff --git ")) {
      flush();
      const path = text.match(/ b\/(.+)$/)?.[1] ?? "";
      file = { path, status: "modified", commentable: new Set(), hunkOf: new Map(), numbered: "" };
      out = [];
      hunk = -1;
      continue;
    }
    if (!file) continue;
    if (text.startsWith("new file mode")) file.status = "added";
    else if (text.startsWith("deleted file mode")) file.status = "deleted";
    else if (text.startsWith("rename to ")) {
      file.status = "renamed";
      file.path = text.slice("rename to ".length);
    } else if (hunk < 0 && text.startsWith("+++ b/")) {
      // The +++ line carries the new path verbatim, spaces included. Header lines only
      // count before the first hunk: inside a hunk "+++ x" is an added line "++ x".
      file.path = text.slice("+++ b/".length);
    } else if (hunk < 0 && (text.startsWith("+++ ") || text.startsWith("--- ") || text.startsWith("index "))) {
      continue;
    } else if (text.startsWith("@@")) {
      const start = text.match(HUNK)?.[1];
      line = start ? Number(start) : 0;
      hunk += 1;
      out.push(text);
    } else if (hunk >= 0) {
      const mark = text[0];
      if (mark === "+" || mark === " ") {
        file.commentable.add(line);
        file.hunkOf.set(line, hunk);
        out.push(`${String(line).padStart(5)} ${mark === "+" ? "+" : " "} ${text.slice(1)}`);
        line += 1;
      } else if (mark === "-") {
        out.push(`      - ${text.slice(1)}`);
      }
    }
  }
  flush();
  return files;
}

/**
 * Where an inline comment for lines start..end can go. GitHub rejects comments on lines
 * outside the diff, so a finding that misses every hunk goes to the summary instead.
 */
export function anchor(
  file: FileDiff | undefined,
  start: number,
  end: number,
): { line: number; startLine?: number } | undefined {
  if (!file) return undefined;
  const last = [end, start].find((n) => file.commentable.has(n));
  if (last === undefined) return undefined;
  const first = start < last && file.commentable.has(start) && file.hunkOf.get(start) === file.hunkOf.get(last)
    ? start
    : undefined;
  return first === undefined ? { line: last } : { line: last, startLine: first };
}
