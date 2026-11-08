---
title: Runs and logs
summary: What a run costs, how long it takes, and where to look.
---

## Logs

Every phase of a run is a collapsible group in the Actions log, with its duration: checkout, diff and context, review, merge, post. Each tool call an agent makes is logged with its arguments.

The job summary gets a run report: the score, new, open and fixed counts, a table of phase timings, and the model's calls and tokens.

## Time

A typical review of a 40,000-character diff takes a few minutes. Model calls back off and retry on rate limits, but never past the agent's own budget. GitHub calls time out after 30 seconds and retry safely: creating a comment is never retried in a way that could post it twice.

## Runs never collide

Runs on the same pull request queue instead of overlapping, so a `/review` during a push review waits its turn. Runs are not cancelled mid-review, because a cancel between posting comments and saving state would post them again next time.

## When something fails

- A part of the diff that could not be reviewed is named in the summary as a partial review.
- A failed run restores the previous summary, or says it failed with a link to the run.
- If saving the summary fails, a fresh one is posted rather than losing state.
