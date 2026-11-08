<img src="assets/logo.png" width="64" alt="ReviewPilot logo: code brackets around a green check">

# ReviewPilot

An open-source PR reviewer that reads the code it needs, re-checks every finding against that code, and posts only what it can prove. Bring your own model key. No dashboard, no server.

Docs: [reviewpilot.rafay99.com](https://reviewpilot.rafay99.com)

## How a review works

1. **Find.** The diff is split into parts and each part goes to an agent with read-only tools (read a file, search the repo, list a directory). It opens callers, types and guards as it needs them and lists every specific suspicion.
2. **Verify.** Each candidate goes to a fresh agent that assumes it is wrong. It traces the trigger through the real code, looks for a guard that already prevents it, and confirms only what holds up.
3. **Post.** Confirmed findings become inline comments. One summary comment shows the score and what changed since the last push.

The tools never run PR code and cannot leave the checkout.

## Score

The score comes from the verified findings, never from the model's opinion, so it only moves when findings change.

| Score | Meaning |
| --- | --- |
| 5/5 | No verified issues |
| 4/5 | Minor issues only |
| 3/5 | At least one major issue |
| 2/5 | A critical issue (security, privacy, data loss, broken build) |
| 1/5 | Several critical issues |

On every push, earlier findings are re-checked: they show as fixed, still open, or new. A fixed finding gets a "Fixed in" reply, its thread is resolved and the comment is collapsed as outdated. A finding whose thread you resolve or reply to counts as dismissed and is not raised again.

## Use it

```yaml
# .github/workflows/reviewpilot.yml
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
          # base_url: https://openrouter.ai/api/v1   # any OpenAI-compatible provider
```

Comment `/review` on a PR to re-run it. GitHub runs comment-triggered workflows only from the default branch, so `/review` works once the workflow is merged.

### Post as your own bot

Without anything else, comments come from `github-actions[bot]`. To post under your own name, create a GitHub App (Pull requests and Issues: read and write, Contents: read, webhook off), install it, and mint its token before the review step:

```yaml
      - id: app
        uses: actions/create-github-app-token@v2
        with:
          app-id: ${{ secrets.REVIEWPILOT_APP_ID }}
          private-key: ${{ secrets.REVIEWPILOT_PRIVATE_KEY }}
      # ...checkout...
      - uses: rafay99-epic/reviewpilot@main
        with:
          api_key: ${{ secrets.REVIEWPILOT_API_KEY }}
          github_token: ${{ steps.app.outputs.token }}
          bot_login: ${{ steps.app.outputs.app-slug }}[bot]
```

## Configure

Everything is optional. Without `.reviewpilot.yml`, the defaults apply. The file is read from the default branch, so a PR cannot change its own review.

```yaml
# .reviewpilot.yml
model:
  name: z-ai/glm-5.3-flash      # find pass
  verify: z-ai/glm-5.3-flash    # verify pass, can be a stronger model
  effort: medium                # low | medium | high

review:
  ignore: ["docs/**"]           # added to the built-in lockfile/build/asset ignores
  min_severity: minor           # minor | major | critical
  max_findings: 20

# Read as repo guidance on every review (default: AGENTS.md and CLAUDE.md).
context_files: [AGENTS.md, CLAUDE.md]

instructions: |
  Guest queries are public by design and size-capped instead of rate-limited.

rules:
  - id: types-end-to-end
    severity: major
    paths: ["apps/**", "packages/**"]
    rule: No `any` or unchecked casts. Server types flow to the client without being redeclared.
  - id: privacy-policy-sync
    severity: critical
    paths: ["packages/backend/convex/schema.ts"]
    rule: A new field that stores user data needs a matching privacy policy update.
```

## Inputs

| Input | Default | |
| --- | --- | --- |
| `api_key` | required | Key for your model provider |
| `base_url` | `https://api.commandcode.ai/provider/v1` | Any OpenAI-compatible API |
| `model` | from config | Overrides `model.name` |
| `verify_model` | from config | Overrides `model.verify` |
| `github_token` | `github.token` | An App token posts as that App's bot |
| `bot_login` | `github-actions[bot]` | The account the token posts as; only its comments are trusted as ReviewPilot's state |

## Develop

```sh
pnpm install
pnpm test && pnpm typecheck
pnpm build                                   # bundles to dist/, which is committed
REVIEWPILOT_API_KEY=... node scripts/local.ts owner/repo 123   # dry run on a real PR, posts nothing
```

## My repos

My repos call `.github/workflows/review.yml` (owner-only gating plus the `reviewpilot[bot]` App token) through `caller.yml`. `enable.sh owner/repo` sets the secrets and opens the PR that adds it.
