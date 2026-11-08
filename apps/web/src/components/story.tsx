// The home page story, from the problem to the first review. Every number and example here
// comes from real ReviewPilot runs (Lumo #182 and ReviewPilot's own PR #6).

import type { ReactNode } from "react";
import { useActive, useCountUp } from "../hooks.ts";
import { Logo, REPO } from "./chrome.tsx";

function Section({ id, title, children, intro }: { id?: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 md:py-28">
      <h2 data-reveal className="max-w-3xl font-serif text-[clamp(2.25rem,5vw,3.75rem)] leading-[1] tracking-[-0.02em]">
        {title}
      </h2>
      {intro && (
        <p data-reveal style={{ "--delay": "100ms" }} className="mt-5 max-w-2xl text-lg leading-relaxed text-[#cfcfcf]">
          {intro}
        </p>
      )}
      <div className="mt-12">{children}</div>
    </section>
  );
}

function Count({ to, label, tone }: { to: number; label: string; tone: string }) {
  const ref = useCountUp<HTMLSpanElement>(to);
  return (
    <div data-reveal className="border-t border-line pt-5">
      <span ref={ref} className={`font-serif text-7xl leading-none tabular-nums md:text-8xl ${tone}`}>
        {to}
      </span>
      <p className="mt-3 text-mute">{label}</p>
    </div>
  );
}

export function Problem() {
  return (
    <Section
      title="Most AI reviewers guess."
      intro="They see the diff and nothing else, so they flag code they never read. Your next agent has to throw half of it away. ReviewPilot checks first."
    >
      <div className="grid gap-8 sm:grid-cols-3">
        <Count to={20} label="suspicions raised across 21 files" tone="text-paper" />
        <Count to={18} label="disproved by reading the real code" tone="text-dim" />
        <Count to={2} label="posted, both real" tone="text-green" />
      </div>
      <p data-reveal className="mt-8 font-mono text-[13px] text-mute">
        One review of a 41,000-character pull request. Two earlier findings its author had shown to be unreachable were rejected for the same reasons.
      </p>
    </Section>
  );
}

const STEPS = [
  {
    id: "find",
    title: "Find",
    text: "The diff is split across agents that work in parallel. Each opens the callers, types and guards it needs before it suspects anything, and must account for every changed file.",
  },
  {
    id: "verify",
    title: "Verify",
    text: "A fresh agent takes each suspicion and assumes it is wrong. It traces the trigger through code it actually opened, looks for a guard that already prevents it, and checks the PR introduced it.",
  },
  {
    id: "post",
    title: "Post",
    text: "Only confirmed findings land, inline on the changed lines. One summary keeps the score, the open findings and what changed since the last push.",
  },
] as const;

const STEP_IDS = STEPS.map((s) => s.id);

function FindPanel() {
  const lines = [
    ["read_file", "apps/mobile/src/features/onboarding/model.ts"],
    ["search", '"parseDraft|unsavedAnswers"'],
    ["read_file", "apps/mobile/src/features/session/api.ts"],
    ["read_file", "packages/backend/convex/onboarding.ts"],
    ["list_dir", "packages/backend/convex/lib"],
  ] as const;
  return (
    <div className="font-mono text-[13px] leading-7">
      <div className="text-mute">part 3 of 4 · 5 tool calls</div>
      {lines.map(([tool, arg], i) => (
        <div key={arg} className="step-line flex gap-3" style={{ "--n": i }}>
          <span className="text-green">{tool}</span>
          <span className="truncate text-[#d0d0d0]">{arg}</span>
        </div>
      ))}
      <div className="mt-2 text-paper">submit_findings · 6 candidates</div>
    </div>
  );
}

function VerifyPanel() {
  const verdicts = [
    { ok: false, where: "hooks.ts:261", why: "busy and state change in the same tick, so the retry is never burned" },
    { ok: false, where: "hooks.ts:99", why: "load() runs before the early return; a fresh draft still loads" },
    { ok: true, where: "convex-hooks.ts:167", why: "the guest query also fires while the account is blocked" },
    { ok: false, where: "fx.ts:301", why: "length check throws on raw input; duplicates are removed later" },
  ];
  return (
    <ul className="space-y-3 text-sm">
      {verdicts.map((v, i) => (
        <li key={v.where} className="step-line grid grid-cols-[1.5rem_1fr] gap-x-2" style={{ "--n": i }}>
          <span className={v.ok ? "text-green" : "text-red"} aria-label={v.ok ? "confirmed" : "rejected"}>
            {v.ok ? "✓" : "✕"}
          </span>
          <span>
            <span className="font-mono text-paper">{v.where}</span>
            <span className="block text-mute">{v.why}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function PostPanel() {
  return (
    <div className="rounded-xl border border-line bg-[#0d1117] text-sm">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="grid size-6 place-items-center rounded-full border border-[#30363d] bg-ink">
          <Logo className="size-4" />
        </span>
        <span className="font-semibold text-paper">reviewpilot-bot</span>
        <span className="rounded-full border border-[#30363d] px-1.5 text-[11px] text-mute">bot</span>
        <span className="text-mute">commented</span>
      </div>
      <div className="space-y-2 px-4 py-3 text-[#e6edf3]">
        <p>
          <strong>Guest query fires while the account is blocked</strong> · minor
        </p>
        <p className="text-[#c9d1d9]">
          When the device gate refuses, <code className="font-mono text-[12.5px]">useSafeQueryResult</code> returns undefined, so <code className="font-mono text-[12.5px]">useSetupQuery</code> also runs the public twin for a signed-in user.
        </p>
        <p className="text-mute">▸ Evidence</p>
      </div>
    </div>
  );
}

const PANELS = { find: FindPanel, verify: VerifyPanel, post: PostPanel } as const;

export function Layers() {
  const active = useActive(STEP_IDS);
  return (
    <Section id="how" title="Three layers. One rule: no proof, no post.">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          {STEPS.map((step, i) => (
            <article key={step.id} id={step.id} className="flex min-h-[min(60vh,640px)] scroll-mt-24 flex-col justify-center md:min-h-[min(70vh,720px)]">
              <span className={`font-mono text-sm transition-colors ${active === step.id ? "text-green" : "text-dim"}`}>0{i + 1}</span>
              <h3 className={`mt-2 font-serif text-5xl transition-colors duration-500 ${active === step.id ? "text-paper" : "text-dim"}`}>{step.title}</h3>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-[#cfcfcf]">{step.text}</p>
              {/* On phones the panel sits under its step instead of in the sticky column. */}
              <div className="mt-8 md:hidden">{PANELS[step.id]()}</div>
            </article>
          ))}
        </div>
        <div className="sticky top-24 hidden h-[min(70vh,720px)] items-center md:flex">
          <div className="layer-panels relative w-full [perspective:1200px]">
            {STEPS.map((step, i) => {
              const Panel = PANELS[step.id];
              const index = STEPS.findIndex((s) => s.id === active);
              const state = i === index ? "now" : i < index ? "past" : "next";
              return (
                <div key={step.id} data-state={state} className="layer-panel absolute inset-x-0 top-1/2 rounded-2xl border border-line bg-panel p-6" aria-hidden={state !== "now"}>
                  <Panel />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}

export function BotComment() {
  const rows = [
    ["minor", "Public guest queries have no rate limiting", "onboarding.ts:100"],
    ["minor", "Guest query fires while the account is blocked", "convex-hooks.ts:167"],
  ] as const;
  return (
    <Section title="Reads like a reviewer, not a linter." intro="One summary per pull request, edited in place. The score comes from the verified findings, never from the model's opinion.">
      <div data-reveal className="overflow-hidden rounded-2xl border border-line bg-[#0d1117] [transform:perspective(1600px)_rotateX(4deg)] transition-transform duration-700 hover:[transform:none]">
        <div className="flex items-center gap-2 border-b border-[#21262d] px-5 py-3 text-sm">
          <span className="grid size-7 place-items-center rounded-full border border-[#30363d] bg-ink">
            <Logo className="size-5" />
          </span>
          <span className="font-semibold">reviewpilot-bot</span>
          <span className="rounded-full border border-[#30363d] px-1.5 text-[11px] text-mute">bot</span>
          <span className="text-mute">commented</span>
        </div>
        <div className="px-5 py-5 sm:px-7">
          <div className="font-serif text-4xl">ReviewPilot: 4/5</div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-mute">
                <tr className="border-b border-[#21262d]">
                  <th className="py-2 pr-4 font-medium">Severity</th>
                  <th className="py-2 pr-4 font-medium">Finding</th>
                  <th className="py-2 font-medium">Where</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([severity, title, where]) => (
                  <tr key={where} className="border-b border-[#21262d]">
                    <td className="py-2.5 pr-4 text-[#c9d1d9]">{severity}</td>
                    <td className="py-2.5 pr-4">{title}</td>
                    <td className="py-2.5 font-mono text-[13px] text-[#58a6ff]">{where}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-dim">Reviewed with z-ai/glm-5.3-flash · 21 files · 20 candidates, 20 checks · 10m 24s</p>
        </div>
      </div>
    </Section>
  );
}

const ROUNDS = [
  { sha: "9ab8ebb", score: 3, fixed: 0, fresh: 13 },
  { sha: "ee6ac73", score: 3, fixed: 9, fresh: 11 },
  { sha: "d72fff2", score: 4, fixed: 8, fresh: 11 },
  { sha: "05af38f", score: 4, fixed: 8, fresh: 6 },
] as const;

export function Rounds() {
  return (
    <Section
      title="It follows the pull request to merge."
      intro="Every push re-checks what is still open. Fixed findings get a reply and collapse out of the way. Dismiss one by replying, and it is never raised again."
    >
      <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
        {ROUNDS.map((r, i) => (
          <li key={r.sha} data-reveal style={{ "--delay": `${i * 110}ms` }} className="bg-ink p-6">
            <div className="font-mono text-xs text-mute">push {i + 1} · {r.sha}</div>
            <div className="mt-3 font-serif text-6xl leading-none">
              {r.score}
              <span className="text-2xl text-dim">/5</span>
            </div>
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-[#141414]">
              <div className="round-bar h-full rounded-full bg-green" style={{ "--w": `${(r.score / 5) * 100}%` }} />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-mute">fixed</dt>
                <dd className="font-mono text-paper">{r.fixed}</dd>
              </div>
              <div>
                <dt className="text-mute">new</dt>
                <dd className="font-mono text-paper">{r.fresh}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
      <p data-reveal className="mt-6 font-mono text-[13px] text-mute">ReviewPilot reviewing its own pull request, four pushes in a row.</p>
    </Section>
  );
}

const YAML = `review:
  min_severity: minor
  max_findings: 20

rules:
  - id: types-end-to-end
    severity: major
    paths: ["apps/**", "packages/**"]
    rule: No any or unchecked casts.
  - id: privacy-policy-sync
    severity: critical
    paths: ["packages/backend/convex/schema.ts"]
    rule: New user data needs a privacy policy update.`;

export function Config() {
  const points = [
    ["Rules with paths", "Write what must hold, scoped to the files it covers. Findings cite the rule they break."],
    ["Read from the default branch", "A pull request cannot loosen its own review."],
    ["Your repo's own guidance", "AGENTS.md and CLAUDE.md are read on every review."],
    ["Defaults that work", "No file at all is a valid setup."],
  ] as const;
  return (
    <Section title="Configure in one file, or not at all.">
      <div className="grid items-start gap-10 md:grid-cols-[1.1fr_1fr]">
        <pre data-reveal className="overflow-x-auto rounded-2xl border border-line bg-panel p-6 font-mono text-[13px] leading-7 text-[#d6d6d6]">
          <span className="text-dim"># .reviewpilot.yml</span>
          {"\n"}
          {YAML.split("\n").map((line, i) => {
            const m = /^(\s*-?\s*)([\w_]+)(:)(.*)$/.exec(line);
            return (
              <span key={i}>
                {m ? (
                  <>
                    {m[1]}
                    <span className="text-green">{m[2]}</span>
                    {m[3]}
                    <span className="text-paper">{m[4]}</span>
                  </>
                ) : (
                  line
                )}
                {"\n"}
              </span>
            );
          })}
        </pre>
        <dl className="divide-y divide-line border-y border-line">
          {points.map(([title, text], i) => (
            <div key={title} data-reveal style={{ "--delay": `${i * 90}ms` }} className="py-5">
              <dt className="font-medium text-paper">{title}</dt>
              <dd className="mt-1 text-mute">{text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

export function Providers() {
  const providers = [
    ["Command Code", "default · GLM-5.3 Flash"],
    ["OpenRouter", "any model it routes"],
    ["OpenCode Zen", "hosted coding models"],
    ["Your own server", "any OpenAI-compatible URL"],
  ] as const;
  return (
    <Section title="Bring your own model." intro="ReviewPilot speaks the OpenAI chat API. Pick a cheap model to find and a stronger one to verify, and pay your provider directly.">
      <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {providers.map(([name, detail], i) => (
          <li key={name} data-reveal style={{ "--delay": `${i * 80}ms` }} className="bg-ink p-6">
            <div className="text-lg text-paper">{name}</div>
            <div className="mt-1 font-mono text-xs text-mute">{detail}</div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function Start() {
  const steps = [
    ["Add your key", "gh secret set REVIEWPILOT_API_KEY"],
    ["Add one workflow", "uses: rafay99-epic/reviewpilot@main"],
    ["Open a pull request", "comment /review any time"],
  ] as const;
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
        <h2 data-reveal className="font-serif text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.95] tracking-[-0.02em]">
          Two minutes to
          <br />
          your first review.
        </h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map(([title, code], i) => (
            <li key={title} data-reveal style={{ "--delay": `${i * 100}ms` }}>
              <span className="font-mono text-sm text-green">0{i + 1}</span>
              <div className="mt-2 text-xl text-paper">{title}</div>
              <code className="mt-3 block truncate rounded-lg border border-line bg-panel px-3 py-2 font-mono text-[13px] text-[#d6d6d6]">{code}</code>
            </li>
          ))}
        </ol>
        <div data-reveal className="mt-12 flex flex-wrap gap-3">
          <a href="/docs/#getting-started" className="rounded-lg bg-paper px-5 py-3 font-medium text-ink transition-transform hover:-translate-y-0.5">
            Read the setup guide
          </a>
          <a href={REPO} className="rounded-lg border border-[#333] px-5 py-3 text-paper transition-colors hover:border-paper">
            Star on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
