// The site is two static pages: the home page and the docs. Docs are markdown files that a
// small plugin turns into HTML at build time, with Shiki highlighting, so neither a markdown
// parser nor a highlighter ships to the browser.

import { basename, resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { Marked, type Tokens } from "marked";
import { createHighlighter } from "shiki";
import { defineConfig, type Plugin } from "vite";

const LANGS = ["yaml", "sh", "ts", "json"] as const;
const highlighter = await createHighlighter({ themes: ["github-dark-default"], langs: [...LANGS] });
const isLang = (lang: string): lang is (typeof LANGS)[number] => (LANGS as readonly string[]).includes(lang);

const slugify = (text: string) => text.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function docs(): Plugin {
  const marked = new Marked({
    renderer: {
      code({ text, lang }: Tokens.Code) {
        return highlighter.codeToHtml(text, { lang: lang && isLang(lang) ? lang : "text", theme: "github-dark-default" });
      },
      heading({ tokens, depth }: Tokens.Heading) {
        const html = this.parser.parseInline(tokens);
        return `<h${depth} id="${slugify(html)}">${html}</h${depth}>`;
      },
    },
  });

  return {
    name: "reviewpilot-docs",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith(".md")) return;
      const front = /^---\n([\s\S]*?)\n---\n/.exec(code);
      const meta = new Map(
        (front?.[1] ?? "").split("\n").map((line) => [line.slice(0, line.indexOf(":")).trim(), line.slice(line.indexOf(":") + 1).trim()]),
      );
      const html = marked.parse(front ? code.slice(front[0].length) : code, { async: false });
      const doc = { slug: basename(id, ".md").replace(/^\d+-/, ""), title: meta.get("title") ?? "", summary: meta.get("summary") ?? "", html };
      return { code: `export default ${JSON.stringify(doc)};`, map: null };
    },
  };
}

export default defineConfig({
  plugins: [docs(), react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: { home: resolve(import.meta.dirname, "index.html"), docs: resolve(import.meta.dirname, "docs/index.html") },
    },
  },
});
