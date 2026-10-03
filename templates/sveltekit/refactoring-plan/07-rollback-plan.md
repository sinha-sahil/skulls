# Phase 7: Rollback Plan

Safety nets and revert procedures for refactoring {{REFACTOR_SCOPE}} in {{PROJECT_NAME}}.

## Objectives

- Define rollback procedures for each refactoring phase
- Establish git-based recovery strategies
- Plan gradual rollout with route-level feature flags
- Set clear criteria for when to rollback vs push forward

## Git-Based Rollback Strategy

### Branch Structure

```bash
# Main refactoring branch
git checkout -b {{BRANCH_NAME}}

# For high-risk changes, create sub-branches
git checkout -b {{BRANCH_NAME}}/store-migration
# Complete and verify, then merge back
git checkout {{BRANCH_NAME}}
git merge {{BRANCH_NAME}}/store-migration
```

### Commit Granularity

Each commit should be independently revertable:

```bash
# Good commit granularity
git log --oneline {{BRANCH_NAME}}
# a1b2c3d refactor: migrate Counter.svelte to $props and $state
# d4e5f6a refactor: migrate Card.svelte slots to snippets
# g7h8i9j refactor: replace interface with type in $lib/types/
# k0l1m2n refactor: add PageServerLoad types to /items route

# Revert a specific change
git revert a1b2c3d  # Reverts Counter migration only
```

### Full Phase Rollback

```bash
# Tag before each major phase
git tag pre-phase-a  # Before type-only changes
git tag pre-phase-b  # Before server changes
git tag pre-phase-c  # Before component changes
git tag pre-phase-d  # Before cross-cutting changes

# Rollback to before a phase
git checkout {{BRANCH_NAME}}
git reset --hard pre-phase-c  # Rollback phases C and D
```

### Emergency Rollback to Main

```bash
# If everything goes wrong, abandon the branch
git checkout main
git branch -D {{BRANCH_NAME}}

# Or if already merged, revert the merge commit
git revert -m 1 <merge-commit-hash>
```

## Route-Level Feature Flags

For gradual rollout of refactored code alongside old code:

### Flag Configuration

```typescript
// src/lib/server/features.ts
type FeatureFlagType = {
  name: string;
  enabled: boolean;
  routes: string[];
  description: string;
};

const flags: FeatureFlagType[] = [
  {
    name: 'refactored-items',
    enabled: false,
    routes: ['/items', '/items/[id]'],
    description: 'Use refactored items components',
  },
  {
    name: 'refactored-auth',
    enabled: false,
    routes: ['/login', '/register', '/profile'],
    description: 'Use refactored auth flow',
  },
];

export function isFeatureEnabled(name: string): boolean {
  const flag = flags.find((f) => f.name === name);
  return flag?.enabled ?? false;
}
```

### Using Flags in Components

```svelte
<!-- src/routes/items/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  import ItemsListLegacy from '$lib/client/components/legacy/ItemsList.svelte';
  import ItemsListRefactored from '$lib/client/components/ItemsList.svelte';

  type Props = { data: PageData };
  let { data }: Props = $props();
</script>

{#if data.features.refactoredItems}
  <ItemsListRefactored items={data.items} />
{:else}
  <ItemsListLegacy items={data.items} />
{/if}
```

### Using Flags in Load Functions

```typescript
// src/routes/items/+page.server.ts
import type { PageServerLoad } from './$types';
import { isFeatureEnabled } from '$lib/server/features';

export const load: PageServerLoad = async ({ locals }) => {
  const useRefactored = isFeatureEnabled('refactored-items');

  return {
    items: useRefactored
      ? await getItemsRefactored(locals.user)
      : await getItemsLegacy(locals.user),
    features: {
      refactoredItems: useRefactored,
    },
  };
};
```

## Gradual Rollout Strategy

### Phase 1: Internal Testing

```typescript
// Enable for development only
const flags = [
  {
    name: 'refactored-items',
    enabled: process.env.NODE_ENV === 'development',
    routes: ['/items'],
    description: 'Refactored items page',
  },
];
```

### Phase 2: Staged Rollout

```typescript
// Enable one route group at a time
// Week 1: Enable items
// Week 2: Enable auth
// Week 3: Enable remaining routes
```

### Phase 3: Full Rollout

```bash
# Once all routes verified:
# 1. Remove feature flag checks
# 2. Delete legacy components
# 3. Remove flag configuration
git commit -m "refactor: remove feature flags, delete legacy code"
```

## Rollback Decision Criteria

| Signal | Action |
|--------|--------|
| `pnpm check` fails after change | Revert the commit, fix, recommit |
| Tests fail after change | Revert, update tests or fix code |
| Build fails | Revert, investigate dependency issue |
| Runtime error in one route | Disable feature flag for that route |
| Widespread runtime errors | Revert entire phase via git tag |
| Performance regression | Profile, revert if > 10% degradation |

## Rollback Procedures by Phase

### Type Changes (Phase A)

**Risk:** Very low - no runtime impact.
**Rollback:** `git revert` specific commits. No feature flags needed.

### Server Changes (Phase B)

**Risk:** Low-medium - affects API responses.
**Rollback:** `git revert` or disable via feature flag per route.

### Component Changes (Phase C)

**Risk:** Medium - affects UI rendering.
**Rollback:** Feature flags to swap between old and new components.

### Cross-Cutting Changes (Phase D)

**Risk:** High - affects state management across routes.
**Rollback:** `git reset --hard pre-phase-d` if widespread issues.

## Post-Rollback Recovery

After any rollback:

```bash
# 1. Verify the rollback is clean
pnpm check && pnpm lint && pnpm test && pnpm build

# 2. Document what went wrong
# 3. Create a fix branch from the rolled-back state
git checkout -b {{BRANCH_NAME}}/fix-<issue>

# 4. Apply the fix and re-verify
# 5. Re-attempt the change with the fix included
```

## Checklist

- [ ] Git tags set before each major phase
- [ ] Commit granularity allows individual reverts
- [ ] Feature flag system implemented (if needed for gradual rollout)
- [ ] Rollback decision criteria documented
- [ ] Team knows how to trigger rollback
- [ ] Post-rollback recovery procedure documented
- [ ] Legacy code preserved until full rollout confirmed
- [ ] Monitoring in place to detect runtime regressions
