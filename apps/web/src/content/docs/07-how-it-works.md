---
title: How a review works
summary: Find, verify, post. Nothing reaches the PR without proof.
---

## Find

The diff is split into parts of about 25,000 characters. Each part goes to its own agent, and up to six run at once. Every agent has three read-only tools:

| Tool | What it does |
| --- | --- |
| `read_file` | Reads up to 250 lines of any file at the PR head |
| `search` | Runs `git grep -E` over the repository |
| `list_dir` | Lists a directory |

The agent opens callers, types and guards as it needs them, then submits every specific suspicion. It must list each changed file it checked; a submission that skips one is sent back.

Findings must be on lines the PR changes. Agents can open any file for context, but a problem in code the PR does not touch is dropped, not posted and not scored (`review.outside_diff: summary` lists those in the summary for information, still unscored).

On a push, the find pass reviews only the lines changed since the last reviewed commit; the rest of the diff was reviewed already and is shown as context. So a fix is reviewed for itself, and the review settles instead of finding new nits in old code every round. A file the agent did not get to is read whole next time. `/review` always reads the whole PR, and `review.scope: all` makes every push do the same.

## Verify

Each candidate goes to a fresh agent that assumes it is wrong. It confirms only when all four hold:

1. The cited lines exist and say what the finding claims.
2. The trigger traces from input to wrong result through code it opened.
3. Nothing already prevents it: no guard, early return, validation or type constraint.
4. The pull request introduced it.

Claims about tool versions or platform behaviour count only when the repository itself shows them. Up to eight verifications run at once.

## Post

Confirmed findings become inline comments on the changed lines. One summary comment holds the score, the findings table and what changed since the last push.

The **ReviewPilot** check shows the review in the pull request's checks. It is in progress while the review runs, with the elapsed time. It then passes at the repo's `review.pass_score` (5/5 unless set lower) and fails below. A review that did not finish (part of the diff or a check failed) fails too, whatever its score; one that skipped files because the PR is too large is neutral, never green, with the score in its title and up to 50 open findings as annotations on their lines, so findings also show in Files changed and the Checks tab. The check needs Checks write on the token; without it the review still posts.

## Safety

- The tools never run code from the pull request and cannot leave the checkout, symlinks included.
- Model output is untrusted: it cannot plant ReviewPilot's hidden markers, and every cited file must exist.
- Only owners, members and collaborators can run `/review`.
