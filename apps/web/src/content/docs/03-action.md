---
title: GitHub Action
summary: One secret and one workflow file. Runs on your own Actions runners.
---

The Action runs the reviewer inside a GitHub Actions job in your repository. Nothing else to install or host. The trade-off is the job timeout: a very large first review can run out of time, and pushes during a review wait their turn. If that happens, use the [hosted bot](#hosted) or [your own server](#server).

<ol class="steps">
<li>

### Add your model key as a secret

<p class="who">You · terminal or repo Settings → Secrets and variables → Actions</p>

ReviewPilot calls an OpenAI-compatible API with your key. The default is [Command Code](https://commandcode.ai) running GLM-5.3 Flash.

```sh
gh secret set REVIEWPILOT_API_KEY -R owner/repo
```

</li>
<li>

### Add the workflow

<p class="who">You · `.github/workflows/reviewpilot.yml`</p>

```yaml
name: reviewpilot
on:
  pull_request:
    types: [opened, reopened, ready_for_review, synchronize]
  issue_comment:
    types: [created]
permissions:
  contents: read
  issues: write
  pull-requests: write
  checks: write        # the ReviewPilot check with the score and annotations
jobs:
  review:
    # Comment-triggered runs get your secrets even on public repos, so only maintainers'
    # /review comments run. Fork PRs never receive secrets, so they are skipped too.
    if: >-
      (github.event_name == 'pull_request' && !github.event.pull_request.head.repo.fork)
      || (github.event.issue.pull_request && startsWith(github.event.comment.body, '/review')
        && contains(fromJSON('["OWNER", "MEMBER", "COLLABORATOR"]'), github.event.comment.author_association))
    runs-on: ubuntu-latest
    timeout-minutes: 20
    # One review per pull request at a time: a /review during a push review waits its turn.
    # On the job, not the workflow, so skipped runs (other comments) never join the group.
    concurrency:
      group: reviewpilot-${{ github.event.pull_request.number || github.event.issue.number }}
      cancel-in-progress: false
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - uses: rafay99-epic/reviewpilot@main
        with:
          api_key: ${{ secrets.REVIEWPILOT_API_KEY }}
          # base_url: https://openrouter.ai/api/v1   # any OpenAI-compatible provider
```

Using another provider? Set `base_url` here and a model it offers as `model.name` in [`.reviewpilot.yml`](#configuration).

</li>
<li>

### Merge the workflow to your default branch

<p class="who">You · GitHub</p>

Pull requests are reviewed as soon as the file is on their branch. `/review` comments only work once the workflow is on the default branch, because GitHub runs comment-triggered workflows from there.

</li>
<li>

### Open a pull request

<p class="who">ReviewPilot · automatic</p>

It reviews on open and on every push, and posts the summary, inline comments and the **ReviewPilot** check. Comment `/review` to review the whole PR again.

</li>
</ol>

## Optional: post as your own bot

By default comments come from `github-actions[bot]`. To post as your own name and logo, create a GitHub App and mint its token in the workflow: [Your own bot](#own-bot).

## When the Action is not enough

| Symptom | Why | Fix |
| --- | --- | --- |
| Review stops at 20 minutes with nothing posted | The first review of a big PR needs longer than the job timeout | Raise `timeout-minutes`, or move to the [server](#server) (50 minutes) |
| Pushes pile up behind a running review | Workflow runs of one PR queue | The server stops the stale review and starts on the new commit |
| Every run spends a minute cloning | Each job starts from a fresh checkout | The server keeps a clone and only fetches new commits |
