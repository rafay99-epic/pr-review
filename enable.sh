#!/usr/bin/env bash
# Turns on ReviewPilot for each repo: sets the secrets, pushes caller.yml as
# .github/workflows/reviewpilot.yml on a new branch through the API (no local checkout
# touched), removes the old PR-Agent caller if present, and opens a PR.
#
# Usage: CMD_API_KEY_FILE=key REVIEWPILOT_APP_ID=123 REVIEWPILOT_PRIVATE_KEY_FILE=app.pem \
#          ./enable.sh owner/repo [owner/repo...]
# The App variables are optional; without them reviews post as github-actions[bot].
# Uses the gh account matching each repo's owner (rafay99-epic, SyntaxLabTechnology).
set -euo pipefail
cd "$(dirname "$0")"

key_file=${CMD_API_KEY_FILE:?set CMD_API_KEY_FILE to a file holding the model provider key}
branch=ci/reviewpilot
content=$(base64 < caller.yml | tr -d '\n')
body='Adds ReviewPilot review on PRs opened by the repo owner.

The workflow calls the shared one in rafay99-epic/reviewpilot. An agent reads the diff and the code around it, a second pass re-checks every finding against the code, and only confirmed findings are posted, as `reviewpilot[bot]`. The summary comment carries a 1-5 score and what changed since the last push. Once this is merged, comment `/review` to re-run it (comment commands only run from the default branch).

Built with Claude Opus 5.5 in Claude Code, running in T3 Code.'

for repo in "$@"; do
  GH_TOKEN=$(gh auth token --user "${repo%%/*}")
  export GH_TOKEN
  base=$(gh api "repos/$repo" --jq .default_branch)
  sha=$(gh api "repos/$repo/git/ref/heads/$base" --jq .object.sha)

  gh secret set CMD_API_KEY -R "$repo" < "$key_file"
  if [[ -n "${REVIEWPILOT_APP_ID:-}" ]]; then
    gh secret set REVIEWPILOT_APP_ID -R "$repo" --body "$REVIEWPILOT_APP_ID"
    gh secret set REVIEWPILOT_PRIVATE_KEY -R "$repo" < "${REVIEWPILOT_PRIVATE_KEY_FILE:?set REVIEWPILOT_PRIVATE_KEY_FILE}"
  fi

  gh api -X POST "repos/$repo/git/refs" -f ref="refs/heads/$branch" -f sha="$sha" > /dev/null
  gh api -X PUT "repos/$repo/contents/.github/workflows/reviewpilot.yml" \
    -f message="ci: review PRs with ReviewPilot" -f content="$content" -f branch="$branch" > /dev/null
  if old=$(gh api "repos/$repo/contents/.github/workflows/pr-agent.yml?ref=$branch" --jq .sha 2>/dev/null); then
    gh api -X DELETE "repos/$repo/contents/.github/workflows/pr-agent.yml" \
      -f message="ci: drop the PR-Agent caller" -f sha="$old" -f branch="$branch" > /dev/null
  fi
  gh pr create -R "$repo" --base "$base" --head "$branch" --title "ci: review PRs with ReviewPilot" --body "$body"
done
