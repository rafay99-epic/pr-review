---
title: Start here
summary: What ReviewPilot does, the three ways to run it, and how they compare.
---

ReviewPilot reviews every pull request, posts the issues it can prove as comments on the lines, and scores the PR from 1 to 5. Fix the issues, push, and it reviews again, until it scores 5/5 and the check turns green.

<figure class="diagram"><img src="/docs/loop.svg" alt="A pull request or push starts a review: find, verify, score. Below 5 you fix and push, which starts the next review. At 5 of 5 the check is green." width="780" height="230" /></figure>

Every suspected issue goes to a second agent that tries to prove it wrong. Only the ones that survive reach your PR, and the score is computed from them, not asked of the model.

## Pick a setup

The code is free and open source (MIT). Every setup uses **your own model API key**, so you pay your model provider for the tokens a review uses and nothing else.

<figure class="diagram"><img src="/docs/paths.svg" alt="Three setups. A, the hosted bot: install the App, seal your model key, open a pull request. B, the GitHub Action: add your key as a secret, add the workflow, open a pull request. C, your own server: create a GitHub App, deploy to Fly.io, install your App." width="780" height="330" /></figure>

| | A · Hosted bot | B · GitHub Action | C · Your own server |
| --- | --- | --- | --- |
| Best for | Trying it, or any repo, in two minutes | Repos that already live in Actions | Busy repos, or teams that want their own bot |
| You set up | Install an App, paste one sealed key | One secret, one workflow file | A GitHub App and a small Fly.io machine |
| Posts as | `reviewpilot-bot` | `github-actions` (or [your own App](#own-bot)) | Your own App, your name and logo |
| Time limit per review | 50 minutes | Your job timeout (20 minutes in the example) | 50 minutes |
| Pushes during a review | Stale review stops, new one starts | Wait in a queue | Stale review stops, new one starts |
| Your code goes to | The hosted server, then your model provider | GitHub's runner, then your model provider | Your server, then your model provider |
| Costs you | Model tokens | Model tokens and Actions minutes | Model tokens and the machine (cents a day) |
| Guide | [Hosted bot](#hosted) | [GitHub Action](#action) | [Your own server](#server) |

Not sure? Start with **A**. You can move to B or C later without losing anything: each PR's history lives in its summary comment, so a new setup picks up where the old one left off. Only run one setup per repository, or two bots will race on the same summary comment.

## Action or server: measured

The same pull request (50 changed files) reviewed both ways. On GitHub Actions the review hit the 20-minute job timeout twice and posted nothing. On the server (A and C) the first review finished, and the next push reread only the files that changed.

<div class="bars" role="img" aria-label="Review time. GitHub Action: stopped at 20 minutes, twice. Server, first review: 20 minutes 35 seconds. Server, next push: 7 minutes 1 second.">
<div><span>Action, run 1</span><i class="bad" style="--w:100%"></i><b>stopped, 20m</b></div>
<div><span>Action, run 2</span><i class="bad" style="--w:100%"></i><b>stopped, 20m</b></div>
<div><span>Server, first review</span><i style="--w:100%"></i><b>20m 35s, 4/5</b></div>
<div><span>Server, next push</span><i class="good" style="--w:34%"></i><b>7m 01s, 5/5</b></div>
</div>

<div class="bars" role="img" aria-label="Tokens. First review: 4.78 million. Next push: 1.43 million, 83 percent of them cached.">
<div><span>Tokens, first review</span><i style="--w:100%"></i><b>4.78M</b></div>
<div><span>Tokens, next push</span><i class="good" style="--w:30%"></i><b>1.43M, 83% cached</b></div>
</div>

| What changed | GitHub Action | Server |
| --- | --- | --- |
| Checkout | Full clone every run | Saved clone, updated in 1 to 1.5 s |
| Files read on a push | Only changed ones | Only changed ones, and the review is never cut off |
| A burst of 5 pushes | 5 reviews, one after another | 1 review, 60 s after the last push |
| Cached tokens | Billed at the cached rate when the provider supports it | The same, shown in the summary footer |

Both read only what changed on a push. The server is where that pays off, because reviews no longer queue or hit a timeout.

## What you see on a pull request

A summary comment with the score and every open finding, updated on each push:

<figure><img src="/docs/pr-summary.webp" alt="ReviewPilot summary comment: score 4/5, three minor findings in a table with file links, and a footer with files read, time and tokens." width="1600" height="735" loading="lazy" /><figcaption>The summary: score, findings, what changed since the last push, time and tokens.</figcaption></figure>

Each finding as a comment on its line, with the evidence that proves it:

<figure><img src="/docs/pr-inline.webp" alt="An inline ReviewPilot comment on a changed line: title, severity, explanation and an Evidence section." width="1596" height="606" loading="lazy" /></figure>

And the **ReviewPilot** check, green only at 5/5, with each finding as an annotation:

<figure><img src="/docs/check-run.webp" alt="The ReviewPilot check run: 4/5, 3 open, 8m 44s, with three annotations on their files and lines." width="1600" height="1184" loading="lazy" /><figcaption>Make the check required in a branch ruleset and nothing merges below 5/5.</figcaption></figure>
