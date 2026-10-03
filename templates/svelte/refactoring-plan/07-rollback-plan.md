# Phase 7: Rollback Plan

Prepare recovery procedures for when issues arise during refactoring, including
git strategies, feature flags, and partial rollback approaches.

## Objectives

- Ensure every migration step can be safely reversed
- Define rollback triggers and decision criteria
- Establish git branching strategy for safe migration
- Plan for partial rollbacks that don't undo all progress

## Git Strategy

### Branch Structure

```text
main (stable)
└── refactor/svelte5-migration (integration branch)
    ├── refactor/batch-1-foundation
    ├── refactor/batch-2-leaf-components
    ├── refactor/batch-3-simple-composites
    ├── refactor/batch-4-complex-composites
    └── refactor/batch-5-layout-wrappers
```

### Commit Conventions

Each component migration gets its own commit for granular rollback:

```bash
# One commit per component migration
git commit -m "refactor(Button): migrate to Svelte 5 runes

- Replace export let with \$props()
- Replace createEventDispatcher with callback props
- Replace <slot> with snippet props
- Update 12 consumer files
- All tests pass"

# One commit per store migration
git commit -m "refactor(itemState): migrate store to .svelte.ts runes

- Replace writable/derived with \$state/\$derived
- Export getter/setter functions
- Update 8 subscriber files
- All tests pass"
```

### Verification Before Each Commit

```bash
# Run full verification before committing
pnpm check && pnpm lint && pnpm test && git add -A && git commit -m "refactor(...): ..."
```

## Rollback Triggers

Define when to roll back vs push forward:

| Situation | Action | Reason |
|-----------|--------|--------|
| `pnpm check` fails after migration | Fix forward | Type errors are usually fixable |
| Tests fail for migrated component | Fix forward | Likely a migration mistake |
| Tests fail for unrelated component | **Roll back** | Migration has unexpected side effects |
| Runtime errors in browser | **Roll back** | Need investigation before proceeding |
| Build fails | **Roll back** | SSR/bundling issue needs investigation |
| Performance regression | **Roll back** | Runes issue needs profiling |

## Rollback Procedures

### Level 1: Single Component Rollback

Revert the last component migration:

```bash
# Identify the commit to revert
git log --oneline -5

# Revert a single component migration
git revert HEAD --no-edit

# Verify the revert
pnpm check && pnpm lint && pnpm test
```

### Level 2: Batch Rollback

Revert an entire batch of migrations:

```bash
# Find the commit before the batch started
git log --oneline -20

# Revert all commits in the batch (in reverse order)
git revert HEAD~5..HEAD --no-edit

# Or reset to the pre-batch state (if not yet pushed)
git reset --hard <pre-batch-commit>

# Verify
pnpm check && pnpm lint && pnpm test
```

### Level 3: Full Rollback

Abandon the migration branch entirely:

```bash
# Switch back to main
git checkout main

# Delete the migration branch (if needed)
git branch -D refactor/svelte5-migration

# Start fresh if needed
git checkout -b refactor/svelte5-migration-v2
```

## Partial Rollback Patterns

### Rolling Back Slot-to-Snippet Migration

Snippets and slots cannot coexist in the same component. To roll back:

```svelte
<!-- Reverted: Back to slots -->
<script lang="ts">
  type {{COMPONENT_NAME}}Props = {
    title: string;
    // Remove snippet props, keep other rune migrations
  };

  let { title }: {{COMPONENT_NAME}}Props = $props();
</script>

<!-- Back to slots (but keep $props) -->
<div class="card">
  <slot name="header" />
  <slot />
  <slot name="footer" />
</div>
```

Note: You can keep `$props()` migration while reverting slots. These are independent.

### Rolling Back Event Migration

```svelte
<!-- Reverted: Back to dispatcher (but keep $props for non-event props) -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  type {{COMPONENT_NAME}}Props = {
    title: string;
    variant?: 'default' | 'compact';
    // Remove callback props from type
  };

  let { title, variant = 'default' }: {{COMPONENT_NAME}}Props = $props();
  const dispatch = createEventDispatcher<{ select: Item }>();
</script>
```

### Rolling Back Store Migration

If a `.svelte.ts` state file causes issues:

```typescript
// Revert: Restore original store file
// stores/itemStore.ts
import { writable, derived } from 'svelte/store';

export const items = writable<Item[]>([]);
export const itemCount = derived(items, $items => $items.length);

// Delete the .svelte.ts file
// Revert all subscriber updates
```

## Coexistence Compatibility Matrix

During partial rollback, verify which patterns can coexist:

| Pattern A | Pattern B | Can Coexist | Notes |
|-----------|-----------|-------------|-------|
| `$props()` | `export let` | No | Per-component, not per-prop |
| `$state` | `let` (mutable) | Yes | In same component |
| `$derived` | `$:` declaration | No | Per-component in Svelte 5 |
| `$effect` | `$:` statement | No | Per-component in Svelte 5 |
| Snippets | Slots | No | Per-component |
| Callback props | `createEventDispatcher` | Yes | Can mix in same component |
| `.svelte.ts` runes | `svelte/store` | Yes | Different files |

## Recovery Checklist Template

Use this after any rollback:

```markdown
## Rollback Report

### Trigger
- What failed: [description]
- Error message: [exact error]
- Affected component(s): [list]

### Action Taken
- Rollback level: [1/2/3]
- Commits reverted: [list]
- Branch state: [current commit hash]

### Root Cause
- [Analysis of what went wrong]

### Prevention
- [What to do differently on retry]

### Verification After Rollback
- [ ] `pnpm check` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` succeeds
- [ ] No runtime errors
```

## Pre-Migration Safety Checklist

Before starting any migration batch:

- [ ] All tests pass on current branch
- [ ] Branch is up to date with main
- [ ] Latest commit is pushed to remote
- [ ] Rollback procedure reviewed
- [ ] Team notified of migration in progress

## Verification

Before marking the refactoring plan as complete:

- [ ] Git branching strategy documented
- [ ] Commit conventions established
- [ ] Rollback triggers defined
- [ ] Rollback procedures for each level documented
- [ ] Partial rollback patterns available
- [ ] Coexistence compatibility matrix reviewed
- [ ] Recovery checklist template prepared
- [ ] Pre-migration safety checklist ready
- [ ] `pnpm check` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
