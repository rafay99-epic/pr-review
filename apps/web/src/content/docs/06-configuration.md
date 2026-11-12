---
title: Configuration
summary: Every key is optional. No file means sensible defaults.
---

<ol class="steps">
<li>

### Create `.reviewpilot.yml` at the repository root

<p class="who">You · your repository</p>

Start from the example below and keep only what you want to change. A repository without the file runs on the defaults.

</li>
<li>

### Commit it to the default branch

<p class="who">You · usually `main`</p>

ReviewPilot reads the file from the default branch only, so a pull request cannot loosen its own review. A change made inside a PR applies once that PR is merged.

</li>
<li>

### Check the next summary

<p class="who">ReviewPilot · next review</p>

An invalid file (bad YAML, a typo in a key, a wrong value) is never silently ignored: the review runs on the defaults and the summary says what was wrong.

</li>
</ol>

## Example

```yaml
sealed_key: |          # hosted bot only: your sealed model key
  dGhpcyBpcyBub3QgYSByZWFsIGtleQ...

model:
  name: z-ai/glm-5.3-flash
  verify: z-ai/glm-5.3-flash
  effort: medium

review:
  ignore: ["docs/**"]
  min_severity: minor
  max_findings: 20
  scope: changed
  outside_diff: drop
  pass_score: 5

context_files: [AGENTS.md, CLAUDE.md]

instructions: |
  Guest queries are public by design and size-capped instead of rate-limited.

rules:
  - id: types-end-to-end
    severity: major
    paths: ["apps/**", "packages/**"]
    rule: No `any` or unchecked casts. Server types flow to the client without being redeclared.
```

## Keys

| Key | Type | Default | Notes |
| --- | --- | --- | --- |
| `sealed_key` | string | none | Your model key, sealed for the [hosted bot](#hosted) or a [server that accepts sealed keys](#server). Ignored by the Action |
| `model.name` | string | `z-ai/glm-5.3-flash` | Model for the find pass. Must be one your provider offers |
| `model.verify` | string | same as `model.name` | Model for the verify pass; a stronger one here costs little |
| `model.effort` | `none` `low` `medium` `high` | `medium` | Sent as `reasoning_effort`; `none` leaves it out |
| `review.ignore` | glob list | lockfiles, build output, images | Added to the built-in list, never replacing it |
| `review.min_severity` | `minor` `major` `critical` | `minor` | Findings below it are not posted |
| `review.max_findings` | 1 to 50 | `20` | New findings posted per run, most severe first |
| `review.scope` | `changed` `all` | `changed` | On a push, `changed` reviews only the lines changed since the last reviewed commit; `all` reviews the whole pull request every time. `/review` always reviews everything |
| `review.outside_diff` | `drop` `summary` | `drop` | A finding on code the PR does not change: `drop` it, or list it in the summary for information. Either way it is not posted inline and not scored |
| `review.pass_score` | 1 to 5 | `5` | The score at which the ReviewPilot check passes |
| `context_files` | path list | `[AGENTS.md, CLAUDE.md]` | Read as repository guidance, up to 10,000 characters in total across all files |
| `instructions` | string | none | Extra guidance for every review |
| `rules[].id` | string | required | Cited on findings that break the rule |
| `rules[].rule` | string | required | What must hold, in one or two sentences |
| `rules[].severity` | `minor` `major` `critical` | `major` | |
| `rules[].paths` | glob list | every file | The rule applies when a changed file matches |

## Action inputs

Only for the [GitHub Action](#action), set under `with:` in the workflow.

| Input | Default | Notes |
| --- | --- | --- |
| `api_key` | required | Key for the model provider |
| `base_url` | `https://api.commandcode.ai/provider/v1` | Any OpenAI-compatible API: OpenRouter, OpenCode Zen, a local server |
| `model` | from config | Overrides `model.name` |
| `verify_model` | from config | Overrides `model.verify` |
| `github_token` | `github.token` | An App installation token posts as that App's bot |
| `bot_login` | `github-actions[bot]` | The account the token posts as. Only its comments and `github-actions[bot]`'s are trusted as ReviewPilot's own; the latter lets an older summary be taken over |
