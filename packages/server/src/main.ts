// ReviewPilot's webhook server. GitHub App deliveries become jobs; each job runs the action
// bundle as a child process against a warm clone on the data volume. Jobs are saved to disk
// until they finish, so a deploy or restart resumes them. The process exits after a quiet
// spell and the platform starts it again on the next delivery, so it only costs while working.

import { execFile, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { promisify } from "node:util";
import { type } from "arktype";
import { createApp } from "./github-app.ts";
import { createQueue, type Job, keyOf, type Run } from "./queue.ts";
import { toJob, verify } from "./webhook.ts";

const exec = promisify(execFile);

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

const SECRET = required("WEBHOOK_SECRET");
const API_KEY = required("REVIEWPILOT_API_KEY");
const app = createApp(required("APP_ID"), required("PRIVATE_KEY").replace(/\\n/g, "\n"));
const DATA = process.env.DATA_DIR ?? "/data";
const ACTION = process.env.ACTION_PATH ?? join(import.meta.dirname, "action.mjs");
const REPOS = new Set((process.env.REPOS ?? "").split(",").map((r) => r.trim().toLowerCase()).filter(Boolean));
const DEBOUNCE_MS = Number(process.env.DEBOUNCE_MS ?? 60_000);
const IDLE_EXIT_MS = Number(process.env.IDLE_EXIT_MS ?? 10 * 60_000);
/** Below the installation token's one-hour life, so a run never posts with an expired token. */
const MAX_RUN_MS = 50 * 60_000;
/** How long a stopped review may take to finish posting before it is killed outright. */
const KILL_AFTER_MS = 2 * 60_000;
const MAX_BODY = 25 * 1024 * 1024;

const SavedJob = type({
  repo: "string",
  number: "number",
  installation: "number",
  event: "'pull_request' | 'issue_comment'",
  payload: "unknown",
  debounce: "boolean",
});

const slug = (key: string) => key.replace(/[^A-Za-z0-9._-]/g, "_");
const jobFile = (key: string) => join(DATA, "jobs", `${slug(key)}.json`);
const say = (key: string, text: string) => console.log(`[${key}] ${text}`);

/** Runs one review: a fresh token, the clone (made once, reused after), then the action. */
function run(job: Job): Run {
  const key = keyOf(job);
  let stopped = false;
  let stop = () => {
    stopped = true;
  };

  const done = (async () => {
    const started = Date.now();
    const [token, login] = await Promise.all([app.token(job.installation), app.login()]);
    // Git reads the token from the environment, so it is never written into the clone's config.
    // Git and the action get only this, never the App key or webhook secret.
    const gitEnv = {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      GIT_TERMINAL_PROMPT: "0",
      GIT_CONFIG_COUNT: "1",
      GIT_CONFIG_KEY_0: "http.https://github.com/.extraheader",
      GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${Buffer.from(`x-access-token:${token}`).toString("base64")}`,
    };
    const dir = join(DATA, "repos", slug(job.repo));
    if (!existsSync(join(dir, ".git"))) {
      say(key, "cloning");
      await rm(dir, { recursive: true, force: true });
      await exec("git", ["clone", "--quiet", "--filter=blob:none", `https://github.com/${job.repo}.git`, dir], { env: gitEnv });
    }
    // A run killed mid-checkout can leave the lock behind; runs on one repo never overlap.
    await rm(join(dir, ".git", "index.lock"), { force: true });
    const eventPath = join(DATA, "events", `${slug(key)}.json`);
    await writeFile(eventPath, JSON.stringify(job.payload));
    if (stopped) return;
    const child = spawn(process.execPath, [ACTION], {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...gitEnv,
        GITHUB_REPOSITORY: job.repo,
        GITHUB_WORKSPACE: dir,
        GITHUB_EVENT_PATH: eventPath,
        INPUT_GITHUB_TOKEN: token,
        INPUT_API_KEY: API_KEY,
        INPUT_BOT_LOGIN: login,
      },
    });
    // SIGTERM lets a review that is posting finish; one that hangs is killed after a grace period.
    stop = () => {
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), KILL_AFTER_MS).unref();
    };
    const limit = setTimeout(stop, MAX_RUN_MS);
    for (const stream of [child.stdout, child.stderr]) createInterface({ input: stream }).on("line", (line) => say(key, line));
    const code = await new Promise<number | string | null>((resolve) => {
      child.on("error", (e) => resolve(e.message));
      child.on("close", (exit, signal) => resolve(exit ?? signal));
    });
    clearTimeout(limit);
    say(key, `exited ${code} after ${Math.round((Date.now() - started) / 1000)}s`);
  })()
    .catch((e: unknown) => say(key, `failed: ${e instanceof Error ? e.message : String(e)}`))
    // The file stays when a newer delivery for this PR rewrote it, or when a shutdown cut
    // the run short, so the job runs again after the restart.
    .finally(() => (shuttingDown || queue.pending(key) ? undefined : rm(jobFile(key), { force: true })));

  return { done, stop: () => stop() };
}

const queue = createQueue({ run, debounceMs: DEBOUNCE_MS, maxRuns: 3 });

// Scheduled before the file is written: a run of the same PR finishing in between then sees
// the pending job and leaves the file alone.
async function enqueue(job: Job) {
  queue.schedule(job);
  await writeFile(jobFile(keyOf(job)), JSON.stringify(job));
}

let lastDelivery = Date.now();
let shuttingDown = false;

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") return void res.end("ok");
  if (req.method !== "POST" || req.url !== "/webhook") return void res.writeHead(404).end();

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req as AsyncIterable<Buffer>) {
    size += chunk.length;
    if (size > MAX_BODY) return void res.writeHead(413).end();
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks);
  if (!verify(SECRET, body, req.headers["x-hub-signature-256"]?.toString())) return void res.writeHead(401).end();

  lastDelivery = Date.now();
  const event = req.headers["x-github-event"]?.toString() ?? "";
  let job: Job | undefined;
  try {
    job = toJob(event, JSON.parse(body.toString("utf8")), REPOS);
  } catch {
    return void res.writeHead(400).end();
  }
  res.writeHead(202).end(job ? "queued" : "ignored");
  if (job) {
    say(keyOf(job), `${event} queued`);
    await enqueue(job).catch((e: unknown) => say(keyOf(job), `queued, but not saved for a restart: ${String(e)}`));
  }
});

async function start() {
  for (const dir of ["jobs", "events", "repos"]) await mkdir(join(DATA, dir), { recursive: true });
  // Jobs left from before a restart run first, without waiting for a debounce.
  for (const name of await readdir(join(DATA, "jobs"))) {
    const saved = SavedJob(JSON.parse(await readFile(join(DATA, "jobs", name), "utf8").catch(() => "null")));
    if (saved instanceof type.errors) {
      await rm(join(DATA, "jobs", name), { force: true });
      continue;
    }
    say(keyOf(saved), "resumed");
    queue.schedule({ ...saved, debounce: false });
  }
  server.listen(Number(process.env.PORT ?? 8080), "0.0.0.0", () => console.log(`listening, repos: ${[...REPOS].join(", ") || "all installed"}`));

  // Exit 0 when idle; the machine stops and the next delivery starts it again.
  setInterval(() => {
    if (queue.idle() && Date.now() - lastDelivery > IDLE_EXIT_MS) {
      console.log("idle, exiting");
      process.exit(0);
    }
  }, 30_000).unref();
}

// A deploy sends SIGTERM: stop reviews that have not started posting, keep their job files.
process.on("SIGTERM", () => {
  console.log("shutting down");
  shuttingDown = true;
  server.close();
  void queue.drain().then(() => process.exit(0));
});

await start();
