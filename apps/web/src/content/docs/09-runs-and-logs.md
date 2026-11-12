---
title: Runs and logs
summary: What a run costs, how long it takes, and where to look.
---

## Logs

Every phase of a run is logged with its duration: checkout, diff and context, review, merge, post. Each tool call an agent makes is logged with its arguments.

With the [hosted bot](#hosted) you see the summary footer and the check; the server log is not public. In the workflow, phases are collapsible groups in the Actions log and the job summary gets a run report: the score, new, open and fixed counts, a table of phase timings, and the model's calls and tokens. On the [server](#server), the same lines go to its log, prefixed with the pull request.

## Time

The summary footer and the check show how long the review took and where the time went: find, verify, and the rest (checkout, diff, merging results). Posting comes after and is not in the total. While a review runs, the check shows its elapsed time.

A typical review of a 40,000-character diff takes a few minutes. The first review of a large pull request takes longest; later pushes only re-read the files that changed. Model calls back off and retry on rate limits, but never past the agent's own budget. GitHub calls time out after 30 seconds and retry safely: creating a comment is never retried in a way that could post it twice.

## What gets reused

Each layer saves work on the next push:

| Layer | What it skips |
| --- | --- |
| Changed files only | The find pass reads only files whose diff changed since the last review |
| Kept verdicts | Earlier findings whose file and cited code did not change are not verified again |
| Prompt cache | Agent turns resend the same opening, which providers bill at the cached rate; the footer shows the cached share |
| Warm clone (server) | No clone per run, only a fetch of the new commits |

## Runs never collide

Two reviews of one pull request never overlap. In the workflow they queue, so a `/review` during a push review waits its turn. The server stops the stale review instead and starts on the new commit.

Stopping is safe: a run that has not started posting puts the previous summary back and exits, and a finding already posted on the current commit is never posted twice.

## When something fails

- A part of the diff that could not be reviewed is named in the summary as a partial review.
- A failed or stopped run restores the previous summary, or says what happened.
- If saving the summary fails, a fresh one is posted rather than losing state.
