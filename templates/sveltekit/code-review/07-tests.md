# Phase 7: Tests

Check that the tests sit in the right place, reuse the shared builders, and prove the behaviour.

## Objectives

- Confirm tests mirror the source layout and reuse `tests/support/`
- Confirm tests go through the public API and query like a user
- Confirm the change's behaviour and branches are covered
- Confirm bug-fix tests fail without the fix

## Critical Rules

1. **Tests live in `tests/`,** mirroring `src/lib/`, never beside source files.
2. **One builder per data shape,** in `tests/support/`. Pass overrides; no per-file copies.
3. **Test the public API** and what components render. Internals only for a store's reset and pure helpers.
4. **Query by role and accessible name.**
5. **A test workaround gets a comment.**

## Checks

```bash
# Test files outside tests/
git diff --name-only origin/{{BASE_BRANCH}}...HEAD | grep -E "\.(test|spec)\.ts$" | grep -v "^tests/"

# Builders defined inside test files
git diff origin/{{BASE_BRANCH}}...HEAD -- tests | grep -nE "^\+function [a-z]+\([^)]*\): [A-Z]"

# Queries by class or tag instead of role
git diff origin/{{BASE_BRANCH}}...HEAD -- tests | grep -nE "^\+.*querySelector(All)?\("
```

For each changed test, also check:

- **Builders:** a data builder written inside a test file, or a second copy of one, moves to
  `tests/support/` with overrides. Check the base branch too: a stacked branch that consolidates a
  builder its base introduced should move that into the base.
- **Public API:** imports come from a module's `index.ts`, except a store's reset function and pure
  `utils.ts` helpers.
- **Queries:** `getByRole` with a name. A `querySelector` needs a reason (a decorative element has no
  role); if the element could have an accessible name, it should get one instead.
- **Coverage:** every branch a user can reach, external input decoding and the platform contract.
  Quiet cases count: nothing happens on first load, without config, or when nothing changed.
- **Workarounds:** a test that fires events the test DOM can't produce (such as `animationend` where
  no CSS animations run) says so in a comment.
- **Proof:** for a fix, disable the fix locally and confirm the new test fails, then restore it.

## Browser Check

Unit tests don't cover layout. Run the changed flows in a browser at 1280 px and 390 px, including
keyboard use and reduced motion where relevant, and keep the screenshots for the pull request.

## Outputs

Record each finding in this phase's plan file using the finding format from the quick reference.

## Validation

- [ ] Tests mirror the source layout
- [ ] Builders are shared, with no per-file copies
- [ ] Tests use the public API and role-based queries
- [ ] Every reachable branch, including quiet cases, is covered
- [ ] Bug-fix tests fail without the fix
- [ ] Browser checks done at both widths
