// Read-only tools the reviewer uses to pull context: read a file, search the repo, list a
// directory. Everything is confined to the checkout at the PR head, and nothing executes
// PR code, so a hostile diff can at most make the model read files.

import { execFile } from "node:child_process";
import { readdir, readFile, realpath, stat } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import type { ToolSpec } from "./llm.ts";

const run = promisify(execFile);

const MAX_LINES = 250;
const MAX_MATCHES = 150;
const MAX_BYTES = 2 * 1024 * 1024;

export const TOOL_SPECS: ToolSpec[] = [
  {
    type: "function",
    function: {
      name: "read_file",
      description:
        "Read a file from the repository at the PR head, with line numbers. Use it to check callers, types, guards and anything the diff does not show. Reads up to 250 lines per call.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Repository-relative path" },
          start_line: { type: "integer", description: "First line, 1-based (default 1)" },
          end_line: { type: "integer", description: "Last line (default start_line + 249)" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search",
      description:
        "Search the repository with a regular expression (git grep -E). Use it to find definitions, callers and other uses of a name.",
      parameters: {
        type: "object",
        properties: {
          pattern: { type: "string", description: "Extended regular expression" },
          path: { type: "string", description: "Optional directory or glob to limit the search, e.g. 'src' or '*.ts'" },
        },
        required: ["pattern"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_dir",
      description: "List a directory in the repository.",
      parameters: {
        type: "object",
        properties: { path: { type: "string", description: "Repository-relative directory, '.' for the root" } },
        required: ["path"],
      },
    },
  },
];

/**
 * Resolves a model-supplied path inside the repo, or undefined if it escapes it or touches
 * .git. Symlinks are resolved first: a PR can commit a link to `.git/config` (which holds
 * the checkout token) or to a file outside the checkout.
 */
async function inside(root: string, path: string): Promise<string | undefined> {
  const real = await realpath(resolve(root, path)).catch(() => undefined);
  if (!real) return undefined;
  const rel = relative(await realpath(root), real);
  if (rel.startsWith("..") || rel.split(sep)[0] === ".git") return undefined;
  return real;
}

const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : fallback);
const str = (v: unknown) => (typeof v === "string" ? v : "");

export async function runTool(root: string, name: string, args: Record<string, unknown>): Promise<string> {
  try {
    if (name === "read_file") {
      const full = await inside(root, str(args.path));
      if (!full) return "Error: no such file in the repository.";
      if ((await stat(full)).size > MAX_BYTES) return `${str(args.path)} is larger than 2 MB, which is too big to read; use search instead.`;
      const text = await readFile(full, "utf8");
      const lines = (text.endsWith("\n") ? text.slice(0, -1) : text).split("\n");
      const start = Math.max(1, num(args.start_line, 1));
      if (start > lines.length) return `${str(args.path)} has only ${lines.length} lines.`;
      const end = Math.max(start, Math.min(lines.length, num(args.end_line, start + MAX_LINES - 1), start + MAX_LINES - 1));
      const body = lines
        .slice(start - 1, end)
        .map((text, i) => `${String(start + i).padStart(5)}  ${text.length > 2000 ? `${text.slice(0, 2000)} [line cut]` : text}`)
        .join("\n")
        .slice(0, 80_000);
      const more = end < lines.length ? `\n[lines ${end + 1}-${lines.length} not shown]` : "";
      return `${str(args.path)} (${lines.length} lines)\n${body}${more}`;
    }
    if (name === "search") {
      const pattern = str(args.pattern);
      if (!pattern) return "Error: empty pattern.";
      const scope = str(args.path);
      // Plain repo-relative scopes only: no absolute paths, parent hops or pathspec magic.
      if (scope && (scope.startsWith("/") || scope.startsWith(":") || scope.split("/").includes(".."))) {
        return "Error: path must be repository-relative.";
      }
      const argv = ["grep", "-n", "-I", "-E", "--no-color", "-e", pattern, "--", ...(scope ? [scope] : [])];
      const { stdout } = await run("git", argv, { cwd: root, maxBuffer: 8 * 1024 * 1024 }).catch(
        (e: { code?: number; stdout?: string }) => (e.code === 1 ? { stdout: "" } : Promise.reject(e)),
      );
      const hits = stdout.split("\n").filter(Boolean);
      if (!hits.length) return "No matches.";
      const shown = hits.slice(0, MAX_MATCHES).map((h) => (h.length > 300 ? `${h.slice(0, 300)}...` : h));
      return `${shown.join("\n")}${hits.length > MAX_MATCHES ? `\n[${hits.length - MAX_MATCHES} more matches not shown]` : ""}`;
    }
    if (name === "list_dir") {
      const full = await inside(root, str(args.path) || ".");
      if (!full || !(await stat(full)).isDirectory()) return "Error: not a directory in the repository.";
      const entries = await readdir(full, { withFileTypes: true });
      return entries
        .filter((e) => e.name !== ".git")
        .map((e) => (e.isDirectory() ? `${e.name}/` : e.name))
        .sort()
        .join("\n");
    }
    return `Error: unknown tool ${name}.`;
  } catch (e) {
    return `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}
