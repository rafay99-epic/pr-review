# pr-review

PR-Agent reviews on my PRs, running GLM-5.3 Flash through Command Code's provider API.

All settings are in `.github/workflows/pr-agent.yml`. Each repo only carries `caller.yml`.

## Turn it on for a repo

```sh
gh secret set CMD_API_KEY -R rafay99-epic/<repo>        # key from commandcode.ai/settings/keys
cp caller.yml ~/code/<repo>/.github/workflows/pr-agent.yml
```

Findings land as inline comments on the changed lines, fixes as one-click committable suggestions, plus one summary comment. All re-run on each push without re-posting old findings.

## Commands (comment on the PR)

- `/review` re-run the review
- `/improve` code suggestions
- `/ask <question>` ask about the diff
- `/describe` write a PR description (off by default)

Only PRs opened by the repo owner, and owner comments starting with `/`, trigger a run.

## Cost

GLM-5.3 Flash is $0.15 in / $0.50 out per 1M tokens. A typical PR (20k tokens in, 2k out, review + improve) costs about $0.01.
