---
title: Your own server
summary: Your App, your Fly.io machine. No time limit, no queue, and pushes reread only what changed.
---

The server is the same reviewer as the Action, run by a small Node process that your GitHub App sends webhooks to. It is what the [hosted bot](#hosted) runs. Use your own when you want your bot's name, your own machine, or your code to stay on infrastructure you control.

<figure class="diagram"><img src="/docs/server.svg" alt="GitHub sends a webhook to the server on Fly.io. The server waits 60 seconds for more pushes, updates a saved clone, and runs the reviewer, which calls the model API and posts back to the pull request." width="780" height="210" /></figure>

**You need:** a GitHub App ([Your own bot](#own-bot), steps 1 to 4), a [Fly.io](https://fly.io) account with `flyctl` installed, and your model key. The repo ships a `Dockerfile` and `fly.toml`; any host that runs a container with a disk works.

<ol class="steps">
<li>

### Create the Fly app and its volume

<p class="who">You · terminal · 1 minute</p>

```sh
git clone https://github.com/rafay99-epic/reviewpilot && cd reviewpilot
fly apps create <your-app>
fly volumes create reviewpilot_data --size 5 --region iad -a <your-app>
```

The volume keeps clones and pending jobs, so a restart picks up where it left off. 5 GB costs $0.75 a month.

</li>
<li>

### Point the App's webhook at it

<p class="who">You · the App's General page</p>

- **Active:** on.
- **Webhook URL:** `https://<your-app>.fly.dev/webhook`
- **Webhook secret:** a long random string, for example from `openssl rand -hex 32`. Keep it for step 4.

<figure><img src="/docs/app-webhook.webp" alt="The GitHub App's Webhook section: Active ticked, the webhook URL ending in fly.dev/webhook, a secret configured, SSL verification enabled." width="1486" height="1130" loading="lazy" /></figure>

On **Permissions & events**, subscribe to **Pull request** and **Issue comment**.

</li>
<li>

### Edit `fly.toml`

<p class="who">You · editor</p>

Set `app` to your app's name and `REPOS` to the repositories that may use **your** model key, usually your whole account:

```toml
app = "<your-app>"

[env]
  REPOS = "your-account/*"
```

Every repository of that account with the App installed is reviewed, new ones included: installing the App on a repo turns ReviewPilot on, uninstalling turns it off. Single repositories work too (`owner/repo`), comma separated. Any other repository that installs your App gets an **Add your model key** check instead of a review, so nobody can spend your key.

</li>
<li>

### Add the secrets and deploy

<p class="who">You · terminal · 2 minutes</p>

```sh
fly secrets set -a <your-app> \
  WEBHOOK_SECRET=<from step 2> \
  APP_ID=<the App ID> \
  PRIVATE_KEY="$(cat app.private-key.pem)" \
  REVIEWPILOT_API_KEY=<your model key>
fly deploy -a <your-app> --ha=false
```

`https://<your-app>.fly.dev/health` answers `ok` once it is up. In the App's **Advanced** tab, recent deliveries should show `202`.

</li>
<li>

### Turn off the workflow

<p class="who">You · each repository the server reviews</p>

Delete `.github/workflows/reviewpilot.yml`, or disable it:

```sh
gh workflow disable reviewpilot -R owner/repo
```

If both run, they race on the same summary comment.

</li>
<li>

### Open a pull request

<p class="who">ReviewPilot · automatic</p>

The first review of a PR reads every file. Later pushes reread only the files whose diff changed. Logs: `fly logs -a <your-app>`, each line prefixed with `[owner/repo#pr]`.

</li>
<li>

### Optional: deploy on every merge

<p class="who">You · repository secrets</p>

`.github/workflows/deploy.yml` runs `flyctl deploy` when `main` changes the server, the reviewer or the deploy config. Give it a deploy token:

```sh
fly tokens create deploy -a <your-app> | gh secret set FLY_API_TOKEN -R owner/reviewpilot
```

</li>
</ol>

## Let others use your server

This is how the hosted bot works, and you can do the same with yours: make the App public (its **Advanced** tab, **Make public**), and let each repository bring its own sealed key.

```sh
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out seal.pem
fly secrets set -a <your-app> SEAL_KEY="$(cat seal.pem)"
```

The server then publishes the public half at `https://<your-app>.fly.dev/seal-key`. Repositories seal their key with it, exactly as in [Hosted bot, step 3](#hosted), using your URL in the `curl` line. Without `REVIEWPILOT_API_KEY` the server never spends a key of its own.

## Settings

| Variable | Default | What it does |
| --- | --- | --- |
| `REPOS` | empty | Repositories that may use `REVIEWPILOT_API_KEY`: `owner/*` and `owner/repo` entries, comma separated. Empty means every installed repository |
| `REVIEWPILOT_API_KEY` | none | The server's own model key. Without it, every repository needs a sealed key |
| `SEAL_KEY` | none | Private key that opens sealed keys. Without it, sealed keys are refused |
| `KEY_DOCS_URL` | the hosted bot guide | Where the **Add your model key** check links to |
| `DEBOUNCE_MS` | `60000` | Quiet time after a push before the review starts |
| `IDLE_EXIT_MS` | `600000` | Idle time before the process exits and the machine stops |
| `DATA_DIR` | `/data` | Where clones and pending jobs live |

Severity, rules and the model still come from `.reviewpilot.yml` in each repository, read from its default branch.

## Running it

- **Cost:** the machine bills by the second only while it runs and stops after ten idle minutes. Fly starts it again when the next webhook arrives, within a few seconds.
- **Deploys:** a review that has started posting finishes first. Any other review stops and runs again after the restart, from jobs saved on the volume.
- **Capacity:** up to three reviews at once, one per repository at a time. A bigger machine in `fly.toml` does not change that; it is a constant in `packages/server/src/main.ts`.
- **Disk:** clones unused for 14 days are deleted when the server starts.
