// The hero: the headline and the exploded stack. The four layers are the four stages of a
// review; they start close together and pull apart as the page scrolls.

import { useRef } from "react";
import { useStackMotion } from "../hooks.ts";
import { Logo } from "./chrome.tsx";

const LAYERS = [
  { name: "Pull request", detail: "diff · 21 files", tone: "border-line" },
  { name: "Find agents", detail: "read · search · list", tone: "border-line" },
  { name: "Verifier", detail: "trace · disprove · confirm", tone: "border-line" },
  { name: "reviewpilot-bot", detail: "2 findings · 4/5", tone: "border-green" },
] as const;

function Stack() {
  const ref = useRef<HTMLDivElement>(null);
  useStackMotion(ref);
  return (
    <div ref={ref} className="stack relative mx-auto mt-16 aspect-[1/0.9] w-full max-w-[340px] sm:max-w-[440px] md:mt-0 md:max-w-[560px]" aria-hidden="true">
      <div className="stack-scene">
        <div className="stack-floor" />
        {LAYERS.map((layer, i) => (
          <div
            key={layer.name}
            className={`stack-layer flex flex-col justify-end rounded-2xl border bg-panel/95 px-6 pb-4 ${layer.tone}`}
            style={{ "--i": i }}
          >
            <div className="flex items-center gap-2.5 text-lg text-paper">
              {i === LAYERS.length - 1 && <Logo className="size-6" />}
              {layer.name}
            </div>
            <div className="mt-1 font-mono text-xs text-mute">{layer.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 pb-10 pt-10 sm:px-6 md:grid-cols-[1.05fr_1fr] md:pb-24 md:pt-20">
        <div>
          <h1 className="hero-in font-serif text-[clamp(3rem,8vw,6.25rem)] leading-[0.92] tracking-[-0.025em]">
            Every comment
            <br />
            comes with <em className="text-green">proof</em>.
          </h1>
          <p style={{ "--delay": "120ms" }} className="hero-in mt-6 max-w-md text-lg leading-relaxed text-[#cfcfcf]">
            An open-source PR reviewer. One agent reads the code around your diff, a second tries to prove each finding wrong. Only what survives gets posted.
          </p>
          <div style={{ "--delay": "220ms" }} className="hero-in mt-8 flex flex-wrap items-center gap-3">
            <a href="/docs/#start" className="rounded-lg bg-paper px-5 py-3 font-medium text-ink transition-transform hover:-translate-y-0.5">
              Add to a repo
            </a>
            <a href="#how" className="rounded-lg border border-[#333] px-5 py-3 text-paper transition-colors hover:border-paper">
              See how it works
            </a>
          </div>
        </div>
        <Stack />
      </div>
      <div className="border-y border-line">
        <ul className="mx-auto flex max-w-6xl flex-wrap gap-x-10 gap-y-2 px-4 py-5 font-mono text-[13px] text-mute sm:px-6">
          <li>No dashboard</li>
          <li>Hosted, Actions or self-hosted</li>
          <li>Your model, your key</li>
          <li>State lives in the PR</li>
          <li>MIT</li>
        </ul>
      </div>
    </section>
  );
}
