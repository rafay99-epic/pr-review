/** A docs page, compiled from markdown at build time by the plugin in vite.config.ts. */
declare module "*.md" {
  const doc: { slug: string; title: string; summary: string; html: string };
  export default doc;
}
