// The tool loop: the model reads files and searches until it calls the submit tool, whose
// arguments are validated. Invalid submissions go back to the model with the error, so a
// malformed answer gets one more try instead of failing the review.

import type { Llm, Message, ToolSpec } from "./llm.ts";
import { runTool, TOOL_SPECS } from "./tools.ts";

export type Submit<T> = {
  spec: ToolSpec;
  /** Validates the submitted arguments; an error goes back to the model. */
  parse: (args: unknown) => { ok: true; value: T } | { ok: false; error: string };
};

export async function runAgent<T>(opts: {
  llm: Llm;
  root: string;
  system: string;
  user: string;
  submit: Submit<T>;
  maxTurns: number;
  /** Epoch ms after which the model is told to submit what it has. */
  deadline: number;
  log: (line: string) => void;
}): Promise<T> {
  const { llm, submit } = opts;
  const name = submit.spec.function.name;
  const tools = [...TOOL_SPECS, submit.spec];
  const messages: Message[] = [
    { role: "system", content: opts.system },
    { role: "user", content: opts.user },
  ];
  let warned = false;

  for (let turn = 1; turn <= opts.maxTurns + 2; turn++) {
    if (!warned && (turn > opts.maxTurns || Date.now() > opts.deadline)) {
      warned = true;
      messages.push({
        role: "user",
        content: `You are out of time. Call ${name} now with what you have so far.`,
      });
    }
    // Once out of budget, only the submit tool is offered and the call is forced.
    const reply = await llm.chat(messages, warned ? [submit.spec] : tools, warned ? name : undefined);
    messages.push(reply);

    const calls = reply.tool_calls ?? [];
    if (!calls.length) {
      messages.push({ role: "user", content: `Use the tools, and finish by calling ${name}.` });
      continue;
    }
    for (const call of calls) {
      let args: unknown;
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
        messages.push({ role: "tool", tool_call_id: call.id, content: "Error: arguments are not valid JSON." });
        continue;
      }
      if (call.function.name === name) {
        const parsed = submit.parse(args);
        if (!parsed.ok) {
          messages.push({ role: "tool", tool_call_id: call.id, content: `Error: ${parsed.error}. Fix it and call ${name} again.` });
          continue;
        }
        opts.log(`${name} after ${turn} turns`);
        return parsed.value;
      }
      const record = (args ?? {}) as Record<string, unknown>;
      opts.log(`  ${call.function.name} ${JSON.stringify(record).slice(0, 120)}`);
      messages.push({ role: "tool", tool_call_id: call.id, content: await runTool(opts.root, call.function.name, record) });
    }
  }
  throw new Error(`${name} was never called after ${opts.maxTurns + 2} turns`);
}
