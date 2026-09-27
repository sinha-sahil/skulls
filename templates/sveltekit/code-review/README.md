# Code Review Template

Review a branch or pull request against the project's written standards, file by file, then fix
what the review finds. Lint, type checks and tests catch only part of a standard; this template
covers the rest: structure, component rules, styling, tests, plans, commit messages and the pull
request itself.

## Rule Sources

A review checks the change against two sets of rules:

1. **The project's own rules.** Standards docs, agent instruction files (`CLAUDE.md`, `AGENTS.md`),
   contributor guides, lint and format configs, and rules the owner stated while the work was done.
2. **The Skulls baseline** in [QUICK-REFERENCE.md](./QUICK-REFERENCE.md). It applies wherever the
   project is silent.

When the two conflict, the project wins. Record the conflict in the report so the owner can settle it.

## Critical Rules

### 1. Read Every Changed File Against Every Rule

Passing lint and tests is where the review starts, not where it ends. Read each changed file
against each standards doc, including the plan, the commit message and the pull request description.

### 2. Verify Before Reporting

Every finding names a file and line, the rule it breaks with its source, and the fix. Reproduce a
finding before reporting it; drop what you can't confirm.

### 3. Fix, Don't Just List

Fix what's clearly wrong in the same branch, keeping one commit per branch. Ask the owner when a fix
is a design decision, and don't widen the change beyond what the review found.

### 4. Public Repositories Stay Clean

In a public repository, findings, fixes, commits and pull requests never mention private projects,
customers or internal links.

## Phases

1. **Standards** - Collect the project's rules and fill gaps from the baseline
2. **Scope** - Pin down the diff, group the files, and run the project's checks
3. **Structure** - Modules, imports, naming, comments and simplicity
4. **Svelte** - Runes, events, component library use and accessibility
5. **TypeScript** - Generated types, strictness and input decoding
6. **Styling** - The theme file, token-only components and layout rules
7. **Tests** - Placement, builders, queries and coverage
8. **Plans and Docs** - Task plans, standards docs and indexes
9. **Commits and Pull Request** - Message style, one commit per branch and a lean description
10. **Report and Fix** - Rank findings, fix them, re-verify and report

## When to Use

- Before merging a branch or pull request
- When the owner asks to "run the review" or "check against our standards"
- After rebasing a stack, to re-check each branch
- When adopting the baseline in a project that has no written standards yet

## Output

The review plan directory holds one file per phase with that phase's findings (or `SKIPPED` with a
reason), plus `00-overview.md` and `checklist.md`. The last phase adds the ranked report, the fixes
applied and anything left for the owner.
