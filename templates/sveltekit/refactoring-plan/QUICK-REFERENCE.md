# Refactoring Plan Quick Reference

## Critical Rules

1. **Always use `type`, never `interface`**
2. **Verify after every change** - `pnpm check && pnpm build && pnpm test`
3. **Commit frequently** - one logical change per commit
4. **Never refactor and add features simultaneously**
5. **Use Svelte 5 runes** when migrating reactive patterns

## Svelte 5 Migration Cheat Sheet

### State Management

```svelte
<!-- BEFORE (Svelte 4) -->
<script lang="ts">
  let count = 0;
  $: doubled = count * 2;
  $: if (count > 10) console.log('High count');
</script>

<!-- AFTER (Svelte 5) -->
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
  $effect(() => {
    if (count > 10) console.log('High count');
  });
</script>
```

### Props

```svelte
<!-- BEFORE (Svelte 4) -->
<script lang="ts">
  export let name: string;
  export let count: number = 0;
</script>

<!-- AFTER (Svelte 5) -->
<script lang="ts">
  type Props = {
    name: string;
    count?: number;
  };

  let { name, count = 0 }: Props = $props();
</script>
```

### Events

```svelte
<!-- BEFORE (Svelte 4) -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{ click: string }>();
</script>
<button on:click={() => dispatch('click', 'value')}>Click</button>

<!-- AFTER (Svelte 5) -->
<script lang="ts">
  type Props = {
    onclick: (value: string) => void;
  };

  let { onclick }: Props = $props();
</script>
<button onclick={() => onclick('value')}>Click</button>
```

### Slots to Snippets

```svelte
<!-- BEFORE (Svelte 4) -->
<div class="card">
  <slot name="header" />
  <slot />
  <slot name="footer" />
</div>

<!-- AFTER (Svelte 5) -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    header?: Snippet;
    children: Snippet;
    footer?: Snippet;
  };

  let { header, children, footer }: Props = $props();
</script>

<div class="card">
  {#if header}{@render header()}{/if}
  {@render children()}
  {#if footer}{@render footer()}{/if}
</div>
```

### Stores to Runes (Component-Level)

```typescript
// BEFORE (Svelte 4) - store.ts
import { writable } from 'svelte/store';
export const count = writable(0);

// AFTER (Svelte 5) - within a component or .svelte.ts file
let count = $state(0);
let doubled = $derived(count * 2);
```

## Common Refactoring Patterns

### Replace `interface` with `type`

```typescript
// BEFORE
interface UserProps {
  name: string;
  email: string;
}

// AFTER
type UserProps = {
  name: string;
  email: string;
};
```

### Extract Shared Component

```bash
# 1. Identify duplicated markup/logic across components
# 2. Create new component in $lib/client/components/
# 3. Replace duplicated code with component import
# 4. Verify each consuming component still works
```

### Consolidate API Routes

```typescript
// BEFORE: Multiple endpoint files with duplicated logic
// src/routes/api/users/+server.ts
// src/routes/api/admin/users/+server.ts

// AFTER: Shared service layer
// src/lib/server/services/userService.ts
export async function getUsers(filters: UserFiltersType) {
  return db.user.findMany({ where: filters });
}

// Both routes import from the service
import { getUsers } from '$lib/server/services/userService';
```

## Refactoring Sequence

```text
1. Types first (no runtime impact)
2. Shared utilities (low risk)
3. Server code (isolated)
4. Stores/state (needs testing)
5. Components (visible changes)
6. Routes (highest impact)
```

## Detection Commands

```bash
# Find interface usage (should be type)
grep -rn "^export interface\|^interface " src/ --include="*.ts" --include="*.svelte"

# Find legacy reactive declarations
grep -rn "^\s*\$:" src/ --include="*.svelte"

# Find createEventDispatcher (replace with callback props)
grep -rn "createEventDispatcher" src/ --include="*.svelte"

# Find old slot usage (replace with snippets)
grep -rn "<slot" src/ --include="*.svelte"

# Find any types
grep -rn ": any\b\|as any\b" src/ --include="*.ts" --include="*.svelte"

# Find export let (replace with $props)
grep -rn "export let " src/ --include="*.svelte"
```

## Verification Commands

```bash
pnpm check    # svelte-check for type errors
pnpm lint     # Linter for code issues
pnpm test     # Run test suite
pnpm build    # Production build verification
```

## Checklist

- [ ] Assessment complete - all refactoring targets identified
- [ ] Goals are measurable and prioritised
- [ ] Impact analysis maps all affected files
- [ ] Strategy chosen (incremental vs big-bang)
- [ ] Execution plan has discrete, testable steps
- [ ] Testing strategy covers each refactoring area
- [ ] Rollback plan documented for each step
- [ ] Verification passes at each step
