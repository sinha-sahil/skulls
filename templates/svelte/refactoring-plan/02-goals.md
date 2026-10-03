# Phase 2: Goals

Define what the refactoring should achieve with measurable success criteria and
clear boundaries for what is in and out of scope.

## Objectives

- Establish concrete, measurable refactoring goals
- Define success criteria that can be verified programmatically
- Set scope boundaries to prevent scope creep
- Align goals with Svelte 5 best practices

## Step 1: Define Primary Goals

Select and customise the relevant goals for this refactoring:

### Goal: Migrate to `$props()` Rune

Replace all `export let` declarations with `$props()` destructuring.

```svelte
<!-- Target pattern for every component -->
<script lang="ts">
  type {{COMPONENT_NAME}}Props = {
    title: string;
    count?: number;
    variant?: 'default' | 'compact';
    onselect?: (item: Item) => void;
    children?: import('svelte').Snippet;
  };

  let {
    title,
    count = 0,
    variant = 'default',
    onselect,
    children,
  }: {{COMPONENT_NAME}}Props = $props();
</script>
```

**Success criteria:**
- [ ] Zero `export let` declarations remain
- [ ] Every component has a named `type` for its props
- [ ] All prop defaults preserved
- [ ] `pnpm check` passes with no type errors

### Goal: Migrate to `$state` and `$derived`

Replace mutable variables with `$state()` and reactive declarations with `$derived()`.

```svelte
<script lang="ts">
  // Mutable local state
  let count = $state(0);
  let items = $state<Item[]>([]);

  // Computed values
  let total = $derived(items.length);
  let filtered = $derived(items.filter(i => i.active));
  let summary = $derived(`${filtered.length} of ${total} items`);
</script>
```

**Success criteria:**
- [ ] Zero `$:` reactive declarations remain (use `$derived`)
- [ ] All mutable state uses `$state()`
- [ ] `pnpm check` passes

### Goal: Migrate to `$effect`

Replace reactive statements with side effects to `$effect()`.

```svelte
<script lang="ts">
  let { query }: { query: string } = $props();
  let results = $state<SearchResult[]>([]);

  $effect(() => {
    if (query.length < 2) return;

    const controller = new AbortController();
    fetch(`/api/search?q=${query}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => { results = data; });

    return () => controller.abort();
  });
</script>
```

**Success criteria:**
- [ ] Zero `$:` side-effect statements remain
- [ ] All effects have proper cleanup where needed
- [ ] No unnecessary effects (prefer `$derived` for pure computations)
- [ ] `pnpm check` passes

### Goal: Replace Slots with Snippets

Migrate all `<slot>` usage to snippet props.

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type CardProps = {
    title: string;
    header?: Snippet;
    children?: Snippet;
    footer?: Snippet<[actions: Action[]]>;
  };

  let { title, header, children, footer }: CardProps = $props();
</script>

<div class="card">
  <div class="card-header">
    {#if header}
      {@render header()}
    {:else}
      <h3>{title}</h3>
    {/if}
  </div>
  <div class="card-body">
    {#if children}{@render children()}{/if}
  </div>
  {#if footer}
    <div class="card-footer">{@render footer(actions)}</div>
  {/if}
</div>
```

**Success criteria:**
- [ ] Zero `<slot>` elements remain
- [ ] Zero `<svelte:fragment slot=...>` in consumers
- [ ] All snippet props properly typed
- [ ] `pnpm check` passes

### Goal: Replace Event Dispatchers with Callback Props

Remove `createEventDispatcher` in favour of direct callback props.

```svelte
<script lang="ts">
  type SelectableListProps = {
    items: Item[];
    onselect?: (item: Item) => void;
    ondelete?: (id: string) => void;
    onreorder?: (items: Item[]) => void;
  };

  let { items, onselect, ondelete, onreorder }: SelectableListProps = $props();
</script>

<ul>
  {#each items as item (item.id)}
    <li>
      <button onclick={() => onselect?.(item)}>{item.label}</button>
      <button onclick={() => ondelete?.(item.id)}>Remove</button>
    </li>
  {/each}
</ul>
```

**Success criteria:**
- [ ] Zero `createEventDispatcher` imports remain
- [ ] Zero `on:` directive event handlers remain (use `onclick`, `oninput`, etc.)
- [ ] All callback props are optional with `?`
- [ ] `pnpm check` passes

### Goal: Migrate Stores to Runes State

Replace Svelte store files with `.svelte.ts` runes-based state.

```typescript
// state.svelte.ts
let items = $state<Item[]>([]);
let isLoading = $state(false);
let error = $state<string | null>(null);
let count = $derived(items.length);

export function getItems(): Item[] { return items; }
export function getIsLoading(): boolean { return isLoading; }
export function getError(): string | null { return error; }
export function getCount(): number { return count; }

export async function loadItems(): Promise<void> {
  isLoading = true;
  error = null;
  try {
    const response = await fetch('/api/items');
    items = await response.json();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
  } finally {
    isLoading = false;
  }
}
```

**Success criteria:**
- [ ] Zero `writable()`, `readable()`, `derived()` store imports remain
- [ ] All state files use `.svelte.ts` extension
- [ ] All store subscriptions removed from components
- [ ] `pnpm check` passes

### Goal: Replace `interface` with `type`

```typescript
// BEFORE
export interface ButtonProps {
  label: string;
  variant: 'primary' | 'secondary';
}

// AFTER
export type ButtonProps = {
  label: string;
  variant: 'primary' | 'secondary';
};
```

**Success criteria:**
- [ ] Zero `interface` declarations remain
- [ ] All type definitions use `type` keyword
- [ ] `pnpm check` passes

## Step 2: Define Scope

### In Scope

- [ ] Components listed in the assessment
- [ ] Store files listed in the assessment
- [ ] Type files with `interface` declarations
- [ ] Consumer code that uses migrated components

### Out of Scope

- [ ] Third-party component wrappers (migrate separately)
- [ ] Build configuration changes
- [ ] New feature development
- [ ] Visual/styling changes
- [ ] Performance optimisation (separate effort)

## Step 3: Define Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| `export let` declarations | ? | 0 |
| `$:` reactive statements | ? | 0 |
| `<slot>` elements | ? | 0 |
| `createEventDispatcher` usage | ? | 0 |
| Legacy store imports | ? | 0 |
| `interface` declarations | ? | 0 |
| `pnpm check` errors | ? | 0 |
| `pnpm test` pass rate | ?% | 100% |

## Verification

Before moving to the next phase:

- [ ] All goals have measurable success criteria
- [ ] Scope boundaries clearly defined
- [ ] Success metrics table populated with current values
- [ ] Team agrees on priorities and scope
- [ ] Goals are achievable within the planned timeline
