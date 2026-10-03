# Phase 4: Strategy

Define the refactoring approach and patterns for {{REFACTOR_SCOPE}} in {{PROJECT_NAME}}.

## Objectives

- Choose between incremental and big-bang refactoring
- Document before/after code patterns for each migration
- Establish the order of operations
- Set ground rules for the refactoring process

## Approach: Incremental Refactoring

Refactor in small, verified steps. Each change must pass `pnpm check` before proceeding.
Never mix refactoring with feature work in the same commit.

**Branch strategy:**
```bash
git checkout -b {{BRANCH_NAME}}
# Work in small commits, each passing verification
# Merge via pull request with review
```

## Migration Patterns

### Pattern 1: `interface` → `type`

```typescript
// BEFORE
interface PageDataType {
  title: string;
  items: ItemType[];
}

interface ItemType {
  id: string;
  name: string;
}

// AFTER
type ItemType = {
  id: string;
  name: string;
};

type PageDataType = {
  title: string;
  items: ItemType[];
};
```

**When extending types:**
```typescript
// BEFORE
interface BaseType {
  id: string;
}
interface UserType extends BaseType {
  name: string;
}

// AFTER
type BaseType = {
  id: string;
};

type UserType = BaseType & {
  name: string;
};
```

### Pattern 2: Store → $state Rune

```typescript
// BEFORE - src/lib/stores/counter.ts
import { writable, derived } from 'svelte/store';

export const count = writable(0);
export const doubled = derived(count, ($c) => $c * 2);

export function increment() {
  count.update((n) => n + 1);
}

// AFTER - src/lib/stores/counter.svelte.ts
let count = $state(0);
let doubled = $derived(count * 2);

export function getCount() {
  return count;
}

export function getDoubled() {
  return doubled;
}

export function increment() {
  count += 1;
}
```

**Consumer migration:**
```svelte
<!-- BEFORE -->
<script lang="ts">
  import { count, doubled, increment } from '$lib/stores/counter';
</script>
<p>{$count} (doubled: {$doubled})</p>
<button on:click={increment}>+1</button>

<!-- AFTER -->
<script lang="ts">
  import { getCount, getDoubled, increment } from '$lib/stores/counter.svelte';
</script>
<p>{getCount()} (doubled: {getDoubled()})</p>
<button onclick={increment}>+1</button>
```

### Pattern 3: Slots → Snippets

```svelte
<!-- BEFORE - Card.svelte -->
<div class="card">
  <div class="header"><slot name="header" /></div>
  <div class="body"><slot /></div>
  <div class="footer"><slot name="footer" /></div>
</div>

<!-- AFTER - Card.svelte -->
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
  <div class="header">
    {#if header}{@render header()}{/if}
  </div>
  <div class="body">{@render children()}</div>
  <div class="footer">
    {#if footer}{@render footer()}{/if}
  </div>
</div>
```

### Pattern 4: createEventDispatcher → Callback Props

```svelte
<!-- BEFORE -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  type Events = {
    save: { id: string; data: string };
    cancel: void;
  };

  const dispatch = createEventDispatcher<Events>();
</script>
<button on:click={() => dispatch('save', { id: '1', data: 'test' })}>Save</button>
<button on:click={() => dispatch('cancel')}>Cancel</button>

<!-- AFTER -->
<script lang="ts">
  type Props = {
    onsave: (payload: { id: string; data: string }) => void;
    oncancel: () => void;
  };

  let { onsave, oncancel }: Props = $props();
</script>
<button onclick={() => onsave({ id: '1', data: 'test' })}>Save</button>
<button onclick={oncancel}>Cancel</button>
```

### Pattern 5: $: Reactive → $derived / $effect

```svelte
<!-- BEFORE -->
<script lang="ts">
  export let items: string[];
  $: count = items.length;
  $: isEmpty = count === 0;
  $: {
    if (isEmpty) {
      console.log('No items');
    }
  }
</script>

<!-- AFTER -->
<script lang="ts">
  type Props = { items: string[] };
  let { items }: Props = $props();

  let count = $derived(items.length);
  let isEmpty = $derived(count === 0);

  $effect(() => {
    if (isEmpty) {
      console.log('No items');
    }
  });
</script>
```

### Pattern 6: onMount → $effect

```svelte
<!-- BEFORE -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let interval: ReturnType<typeof setInterval>;

  onMount(() => {
    interval = setInterval(() => { /* tick */ }, 1000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<!-- AFTER -->
<script lang="ts">
  $effect(() => {
    const interval = setInterval(() => { /* tick */ }, 1000);
    return () => clearInterval(interval);
  });
</script>
```

## Refactoring Order

```text
Phase A: Type-only changes (zero runtime risk)
  1. interface → type
  2. Add missing load function types
  3. Replace any with proper types

Phase B: Server-side changes (isolated, testable)
  4. Error handling standardisation (fail(), error())

Phase C: Component internals (contained changes)
  5. $: → $derived / $effect
  6. export let → $props()
  7. onMount/onDestroy → $effect

Phase D: Cross-cutting changes (highest risk)
  8. Stores → $state runes
  9. Slots → snippets
  10. createEventDispatcher → callback props
```

## Checklist

- [ ] Refactoring approach chosen (incremental recommended)
- [ ] All migration patterns documented with before/after
- [ ] Refactoring order defined respecting dependencies
- [ ] Branch strategy agreed upon
- [ ] Ground rules established (no mixing refactor + features)
- [ ] Each pattern verified with `pnpm check` in isolation
