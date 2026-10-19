# Phase 10: Report and Fix

Rank the findings, fix them, prove the fixes, and report what happened.

## Objectives

- Rank every confirmed finding
- Fix what's clearly wrong and ask about design decisions
- Re-run every check and rebase dependent branches
- Report findings, fixes and anything left for the owner

## Critical Rules

1. **Report only confirmed findings,** each with a file and line, the rule and its source, and the fix.
2. **Fix in the same branch** and fold the fix into its one commit.
3. **Ask before deciding design.** A fix that changes behaviour, scope or public API is the owner's call.
4. **Re-verify after fixing.** A fix that breaks a check is not a fix.
5. **Report plainly:** what was found, what was fixed, what's left.

## Rank

| Rank | Examples |
|------|----------|
| Blocking | Failing checks, broken behaviour, lost data, accessibility failures, private names in a public repo |
| Standards | Rules the project or baseline states: structure, runes, tokens, tests, plans, commits |
| Polish | Naming, wording, docs gaps, message style |

Group the findings by branch when reviewing a stack. Fix a finding in the branch that introduced it,
then rebase the branches above.

## Fix

```bash
# Fold fixes into the branch's one commit
git add -A
git commit --amend -F {{MESSAGE_FILE}}
git push --force-with-lease

# Rebase a dependent branch onto the fixed base
git rebase --onto {{BASE_BRANCH}} {{OLD_BASE_COMMIT}} {{DEPENDENT_BRANCH}}
```

Update the commit message and the pull request description when a fix changes what they describe.

## Re-verify

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
```

Re-open the changed screens at 1280 px and 390 px when a fix touched the UI.

## Report

Write the report in this phase's plan file, then summarise it for the owner:

```markdown
## Findings

### Branch {{HEAD_BRANCH}}

1. **{{short title}}** ({{rank}})
   - **Where:** `{{file}}:{{line}}`
   - **Rule:** {{rule}} ({{source}})
   - **Fix:** {{what changed}} - fixed in {{commit}}

## Still Open

- {{finding the owner must decide, with the options}}

## Checked

- {{checks run and their results}}
```

## Validation

- [ ] Every finding is confirmed, ranked and has a fix or a question
- [ ] Fixes are folded into each branch's one commit and pushed
- [ ] Dependent branches are rebased and re-checked
- [ ] Every check passes after the fixes
- [ ] The report lists findings, fixes and what's left
