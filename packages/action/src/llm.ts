// Minimal client for any OpenAI-compatible chat completions API (Command Code, OpenRouter,
// OpenCode Zen, a local server). Bring your own key and base URL.

import { type } from "arktype";

export type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };

export type Message =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

export type ToolSpec = {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
};

export type Llm = {
  model: string;
  /** `force` names a tool the model must call this turn; `deadline` (epoch ms) caps timeouts and retries. */
  chat(messages: Message[], tools: ToolSpec[], force?: string, deadline?: number): Promise<Extract<Message, { role: "assistant" }>>;
  /** `cached` is the part of `prompt` the provider served from its prompt cache. */
  usage: { prompt: number; completion: number; calls: number; cached: number };
};

const Completion = type({
  "choices?": type({
    "message?": {
      "content?": "string | null",
      "tool_calls?": type({ id: "string", type: "'function'", function: { name: "string", arguments: "string" } }).array(),
    },
  }).array(),
  "usage?": { "prompt_tokens?": "number", "completion_tokens?": "number", "prompt_tokens_details?": { "cached_tokens?": "number" } },
  "error?": { "message?": "string" },
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function createLlm(opts: {
  baseUrl: string;
  apiKey: string;
  model: string;
  effort: string;
  timeoutMs?: number;
}): Llm {
  const usage = { prompt: 0, completion: 0, calls: 0, cached: 0 };
  const url = `${opts.baseUrl.replace(/\/$/, "")}/chat/completions`;

  // Dropped after a provider rejects it, so one 400 does not fail every later call.
  let sendEffort = opts.effort !== "none";

  async function chat(messages: Message[], tools: ToolSpec[], force?: string, deadline?: number) {
    // Rate limits and upstream hiccups are common on shared tiers: back off and retry a few
    // times, but never past the caller's deadline (one call cannot outlive its agent's budget).
    const left = () => (deadline === undefined ? Infinity : deadline - Date.now());
    for (let attempt = 0; ; attempt++) {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${opts.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "reviewpilot/0.1",
        },
        body: JSON.stringify({
          model: opts.model,
          messages,
          tools,
          tool_choice: force ? { type: "function", function: { name: force } } : "auto",
          // "none" leaves the parameter out, for providers that reject it.
          ...(sendEffort ? { reasoning_effort: opts.effort } : {}),
        }),
        // At least 60s even past the deadline: the forced final call must still get an answer.
        signal: AbortSignal.timeout(Math.max(60_000, Math.min(opts.timeoutMs ?? 240_000, left()))),
      }).catch((e: unknown) => ({ ok: false, status: 0, error: e }) as const);

      const retryable = !res.ok && (res.status === 0 || res.status === 429 || res.status >= 500);
      if (retryable && attempt < 4 && left() > 15_000) {
        // Retry-After is either seconds or an HTTP date.
        const header = "headers" in res ? res.headers.get("retry-after") : null;
        const wait = header ? (Number(header) * 1000 || Date.parse(header) - Date.now()) : NaN;
        await sleep(Number.isFinite(wait) && wait > 0 ? Math.min(wait, 60_000) : 2 ** attempt * 3000);
        continue;
      }
      if (!res.ok) {
        const detail = "text" in res ? await res.text().catch((e: unknown) => String(e)) : String(res.error);
        if (res.status === 400 && sendEffort && /reasoning/i.test(detail) && attempt < 4) {
          sendEffort = false;
          continue;
        }
        throw new Error(`${opts.model}: HTTP ${res.status} ${detail.slice(0, 300)}`);
      }

      // A 200 with a body that is not a completion (proxy error page, truncation) is retried.
      // A connection dropped while reading the body is retried like one dropped before it.
      const text = await res.text().catch(() => undefined);
      if (text === undefined && attempt < 4 && left() > 15_000) {
        await sleep(2 ** attempt * 3000);
        continue;
      }
      if (text === undefined) throw new Error(`${opts.model}: the response body could not be read`);
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        json = undefined;
      }
      const parsed = Completion(json);
      const data = parsed instanceof type.errors ? undefined : parsed;
      if (!data && attempt < 4 && left() > 15_000) {
        await sleep(2 ** attempt * 3000);
        continue;
      }
      if (!data) throw new Error(`${opts.model}: response is not a chat completion: ${text.slice(0, 200)}`);
      const message = data.choices?.[0]?.message;
      if (!message && attempt < 4 && left() > 15_000) {
        await sleep(2 ** attempt * 3000);
        continue;
      }
      if (!message) throw new Error(`${opts.model}: empty response ${data.error?.message ?? ""}`);
      usage.calls += 1;
      usage.prompt += data.usage?.prompt_tokens ?? 0;
      usage.completion += data.usage?.completion_tokens ?? 0;
      usage.cached += data.usage?.prompt_tokens_details?.cached_tokens ?? 0;
      return {
        role: "assistant" as const,
        content: message.content ?? null,
        ...(message.tool_calls?.length ? { tool_calls: message.tool_calls } : {}),
      };
    }
  }

  return { model: opts.model, chat, usage };
}
