---
title: Your own bot
summary: Post as your-app[bot] with your logo instead of github-actions.
---

## 1. Create a GitHub App

In **Settings → Developer settings → GitHub Apps → New GitHub App**:

- **Webhook:** turn off **Active**. Nothing calls the App; the workflow borrows its identity. Turn it on only to [run the server](#server).
- **Repository permissions:** Pull requests and Issues read and write, Contents read, Checks read. Contents write is optional: with it, fixed findings also resolve their thread, but it lets the token push code too.
- Upload a logo. It becomes the avatar on every comment.

Generate a private key, note the App ID, and install the App on your repositories.

## 2. Add two secrets

```sh
gh secret set REVIEWPILOT_APP_ID -R owner/repo --body 123456
gh secret set REVIEWPILOT_PRIVATE_KEY -R owner/repo < app.private-key.pem
```

## 3. Mint the token in the workflow

```yaml
    steps:
      - id: app
        uses: actions/create-github-app-token@v2
        continue-on-error: true
        with:
          app-id: ${{ secrets.REVIEWPILOT_APP_ID }}
          private-key: ${{ secrets.REVIEWPILOT_PRIVATE_KEY }}
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - uses: rafay99-epic/reviewpilot@main
        with:
          api_key: ${{ secrets.REVIEWPILOT_API_KEY }}
          github_token: ${{ steps.app.outputs.token || github.token }}
          bot_login: ${{ steps.app.outputs.app-slug && format('{0}[bot]', steps.app.outputs.app-slug) || 'github-actions[bot]' }}
```

If the key is revoked or the App is uninstalled, the run falls back to `github.token` instead of failing. A summary written by `github-actions[bot]` earlier is taken over and retired on the next run.
