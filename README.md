# pr-review

PR-Agent reviews on my PRs, running GLM-5.3 Flash at high effort (DeepSeek V4.1 Flash Fast fallback) through Command Code's provider API.

All settings are in `.github/workflows/pr-agent.yml`. Each repo only carries `caller.yml`.

## Turn it on for a repo

```sh
gh secret set CMD_API_KEY -R rafay99-epic/<repo>        # key from commandcode.ai/settings/keys
cp caller.yml ~/code/<repo>/.github/workflows/pr-agent.yml
```

Only `/review` runs automatically: a thorough pass for bugs, missed cases, security holes and inconsistencies, up to 20 findings, each an inline comment on its line plus one summary comment. It re-runs on each push without re-posting old findings. Comment `/improve` for one-click committable fixes.

## Commands (comment on the PR)

- `/review` re-run the review
- `/improve` code suggestions
- `/ask <question>` ask about the diff
- `/describe` write a PR description (off by default)

Only PRs opened by the repo owner, and owner comments starting with `/`, trigger a run.

## Cost and time

Billed against Command Code plan credits. GLM-5.3 Flash at high effort takes a few minutes per review; the step is killed at 10 min and DeepSeek takes over.
