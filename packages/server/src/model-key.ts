// Which model key a review runs on. Repos in REPOS may use the server's own key. Any other
// repo brings its own: the key is sealed (RSA-OAEP, SHA-256) to the server's public key and
// committed as `sealed_key` in `.reviewpilot.yml`. Only the server can open it, and it opens
// only for the account it was sealed for (by GitHub's numeric account id, which survives a
// rename and is never reused) and only toward the provider it names, so a copied blob cannot
// spend someone else's key and an edited config cannot send the key elsewhere.

import { constants, createPublicKey, type KeyObject, privateDecrypt, publicEncrypt } from "node:crypto";
import { type } from "arktype";
import { parse } from "yaml";
import { allowedRepo } from "./webhook.ts";

const Sealed = type({
  v: "1",
  /** The GitHub account (user or org) the key was sealed for: login for messages, id to match. */
  owner: "string",
  owner_id: "number.integer > 0",
  key: "string > 0",
  /** The provider the key is sent to; the action's default when absent. */
  "base_url?": "string",
});

export type Sealed = typeof Sealed.infer;
export type ModelKey = { key: string; baseUrl?: string } | { missing: string };

const OAEP = { padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" } as const;

const RepoOwner = type({ repository: { owner: { login: "string", id: "number.integer" } } });

/** The account that owns a repo. */
export type Owner = typeof RepoOwner.infer.repository.owner;

/** The repo's owner from a webhook payload (saved jobs carry the same payload). */
export function ownerOf(payload: unknown): Owner | undefined {
  const out = RepoOwner(payload);
  return out instanceof type.errors ? undefined : { login: out.repository.owner.login, id: out.repository.owner.id };
}

/** The login a sealed key claims, cut to what a GitHub login can hold: it is sealer-written text that ends up in logs and checks. */
const claimed = (login: string) => login.replace(/[^A-Za-z0-9-]/g, "").slice(0, 39) || "another account";

/** Seals a key for `owner`. The website and `openssl pkeyutl` produce the same format. */
export function seal(publicKey: KeyObject | string, payload: Sealed): string {
  return publicEncrypt({ key: publicKey, ...OAEP }, Buffer.from(JSON.stringify(payload))).toString("base64");
}

/** The public half, to publish for sealing. */
export const publicPem = (privateKey: KeyObject) => createPublicKey(privateKey).export({ type: "spki", format: "pem" }).toString();

/**
 * `sealed_key` from the config text: the blob, `undefined` when there is none, or `null` when
 * one is there but unreadable (not text, or the file is not valid YAML), so a broken key is
 * reported instead of treated as absent. Validation of the rest is the action's job.
 */
export function sealedKeyOf(configText: string | undefined): string | null | undefined {
  if (!configText) return undefined;
  let raw: unknown;
  try {
    raw = parse(configText);
  } catch {
    return /^\s*sealed_key\s*:/m.test(configText) ? null : undefined;
  }
  if (!raw || typeof raw !== "object" || !("sealed_key" in raw)) return undefined;
  const value = raw.sealed_key;
  return typeof value === "string" && value.trim() ? value.replace(/\s+/g, "") : null;
}

/** A provider URL the key may go to: https, a host, and no user info that could hide the real host. */
function safeBaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname !== "" && url.username === "" && url.password === "";
  } catch {
    return false;
  }
}

/** Opens a sealed key for a repo of `owner`, or says why it cannot be used. */
export function unseal(privateKey: KeyObject, blob: string, owner: Owner): ModelKey {
  let text: string;
  try {
    text = privateDecrypt({ key: privateKey, ...OAEP }, Buffer.from(blob, "base64")).toString("utf8");
  } catch {
    return { missing: "the sealed key could not be opened; it was sealed for a different server, or it is damaged" };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    raw = undefined;
  }
  const payload = Sealed(raw);
  if (payload instanceof type.errors) return { missing: "the sealed key is not in the expected format; seal it again" };
  if (payload.owner_id !== owner.id) {
    const name = claimed(payload.owner);
    const who = name.toLowerCase() === owner.login.toLowerCase() ? `a different account that was named ${name}` : name;
    return { missing: `the sealed key belongs to ${who}, not ${owner.login}; seal your own key for ${owner.login}` };
  }
  if (payload.base_url !== undefined && !safeBaseUrl(payload.base_url)) {
    return { missing: "the sealed key's base_url must be an https URL" };
  }
  return payload.base_url === undefined ? { key: payload.key } : { key: payload.key, baseUrl: payload.base_url };
}

/**
 * The key a repo's reviews run on: its own sealed key first, then the server's key when REPOS
 * covers the repo. A sealed key the server cannot accept never falls back to the server's key.
 */
export function chooseKey(o: {
  sealed: string | null | undefined;
  sealKey: KeyObject | undefined;
  apiKey: string | undefined;
  repos: ReadonlySet<string>;
  repo: string;
  owner: Owner;
}): ModelKey {
  if (o.sealed === null) return { missing: "sealed_key in .reviewpilot.yml is not a sealed key; paste the whole block the seal form gives you" };
  if (o.sealed) return o.sealKey ? unseal(o.sealKey, o.sealed, o.owner) : { missing: "this server does not accept sealed keys" };
  if (o.apiKey && allowedRepo(o.repos, o.repo)) return { key: o.apiKey };
  return { missing: "this repository has no model key yet" };
}
