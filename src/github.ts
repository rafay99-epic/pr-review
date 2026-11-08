// The handful of GitHub API calls ReviewPilot makes. Whatever token it is given decides the
// author: a GitHub App installation token posts as `<app>[bot]`.

export type Pr = {
  number: number;
  state: string;
  draft: boolean;
  title: string;
  body: string | null;
  head: { sha: string };
  base: { ref: string; sha: string; repo: { default_branch: string } };
};

export type IssueComment = { id: number; body: string };
export type ReviewComment = { id: number; body: string; in_reply_to_id?: number; user: { login: string } };
export type Thread = { resolved: boolean; comments: { body: string; author: string }[] };

export type InlineComment = { path: string; line: number; start_line?: number; body: string };

export function createGitHub(token: string, repo: string) {
  const api = process.env.GITHUB_API_URL ?? "https://api.github.com";

  async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${api}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "reviewpilot",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!res.ok) throw new Error(`GitHub ${method} ${path}: ${res.status} ${(await res.text()).slice(0, 300)}`);
    return (res.status === 204 ? undefined : await res.json()) as T;
  }

  async function all<T>(path: string): Promise<T[]> {
    const out: T[] = [];
    for (let page = 1; page <= 10; page++) {
      const batch = await call<T[]>("GET", `${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
      out.push(...batch);
      if (batch.length < 100) break;
    }
    return out;
  }

  const [owner, name] = repo.split("/");
  const r = `/repos/${repo}`;

  return {
    pr: (n: number) => call<Pr>("GET", `${r}/pulls/${n}`),
    issueComments: (n: number) => all<IssueComment>(`${r}/issues/${n}/comments`),
    reviewComments: (n: number) => all<ReviewComment>(`${r}/pulls/${n}/comments`),
    comment: (n: number, body: string) => call<IssueComment>("POST", `${r}/issues/${n}/comments`, { body }),
    editComment: (id: number, body: string) => call<IssueComment>("PATCH", `${r}/issues/comments/${id}`, { body }),
    react: (commentId: number, content: "eyes" | "+1") =>
      call<unknown>("POST", `${r}/issues/comments/${commentId}/reactions`, { content }),
    reply: (n: number, commentId: number, body: string) =>
      call<ReviewComment>("POST", `${r}/pulls/${n}/comments/${commentId}/replies`, { body }),
    review: (n: number, commitId: string, comments: InlineComment[]) =>
      call<{ id: number }>("POST", `${r}/pulls/${n}/reviews`, {
        commit_id: commitId,
        event: "COMMENT",
        comments: comments.map((c) => ({
          path: c.path,
          line: c.line,
          side: "RIGHT",
          ...(c.start_line ? { start_line: c.start_line, start_side: "RIGHT" } : {}),
          body: c.body,
        })),
      }),

    /** Review threads with their resolved state, which only GraphQL exposes. */
    async threads(n: number): Promise<Thread[]> {
      const query = `query($owner:String!,$name:String!,$n:Int!){repository(owner:$owner,name:$name){pullRequest(number:$n){
        reviewThreads(first:100){nodes{isResolved comments(first:20){nodes{body author{login}}}}}}}}`;
      type Data = {
        data?: { repository?: { pullRequest?: { reviewThreads?: { nodes: { isResolved: boolean; comments: { nodes: { body: string; author: { login: string } | null }[] } }[] } } } };
      };
      const res = await call<Data>("POST", "/graphql", { query, variables: { owner, name, n } });
      return (res.data?.repository?.pullRequest?.reviewThreads?.nodes ?? []).map((t) => ({
        resolved: t.isResolved,
        comments: t.comments.nodes.map((c) => ({ body: c.body, author: c.author?.login ?? "" })),
      }));
    },
  };
}

export type GitHub = ReturnType<typeof createGitHub>;
