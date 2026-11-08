// Run logs. In Actions each phase is a collapsible group with its duration, and the run
// report (phase timings, model usage, findings) lands in the job summary. Lines that may
// carry model text are neutralised so they cannot issue workflow commands (`::...::`).

import { appendFile } from "node:fs/promises";

export type Usage = { calls: number; prompt: number; completion: number };

const seconds = (ms: number) => (ms >= 60_000 ? `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s` : `${(ms / 1000).toFixed(1)}s`);

export function createLog(actions: boolean) {
  const phases: { name: string; ms: number }[] = [];
  const safe = (text: string) => (actions ? text.replace(/^::/gm, ": :") : text);

  return {
    phases,
    line: (text: string) => console.log(safe(text)),
    warn: (text: string) => console.log(actions ? `::warning::${safe(text).replace(/\n/g, " ")}` : `warning: ${text}`),

    /** Runs one phase inside a log group and records how long it took. */
    async phase<T>(name: string, fn: () => Promise<T>): Promise<T> {
      const start = performance.now();
      console.log(actions ? `::group::${name}` : `> ${name}`);
      try {
        return await fn();
      } finally {
        const ms = Math.round(performance.now() - start);
        phases.push({ name, ms });
        if (actions) console.log("::endgroup::");
        console.log(`${name}: ${seconds(ms)}`);
      }
    },

    /** Appends the run report to the Actions job summary, when there is one. */
    async report(facts: { score: number; findings: { new: number; open: number; fixed: number }; candidates: number; verified: number; usage: Usage; model: string }) {
      const file = process.env.GITHUB_STEP_SUMMARY;
      if (!file) return;
      const rows = phases.map((p) => `| ${p.name} | ${seconds(p.ms)} |`).join("\n");
      const total = phases.reduce((sum, p) => sum + p.ms, 0);
      await appendFile(
        file,
        [
          `### ReviewPilot run: ${facts.score}/5`,
          "",
          `${facts.findings.new} new, ${facts.findings.open} open, ${facts.findings.fixed} fixed. ${facts.verified} of ${facts.candidates} candidates verified.`,
          "",
          "| Phase | Time |",
          "| --- | --- |",
          rows,
          `| **Total** | **${seconds(total)}** |`,
          "",
          `Model \`${facts.model}\`: ${facts.usage.calls} calls, ${facts.usage.prompt.toLocaleString("en")} input and ${facts.usage.completion.toLocaleString("en")} output tokens.`,
          "",
        ].join("\n"),
      );
    },
  };
}

export type Log = ReturnType<typeof createLog>;
