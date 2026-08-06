# Worktree and branch strategy

## Foundation branch

The substantive foundation target is `foundation/product-and-system-design`, based on `main`. The canonical remote must be exactly `https://github.com/Itskorrah/NextSet.git`.

## Worktrees

Prefer one isolated worktree per independent specialist stream when Git metadata is writable:

```text
foundation/product-and-system-design
  research/market-and-users
  product/domain-and-ux
  architecture/data-and-quality
  design/visual-directions
```

Specialists commit only their owned paths. The lead integrates in dependency order: research → product/domain → architecture/quality → design/prototypes → governance → independent review/rework. Do not merge empty review theatre or generated chatter.

## Branch safety

- Fetch before branching and verify the base commit.
- Never force-push, rewrite shared history, disable checks, or delete branches to hide failures.
- Keep commits small enough to review by concern; avoid one repository-wide generated commit.
- Before every push run `git status -sb`, `git branch --show-current`, `git remote get-url origin`, and relevant validation.
- Open a draft pull request into `main`; do not merge during the foundation approval phase.

## Degraded operation

If Git, authentication, or network access is blocked, continue safe local artefact work, retain exact validation evidence, and report the precise command/error. Do not pretend a branch, commit, push, or PR exists. Resume publication only in a writable authenticated checkout and re-run pre-push checks there.

## Production phase

After approval, create focused branches from the accepted foundation state. Do not use the disposable prototype tree as a production base. Shared domain/data contracts land before parallel screen work.
