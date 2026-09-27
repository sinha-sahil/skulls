# Phase 2: Scope

Pin down exactly what changed, and let the machines find what they can before reading by hand.

## Objectives

- Identify the branch, its base and every changed file
- Group the files by review area
- Run the project's checks and record their results
- Note stacked branches that depend on this one

## Critical Rules

1. **Review the merge base diff** (`base...head`), not the working tree, so the findings match the pull request.
2. **Generated files are out of scope** for hand review; check only that they were regenerated, not edited.
3. **A green check run is the start of the review, not the end.**

## Find the Change

```bash
git fetch origin
git log --oneline origin/{{BASE_BRANCH}}..HEAD
git diff --stat origin/{{BASE_BRANCH}}...HEAD
git diff --name-only origin/{{BASE_BRANCH}}...HEAD -- . ':!src/generated'
```

For a pull request, confirm its base and head:

```bash
gh pr view {{PR_NUMBER}} --json baseRefName,headRefName,title
```

## Group the Files

| Area | Files | Phase |
|------|-------|-------|
| Structure | new or moved modules, `index.ts` files, imports | 3 |
| Svelte | `*.svelte`, `*.svelte.ts` | 4 |
| TypeScript | `*.ts`, type specs (`*.yaml`) | 5 |
| Styling | `<style>` blocks, theme and mapping CSS files | 6 |
| Tests | `tests/**` | 7 |
| Plans and docs | `plans/**`, `docs/**`, READMEs | 8 |
| Commits and pull request | commit messages, the description | 9 |

## Run the Checks

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
```

Record each result. A failure is a finding for phase 10; fix it before reviewing by hand, since a
fix can change the code under review.

## Stacks

```bash
gh pr list --base {{HEAD_BRANCH}} --json number,headRefName
```

Branches stacked on this one must be rebased and re-checked after any fix.

## Outputs

Record in this phase's plan file:

- Base, head and the pull request, if any
- The changed files, grouped by area
- The check results
- Dependent branches

## Validation

- [ ] The diff is taken against the merge base
- [ ] Every changed file sits in one area
- [ ] Every project check ran and its result is recorded
- [ ] Dependent branches are listed
