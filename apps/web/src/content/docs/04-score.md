---
title: The score
summary: Computed from verified findings, never asked of the model.
---

| Score | Meaning |
| --- | --- |
| 5/5 | No verified issues |
| 4/5 | Minor issues only |
| 3/5 | At least one major issue |
| 2/5 | A critical issue: security, privacy, data loss, a broken build |
| 1/5 | Several critical issues |

Because it is derived from findings, the score only moves when findings change.

## Across pushes

On every push, open findings are checked again against the new code:

- **Fixed.** ReviewPilot replies "Fixed in" with the commit, resolves the thread and collapses the comment as outdated.
- **Still open.** It stays in the table with its original wording.
- **New.** Posted inline, counted in the delta line.

A finding is dismissed, and never raised again, when someone other than ReviewPilot resolves its thread, or when the PR author or a maintainer replies to it.

State lives in a hidden marker inside the summary comment. There is no database, and the PR carries its own history.
