---
title: Questions
summary: Short answers to what people ask most, and what to check when a review does not show up.
---

## Choosing

### Which setup should I use?

The [hosted bot](#hosted) if you want it working in two minutes. The [GitHub Action](#action) if your code may only run on GitHub's runners. [Your own server](#server) if you want your own bot name, your own machine, or reviews that never hit a time limit on infrastructure you control. The comparison is in [Start here](#start).

### Is it free?

The code is MIT licensed and the hosted bot costs nothing. Every setup spends your own model key, so your provider bills you for tokens. The Action also uses your Actions minutes; your own server costs a few cents a day on Fly.io.

### Can I use the Action and the server together?

On different repositories, yes. On the same repository, no: both would write the same summary comment. Turn the workflow off where a server reviews.

### Can I switch setups later?

Yes. A PR's findings and history live in its summary comment, so a new setup carries on from there. Remove the old one first.

## Models and cost

### Which model providers work?

Any OpenAI-compatible chat API: Command Code (the default), OpenRouter, OpenCode Zen, OpenAI, or a local server. Set the provider URL (`base_url` in the Action, or when you seal your key) and a model it offers as `model.name`.

### How many tokens does a review use?

It depends on the diff. On a 50-file PR the first review used 4.78M tokens and the next push 1.43M, 83% of them cached. On a 32-file PR a push that changed 4 files used 1.4M, 70% cached. Cached tokens are billed at the provider's lower rate where it has one. The summary footer shows the numbers for every review.

### How long does a review take?

A few minutes for a typical PR. The first review of a large PR takes longest (20 minutes for 50 files); later pushes only reread what changed. The check shows the elapsed time while it runs.

## Privacy

### Does the hosted bot see my code?

Yes: it clones the repository to read it and sends it, in pieces, to your model provider. Clones unused for 14 days are deleted. Your key is opened only in memory for a review. If code must stay on your own infrastructure, use the Action or your own server. See [What the hosted server sees](#what-the-hosted-server-sees).

### Is a sealed key safe in a public repository?

Yes. Only the hosted server's private key can open it. It opens only for repositories of the account it was sealed for, and only toward the provider URL sealed with it, so a copy is useless to anyone else.

### Can a pull request change the key or the rules?

No. `.reviewpilot.yml` is read from the default branch, so a PR is always reviewed under the rules already merged.

## When nothing happens

### Why was my pull request not reviewed?

Check, in order:

1. **Draft?** Drafts are skipped until marked ready for review.
2. **From a fork?** Fork PRs are skipped: their authors could be anyone, and in the Action they get no secrets.
3. **Opened by a bot?** The hosted bot and the server skip Dependabot and other bot PRs. In the Action they get no secrets, so the run fails early.
4. **Hosted bot or server:** is the App installed on this repository? Is there a **ReviewPilot** check saying **Add your model key**? Its text says what is missing.
5. **Action:** is the workflow on the PR's branch, and did the run start under the Actions tab?
6. **Just pushed?** The server waits a minute after the last push before it starts. If GitHub could not reach it, the server asks for the webhook again within a few minutes.

### `/review` does nothing

Only owners, members and collaborators can run it, and the comment must start with `/review`. With the Action, the workflow must be on the default branch first.

### The check says "Add your model key"

The repository has the App but no key it can use. The check's text gives the reason, and [If something is missing](#if-something-is-missing) lists what to do for each.

### The review was cut off or partial

The summary names any part of the diff that could not be reviewed, and the check fails: a review that did not read everything cannot pass, whatever its score. When an agent runs out of time it submits what it found so far, so this is rare. Comment `/review` to try again. A PR too large to read whole (files skipped by size) gets a neutral check instead.

### How do I stop ReviewPilot on a repository?

Hosted bot or server: remove the repository from the App's installation (or uninstall it). Action: delete or disable the workflow.
