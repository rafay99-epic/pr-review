---
title: Hosted bot
summary: Install reviewpilot-bot, seal your model key, open a pull request. Nothing to run.
---

The hosted bot is ReviewPilot running on a server you do not have to manage. You install the GitHub App, give it your own model key in a sealed form, and every pull request gets reviewed. It is free; your model provider bills you for the tokens.

<figure class="diagram"><img src="/docs/sealed.svg" alt="Your key is sealed in the browser, stored as sealed_key in .reviewpilot.yml on your default branch, opened only by the hosted server for your account, and sent only to the provider you chose." width="780" height="170" /></figure>

<ol class="steps">
<li>

### Install the App

<p class="who">You · github.com · 30 seconds</p>

Open [github.com/apps/reviewpilot-bot](https://github.com/apps/reviewpilot-bot), click **Install**, and pick the account or organization. Choose all repositories or only some; you can change this any time under **Settings → Applications → ReviewPilot Bot → Configure**.

<figure><img src="/docs/install-repos.webp" alt="GitHub's install screen: choose all repositories or only select ones, and the permissions: read code and metadata, read and write checks, issues and pull requests." width="980" height="710" loading="lazy" /><figcaption>The permissions it asks for: read your code, write comments, issues and the check. It cannot push code.</figcaption></figure>

</li>
<li>

### Get a model API key

<p class="who">You · your model provider</p>

Any OpenAI-compatible API works. The default is [Command Code](https://commandcode.ai) with GLM-5.3 Flash. OpenRouter, OpenCode Zen, OpenAI and others work too; note the provider's base URL and a model name it offers.

</li>
<li>

### Seal the key

<p class="who">You · this page · 10 seconds</p>

Sealing encrypts the key so only the hosted server can read it, only for repositories of the account you name (matched by its GitHub account id, so a rename keeps working and nobody who later takes the old name can use it), and only to send it to the provider URL you name. It happens in your browser; the key is not sent anywhere.

<div id="seal-tool"></div>

Prefer the terminal? This gives the same result:

```sh
OWNER=your-account
OWNER_ID=$(curl -s https://api.github.com/users/$OWNER | jq .id)
curl -s https://reviewpilotbot.rafay99.com/seal-key.pem -o seal-key.pem
printf '{"v":1,"owner":"%s","owner_id":%s,"key":"%s","base_url":"%s"}' \
  "$OWNER" "$OWNER_ID" "$MODEL_KEY" https://api.commandcode.ai/provider/v1 \
  | openssl pkeyutl -encrypt -pubin -inkey seal-key.pem \
      -pkeyopt rsa_padding_mode:oaep -pkeyopt rsa_oaep_md:sha256 -pkeyopt rsa_mgf1_md:sha256 \
  | base64 | tr -d '\n'
```

</li>
<li>

### Add it to `.reviewpilot.yml` on your default branch

<p class="who">You · your repository</p>

Create `.reviewpilot.yml` at the repository root with the sealed key. If your provider is not Command Code, also name a model it offers:

```yaml
sealed_key: |
  dGhpcyBpcyBub3QgYSByZWFsIGtleSwganVzdCB0aGUgc2hhcGUgb2Ygb25l...
model:
  name: z-ai/glm-5.3-flash   # a model your provider offers
```

Commit it straight to the default branch (usually `main`). ReviewPilot reads its config only from there, so a pull request cannot swap the key. If the config arrives through a pull request instead, that first PR has no key yet: merge it, then comment `/review` on any open PR.

The sealed key is safe in a public repository. Every other setting is optional; see [Configuration](#configuration).

</li>
<li>

### Open a pull request

<p class="who">ReviewPilot · automatic</p>

ReviewPilot starts about a minute after a PR is opened, reopened, marked ready or pushed to; a burst of pushes becomes one review. The **ReviewPilot** check shows progress and elapsed time, then the score. Comment `/review` to review the whole PR again right away.

</li>
</ol>

## If something is missing

When a repository has the App but no usable key, the PR gets a **ReviewPilot** check marked *Action required*, titled **Add your model key**, with the reason:

| Reason in the check | What to do |
| --- | --- |
| this repository has no model key yet | Add `sealed_key` to `.reviewpilot.yml` on the default branch |
| the sealed key belongs to *another-account* | You sealed it for a different account, or the repository moved to another owner. Seal it again for the account that owns it now |
| the sealed key could not be opened | It was sealed for a different server, or got cut while pasting. Seal it again and paste the whole block |
| the sealed key is not in the expected format | It was sealed by hand with a mistake in the JSON. Use the form above, or copy the `printf` line exactly |
| this server does not accept sealed keys | The server you installed is not set up for sealed keys (a self-hosted one without `SEAL_KEY`). Ask its owner |
| the sealed key's base_url must be an https URL | Seal it again with an `https://` provider URL |

## What the hosted server sees

- **Your code.** It is cloned onto the hosted server so agents can read it, and sent to your model provider in pieces. Clones not used for 14 days are deleted. Nothing is shared with anyone else.
- **Your key.** Opened in memory for each review and handed only to the reviewer process. It is never logged and never written to disk unsealed.
- **Not your other secrets.** The App cannot read repository secrets, Actions logs or anything outside the repositories you installed it on.

The hosted server is run by the ReviewPilot author. If your code must not leave infrastructure you control, use the [GitHub Action](#action) or [your own server](#server): same reviewer, same results.

## Stop or change it

- **Stop on one repo:** remove it under **Configure** for the App, or delete `sealed_key`.
- **Stop everywhere:** uninstall the App.
- **Change or revoke the key:** revoke it at your provider, seal the new one, replace `sealed_key`.
- **Limits:** the hosted server runs up to three reviews at once, one per repository at a time. At busy moments a review waits its turn.
