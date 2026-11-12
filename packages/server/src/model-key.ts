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

/** The account that owns a repo, from the webhook payload. */
export type Owner = { login: string; id: number };

/** Seals a key for `owner`. The website and `openssl pkeyutl` produce the same format. */
export function seal(publicKey: KeyObject | string, payload: Sealed): string {
  return publicEncrypt({ key: publicKey, ...OAEP }, Buffer.from(JSON.stringify(payload))).toString("base64");
}

/** The public half, to publish for sealing. */
export const publicPem = (privateKey: KeyObject) => createPublicKey(privateKey).export({ type: "spki", format: "pem" }).toString();

/** `sealed_key` from the config text, if any. Validation of the rest is the action's job. */
export function sealedKeyOf(configText: string | undefined): string | undefined {
  if (!configText) return undefined;
  try {
    const raw: unknown = parse(configText);
    const value = raw && typeof raw === "object" && "sealed_key" in raw ? raw.sealed_key : undefined;
    return typeof value === "string" ? value.replace(/\s+/g, "") : undefined;
  } catch {
    return undefined;
  }
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
    const who = payload.owner.toLowerCase() === owner.login.toLowerCase() ? `a different account that was named ${payload.owner}` : payload.owner;
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
  sealed: string | undefined;
  sealKey: KeyObject | undefined;
  apiKey: string | undefined;
  repos: ReadonlySet<string>;
  repo: string;
  owner: Owner;
}): ModelKey {
  if (o.sealed) return o.sealKey ? unseal(o.sealKey, o.sealed, o.owner) : { missing: "this server does not accept sealed keys" };
  if (o.apiKey && allowedRepo(o.repos, o.repo)) return { key: o.apiKey };
  return { missing: "this repository has no model key yet" };
}
