// Shared page chrome: the logo mark, the top navigation and the footer.

export const REPO = "https://github.com/rafay99-epic/reviewpilot";

/** The ReviewPilot mark: code brackets around a green check. */
export function Logo({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path d="M30 30L14 50l16 20M70 30l16 20-16 20" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 51l8 8 16-18" fill="none" stroke="#3fb950" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Nav({ current }: { current: "home" | "docs" }) {
  const link = (href: string, label: string, active: boolean) => (
    <a href={href} className={`transition-colors hover:text-paper ${active ? "text-paper" : "text-mute"}`} aria-current={active ? "page" : undefined}>
      {label}
    </a>
  );
  return (
    <header className="sticky top-0 z-40 border-b border-line/0 bg-ink/70 backdrop-blur-md supports-[backdrop-filter]:bg-ink/55">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 text-sm sm:px-6" aria-label="Main">
        <a href="/" className="mr-auto flex items-center gap-2.5 font-medium text-paper">
          <Logo />
          ReviewPilot
        </a>
        <span className="hidden sm:contents">{link("/#how", "How it works", false)}</span>
        {link("/docs/", "Docs", current === "docs")}
        <a href={REPO} className="text-mute transition-colors hover:text-paper">
          GitHub
        </a>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-10 text-sm text-mute sm:px-6">
        <span className="mr-auto flex items-center gap-2.5 text-paper">
          <Logo className="size-6" />
          ReviewPilot
        </span>
        <a href="/docs/" className="hover:text-paper">Docs</a>
        <a href={REPO} className="hover:text-paper">Source</a>
        <a href={`${REPO}/blob/main/LICENSE`} className="hover:text-paper">MIT licence</a>
        <span>Built by <a href="https://rafay99.com" className="text-paper hover:underline">Rafay</a></span>
      </div>
    </footer>
  );
}
