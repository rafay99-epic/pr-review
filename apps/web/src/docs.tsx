// The docs page: every markdown file in content/docs, in file order, with a sticky sidebar
// that follows the section being read.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Footer, Nav } from "./components/chrome.tsx";
import { useActive, useReveal } from "./hooks.ts";
import "./styles.css";

type Doc = { slug: string; title: string; summary: string; html: string };

const DOCS: Doc[] = Object.entries(import.meta.glob<Doc>("./content/docs/*.md", { eager: true, import: "default" }))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, doc]) => doc);
const IDS = DOCS.map((d) => d.slug);

function Docs() {
  useReveal();
  const active = useActive(IDS);
  return (
    <>
      <Nav current="docs" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[13rem_1fr] md:py-16">
        <aside className="md:sticky md:top-24 md:h-[calc(100vh-8rem)]">
          <nav aria-label="Docs" className="flex gap-4 overflow-x-auto pb-2 text-sm md:flex-col md:gap-1 md:overflow-visible">
            {DOCS.map((d) => (
              <a
                key={d.slug}
                href={`#${d.slug}`}
                aria-current={active === d.slug ? "true" : undefined}
                className={`shrink-0 rounded-md py-1.5 transition-colors md:px-3 ${active === d.slug ? "text-paper md:bg-[#111]" : "text-mute hover:text-paper"}`}
              >
                {d.title}
              </a>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">
          <h1 className="font-serif text-[clamp(2.75rem,6vw,4.5rem)] leading-none tracking-[-0.02em]">Docs</h1>
          <p className="mt-4 max-w-xl text-lg text-[#cfcfcf]">Everything ReviewPilot needs, and everything it does, on one page.</p>
          {DOCS.map((d) => (
            <section key={d.slug} id={d.slug} className="mt-16 scroll-mt-24 border-t border-line pt-10">
              <h2 className="font-serif text-4xl tracking-[-0.01em]">{d.title}</h2>
              <p className="mt-2 text-mute">{d.summary}</p>
              <div className="prose-doc mt-4 max-w-3xl" dangerouslySetInnerHTML={{ __html: d.html }} />
            </section>
          ))}
        </main>
      </div>
      <Footer />
    </>
  );
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<StrictMode><Docs /></StrictMode>);
