---
title: Run it as a server
summary: For busy repos. No time limit, no queued reviews, and pushes only re-read what changed.
---

The workflow is the quick start. On a busy repo it hits three limits: the job has a time cap, pushes wait behind reviews of commits that are already stale, and each run starts from a fresh checkout. The server removes all three. It is the same reviewer, run by a small Node process that your GitHub App sends webhooks to.

| | Workflow | Server |
| --- | --- | --- |
| Time per review | Job timeout (20 minutes in the example) | Up to 50 minutes |
| Pushes in a burst | One review each, queued | Folded into one review after 60 seconds of quiet |
| Push during a review | Waits for the stale review to finish | Stops the stale review and starts on the new commit |
| Checkout | Full clone per run | Warm clone kept on a volume |
| Where it runs | Your Actions minutes | One small machine that stops when idle |

Pushes only send the files whose diff changed to the find pass in both setups. The server is where that pays off, because reviews no longer queue.

## What you need

- A GitHub App you own (see [Your own bot](#own-bot)), with **Webhook: Active** this time.
- A [Fly.io](https://fly.io) account. The repo ships a `Dockerfile` and `fly.toml`; any host that runs a container with a disk works.
- Your model key, as for the workflow.

## 1. Set up the App's webhook

In the App's settings:

- **Webhook URL:** `https://<your-app>.fly.dev/webhook`
- **Webhook secret:** a long random string, for example `openssl rand -hex 32`. Keep it for step 3.
- **Subscribe to events:** Pull request, Issue comment.
- **Permissions:** Pull requests and Issues read and write, Contents read, Checks read and write.

Install the App on the repositories it should review.

## 2. Create the app and its volume

```sh
git clone https://github.com/rafay99-epic/reviewpilot && cd reviewpilot
fly apps create <your-app>
fly volumes create reviewpilot_data --size 5 --region iad -a <your-app>
```

In `fly.toml`, set `app` to your app's name and `REPOS` to your account, as `your-account/*`. Every repository of that account with the App installed is reviewed, new ones included: installing the App on a repository turns ReviewPilot on, uninstalling turns it off. Other accounts that install the App are ignored, so they cannot spend your model key. Single repositories work too (`owner/repo`), comma separated. Empty allows every installation, which is only safe for a private App.

## 3. Add the secrets and deploy

```sh
fly secrets set -a <your-app> \
  WEBHOOK_SECRET=<from step 1> \
  APP_ID=<the App ID> \
  PRIVATE_KEY="$(cat app.private-key.pem)" \
  REVIEWPILOT_API_KEY=<your model key>
fly deploy -a <your-app> --ha=false
```

`https://<your-app>.fly.dev/health` answers `ok` once it is up.

## 4. Turn off the workflow

In each repository the server reviews, delete `.github/workflows/reviewpilot.yml` or disable it with `gh workflow disable reviewpilot -R owner/repo`. If both run, they race on the same summary comment.

Open a pull request or push to one. The first review of a pull request reads every file; later pushes only re-read the files that changed.

## Who triggers a review

The same rules as the workflow:

- Pull requests from branches in the repository itself, when opened, reopened, marked ready, or pushed to. Drafts, forks and bot authors such as Dependabot are skipped.
- `/review` comments from owners, members and collaborators. `/review` always reads every file.

## Settings

| Variable | Default | What it does |
| --- | --- | --- |
| `REPOS` | empty (every installation) | Allowlist of `owner/*` and `owner/repo` entries, comma separated |
| `DEBOUNCE_MS` | `60000` | Quiet time after a push before the review starts |
| `IDLE_EXIT_MS` | `600000` | Idle time before the process exits and the machine stops |
| `DATA_DIR` | `/data` | Where clones and pending jobs live |

The model, severity and rules still come from `.reviewpilot.yml` in each repository, read from its default branch.

## Running it

- **Logs:** `fly logs -a <your-app>`. Each line starts with `[owner/repo#pr]`.
- **Deploys:** a review that has started posting finishes first. Any other review stops and runs again after the restart, from saved jobs on the volume.
- **Cost:** the machine bills by the second only while it runs, and stops after ten idle minutes. Fly starts it again when the next webhook arrives. The volume costs $0.15 per GB per month.
- **Deploy on merge:** `.github/workflows/deploy.yml` runs `flyctl deploy` when `main` changes the server, the action or the deploy config. Add a deploy token as the `FLY_API_TOKEN` secret: `fly tokens create deploy -a <your-app>`.
