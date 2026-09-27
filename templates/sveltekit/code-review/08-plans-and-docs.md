# Phase 8: Plans and Docs

Check that the plan behind the change and the docs around it match what was built.

## Objectives

- Confirm the task's plan exists and is updated for what shipped
- Confirm standards docs list what the change added
- Confirm indexes, counts and READMEs are in sync

## Critical Rules

1. **Plans live in the top-level `plans/` directory.** One task, one pull request.
2. **A task file states why, what, how, acceptance criteria and tests.**
3. **When a task ships,** its file gets a status, an "As built" section for anything that changed,
   ticked criteria and the list of tests. Nothing from the original plan is deleted.
4. **Docs change with the code.**

## Checks

```bash
# Plan and doc changes in the diff
git diff --stat origin/{{BASE_BRANCH}}...HEAD -- plans docs '*.md'

# Find the task's plan
grep -rl "{{TASK_ID}}" plans/
```

For the task's plan file, check:

- **Sections:** why, what ships, how, acceptance criteria, tests, definition of done.
- **Status:** set, with the pull request number.
- **As built:** every difference between the plan and the code is recorded (renamed files, changed
  types, dropped or added parts), and nothing from the original plan was deleted to hide it.
- **Criteria:** ticked only when verified; unverified ones stay open and say so.
- **Tests:** listed by file, plus the manual checks that were run.

For the docs, check:

- **Standards docs:** new modules, components, tokens and variant classes are listed where the docs
  enumerate them.
- **Indexes and counts:** task indexes, phase totals and README summaries match the plans.
- **READMEs:** new commands, panels and flags are described where users look for them.

## Outputs

Record each finding in this phase's plan file using the finding format from the quick reference.

## Validation

- [ ] The task's plan has every section and reflects what shipped
- [ ] Standards docs list what the change added
- [ ] Indexes, counts and READMEs are in sync
