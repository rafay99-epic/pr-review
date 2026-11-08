// The GitHub API calls ReviewPilot makes. Every response is validated against a schema,
// so a surprise from the API fails loudly here instead of deep in the review. Whatever
// token it is given decides the author: a GitHub App installation token posts as `<app>[bot]`.

import { type } from "arktype";

const User = type({ login: "string" });

const Pr = type({
  number: "number",
  state: "'open' | 'closed'",
  draft: "boolean",
  title: "string",
  body: "string | null",
  user: User,
  head: { sha: "string" },
  base: { ref: "string", sha: "string", repo: { default_branch: "string" } },
});

const IssueComment = type({ id: "number", node_id: "string", body: "string", user: User.or("null") });
const ReviewComment = type({ id: "number", body: "string", "in_reply_to_id?": "number", user: User.or("null") });
const Created = type({ id: "number" });
const GraphQlEnvelope = type({ "errors?": type({ message: "string" }).array(), "data?": "unknown" });

const ThreadsData = type({
  data: {
    repository: {
      pullRequest: {
        reviewThreads: {
          nodes: type({
            id: "string",
            isResolved: "boolean",
            resolvedBy: User.or("null"),
            comments: {
              nodes: type({
                id: "string",
                databaseId: "number | null",
                body: "string",
                authorAssociation: "string",
                author: User.or("null"),
              }).array(),
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
  resolvedBy: string;
  comments: { id: string; databaseId: number | null; body: string; author: string; association: string }[];
};

export type InlineComment = { path: string; line: number; start_line?: number; body: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function createGitHub(token: string, repo: string) {
  const api = process.env.GITHUB_API_URL ?? "https://api.github.com";

  /**
   * One API call with a 30s timeout. Reads and edits retry on network errors, 429 and 5xx;
   * creates retry only on 429 (not processed), so a retry can never post a duplicate.
   */
  async function call<S extends type.Any>(schema: S, method: string, path: string, body?: unknown): Promise<S["infer"]> {
    const idempotent = method !== "POST" || path === "/graphql";
    for (let attempt = 0; ; attempt++) {
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
        signal: AbortSignal.timeout(30_000),
      }).catch((e: unknown) => (e instanceof Error ? e : new Error(String(e))));

      const status = res instanceof Error ? 0 : res.status;
      const retryable = status === 429 || (idempotent && (status === 0 || status >= 500));
      if (retryable && attempt < 3) {
        await sleep(2 ** attempt * 1000);
        continue;
      }
      if (res instanceof Error) throw new Error(`GitHub ${method} ${path}: ${res.message}`);
      if (!res.ok) throw new Error(`GitHub ${method} ${path}: ${res.status} ${(await res.text()).slice(0, 300)}`);
      try {
        return schema.assert(res.status === 204 ? undefined : await res.json());
      } catch (e) {
        throw new Error(`GitHub ${method} ${path}: unexpected response, ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  async function all<S extends type.Any>(schema: S, path: string): Promise<S["infer"][]> {
    const page = schema.array();
    const out: S["infer"][] = [];
    for (let n = 1; n <= 30; n++) {
      const batch = await call(page, "GET", `${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${n}`);
      out.push(...batch);
      if (batch.length < 100) break;
    }
    return out;
  }

  /** GraphQL answers 200 even when it fails; its `errors` array is turned into a throw. */
  async function graphql<S extends type.Any>(schema: S, query: string, variables: Record<string, unknown>): Promise<S["infer"]> {
    const res = await call(GraphQlEnvelope, "POST", "/graphql", { query, variables });
    if (res.errors?.length) throw new Error(`GitHub GraphQL: ${res.errors.map((e) => e.message).join("; ")}`);
    try {
      return schema.assert(res);
    } catch (e) {
      throw new Error(`GitHub GraphQL: unexpected response, ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const [owner, name] = repo.split("/");
  const r = `/repos/${repo}`;
  const done = type("unknown");

  return {
    pr: (n: number) => call(Pr, "GET", `${r}/pulls/${n}`),
    issueComments: (n: number) => all(IssueComment, `${r}/issues/${n}/comments`),
    reviewComments: (n: number) => all(ReviewComment, `${r}/pulls/${n}/comments`),
    comment: (n: number, body: string) => call(Created, "POST", `${r}/issues/${n}/comments`, { body }),
    editComment: (id: number, body: string) => call(Created, "PATCH", `${r}/issues/comments/${id}`, { body }),
    react: (commentId: number, content: "eyes" | "+1") => call(done, "POST", `${r}/issues/comments/${commentId}/reactions`, { content }),
    reply: (n: number, commentId: number, body: string) => call(Created, "POST", `${r}/pulls/${n}/comments/${commentId}/replies`, { body }),
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

    /** Removes an old summary; if deleting is not allowed, collapses it as outdated instead. */
    async retire(comment: IssueComment) {
      await call(done, "DELETE", `${r}/issues/comments/${comment.id}`).catch(() =>
        graphql(done, "mutation($id:ID!){minimizeComment(input:{subjectId:$id,classifier:OUTDATED}){minimizedComment{isMinimized}}}", { id: comment.node_id }),
      );
    },

    async threads(n: number): Promise<Thread[]> {
      const query = `query($owner:String!,$name:String!,$n:Int!){repository(owner:$owner,name:$name){pullRequest(number:$n){
        reviewThreads(first:100){nodes{id isResolved resolvedBy{login} comments(first:100){nodes{id databaseId body authorAssociation author{login}}}}}}}}`;
      const res = await graphql(ThreadsData, query, { owner, name, n });
      return res.data.repository.pullRequest.reviewThreads.nodes.map((t) => ({
        id: t.id,
        resolved: t.isResolved,
        resolvedBy: t.resolvedBy?.login ?? "",
        comments: t.comments.nodes.map((c) => ({
          id: c.id,
          databaseId: c.databaseId,
          body: c.body,
          author: c.author?.login ?? "",
          association: c.authorAssociation,
        })),
      }));
    },

    /**
     * Closes a fixed finding: collapses its comment as outdated, then resolves the thread.
     * GitHub only lets an App resolve threads with Contents write, which a reviewer should
     * not need, so without it the thread stays open but collapsed. Returns whether it resolved.
     */
    async close(thread: Thread): Promise<boolean> {
      const root = thread.comments[0];
      if (root) {
        await graphql(done, "mutation($id:ID!){minimizeComment(input:{subjectId:$id,classifier:OUTDATED}){minimizedComment{isMinimized}}}", { id: root.id });
      }
      return graphql(done, "mutation($id:ID!){resolveReviewThread(input:{threadId:$id}){thread{id}}}", { id: thread.id }).then(
        () => true,
        (e: unknown) => {
          if (/not accessible by integration/i.test(String(e))) return false;
          throw e;
        },
      );
    },
  };
}

export type GitHub = ReturnType<typeof createGitHub>;
