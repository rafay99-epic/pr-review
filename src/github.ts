// The GitHub API calls ReviewPilot makes. Every response is validated against a schema,
// so a surprise from the API fails loudly here instead of deep in the review. Whatever
// token it is given decides the author: a GitHub App installation token posts as `<app>[bot]`.

import { type } from "arktype";

const Pr = type({
  number: "number",
  state: "string",
  draft: "boolean",
  title: "string",
  body: "string | null",
  head: { sha: "string" },
  base: { ref: "string", sha: "string", repo: { default_branch: "string" } },
});

const User = type({ login: "string" });
const IssueComment = type({ id: "number", body: "string", user: User.or("null") });
const ReviewComment = type({ id: "number", body: "string", "in_reply_to_id?": "number", user: User.or("null") });
const Created = type({ id: "number" });

const ThreadsData = type({
  data: {
    repository: {
      pullRequest: {
        reviewThreads: {
          nodes: type({
            id: "string",
            isResolved: "boolean",
            comments: {
              nodes: type({ id: "string", databaseId: "number | null", body: "string", author: User.or("null") }).array(),
            },
          }).array(),
        },
      },
    },
  },
});

export type Pr = typeof Pr.infer;
export type IssueComment = typeof IssueComment.infer;
export type ReviewComment = typeof ReviewComment.infer;

/** A review thread with its resolved state, which only GraphQL exposes. */
export type Thread = {
  id: string;
  resolved: boolean;
  comments: { id: string; databaseId: number | null; body: string; author: string }[];
};

export type InlineComment = { path: string; line: number; start_line?: number; body: string };

export function createGitHub(token: string, repo: string) {
  const api = process.env.GITHUB_API_URL ?? "https://api.github.com";

  async function call<S extends type.Any>(schema: S, method: string, path: string, body?: unknown): Promise<S["infer"]> {
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
    try {
      return schema.assert(res.status === 204 ? undefined : await res.json());
    } catch (e) {
      throw new Error(`GitHub ${method} ${path}: unexpected response, ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function all<S extends type.Any>(schema: S, path: string): Promise<S["infer"][]> {
    const page = schema.array();
    const out: S["infer"][] = [];
    for (let n = 1; n <= 10; n++) {
      const batch = await call(page, "GET", `${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${n}`);
      out.push(...batch);
      if (batch.length < 100) break;
    }
    return out;
  }

  const graphql = <S extends type.Any>(schema: S, query: string, variables: Record<string, unknown>) =>
    call(schema, "POST", "/graphql", { query, variables });

  const [owner, name] = repo.split("/");
  const r = `/repos/${repo}`;
  const ignore = type("unknown");

  return {
    pr: (n: number) => call(Pr, "GET", `${r}/pulls/${n}`),
    issueComments: (n: number) => all(IssueComment, `${r}/issues/${n}/comments`),
    reviewComments: (n: number) => all(ReviewComment, `${r}/pulls/${n}/comments`),
    comment: (n: number, body: string) => call(Created, "POST", `${r}/issues/${n}/comments`, { body }),
    editComment: (id: number, body: string) => call(Created, "PATCH", `${r}/issues/comments/${id}`, { body }),
    react: (commentId: number, content: "eyes" | "+1") =>
      call(ignore, "POST", `${r}/issues/comments/${commentId}/reactions`, { content }),
    reply: (n: number, commentId: number, body: string) =>
      call(Created, "POST", `${r}/pulls/${n}/comments/${commentId}/replies`, { body }),
    review: (n: number, commitId: string, comments: InlineComment[]) =>
      call(Created, "POST", `${r}/pulls/${n}/reviews`, {
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

    async threads(n: number): Promise<Thread[]> {
      const query = `query($owner:String!,$name:String!,$n:Int!){repository(owner:$owner,name:$name){pullRequest(number:$n){
        reviewThreads(first:100){nodes{id isResolved comments(first:20){nodes{id databaseId body author{login}}}}}}}}`;
      const res = await graphql(ThreadsData, query, { owner, name, n });
      return res.data.repository.pullRequest.reviewThreads.nodes.map((t) => ({
        id: t.id,
        resolved: t.isResolved,
        comments: t.comments.nodes.map((c) => ({ id: c.id, databaseId: c.databaseId, body: c.body, author: c.author?.login ?? "" })),
      }));
    },

    /** Closes a fixed finding: resolves its thread and collapses the comment as outdated. */
    async close(thread: Thread) {
      const root = thread.comments[0];
      await graphql(ignore, "mutation($id:ID!){resolveReviewThread(input:{threadId:$id}){thread{id}}}", { id: thread.id });
      if (root) {
        await graphql(ignore, "mutation($id:ID!){minimizeComment(input:{subjectId:$id,classifier:OUTDATED}){minimizedComment{isMinimized}}}", { id: root.id });
      }
    },
  };
}

export type GitHub = ReturnType<typeof createGitHub>;
