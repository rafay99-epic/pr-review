---
title: How a review works
summary: Find, verify, post. Nothing reaches the PR without proof.
---

## Find

The diff is split into parts of about 25,000 characters. Each part goes to its own agent, and up to three run at once. Every agent has three read-only tools:

| Tool | What it does |
| --- | --- |
| `read_file` | Reads up to 250 lines of any file at the PR head |
| `search` | Runs `git grep -E` over the repository |
| `list_dir` | Lists a directory |

The agent opens callers, types and guards as it needs them, then submits every specific suspicion. It must list each changed file it checked; a submission that skips one is sent back.

## Verify

Each candidate goes to a fresh agent that assumes it is wrong. It confirms only when all four hold:

1. The cited lines exist and say what the finding claims.
2. The trigger traces from input to wrong result through code it opened.
3. Nothing already prevents it: no guard, early return, validation or type constraint.
4. The pull request introduced it.

Claims about tool versions or platform behaviour count only when the repository itself shows them. Up to four verifications run at once.

## Post

Confirmed findings become inline comments on the changed lines. One summary comment holds the score, the findings table and what changed since the last push.

## Safety

- The tools never run code from the pull request and cannot leave the checkout, symlinks included.
- Model output is untrusted: it cannot plant ReviewPilot's hidden markers, and every cited file must exist.
- Only owners, members and collaborators can run `/review`.
