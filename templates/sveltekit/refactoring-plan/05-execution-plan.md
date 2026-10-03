# Phase 5: Execution Plan

Step-by-step implementation plan for refactoring {{REFACTOR_SCOPE}} in {{PROJECT_NAME}}.

## Objectives

- Define discrete, testable refactoring steps
- Ensure the app passes `pnpm check` after every step
- Work route-by-route, shared components first
- Each step produces a clean commit

## Pre-Execution Setup

```bash
# Create refactoring branch
git checkout -b {{BRANCH_NAME}}

# Verify baseline passes
pnpm check && pnpm lint && pnpm test && pnpm build

# Record baseline metrics
echo "Baseline error count:"
pnpm check 2>&1 | tail -5
```

## Step 1: Type-Only Changes (No Runtime Impact)

### 1a. Replace `interface` with `type`

Process one file at a time. Start with leaf files (no dependents).

```bash
# Get list of files to process
grep -rln "^export interface\|^interface " src/ --include="*.ts" --include="*.svelte" | sort

# After each file: verify
pnpm check
```

**Order:** `$lib/types/` → `$lib/server/` → `$lib/client/` → `src/routes/`

### 1b. Add Load Function Types

```typescript
// For each +page.server.ts without types:
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  // existing logic
};

// For each +layout.server.ts:
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // existing logic
};

// For each +page.ts:
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, fetch }) => {
  // existing logic
};
```

```bash
pnpm check  # Verify after each file
git commit -m "refactor: add load function types for [route]"
```

### 1c. Replace `any` Types

For each `any` found, determine the correct type:

```typescript
// Common replacements
type JsonValueType = string | number | boolean | null | JsonValueType[] | { [key: string]: JsonValueType };

// For API responses, define specific types
type ApiResponseType<T> = {
  data: T;
  error: string | null;
  status: number;
};

// For unknown data from external sources
function processExternal(data: unknown): string {
  if (typeof data === 'string') return data;
  return String(data);
}
```

```bash
pnpm check
git commit -m "refactor: eliminate any types in [scope]"
```

## Step 2: Server-Side Error Handling

### 2a. Standardise Load Function Errors

```typescript
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const item = await db.item.findUnique({ where: { id: params.id } });

  if (!item) {
    error(404, { message: 'Item not found' });
  }

  return { item };
};
```

### 2b. Standardise Form Action Errors

```typescript
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name');

    if (!name || typeof name !== 'string') {
      return fail(400, { name: '', error: 'Name is required' });
    }

    try {
      const item = await db.item.create({ data: { name } });
      redirect(303, `/items/${item.id}`);
    } catch (e) {
      return fail(500, { name, error: 'Failed to create item' });
    }
  }
} satisfies Actions;
```

```bash
pnpm check && pnpm test
git commit -m "refactor: standardise error handling in [scope]"
```

## Step 3: Component Internals (Per-Component)

Process each component in dependency order: leaf components first, then parents.

### 3a. Migrate Props (`export let` → `$props`)

```svelte
<!-- Process one component at a time -->
<script lang="ts">
  // Step 1: Define Props type
  type Props = {
    title: string;
    count?: number;
    items: string[];
  };

  // Step 2: Replace export let with $props
  let { title, count = 0, items }: Props = $props();

  // Step 3: Remove any leftover export let lines
</script>
```

### 3b. Migrate Reactive Declarations

```svelte
<script lang="ts">
  // Replace $: assignments with $derived
  // Replace $: statements/blocks with $effect
  // Replace $: if with $effect + if
</script>
```

### 3c. Migrate Lifecycle

```svelte
<script lang="ts">
  // Replace onMount + onDestroy pair with single $effect
  // Replace onMount (no cleanup) with $effect
</script>
```

```bash
# After EACH component:
pnpm check
git commit -m "refactor: migrate [ComponentName] to Svelte 5 patterns"
```

## Step 4: Cross-Cutting Changes

### 4a. Migrate Stores (One Store File at a Time)

1. Rename `store.ts` → `store.svelte.ts`
2. Replace store primitives with runes
3. Update all consumers
4. Verify: `pnpm check && pnpm test`
5. Commit

### 4b. Migrate Slots to Snippets

1. Update component to use Snippet props
2. Update all parent components that pass slot content
3. Verify: `pnpm check`
4. Commit

### 4c. Migrate Events to Callback Props

1. Replace createEventDispatcher with callback prop types
2. Update all parent components that listen to events
3. Verify: `pnpm check`
4. Commit

## Step 5: Route-by-Route Verification

After all component-level changes, verify each route:

```bash
# For each route directory in src/routes/
pnpm check
pnpm test -- --grep "[route-name]"
# Manual smoke test in browser
```

## Step 6: Final Verification

```bash
pnpm check    # Zero errors
pnpm lint     # Zero warnings
pnpm test     # All pass
pnpm build    # Clean build

# Verify no legacy patterns remain
grep -rn "^interface \|^export interface " src/ --include="*.ts" --include="*.svelte"
grep -rn "from 'svelte/store'" src/
grep -rn "createEventDispatcher" src/
grep -rn "<slot" src/ --include="*.svelte"
grep -rn ": any\b" src/ --include="*.ts" --include="*.svelte"
```

## Checklist

- [ ] Branch created from latest main
- [ ] Baseline verification passes
- [ ] Step 1: All type-only changes committed
- [ ] Step 2: Error handling standardised
- [ ] Step 3: Components migrated (leaf → parent order)
- [ ] Step 4: Stores, slots, and events migrated
- [ ] Step 5: Route-by-route verification complete
- [ ] Step 6: Final verification passes with zero legacy patterns
- [ ] All changes committed with descriptive messages
- [ ] PR opened for review
