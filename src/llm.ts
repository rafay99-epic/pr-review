// Minimal client for any OpenAI-compatible chat completions API (Command Code, OpenRouter,
// OpenCode Zen, a local server). Bring your own key and base URL.

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
  /** `force` names a tool the model must call this turn. */
  chat(messages: Message[], tools: ToolSpec[], force?: string): Promise<Extract<Message, { role: "assistant" }>>;
  usage: { prompt: number; completion: number; calls: number };
};

type Completion = {
  choices?: { message?: { content?: string | null; tool_calls?: ToolCall[] } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  error?: { message?: string };
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function createLlm(opts: {
  baseUrl: string;
  apiKey: string;
  model: string;
  effort: string;
  timeoutMs?: number;
}): Llm {
  const usage = { prompt: 0, completion: 0, calls: 0 };
  const url = `${opts.baseUrl.replace(/\/$/, "")}/chat/completions`;

  async function chat(messages: Message[], tools: ToolSpec[], force?: string) {
    // Rate limits and upstream hiccups are common on shared tiers: back off and retry a few times.
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
          ...(opts.effort === "none" ? {} : { reasoning_effort: opts.effort }),
        }),
        signal: AbortSignal.timeout(opts.timeoutMs ?? 240_000),
      }).catch((e: unknown) => ({ ok: false, status: 0, error: e }) as const);

      const retryable = !res.ok && (res.status === 0 || res.status === 429 || res.status >= 500);
      if (retryable && attempt < 4) {
        // Retry-After is either seconds or an HTTP date.
        const header = "headers" in res ? res.headers.get("retry-after") : null;
        const wait = header ? (Number(header) * 1000 || Date.parse(header) - Date.now()) : NaN;
        await sleep(Number.isFinite(wait) && wait > 0 ? Math.min(wait, 60_000) : 2 ** attempt * 3000);
        continue;
      }
      if (!res.ok) {
        const detail = "text" in res ? await res.text() : String(res.error);
        throw new Error(`${opts.model}: HTTP ${res.status} ${detail.slice(0, 300)}`);
      }

      const data = (await res.json().catch(() => undefined)) as Completion | undefined;
      if (!data && attempt < 4) {
        await sleep(2 ** attempt * 3000);
        continue;
      }
      if (!data) throw new Error(`${opts.model}: response body is not JSON`);
      const message = data.choices?.[0]?.message;
      if (!message) throw new Error(`${opts.model}: empty response ${data.error?.message ?? ""}`);
      usage.calls += 1;
      usage.prompt += data.usage?.prompt_tokens ?? 0;
      usage.completion += data.usage?.completion_tokens ?? 0;
      return {
        role: "assistant" as const,
        content: message.content ?? null,
        ...(message.tool_calls?.length ? { tool_calls: message.tool_calls } : {}),
      };
    }
  }

  return { model: opts.model, chat, usage };
}
