// The per-PR scheduler. A push waits out a debounce so a burst of pushes becomes one review;
// a push while that PR is being reviewed stops the stale run. Reviews of one repo run one at
// a time (they share a clone), and at most `maxRuns` run at once overall.

export type Job = {
  repo: string;
  number: number;
  installation: number;
  event: "pull_request" | "issue_comment";
  /** The webhook payload, handed to the action as its event file. */
  payload: unknown;
  /** Pushes wait for the debounce; `/review` starts right away. */
  debounce: boolean;
};

/** A started review: `done` settles when it exits, `stop` asks it to exit early. */
export type Run = { done: Promise<void>; stop: () => void };

export const keyOf = (job: Pick<Job, "repo" | "number">) => `${job.repo}#${job.number}`;

export function createQueue(opts: { run: (job: Job) => Run; debounceMs: number; maxRuns: number }) {
  const timers = new Map<string, NodeJS.Timeout>();
  /** Jobs past their debounce, in arrival order, waiting for a free slot or their repo. */
  const ready = new Map<string, Job>();
  const running = new Map<string, Run & { repo: string }>();
  let closed = false;

  function pump() {
    if (closed) return;
    for (const [key, job] of ready) {
      if (running.size >= opts.maxRuns) return;
      if (running.has(key) || [...running.values()].some((r) => r.repo === job.repo)) continue;
      ready.delete(key);
      const run = opts.run(job);
      running.set(key, { ...run, repo: job.repo });
      void run.done.finally(() => {
        running.delete(key);
        pump();
      });
    }
  }

  return {
    schedule(job: Job) {
      const key = keyOf(job);
      clearTimeout(timers.get(key));
      ready.delete(key);
      // The running review is for an older head now; it exits and the new one takes its place.
      running.get(key)?.stop();
      timers.set(
        key,
        setTimeout(() => {
          timers.delete(key);
          ready.set(key, job);
          pump();
        }, job.debounce ? opts.debounceMs : 0),
      );
    },

    /** True when a job for this PR is still waiting (debouncing or queued). */
    pending: (key: string) => timers.has(key) || ready.has(key),

    idle: () => timers.size === 0 && ready.size === 0 && running.size === 0,

    /** For shutdown: starts nothing more, stops running reviews and waits for them to exit. */
    async drain() {
      closed = true;
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
      const runs = [...running.values()];
      for (const r of runs) r.stop();
      await Promise.allSettled(runs.map((r) => r.done));
    },
  };
}

export type Queue = ReturnType<typeof createQueue>;
