# Refactoring Plan Quick Reference

## Critical Rules

1. **Always use `type`, never `interface`**
2. **`$props()`** replaces `export let`
3. **`$state()`** replaces `writable()` and mutable variables
4. **`$derived()`** replaces `$:` reactive declarations
5. **`$effect()`** replaces `$:` reactive statements with side effects
6. **`$bindable()`** for two-way binding props
7. **Snippets** replace `<slot>` for content composition
8. **Callback props** replace `createEventDispatcher`

## Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{COMPONENT_NAME}}` | Component being refactored | `DataTable` |
| `{{LIB_PATH}}` | Library source path | `src/lib` |
| `{{COMPONENT_DIR}}` | Components directory | `src/lib/components` |
| `{{FEATURE_NAME}}` | Feature module name | `dashboard` |

## Svelte 5 Migration Patterns

### Props: `export let` → `$props()`

```svelte
<!-- BEFORE -->
<script lang="ts">
  export let title: string;
  export let count: number = 0;
  export let variant: 'primary' | 'secondary' = 'primary';
</script>

<!-- AFTER -->
<script lang="ts">
  type Props = {
    title: string;
    count?: number;
    variant?: 'primary' | 'secondary';
  };
  let { title, count = 0, variant = 'primary' }: Props = $props();
</script>
```

### Reactive Declarations: `$:` → `$derived()`

```svelte
<!-- BEFORE -->
<script lang="ts">
  export let items: Item[];
  $: total = items.length;
  $: filtered = items.filter(i => i.active);
  $: summary = `${filtered.length} of ${total}`;
</script>

<!-- AFTER -->
<script lang="ts">
  let { items }: { items: Item[] } = $props();
  let total = $derived(items.length);
  let filtered = $derived(items.filter(i => i.active));
  let summary = $derived(`${filtered.length} of ${total}`);
</script>
```

### Side Effects: `$:` → `$effect()`

```svelte
<!-- BEFORE -->
<script lang="ts">
  export let query: string;
  $: {
    fetch(`/api/search?q=${query}`).then(r => r.json()).then(data => results = data);
  }
</script>

<!-- AFTER -->
<script lang="ts">
  let { query }: { query: string } = $props();
  let results = $state<SearchResult[]>([]);
  $effect(() => {
    fetch(`/api/search?q=${query}`).then(r => r.json()).then(data => { results = data; });
  });
</script>
```

### Local State: `let` → `$state()`

```svelte
<!-- BEFORE -->
<script lang="ts">
  let count = 0;
  let items: Item[] = [];
</script>

<!-- AFTER -->
<script lang="ts">
  let count = $state(0);
  let items = $state<Item[]>([]);
</script>
```

### Events: `createEventDispatcher` → Callback Props

```svelte
<!-- BEFORE -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{ select: Item; close: void }>();
</script>
<button on:click={() => dispatch('select', item)}>Select</button>
<button on:click={() => dispatch('close')}>Close</button>

<!-- AFTER -->
<script lang="ts">
  let { onselect, onclose }: {
    onselect?: (item: Item) => void;
    onclose?: () => void;
  } = $props();
</script>
<button onclick={() => onselect?.(item)}>Select</button>
<button onclick={onclose}>Close</button>
```

### Slots → Snippets

```svelte
<!-- BEFORE -->
<div class="card">
  <slot name="header" />
  <slot />
  <slot name="actions" {item} />
</div>

<!-- Consumer BEFORE -->
<Card>
  <svelte:fragment slot="header"><h2>Title</h2></svelte:fragment>
  <p>Content</p>
  <svelte:fragment slot="actions" let:item>
    <button>{item.label}</button>
  </svelte:fragment>
</Card>

<!-- AFTER -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { header, children, actions }: {
    header?: Snippet;
    children?: Snippet;
    actions?: Snippet<[item: Item]>;
  } = $props();
</script>
<div class="card">
  {#if header}{@render header()}{/if}
  {#if children}{@render children()}{/if}
  {#if actions}{@render actions(item)}{/if}
</div>

<!-- Consumer AFTER -->
<Card>
  {#snippet header()}<h2>Title</h2>{/snippet}
  <p>Content</p>
  {#snippet actions(item)}<button>{item.label}</button>{/snippet}
</Card>
```

### Stores → Runes State Files

```typescript
// BEFORE: store.ts
import { writable, derived } from 'svelte/store';
export const items = writable<Item[]>([]);
export const count = derived(items, $i => $i.length);

// AFTER: state.svelte.ts
let items = $state<Item[]>([]);
let count = $derived(items.length);
export function getItems(): Item[] { return items; }
export function getCount(): number { return count; }
export function setItems(newItems: Item[]): void { items = newItems; }
```

## Detection Commands

```bash
# Find legacy patterns
grep -rn "export let" {{LIB_PATH}} --include="*.svelte"           # → $props()
grep -rn "^\s*\$:" {{LIB_PATH}} --include="*.svelte"              # → $derived/$effect
grep -rn "createEventDispatcher" {{LIB_PATH}} --include="*.svelte" # → callback props
grep -rn "<slot" {{LIB_PATH}} --include="*.svelte"                 # → snippets
grep -rn "writable\|readable" {{LIB_PATH}} --include="*.ts"       # → $state
grep -rn "interface " {{LIB_PATH}} --include="*.ts"                # → type
```

## Checklist

- [ ] Legacy patterns detected and catalogued
- [ ] Refactoring goals defined with success criteria
- [ ] Impact analysis complete
- [ ] Strategy chosen (incremental recommended)
- [ ] Execution order determined (leaf components first)
- [ ] Testing strategy defined
- [ ] Rollback plan documented
- [ ] `pnpm check` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
