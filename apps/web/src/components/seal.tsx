// Seals a model key for the hosted bot, in the browser. The key is encrypted with the
// server's public key (RSA-OAEP, SHA-256, /seal-key.pem) and never leaves the page; only the
// server can open the result, and only for the account it was sealed for. The account is
// bound by its numeric GitHub id (looked up here), which survives renames and is never reused.

import { type FormEvent, useState } from "react";

const DEFAULT_BASE_URL = "https://api.commandcode.ai/provider/v1";
/** RSA-OAEP with a 4096-bit key and SHA-256 fits at most this many bytes. */
const MAX_BYTES = 446;

const toDer = (pem: string) => Uint8Array.from(atob(pem.replace(/-----[^-]+-----|\s/g, "")), (c) => c.charCodeAt(0));

async function accountId(login: string): Promise<number> {
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`);
  if (res.status === 404) throw new Error(`There is no GitHub account named ${login}.`);
  if (!res.ok) throw new Error("Could not look up the account on GitHub. Try again in a minute.");
  const body: unknown = await res.json();
  const id = body && typeof body === "object" && "id" in body ? body.id : undefined;
  if (typeof id !== "number") throw new Error("GitHub did not return an account id.");
  return id;
}

async function sealKey(owner: string, key: string, baseUrl: string): Promise<string> {
  const payload = new TextEncoder().encode(JSON.stringify({ v: 1, owner, owner_id: await accountId(owner), key, base_url: baseUrl }));
  if (payload.length > MAX_BYTES) throw new Error("That key and URL are too long to seal together.");
  const res = await fetch("/seal-key.pem");
  if (!res.ok) throw new Error("Could not load the server's public key. Try again.");
  const publicKey = await crypto.subtle.importKey("spki", toDer(await res.text()), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
  const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, payload));
  return btoa(String.fromCharCode(...sealed));
}

const field = "mt-1.5 w-full rounded-md border border-line bg-[#0a0a0a] px-3 py-2 font-mono text-sm text-paper placeholder:text-dim focus:border-green focus:outline-none";

export function Seal() {
  const [owner, setOwner] = useState("");
  const [key, setKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [out, setOut] = useState<{ ok: true; yaml: string } | { ok: false; error: string }>();
  const [copied, setCopied] = useState<"no" | "yes" | "failed">("no");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setCopied("no");
    try {
      const sealed = await sealKey(owner.trim(), key.trim(), baseUrl.trim());
      setOut({ ok: true, yaml: `sealed_key: |\n${(sealed.match(/.{1,76}/g) ?? []).map((l) => `  ${l}`).join("\n")}\n` });
    } catch (err) {
      setOut({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  }

  async function copy() {
    if (!out?.ok) return;
    try {
      await navigator.clipboard.writeText(out.yaml);
      setCopied("yes");
    } catch {
      // Blocked clipboard (permissions, insecure page): the block below is still selectable.
      setCopied("failed");
    }
  }

  return (
    <form onSubmit={submit} className="not-prose my-6 border-y border-line py-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-mute">
          GitHub account or org
          <input className={field} value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="your-account" required pattern="[A-Za-z0-9-]+" autoComplete="off" spellCheck={false} />
        </label>
        <label className="text-sm text-mute">
          Provider base URL
          <input className={field} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} required pattern="https://.+" type="url" spellCheck={false} />
        </label>
        <label className="text-sm text-mute sm:col-span-2">
          Model API key
          <input className={field} value={key} onChange={(e) => setKey(e.target.value)} type="password" required autoComplete="off" placeholder="sk-..." />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-md bg-paper px-4 py-2 text-sm font-semibold text-ink hover:bg-[#e6e6e6]">Seal key</button>
        <span className="text-xs text-mute">Encrypted in this page. Your key is not sent anywhere; only the account name is looked up on GitHub.</span>
      </div>
      {out?.ok === false && <p className="mt-4 text-sm text-red" role="alert">{out.error}</p>}
      {out?.ok && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-mute">
            <span>Add to <code>.reviewpilot.yml</code> on your default branch</span>
            <button type="button" onClick={copy} className="text-paper underline decoration-green underline-offset-4">{copied === "yes" ? "Copied" : copied === "failed" ? "Copy failed, select the text" : "Copy"}</button>
          </div>
          <pre className="mt-2 overflow-x-auto rounded-md border border-line bg-panel p-3 font-mono text-xs text-paper">{out.yaml}</pre>
        </div>
      )}
    </form>
  );
}
