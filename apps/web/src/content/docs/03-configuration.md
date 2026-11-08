---
title: Configuration
summary: Every key is optional. No file means sensible defaults.
---

Add `.reviewpilot.yml` to the repository root. It is read from the default branch, so a pull request cannot change its own review. An invalid file falls back to the defaults and says why in the summary.

```yaml
model:
  name: z-ai/glm-5.3-flash
  verify: z-ai/glm-5.3-flash
  effort: medium

review:
  ignore: ["docs/**"]
  min_severity: minor
  max_findings: 20

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
| `model.name` | string | `z-ai/glm-5.3-flash` | Model for the find pass |
| `model.verify` | string | same as `model.name` | Model for the verify pass; a stronger one here costs little |
| `model.effort` | `none` `low` `medium` `high` | `medium` | Sent as `reasoning_effort`; `none` leaves it out |
| `review.ignore` | glob list | lockfiles, build output, images | Added to the built-in list, never replacing it |
| `review.min_severity` | `minor` `major` `critical` | `minor` | Findings below it are not posted |
| `review.max_findings` | 1 to 50 | `20` | New findings posted per run, most severe first |
| `context_files` | path list | `[AGENTS.md, CLAUDE.md]` | Read as repository guidance, up to 10,000 characters |
| `instructions` | string | none | Extra guidance for every review |
| `rules[].id` | string | required | Cited on findings that break the rule |
| `rules[].rule` | string | required | What must hold, in one or two sentences |
| `rules[].severity` | `minor` `major` `critical` | `major` | |
| `rules[].paths` | glob list | every file | The rule applies when a changed file matches |

## Action inputs

| Input | Default | Notes |
| --- | --- | --- |
| `api_key` | required | Key for the model provider |
| `base_url` | `https://api.commandcode.ai/provider/v1` | Any OpenAI-compatible API: OpenRouter, OpenCode Zen, a local server |
| `model` | from config | Overrides `model.name` |
| `verify_model` | from config | Overrides `model.verify` |
| `github_token` | `github.token` | An App installation token posts as that App's bot |
| `bot_login` | `github-actions[bot]` | The account the token posts as; only its comments are trusted as ReviewPilot's own |
