# Phase 7: Rollback Plan

**Dependencies:** Phase 5 (Execution Plan), Phase 6 (Testing Strategy)

**Can be implemented in parallel with:** Phase 5 (rollback should be ready throughout execution)

## Overview

Define the rollback strategy for `{{PROJECT_NAME}}` CSS refactoring. At every point during execution, it must be possible to revert to a known-good state. This plan covers git-based rollback, partial rollback of individual components, and gradual rollout strategies.

---

## 7.1 Git-Based Rollback

### Full Revert to Pre-Refactoring State

```bash
# Find the last commit before refactoring started
git log --oneline {{BRANCH_NAME}} | tail -5

# Create a revert branch from the pre-refactoring state
git checkout -b rollback/full-revert <pre-refactoring-commit>

# Or revert the merge commit if already merged
git revert -m 1 <merge-commit-hash>
```

### Partial Revert (Single Component)

Each component is refactored in its own commit, so individual components can be reverted:

```bash
# Find the commit that refactored a specific component
git log --oneline --all -- "{{STYLES_DIR}}/components/_{{COMPONENT_NAME}}.css"

# Revert that specific commit
git revert <commit-hash>

# Verify
stylelint . && pnpm build
```

### Revert a Range of Commits

```bash
# Revert multiple consecutive refactoring commits
git revert --no-commit <oldest-commit>..<newest-commit>
git commit -m "revert: rollback CSS refactoring steps X through Y"
```

## 7.2 Rollback Triggers

Define conditions that require immediate rollback:

```text
| Trigger | Severity | Action |
|---------|----------|--------|
| Visual regression on critical page | Critical | Revert last commit immediately |
| Build failure after merge | Critical | Revert merge commit |
| Cross-browser rendering bug | High | Revert specific component commit |
| Performance regression (>10% size increase) | High | Investigate, revert if unresolvable |
| Stylelint errors that cannot be resolved | Medium | Revert and investigate strategy |
| Inconsistent behaviour in one browser | Medium | Add @supports fallback, or revert |
| Minor visual difference (spacing, etc.) | Low | Fix forward, do not revert |
```

## 7.3 Pre-Rollback Checklist

Before rolling back, verify:

```text
- [ ] Identify the exact commit(s) causing the issue
- [ ] Confirm the issue is caused by CSS changes (not unrelated code)
- [ ] Check if a fix-forward is simpler than a revert
- [ ] Notify the team before reverting shared branches
- [ ] Capture screenshots/logs of the issue for debugging
```

## 7.4 Gradual Rollout Strategy

### Feature Flag Approach (CSS Custom Property Toggle)

```css
/* Use a custom property as a feature flag */
:root {
  --use-new-card-styles: 0; /* 0 = old, 1 = new */
}

/* Old styles (will be removed after validation) */
@layer components {
  .card:not([data-refactored]) {
    /* Original styles */
    background: white;
    padding: 16px;
    border-radius: 8px;
  }
}

/* New refactored styles */
@layer components {
  .card[data-refactored] {
    background: var(--color-surface);
    padding: var(--space-md);
    border-radius: var(--radius-md);
  }
}
```

### Per-Page Rollout

Apply refactored styles to one page at a time:

```html
<!-- Add data attribute to pages using refactored styles -->
<body data-styles="v2">
```

```css
@layer components {
  /* New styles only apply when parent has the v2 flag */
  [data-styles="v2"] .card {
    background: var(--color-surface);
    padding: var(--space-md);
  }
}
```

### A/B Rollout

```css
/* Two separate entry files for A/B testing */

/* {{STYLES_DIR}}/main-legacy.css — original styles */
@import "./legacy/styles.css";

/* {{STYLES_DIR}}/main-refactored.css — new styles */
@layer reset, base, tokens, layouts, components, utilities;
@import "./settings/_colors.css" layer(tokens);
/* ... refactored imports */
```

## 7.5 Rollback Procedures

### Procedure 1: Revert Last Change

```bash
# Undo the most recent commit
git revert HEAD
stylelint . && pnpm build
npx playwright test
```

**When to use:** The last commit caused a visual regression or build failure.

### Procedure 2: Revert Specific Component

```bash
# Find the commit that broke things
git log --oneline -- "{{STYLES_DIR}}/components/_{{COMPONENT_NAME}}.css"

# Revert that commit
git revert <commit-hash>
stylelint . && pnpm build

# Verify the component renders correctly
npx playwright test --grep "{{COMPONENT_NAME}}"
```

**When to use:** A specific component has visual issues after refactoring.

### Procedure 3: Full Branch Rollback

```bash
# If the entire refactoring branch is problematic
git checkout main
git branch -D {{BRANCH_NAME}}  # Only if not pushed

# Or if already merged
git revert -m 1 <merge-commit>
git push
```

**When to use:** The refactoring approach is fundamentally flawed and needs rethinking.

## 7.6 Recovery After Rollback

After rolling back, follow these steps to re-attempt:

```text
1. Document what went wrong and why
2. Update the strategy (Phase 4) if the approach was flawed
3. Update the impact analysis (Phase 3) if dependencies were missed
4. Create a new branch from the rolled-back state
5. Apply a corrected approach
6. Run the full test suite before merging again
```

## 7.7 Backup Points

Create explicit backup tags at key milestones:

```bash
# Before starting execution
git tag refactor/baseline

# After foundation setup (tokens + @layer)
git tag refactor/foundation-complete

# After each major milestone
git tag refactor/ids-removed
git tag refactor/layers-wrapped
git tag refactor/tokens-migrated
git tag refactor/important-removed

# After all refactoring
git tag refactor/complete
```

```bash
# To roll back to any milestone
git checkout refactor/foundation-complete
git checkout -b {{BRANCH_NAME}}-retry
```

---

## Checklist

- [ ] Git-based rollback procedures documented (full, partial, range)
- [ ] Rollback triggers defined with severity levels
- [ ] Pre-rollback checklist created
- [ ] Gradual rollout strategy defined (feature flags or per-page)
- [ ] Backup tags planned for key milestones
- [ ] Recovery procedure documented for re-attempting after rollback
- [ ] Team knows how to execute rollback procedures
- [ ] All rollback procedures have been verified to work

## Verification

```bash
stylelint .
pnpm build
```

Rollback plan should be ready before execution (Phase 5) begins. Backup tags should be created at each milestone during execution.
