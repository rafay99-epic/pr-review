# pr-review

PR-Agent reviews on my PRs, running DeepSeek V4.1 Flash Fast (GLM-5.3 Flash fallback) through Command Code's provider API.

All settings are in `.github/workflows/pr-agent.yml`. Each repo only carries `caller.yml`.

## Turn it on for a repo

```sh
gh secret set CMD_API_KEY -R rafay99-epic/<repo>        # key from commandcode.ai/settings/keys
cp caller.yml ~/code/<repo>/.github/workflows/pr-agent.yml
```

Only `/review` runs automatically: findings land as inline comments on the changed lines, plus one summary comment, re-run on each push without re-posting old findings. Comment `/improve` for one-click committable fixes.

## Commands (comment on the PR)

- `/review` re-run the review
- `/improve` code suggestions
- `/ask <question>` ask about the diff
- `/describe` write a PR description (off by default)

Only PRs opened by the repo owner, and owner comments starting with `/`, trigger a run.

## Cost

DeepSeek V4.1 Flash Fast is $0.16 in / $0.58 out per 1M tokens off-peak ($0.32 / $1.16 peak). A typical review costs about $0.01-0.02 and takes about 1-2 minutes.
