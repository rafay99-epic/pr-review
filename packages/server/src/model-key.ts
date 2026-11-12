// Which model key a review runs on. Repos in REPOS may use the server's own key. Any other
// repo brings its own: the key is sealed (RSA-OAEP, SHA-256) to the server's public key and
// committed as `sealed_key` in `.reviewpilot.yml`. Only the server can open it, and it opens
// only for the account it was sealed for and only toward the provider it names, so a copied
// blob cannot spend someone else's key and an edited config cannot send the key elsewhere.

import { constants, createPublicKey, type KeyObject, privateDecrypt, publicEncrypt } from "node:crypto";
import { type } from "arktype";
import { parse } from "yaml";

const Sealed = type({
  v: "1",
  /** The GitHub account (user or org) whose repos may use the key, lowercase. */
  owner: "string",
  key: "string > 0",
  /** The provider the key is sent to; the action's default when absent. */
  "base_url?": "string",
});

export type Sealed = typeof Sealed.infer;
export type ModelKey = { key: string; baseUrl?: string } | { missing: string };

const OAEP = { padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" } as const;

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

/** Opens a sealed key for a repo of `owner`, or says why it cannot be used. */
export function unseal(privateKey: KeyObject, blob: string, owner: string): ModelKey {
  let payload: Sealed;
  try {
    const out = Sealed(JSON.parse(privateDecrypt({ key: privateKey, ...OAEP }, Buffer.from(blob, "base64")).toString("utf8")));
    if (out instanceof type.errors) return { missing: "the sealed key is not in the expected format; seal it again" };
    payload = out;
  } catch {
    return { missing: "the sealed key could not be opened; it was sealed for a different server, or it is damaged" };
  }
  if (payload.owner.toLowerCase() !== owner.toLowerCase()) {
    return { missing: `the sealed key belongs to ${payload.owner}, not ${owner}; seal your own key for ${owner}` };
  }
  if (payload.base_url !== undefined && !/^https:\/\/[^\s/]+/.test(payload.base_url)) {
    return { missing: "the sealed key's base_url must be an https URL" };
  }
  return payload.base_url === undefined ? { key: payload.key } : { key: payload.key, baseUrl: payload.base_url };
}
