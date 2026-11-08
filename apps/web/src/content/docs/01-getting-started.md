---
title: Getting started
summary: One workflow file and one secret. Two minutes.
---

## 1. Add your model key

ReviewPilot calls an OpenAI-compatible chat API with your own key. The default is [Command Code](https://commandcode.ai) running GLM-5.3 Flash.

```sh
gh secret set REVIEWPILOT_API_KEY -R owner/repo
```

## 2. Add the workflow

Create `.github/workflows/reviewpilot.yml`:

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
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - uses: rafay99-epic/reviewpilot@main
        with:
          api_key: ${{ secrets.REVIEWPILOT_API_KEY }}
```

## 3. Open a pull request

ReviewPilot reviews it on open and on every push. Comment `/review` to run it again.

GitHub runs comment-triggered workflows only from the default branch, so `/review` starts working once this workflow is merged.
