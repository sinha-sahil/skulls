# {{PROJECT_NAME}} - Rollback Plan

## Overview

Define git-based rollback strategies and gradual rollout procedures for the refactoring of {{PROJECT_NAME}}. Every refactoring step must be safely revertible without affecting runtime behaviour.

## Status

🔴 Not Started

## Dependencies

- 05-execution-plan.md (know execution steps to revert)
- 06-testing-strategy.md (know how to verify after rollback)

---

## Step 1: Git Branch Strategy

### Branch Layout

```text
main (or master)
└── {{BRANCH_NAME}}
    ├── commit: "refactor: add utility types"
    ├── commit: "refactor: add type guards"
    ├── commit: "refactor: convert {{TARGET_TYPE}} to discriminated union"
    ├── commit: "refactor: type-safe {{MODULE_NAME}} service"
    ├── commit: "refactor: enable noImplicitAny"
    ├── commit: "refactor: enable strictNullChecks"
    └── commit: "refactor: enable strict: true"
```

### Commit Convention

Every refactoring commit should follow this pattern:

```text
refactor: <what changed>

- What was the {{OLD_PATTERN}}
- What is the {{NEW_PATTERN}}
- Which files are affected: {{AFFECTED_FILES}}
- Verification: tsc --noEmit passes, vitest run passes
```

---

## Step 2: Rollback Commands

### Revert a Single Commit

```bash
# Identify the commit to revert
git log --oneline {{BRANCH_NAME}}

# Revert the specific commit (creates a new revert commit)
git revert <commit-hash> --no-edit

# Verify after revert
tsc --noEmit
vitest run
```

### Revert to a Specific Checkpoint

```bash
# List checkpoint tags
git tag -l 'refactor/*'

# Reset to checkpoint (keeps changes as unstaged)
git reset refactor/before-strict-flags

# Or hard reset (discards all changes after checkpoint)
git reset --hard refactor/before-strict-flags

# Verify
tsc --noEmit
vitest run
```

### Revert the Entire Refactoring

```bash
# Option A: Delete branch (if not yet merged)
git checkout main
git branch -D {{BRANCH_NAME}}

# Option B: Revert merge commit (if already merged)
git revert -m 1 <merge-commit-hash>

# Verify
tsc --noEmit
vitest run
```

---

## Step 3: Define Checkpoints

Create git tags at key milestones for easy rollback:

```bash
# Before starting refactoring
git tag refactor/baseline

# After utility types are added
git tag refactor/after-utility-types

# After type guards are added
git tag refactor/after-type-guards

# After type definitions are refactored
git tag refactor/after-type-definitions

# After service layer is refactored
git tag refactor/after-services

# Before enabling strict flags
git tag refactor/before-strict-flags

# After full strict mode
git tag refactor/after-strict-mode
```

### Checkpoint Verification

| Checkpoint | Tag | `tsc` | `vitest` | `eslint` |
|-----------|-----|-------|----------|----------|
| Baseline | `refactor/baseline` | ✓ | ✓ | ✓ |
| Utility types | `refactor/after-utility-types` | ✓ | ✓ | ✓ |
| Type guards | `refactor/after-type-guards` | ✓ | ✓ | ✓ |
| Type definitions | `refactor/after-type-definitions` | ✓ | ✓ | ✓ |
| Services | `refactor/after-services` | ✓ | ✓ | ✓ |
| Strict flags | `refactor/after-strict-mode` | ✓ | ✓ | ✓ |

---

## Step 4: Gradual Rollout Strategy

### Phase-Based Merge

Instead of merging the entire refactoring at once, merge in phases:

```text
Phase 1: Merge utility types + type guards
         → Low risk, additive only, no breaking changes
         → Monitor CI for 1-2 days

Phase 2: Merge type definition changes
         → Medium risk, consumers must update
         → Monitor CI for 1-2 days

Phase 3: Merge service layer changes
         → Medium risk, runtime paths changed (Result pattern)
         → Monitor CI + staging for 2-3 days

Phase 4: Merge strict mode flags
         → High risk, entire codebase affected
         → Monitor CI + staging for 3-5 days
```

### Feature Flag for Runtime Changes

If the refactoring introduces runtime changes (like the Result pattern):

```typescript
// Temporary compatibility layer during rollout
const USE_RESULT_PATTERN = process.env.USE_RESULT_PATTERN === 'true';

async function find{{MODULE_NAME}}(id: string) {
  if (USE_RESULT_PATTERN) {
    // New: Returns Result<T, E>
    return findWithResult(id);
  }
  // Legacy: Returns T | null, throws on error
  return findLegacy(id);
}
```

---

## Step 5: Rollback Decision Matrix

| Symptom | Likely Cause | Rollback Level |
|---------|-------------|----------------|
| `tsc --noEmit` fails after commit | Type error in latest change | Revert last commit |
| Tests fail after commit | Runtime behaviour changed | Revert last commit |
| Multiple test failures after strict flag | Flag enabled too aggressively | Reset to `before-strict-flags` |
| CI failures on merged PR | Incompatible changes | Revert merge commit |
| Production errors after deploy | Runtime change from Result pattern | Revert merge + disable feature flag |

### Escalation Path

```text
1. Single test failure → Fix forward (< 15 minutes)
2. Multiple test failures → Revert last commit
3. Compile failure → Revert to last checkpoint
4. CI pipeline broken → Revert merge commit
5. Production issue → Full rollback + incident review
```

---

## Step 6: Post-Refactoring Cleanup

After the refactoring is stable and merged:

```bash
# Remove checkpoint tags
git tag -d refactor/baseline
git tag -d refactor/after-utility-types
git tag -d refactor/after-type-guards
git tag -d refactor/after-type-definitions
git tag -d refactor/after-services
git tag -d refactor/before-strict-flags
git tag -d refactor/after-strict-mode

# Remove feature flags (if used)
# Search for USE_RESULT_PATTERN and remove conditional logic

# Remove baseline metrics file
rm -f .refactor-baseline
rm -f .refactor-test-baseline

# Final verification
tsc --noEmit
eslint .
vitest run
```

### Documentation Updates

- [ ] Update CHANGELOG with refactoring summary
- [ ] Update API documentation if public types changed
- [ ] Update contributing guide if new patterns introduced
- [ ] Document new utility types in shared/types/README.md

---

## Step 7: Lessons Learned

After the refactoring is complete, document:

| Question | Answer |
|----------|--------|
| What was the hardest part? | |
| What would you do differently? | |
| Which patterns worked best? | |
| Were the goals realistic? | |
| How long did it actually take vs estimate? | |

---

## Verification

```bash
tsc --noEmit
eslint .
vitest run
```

**Checklist:**

- [ ] Git branch strategy documented
- [ ] Commit convention established
- [ ] Rollback commands documented for each level
- [ ] Checkpoint tags created at each milestone
- [ ] Each checkpoint verified (tsc, vitest, eslint)
- [ ] Gradual rollout strategy defined
- [ ] Feature flag approach documented (if runtime changes)
- [ ] Rollback decision matrix created
- [ ] Post-refactoring cleanup planned
- [ ] Documentation updates listed
