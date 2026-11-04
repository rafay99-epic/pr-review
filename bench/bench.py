# Benchmarks Command Code models on a PR-Agent-shaped review of a real diff.
# Usage: gh pr diff <n> -R <repo> > diff.txt
#        python3 -I bench/bench.py <key_file> diff.txt results.json [variant,variant]
# Prints total time, time to first token, and thinking tokens per run.
import json, sys, time, threading, urllib.request

key = open(sys.argv[1]).read().strip()
diff = open(sys.argv[2]).read()
URL = "https://api.commandcode.ai/provider/v1/chat/completions"

SYSTEM = """You are PR-Reviewer, a senior engineer reviewing a GitHub PR diff.
Look for logic bugs, security holes, type-safety gaps, and UI accessibility issues. Skip style nits.
Respond with valid YAML only, matching:
review:
  estimated_effort_to_review_[1-5]: int
  security_concerns: str
  key_issues_to_review:
    - relevant_file: str
      start_line: int
      end_line: int
      issue_header: str
      issue_content: str
List at most 8 key issues."""

# Candidates worth re-checking when reviews get slow. Gemini is excluded on purpose.
VARIANTS = [
    ("deepseek-v4.1-flash-fast low", {"model": "deepseek/deepseek-v4.1-flash-fast", "reasoning_effort": "low"}),
    ("deepseek-v4.1-flash-fast", {"model": "deepseek/deepseek-v4.1-flash-fast"}),
    ("glm-5.3-flash low", {"model": "z-ai/glm-5.3-flash", "reasoning_effort": "low"}),
    ("glm-5.3-flash", {"model": "z-ai/glm-5.3-flash"}),
    ("GLM-5.2-Fast", {"model": "zai-org/GLM-5.2-Fast"}),
    ("Kimi-K2.7-Code-Highspeed", {"model": "moonshotai/Kimi-K2.7-Code-Highspeed"}),
]
# Optional 4th arg: comma-separated variant names to run.
if len(sys.argv) > 4:
    VARIANTS = [v for v in VARIANTS if v[0] in sys.argv[4].split(",")]
RUNS = 2
results = []
lock = threading.Lock()


def run(name, extra, trial):
    body = {
        "messages": [{"role": "system", "content": SYSTEM}, {"role": "user", "content": diff}],
        "stream": True,
        "stream_options": {"include_usage": True},
        **extra,
    }
    req = urllib.request.Request(URL, data=json.dumps(body).encode(), headers={
        "Authorization": f"Bearer {key}", "Content-Type": "application/json",
        "User-Agent": "pr-review-bench/1.0"})  # Cloudflare 1010-blocks urllib's default UA
    r = {"variant": name, "trial": trial, "ttft": None, "total": None, "out": None,
         "reasoning": None, "chars": 0, "error": None, "text": ""}
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            for raw in resp:
                line = raw.decode("utf-8", "replace").strip()
                if not line.startswith("data:"):
                    continue
                data = line[5:].strip()
                if data == "[DONE]":
                    break
                ev = json.loads(data)
                if ev.get("error"):
                    r["error"] = str(ev["error"])[:150]
                for ch in ev.get("choices") or []:
                    d = ch.get("delta") or {}
                    piece = d.get("content") or ""
                    if (piece or d.get("reasoning_content") or d.get("reasoning")) and r["ttft"] is None:
                        r["ttft"] = round(time.time() - t0, 1)
                    r["text"] += piece
                u = ev.get("usage")
                if u:
                    r["out"] = u.get("completion_tokens")
                    r["reasoning"] = (u.get("completion_tokens_details") or {}).get("reasoning_tokens")
                    r["in"] = u.get("prompt_tokens")
    except Exception as e:  # timeouts, HTTP errors, upstream failures
        body_txt = ""
        if hasattr(e, "read"):
            try:
                body_txt = e.read().decode()[:150]
            except Exception:
                pass
        r["error"] = f"{type(e).__name__}: {e} {body_txt}"[:200]
    r["total"] = round(time.time() - t0, 1)
    r["chars"] = len(r["text"])
    with lock:
        results.append(r)
        with open(sys.argv[3] + "l", "a") as f:  # results.jsonl survives an outer timeout
            f.write(json.dumps(r) + "\n")
        print(f"{name} #{trial}: total={r['total']}s ttft={r['ttft']} out={r['out']} "
              f"reasoning={r['reasoning']} chars={r['chars']} err={r['error']}", flush=True)


threads = [threading.Thread(target=run, args=(n, e, t)) for t in range(1, RUNS + 1) for n, e in VARIANTS]
for th in threads:
    th.start()
for th in threads:
    th.join()
json.dump(results, open(sys.argv[3], "w"), indent=1)
