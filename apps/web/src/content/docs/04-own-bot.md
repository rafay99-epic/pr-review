---
title: Your own bot
summary: A GitHub App of your own, so comments come from your-app[bot] with your logo.
---

You need your own GitHub App for two things: to post from the [Action](#action) under your own name instead of `github-actions`, and to run [your own server](#server). The same App does both.

<ol class="steps">
<li>

### Create the App

<p class="who">You · github.com → Settings → Developer settings → GitHub Apps → New GitHub App</p>

For an organization, start from the organization's settings instead. Fill in:

| Field | Value |
| --- | --- |
| GitHub App name | Anything; it becomes the bot's name, like `acme-review[bot]` |
| Homepage URL | Your repo or site |
| Webhook → Active | **Off** for the Action only. **On** for your own server (step 2 of [Your own server](#server)) |
| Where can this App be installed? | Only on this account (unless you want others to use your server) |

Upload a logo on the App's page afterwards; it becomes the avatar on every comment.

</li>
<li>

### Set the permissions

<p class="who">You · the App's Permissions & events page</p>

Under **Repository permissions**:

| Permission | Access | Why |
| --- | --- | --- |
| Checks | Read and write | The ReviewPilot check with the score and annotations |
| Contents | Read-only | Read the code and `.reviewpilot.yml`. Read and write also lets fixed findings resolve their thread, but lets the token push code |
| Issues | Read and write | The summary comment |
| Pull requests | Read and write | Inline comments and replies |
| Metadata | Read-only | Required by GitHub |

For a server, also tick **Subscribe to events → Pull request** and **Issue comment**. Leave everything else at No access.

</li>
<li>

### Generate a private key and note the App ID

<p class="who">You · the App's General page</p>

Under **Private keys**, click **Generate a private key**; a `.pem` file downloads. The **App ID** is at the top of the page. Keep both: the Action and the server sign in with them.

</li>
<li>

### Install the App on your repositories

<p class="who">You · the App's Install App page</p>

Pick the account and choose all repositories or a few. Installing is what lets the App comment on a repository.

<figure><img src="/docs/install-repos.webp" alt="GitHub's install screen: choose all repositories or only select ones, and the permissions the App asks for." width="980" height="710" loading="lazy" /></figure>

</li>
<li>

### Use it from the Action

<p class="who">You · repo secrets and the workflow</p>

Skip this step if you are setting up a server; the server uses the App directly.

```sh
gh secret set REVIEWPILOT_APP_ID -R owner/repo --body 123456
gh secret set REVIEWPILOT_PRIVATE_KEY -R owner/repo < app.private-key.pem
```

Then mint the App's token before the review step:

```yaml
    steps:
      - id: app
        uses: actions/create-github-app-token@v2
        continue-on-error: true
        with:
          app-id: ${{ secrets.REVIEWPILOT_APP_ID }}
          private-key: ${{ secrets.REVIEWPILOT_PRIVATE_KEY }}
      - if: steps.app.outcome == 'failure'
        run: echo "::warning::Could not mint the ReviewPilot App token; posting as github-actions[bot]. Check the App ID, the private key and that the App is installed."
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - uses: rafay99-epic/reviewpilot@main
        with:
          api_key: ${{ secrets.REVIEWPILOT_API_KEY }}
          github_token: ${{ steps.app.outputs.token || github.token }}
          bot_login: ${{ steps.app.outputs.app-slug && format('{0}[bot]', steps.app.outputs.app-slug) || 'github-actions[bot]' }}
```

If the key is revoked or the App is uninstalled, the run falls back to `github.token` instead of failing, and the run shows a warning so the fallback is not silent. A summary written earlier by `github-actions[bot]` is taken over on the next run.

</li>
</ol>
