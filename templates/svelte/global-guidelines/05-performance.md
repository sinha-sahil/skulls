# Phase 5: Performance

Establish performance guidelines for Svelte 5 components including reactivity
efficiency, rendering optimisation, and bundle size management.

## Objectives

- Define rules for efficient use of Svelte 5 runes
- Establish rendering performance patterns
- Set guidelines for bundle size and code splitting
- Create measurable performance benchmarks

## Rune Efficiency Rules

### Rule 1: Prefer `$derived` Over `$effect` for Computations

`$derived` is synchronous and optimised by the compiler. `$effect` is asynchronous
and runs after rendering. Never use `$effect` for what `$derived` can do:

```svelte
<script lang="ts">
  let { items }: { items: Item[] } = $props();

  // CORRECT: $derived for pure computation
  let total = $derived(items.length);
  let sorted = $derived([...items].sort((a, b) => a.order - b.order));
  let grouped = $derived(
    items.reduce<Record<string, Item[]>>((acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    }, {})
  );

  // WRONG: $effect for computation (causes extra render cycle)
  let total_wrong = $state(0);
  $effect(() => { total_wrong = items.length; }); // Never do this
</script>
```

### Rule 2: Minimise `$effect` Usage

Every `$effect` is a potential source of re-render cascades. Use only for genuine
side effects:

```svelte
<script lang="ts">
  // VALID $effect uses:

  // 1. DOM manipulation
  $effect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => document.body.classList.remove('modal-open');
    }
  });

  // 2. External subscriptions
  $effect(() => {
    const subscription = eventSource.subscribe(handler);
    return () => subscription.unsubscribe();
  });

  // 3. Logging/analytics (fire-and-forget)
  $effect(() => {
    analytics.track('view', { page: currentPage });
  });
</script>
```

### Rule 3: Granular `$state` Updates

Update only what changed, not entire objects:

```svelte
<script lang="ts">
  type FormData = {
    name: string;
    email: string;
    age: number;
  };

  let form = $state<FormData>({ name: '', email: '', age: 0 });

  // CORRECT: Update specific field
  function updateName(name: string): void {
    form.name = name;
  }

  // LESS OPTIMAL: Replacing entire object
  function updateNameBad(name: string): void {
    form = { ...form, name }; // Creates new object, triggers more updates
  }
</script>
```

### Rule 4: Avoid Unnecessary `$state` Wrapping

Not every variable needs `$state`. Only wrap values that change and need to
trigger re-renders:

```svelte
<script lang="ts">
  let { items }: { items: Item[] } = $props();

  // CORRECT: Static helper doesn't need $state
  const formatter = new Intl.DateTimeFormat('en-GB');
  const MAX_VISIBLE = 50;

  // CORRECT: These change and affect the DOM
  let filter = $state('');
  let selectedId = $state<string | null>(null);

  // CORRECT: Derived from reactive sources
  let visible = $derived(
    items
      .filter(i => i.label.includes(filter))
      .slice(0, MAX_VISIBLE)
  );
</script>
```

## Rendering Performance

### Key-Based Each Blocks

Always provide a key expression for `{#each}` to enable efficient DOM diffing:

```svelte
<!-- CORRECT: Keyed each block -->
{#each items as item (item.id)}
  <ListItem {item} />
{/each}

<!-- WRONG: Unkeyed each block (full re-render on change) -->
{#each items as item}
  <ListItem {item} />
{/each}
```

### Conditional Rendering vs CSS Visibility

```svelte
<!-- Use {#if} for content that is rarely shown (avoids DOM overhead) -->
{#if showDetails}
  <DetailPanel {data} />
{/if}

<!-- Use CSS for content that toggles frequently (avoids mount/unmount cost) -->
<div class="details" class:hidden={!showDetails}>
  <DetailPanel {data} />
</div>

<style>
  .hidden { display: none; }
</style>
```

### Heavy Computation in $derived

For expensive computations, consider whether the derivation needs to run
on every dependency change:

```svelte
<script lang="ts">
  let { items, sortKey, filterQuery }: ListProps = $props();

  // This runs every time items, sortKey, OR filterQuery changes
  let processed = $derived(
    items
      .filter(i => i.label.toLowerCase().includes(filterQuery.toLowerCase()))
      .sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey])))
  );

  // For very large datasets, consider splitting derivations:
  let filtered = $derived(
    items.filter(i => i.label.toLowerCase().includes(filterQuery.toLowerCase()))
  );
  let sorted = $derived(
    [...filtered].sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey])))
  );
  // filtered recomputes only when items or filterQuery changes
  // sorted recomputes when filtered or sortKey changes
</script>
```

## Lazy Loading and Code Splitting

### Dynamic Component Imports

```svelte
<script lang="ts">
  let { view }: { view: 'chart' | 'table' | 'grid' } = $props();

  // Lazy load heavy components
  const components = {
    chart: () => import('./ChartView.svelte'),
    table: () => import('./TableView.svelte'),
    grid: () => import('./GridView.svelte'),
  };

  let Component = $state<typeof import('*.svelte').default | null>(null);

  $effect(() => {
    components[view]().then(mod => { Component = mod.default; });
  });
</script>

{#if Component}
  <svelte:component this={Component} />
{:else}
  <Spinner />
{/if}
```

### Image and Asset Optimisation

```svelte
<script lang="ts" module>
  export type ImageProps = {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    loading?: 'lazy' | 'eager';
  };
</script>

<script lang="ts">
  let {
    src,
    alt,
    width,
    height,
    loading = 'lazy',
  }: ImageProps = $props();
</script>

<img {src} {alt} {width} {height} {loading} decoding="async" />
```

## Bundle Size Guidelines

### Import Only What You Need

```typescript
// CORRECT: Named imports
import { formatDate, formatCurrency } from '$lib/utils/format';

// WRONG: Default import of entire module
import * as utils from '$lib/utils';
```

### Barrel Export Best Practices

```typescript
// components/index.ts
// Only export components that are part of the public API
export { Button } from './Button';
export { Input } from './Input';

// Don't re-export internal sub-components
// export { ButtonIcon } from './Button'; // internal detail
```

## Performance Checklist

| Area | Check | Priority |
|------|-------|----------|
| Runes | No `$effect` used for computations | High |
| Runes | `$derived` used for all computed values | High |
| Runes | `$state` only for values that change | Medium |
| Rendering | All `{#each}` blocks have keys | High |
| Rendering | Heavy components lazy-loaded | Medium |
| Bundle | Named imports only | Medium |
| Bundle | No re-export of internal components | Low |
| Images | `loading="lazy"` on below-fold images | Medium |

## Verification

Before moving to the next phase:

- [ ] Rune efficiency rules documented and followed
- [ ] No `$effect` used for pure computations
- [ ] All `{#each}` blocks have key expressions
- [ ] Lazy loading used for heavy components
- [ ] Bundle imports optimised (named imports)
- [ ] Performance checklist available for code reviews
- [ ] `pnpm check` passes
- [ ] `pnpm build` produces reasonable bundle size
