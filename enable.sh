#!/usr/bin/env bash
# Turns on PR-Agent for each repo: sets the CMD_API_KEY secret, pushes caller.yml
# to a new branch through the API (no local checkout touched), and opens a PR.
# The PR reviews itself, so it doubles as the smoke test.
#
# Usage: CMD_API_KEY_FILE=/path/to/key ./enable.sh owner/repo [owner/repo...]
# Uses the gh account matching each repo's owner (rafay99-epic, SyntaxLabTechnology).
set -euo pipefail
cd "$(dirname "$0")"

key_file=${CMD_API_KEY_FILE:?set CMD_API_KEY_FILE to a file holding the Command Code key}
branch=ci/pr-agent-review
content=$(base64 < caller.yml | tr -d '\n')
body='Adds PR-Agent review on PRs opened by the repo owner.

The workflow calls the shared one in rafay99-epic/pr-review, which runs GLM-5.3 Flash through the Command Code provider API. Review and code suggestions run on open, review re-runs on each push. Comment `/review`, `/improve` or `/ask <question>` to run on demand.

This PR should get the first review.

Changes made by Claude Opus 5.5 in T3 Code.'

for repo in "$@"; do
  GH_TOKEN=$(gh auth token --user "${repo%%/*}")
  export GH_TOKEN
  base=$(gh api "repos/$repo" --jq .default_branch)
  sha=$(gh api "repos/$repo/git/ref/heads/$base" --jq .object.sha)

  gh secret set CMD_API_KEY -R "$repo" < "$key_file"
  gh api -X POST "repos/$repo/git/refs" -f ref="refs/heads/$branch" -f sha="$sha" > /dev/null
  gh api -X PUT "repos/$repo/contents/.github/workflows/pr-agent.yml" \
    -f message="ci: add PR-Agent review" -f content="$content" -f branch="$branch" > /dev/null
  gh pr create -R "$repo" --base "$base" --head "$branch" --title "ci: add PR-Agent review" --body "$body"
done
