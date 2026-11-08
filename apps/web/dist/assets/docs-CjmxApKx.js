import{a as e,d as t,l as n,r,s as i,t as a,u as o}from"./styles-B95kt0k4.js";var s={slug:`getting-started`,title:`Getting started`,summary:`One workflow file and one secret. Two minutes.`,html:`<h2 id="1-add-your-model-key">1. Add your model key</h2><p>ReviewPilot calls an OpenAI-compatible chat API with your own key. The default is <a href="https://commandcode.ai">Command Code</a> running GLM-5.3 Flash.</p>
<pre class="shiki github-dark-default" style="background-color:#0d1117;color:#e6edf3" tabindex="0"><code><span class="line"><span style="color:#FFA657">gh</span><span style="color:#A5D6FF"> secret</span><span style="color:#A5D6FF"> set</span><span style="color:#A5D6FF"> REVIEWPILOT_API_KEY</span><span style="color:#79C0FF"> -R</span><span style="color:#A5D6FF"> owner/repo</span></span></code></pre><h2 id="2-add-the-workflow">2. Add the workflow</h2><p>Create <code>.github/workflows/reviewpilot.yml</code>:</p>
<pre class="shiki github-dark-default" style="background-color:#0d1117;color:#e6edf3" tabindex="0"><code><span class="line"><span style="color:#7EE787">name</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">reviewpilot</span></span>
<span class="line"><span style="color:#79C0FF">on</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#7EE787">  pull_request</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#7EE787">    types</span><span style="color:#E6EDF3">: [</span><span style="color:#A5D6FF">opened</span><span style="color:#E6EDF3">, </span><span style="color:#A5D6FF">reopened</span><span style="color:#E6EDF3">, </span><span style="color:#A5D6FF">ready_for_review</span><span style="color:#E6EDF3">, </span><span style="color:#A5D6FF">synchronize</span><span style="color:#E6EDF3">]</span></span>
<span class="line"><span style="color:#7EE787">  issue_comment</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#7EE787">    types</span><span style="color:#E6EDF3">: [</span><span style="color:#A5D6FF">created</span><span style="color:#E6EDF3">]</span></span>
<span class="line"><span style="color:#7EE787">permissions</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#7EE787">  contents</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">read</span></span>
<span class="line"><span style="color:#7EE787">  issues</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">write</span></span>
<span class="line"><span style="color:#7EE787">  pull-requests</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">write</span></span>
<span class="line"><span style="color:#7EE787">jobs</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#7EE787">  review</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#8B949E">    # Comment-triggered runs get your secrets even on public repos, so only maintainers'</span></span>
<span class="line"><span style="color:#8B949E">    # /review comments run. Fork PRs never receive secrets, so they are skipped too.</span></span>
<span class="line"><span style="color:#7EE787">    if</span><span style="color:#E6EDF3">: </span><span style="color:#FF7B72">>-</span></span>
<span class="line"><span style="color:#A5D6FF">      (github.event_name == 'pull_request' &#x26;&#x26; !github.event.pull_request.head.repo.fork)</span></span>
<span class="line"><span style="color:#A5D6FF">      || (github.event.issue.pull_request &#x26;&#x26; startsWith(github.event.comment.body, '/review')</span></span>
<span class="line"><span style="color:#A5D6FF">        &#x26;&#x26; contains(fromJSON('["OWNER", "MEMBER", "COLLABORATOR"]'), github.event.comment.author_association))</span></span>
<span class="line"><span style="color:#7EE787">    runs-on</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">ubuntu-latest</span></span>
<span class="line"><span style="color:#7EE787">    timeout-minutes</span><span style="color:#E6EDF3">: </span><span style="color:#79C0FF">20</span></span>
<span class="line"><span style="color:#7EE787">    steps</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#E6EDF3">      - </span><span style="color:#7EE787">uses</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">actions/checkout@v5</span></span>
<span class="line"><span style="color:#7EE787">        with</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#7EE787">          fetch-depth</span><span style="color:#E6EDF3">: </span><span style="color:#79C0FF">0</span></span>
<span class="line"><span style="color:#E6EDF3">      - </span><span style="color:#7EE787">uses</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">rafay99-epic/reviewpilot@main</span></span>
<span class="line"><span style="color:#7EE787">        with</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#7EE787">          api_key</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">\${{ secrets.REVIEWPILOT_API_KEY }}</span></span></code></pre><h2 id="3-open-a-pull-request">3. Open a pull request</h2><p>ReviewPilot reviews it on open and on every push. Comment <code>/review</code> to run it again.</p>
<p>GitHub runs comment-triggered workflows only from the default branch, so <code>/review</code> starts working once this workflow is merged.</p>
`},c={slug:`how-it-works`,title:`How a review works`,summary:`Find, verify, post. Nothing reaches the PR without proof.`,html:`<h2 id="find">Find</h2><p>The diff is split into parts of about 25,000 characters. Each part goes to its own agent, and up to three run at once. Every agent has three read-only tools:</p>
<table>
<thead>
<tr>
<th>Tool</th>
<th>What it does</th>
</tr>
</thead>
<tbody><tr>
<td><code>read_file</code></td>
<td>Reads up to 250 lines of any file at the PR head</td>
</tr>
<tr>
<td><code>search</code></td>
<td>Runs <code>git grep -E</code> over the repository</td>
</tr>
<tr>
<td><code>list_dir</code></td>
<td>Lists a directory</td>
</tr>
</tbody></table>
<p>The agent opens callers, types and guards as it needs them, then submits every specific suspicion. It must list each changed file it checked; a submission that skips one is sent back.</p>
<h2 id="verify">Verify</h2><p>Each candidate goes to a fresh agent that assumes it is wrong. It confirms only when all four hold:</p>
<ol>
<li>The cited lines exist and say what the finding claims.</li>
<li>The trigger traces from input to wrong result through code it opened.</li>
<li>Nothing already prevents it: no guard, early return, validation or type constraint.</li>
<li>The pull request introduced it.</li>
</ol>
<p>Claims about tool versions or platform behaviour count only when the repository itself shows them. Up to four verifications run at once.</p>
<h2 id="post">Post</h2><p>Confirmed findings become inline comments on the changed lines. One summary comment holds the score, the findings table and what changed since the last push.</p>
<h2 id="safety">Safety</h2><ul>
<li>The tools never run code from the pull request and cannot leave the checkout, symlinks included.</li>
<li>Model output is untrusted: it cannot plant ReviewPilot&#39;s hidden markers, and every cited file must exist.</li>
<li>Only owners, members and collaborators can run <code>/review</code>.</li>
</ul>
`},l={slug:`configuration`,title:`Configuration`,summary:`Every key is optional. No file means sensible defaults.`,html:`<p>Add <code>.reviewpilot.yml</code> to the repository root. It is read from the default branch, so a pull request cannot change its own review. An invalid file falls back to the defaults and says why in the summary.</p>
<pre class="shiki github-dark-default" style="background-color:#0d1117;color:#e6edf3" tabindex="0"><code><span class="line"><span style="color:#7EE787">model</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#7EE787">  name</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">z-ai/glm-5.3-flash</span></span>
<span class="line"><span style="color:#7EE787">  verify</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">z-ai/glm-5.3-flash</span></span>
<span class="line"><span style="color:#7EE787">  effort</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">medium</span></span>
<span class="line"></span>
<span class="line"><span style="color:#7EE787">review</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#7EE787">  ignore</span><span style="color:#E6EDF3">: [</span><span style="color:#A5D6FF">"docs/**"</span><span style="color:#E6EDF3">]</span></span>
<span class="line"><span style="color:#7EE787">  min_severity</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">minor</span></span>
<span class="line"><span style="color:#7EE787">  max_findings</span><span style="color:#E6EDF3">: </span><span style="color:#79C0FF">20</span></span>
<span class="line"></span>
<span class="line"><span style="color:#7EE787">context_files</span><span style="color:#E6EDF3">: [</span><span style="color:#A5D6FF">AGENTS.md</span><span style="color:#E6EDF3">, </span><span style="color:#A5D6FF">CLAUDE.md</span><span style="color:#E6EDF3">]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#7EE787">instructions</span><span style="color:#E6EDF3">: </span><span style="color:#FF7B72">|</span></span>
<span class="line"><span style="color:#A5D6FF">  Guest queries are public by design and size-capped instead of rate-limited.</span></span>
<span class="line"></span>
<span class="line"><span style="color:#7EE787">rules</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#E6EDF3">  - </span><span style="color:#7EE787">id</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">types-end-to-end</span></span>
<span class="line"><span style="color:#7EE787">    severity</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">major</span></span>
<span class="line"><span style="color:#7EE787">    paths</span><span style="color:#E6EDF3">: [</span><span style="color:#A5D6FF">"apps/**"</span><span style="color:#E6EDF3">, </span><span style="color:#A5D6FF">"packages/**"</span><span style="color:#E6EDF3">]</span></span>
<span class="line"><span style="color:#7EE787">    rule</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">No \`any\` or unchecked casts. Server types flow to the client without being redeclared.</span></span></code></pre><h2 id="keys">Keys</h2><table>
<thead>
<tr>
<th>Key</th>
<th>Type</th>
<th>Default</th>
<th>Notes</th>
</tr>
</thead>
<tbody><tr>
<td><code>model.name</code></td>
<td>string</td>
<td><code>z-ai/glm-5.3-flash</code></td>
<td>Model for the find pass</td>
</tr>
<tr>
<td><code>model.verify</code></td>
<td>string</td>
<td>same as <code>model.name</code></td>
<td>Model for the verify pass; a stronger one here costs little</td>
</tr>
<tr>
<td><code>model.effort</code></td>
<td><code>none</code> <code>low</code> <code>medium</code> <code>high</code></td>
<td><code>medium</code></td>
<td>Sent as <code>reasoning_effort</code>; <code>none</code> leaves it out</td>
</tr>
<tr>
<td><code>review.ignore</code></td>
<td>glob list</td>
<td>lockfiles, build output, images</td>
<td>Added to the built-in list, never replacing it</td>
</tr>
<tr>
<td><code>review.min_severity</code></td>
<td><code>minor</code> <code>major</code> <code>critical</code></td>
<td><code>minor</code></td>
<td>Findings below it are not posted</td>
</tr>
<tr>
<td><code>review.max_findings</code></td>
<td>1 to 50</td>
<td><code>20</code></td>
<td>New findings posted per run, most severe first</td>
</tr>
<tr>
<td><code>context_files</code></td>
<td>path list</td>
<td><code>[AGENTS.md, CLAUDE.md]</code></td>
<td>Read as repository guidance, up to 10,000 characters</td>
</tr>
<tr>
<td><code>instructions</code></td>
<td>string</td>
<td>none</td>
<td>Extra guidance for every review</td>
</tr>
<tr>
<td><code>rules[].id</code></td>
<td>string</td>
<td>required</td>
<td>Cited on findings that break the rule</td>
</tr>
<tr>
<td><code>rules[].rule</code></td>
<td>string</td>
<td>required</td>
<td>What must hold, in one or two sentences</td>
</tr>
<tr>
<td><code>rules[].severity</code></td>
<td><code>minor</code> <code>major</code> <code>critical</code></td>
<td><code>major</code></td>
<td></td>
</tr>
<tr>
<td><code>rules[].paths</code></td>
<td>glob list</td>
<td>every file</td>
<td>The rule applies when a changed file matches</td>
</tr>
</tbody></table>
<h2 id="action-inputs">Action inputs</h2><table>
<thead>
<tr>
<th>Input</th>
<th>Default</th>
<th>Notes</th>
</tr>
</thead>
<tbody><tr>
<td><code>api_key</code></td>
<td>required</td>
<td>Key for the model provider</td>
</tr>
<tr>
<td><code>base_url</code></td>
<td><code>https://api.commandcode.ai/provider/v1</code></td>
<td>Any OpenAI-compatible API: OpenRouter, OpenCode Zen, a local server</td>
</tr>
<tr>
<td><code>model</code></td>
<td>from config</td>
<td>Overrides <code>model.name</code></td>
</tr>
<tr>
<td><code>verify_model</code></td>
<td>from config</td>
<td>Overrides <code>model.verify</code></td>
</tr>
<tr>
<td><code>github_token</code></td>
<td><code>github.token</code></td>
<td>An App installation token posts as that App&#39;s bot</td>
</tr>
<tr>
<td><code>bot_login</code></td>
<td><code>github-actions[bot]</code></td>
<td>The account the token posts as; only its comments are trusted as ReviewPilot&#39;s own</td>
</tr>
</tbody></table>
`},u={slug:`score`,title:`The score`,summary:`Computed from verified findings, never asked of the model.`,html:`<table>
<thead>
<tr>
<th>Score</th>
<th>Meaning</th>
</tr>
</thead>
<tbody><tr>
<td>5/5</td>
<td>No verified issues</td>
</tr>
<tr>
<td>4/5</td>
<td>Minor issues only</td>
</tr>
<tr>
<td>3/5</td>
<td>At least one major issue</td>
</tr>
<tr>
<td>2/5</td>
<td>A critical issue: security, privacy, data loss, a broken build</td>
</tr>
<tr>
<td>1/5</td>
<td>Several critical issues</td>
</tr>
</tbody></table>
<p>Because it is derived from findings, the score only moves when findings change.</p>
<h2 id="across-pushes">Across pushes</h2><p>On every push, open findings are checked again against the new code:</p>
<ul>
<li><strong>Fixed.</strong> ReviewPilot replies &quot;Fixed in&quot; with the commit, resolves the thread and collapses the comment as outdated.</li>
<li><strong>Still open.</strong> It stays in the table with its original wording.</li>
<li><strong>New.</strong> Posted inline, counted in the delta line.</li>
</ul>
<p>A finding is dismissed, and never raised again, when someone other than ReviewPilot resolves its thread, or when the PR author or a maintainer replies to it.</p>
<p>State lives in a hidden marker inside the summary comment. There is no database, and the PR carries its own history.</p>
`},d={slug:`own-bot`,title:`Your own bot`,summary:`Post as your-app[bot] with your logo instead of github-actions.`,html:`<h2 id="1-create-a-github-app">1. Create a GitHub App</h2><p>In <strong>Settings → Developer settings → GitHub Apps → New GitHub App</strong>:</p>
<ul>
<li><strong>Webhook:</strong> turn off <strong>Active</strong>. Nothing calls the App; the workflow borrows its identity.</li>
<li><strong>Repository permissions:</strong> Pull requests and Issues read and write, Contents read, Checks read.</li>
<li>Upload a logo. It becomes the avatar on every comment.</li>
</ul>
<p>Generate a private key, note the App ID, and install the App on your repositories.</p>
<h2 id="2-add-two-secrets">2. Add two secrets</h2><pre class="shiki github-dark-default" style="background-color:#0d1117;color:#e6edf3" tabindex="0"><code><span class="line"><span style="color:#FFA657">gh</span><span style="color:#A5D6FF"> secret</span><span style="color:#A5D6FF"> set</span><span style="color:#A5D6FF"> REVIEWPILOT_APP_ID</span><span style="color:#79C0FF"> -R</span><span style="color:#A5D6FF"> owner/repo</span><span style="color:#79C0FF"> --body</span><span style="color:#79C0FF"> 123456</span></span>
<span class="line"><span style="color:#FFA657">gh</span><span style="color:#A5D6FF"> secret</span><span style="color:#A5D6FF"> set</span><span style="color:#A5D6FF"> REVIEWPILOT_PRIVATE_KEY</span><span style="color:#79C0FF"> -R</span><span style="color:#A5D6FF"> owner/repo</span><span style="color:#FF7B72"> &#x3C;</span><span style="color:#A5D6FF"> app.private-key.pem</span></span></code></pre><h2 id="3-mint-the-token-in-the-workflow">3. Mint the token in the workflow</h2><pre class="shiki github-dark-default" style="background-color:#0d1117;color:#e6edf3" tabindex="0"><code><span class="line"><span style="color:#7EE787">    steps</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#E6EDF3">      - </span><span style="color:#7EE787">id</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">app</span></span>
<span class="line"><span style="color:#7EE787">        uses</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">actions/create-github-app-token@v2</span></span>
<span class="line"><span style="color:#7EE787">        continue-on-error</span><span style="color:#E6EDF3">: </span><span style="color:#79C0FF">true</span></span>
<span class="line"><span style="color:#7EE787">        with</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#7EE787">          app-id</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">\${{ secrets.REVIEWPILOT_APP_ID }}</span></span>
<span class="line"><span style="color:#7EE787">          private-key</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">\${{ secrets.REVIEWPILOT_PRIVATE_KEY }}</span></span>
<span class="line"><span style="color:#E6EDF3">      - </span><span style="color:#7EE787">uses</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">actions/checkout@v5</span></span>
<span class="line"><span style="color:#7EE787">        with</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#7EE787">          fetch-depth</span><span style="color:#E6EDF3">: </span><span style="color:#79C0FF">0</span></span>
<span class="line"><span style="color:#E6EDF3">      - </span><span style="color:#7EE787">uses</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">rafay99-epic/reviewpilot@main</span></span>
<span class="line"><span style="color:#7EE787">        with</span><span style="color:#E6EDF3">:</span></span>
<span class="line"><span style="color:#7EE787">          api_key</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">\${{ secrets.REVIEWPILOT_API_KEY }}</span></span>
<span class="line"><span style="color:#7EE787">          github_token</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">\${{ steps.app.outputs.token || github.token }}</span></span>
<span class="line"><span style="color:#7EE787">          bot_login</span><span style="color:#E6EDF3">: </span><span style="color:#A5D6FF">\${{ steps.app.outputs.app-slug &#x26;&#x26; format('{0}[bot]', steps.app.outputs.app-slug) || 'github-actions[bot]' }}</span></span></code></pre><p>If the key is revoked or the App is uninstalled, the run falls back to <code>github.token</code> instead of failing. A summary written by <code>github-actions[bot]</code> earlier is taken over and retired on the next run.</p>
`},f={slug:`runs-and-logs`,title:`Runs and logs`,summary:`What a run costs, how long it takes, and where to look.`,html:`<h2 id="logs">Logs</h2><p>Every phase of a run is a collapsible group in the Actions log, with its duration: checkout, diff and context, review, merge, post. Each tool call an agent makes is logged with its arguments.</p>
<p>The job summary gets a run report: the score, new, open and fixed counts, a table of phase timings, and the model&#39;s calls and tokens.</p>
<h2 id="time">Time</h2><p>A typical review of a 40,000-character diff takes a few minutes. Model calls back off and retry on rate limits, but never past the agent&#39;s own budget. GitHub calls time out after 30 seconds and retry safely: creating a comment is never retried in a way that could post it twice.</p>
<h2 id="runs-never-collide">Runs never collide</h2><p>Runs on the same pull request queue instead of overlapping, so a <code>/review</code> during a push review waits its turn. Runs are not cancelled mid-review, because a cancel between posting comments and saving state would post them again next time.</p>
<h2 id="when-something-fails">When something fails</h2><ul>
<li>A part of the diff that could not be reviewed is named in the summary as a partial review.</li>
<li>A failed run restores the previous summary, or says it failed with a link to the run.</li>
<li>If saving the summary fails, a fresh one is posted rather than losing state.</li>
</ul>
`},p=t(),m=o(),h=n(),g=Object.entries(Object.assign({"./content/docs/01-getting-started.md":s,"./content/docs/02-how-it-works.md":c,"./content/docs/03-configuration.md":l,"./content/docs/04-score.md":u,"./content/docs/05-own-bot.md":d,"./content/docs/06-runs-and-logs.md":f})).sort(([e],[t])=>e.localeCompare(t)).map(([,e])=>e),_=g.map(e=>e.slug);function v(){r();let t=a(_);return(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(i,{current:`docs`}),(0,h.jsxs)(`div`,{className:`mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[13rem_1fr] md:py-16`,children:[(0,h.jsx)(`aside`,{className:`md:sticky md:top-24 md:h-[calc(100vh-8rem)]`,children:(0,h.jsx)(`nav`,{"aria-label":`Docs`,className:`flex gap-4 overflow-x-auto pb-2 text-sm md:flex-col md:gap-1 md:overflow-visible`,children:g.map(e=>(0,h.jsx)(`a`,{href:`#${e.slug}`,"aria-current":t===e.slug?`true`:void 0,className:`shrink-0 rounded-md py-1.5 transition-colors md:px-3 ${t===e.slug?`text-paper md:bg-[#111]`:`text-mute hover:text-paper`}`,children:e.title},e.slug))})}),(0,h.jsxs)(`main`,{className:`min-w-0`,children:[(0,h.jsx)(`h1`,{className:`font-serif text-[clamp(2.75rem,6vw,4.5rem)] leading-none tracking-[-0.02em]`,children:`Docs`}),(0,h.jsx)(`p`,{className:`mt-4 max-w-xl text-lg text-[#cfcfcf]`,children:`Everything ReviewPilot needs, and everything it does, on one page.`}),g.map(e=>(0,h.jsxs)(`section`,{id:e.slug,className:`mt-16 scroll-mt-24 border-t border-line pt-10`,children:[(0,h.jsx)(`h2`,{className:`font-serif text-4xl tracking-[-0.01em]`,children:e.title}),(0,h.jsx)(`p`,{className:`mt-2 text-mute`,children:e.summary}),(0,h.jsx)(`div`,{className:`prose-doc mt-4 max-w-3xl`,dangerouslySetInnerHTML:{__html:e.html}})]},e.slug))]})]}),(0,h.jsx)(e,{})]})}var y=document.getElementById(`root`);y&&(0,m.createRoot)(y).render((0,h.jsx)(p.StrictMode,{children:(0,h.jsx)(v,{})}));