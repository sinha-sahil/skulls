# Global Guidelines Quick Reference

## Critical Rules

1. **Always use `type`, never `interface`**
2. **`$props()`** for all component inputs
3. **`$state()`** for all mutable local state
4. **`$derived()`** for all computed values
5. **`$effect()`** only for side effects (use sparingly)
6. **Snippets** replace slots for content composition
7. **Callback props** replace `createEventDispatcher`
8. **TypeScript** in all script blocks (`lang="ts"`)

## Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_ROOT}}` | Project root directory | `./` |
| `{{LIB_PATH}}` | Library source path | `src/lib` |
| `{{COMPONENT_DIR}}` | Components directory | `src/lib/components` |
| `{{COMPONENT_NAME}}` | Component name (PascalCase) | `DataTable` |
| `{{FEATURE_NAME}}` | Feature module name | `dashboard` |

## Component Structure Template

```svelte
<script lang="ts" module>
  import type { Snippet } from 'svelte';

  export type {{COMPONENT_NAME}}Props = {
    // Required props first
    title: string;
    items: Item[];
    // Optional props with defaults
    variant?: 'default' | 'compact';
    disabled?: boolean;
    // Snippet props
    header?: Snippet;
    children?: Snippet;
    row?: Snippet<[item: Item]>;
    // Callback props
    onselect?: (item: Item) => void;
    onchange?: (value: string) => void;
  };
</script>

<script lang="ts">
  let {
    title,
    items,
    variant = 'default',
    disabled = false,
    header,
    children,
    row,
    onselect,
    onchange,
  }: {{COMPONENT_NAME}}Props = $props();

  let selectedId = $state<string | null>(null);
  let filtered = $derived(items.filter(i => i.active));
</script>
```

## Rune Patterns

### $props() with Defaults

```svelte
<script lang="ts">
  type Props = {
    label: string;
    count?: number;
    variant?: 'primary' | 'secondary';
  };
  let { label, count = 0, variant = 'primary' }: Props = $props();
</script>
```

### $bindable() for Two-Way Binding

```svelte
<script lang="ts">
  type Props = { value: string };
  let { value = $bindable('') }: Props = $props();
</script>
<input bind:value />
```

### $state() for Local State

```svelte
<script lang="ts">
  let count = $state(0);
  let items = $state<Item[]>([]);
  let selected = $state<Item | null>(null);
</script>
```

### $derived() for Computed Values

```svelte
<script lang="ts">
  let total = $derived(items.length);
  let filtered = $derived(items.filter(i => i.active));
  let summary = $derived(`${filtered.length} of ${total}`);
</script>
```

### $effect() for Side Effects

```svelte
<script lang="ts">
  $effect(() => {
    const controller = new AbortController();
    fetch(`/api/search?q=${query}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => { results = data; });
    return () => controller.abort();
  });
</script>
```

## Snippet Patterns

### Basic Snippet Props

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { header, children, footer }: {
    header?: Snippet;
    children?: Snippet;
    footer?: Snippet;
  } = $props();
</script>

{#if header}{@render header()}{/if}
{#if children}{@render children()}{/if}
{#if footer}{@render footer()}{/if}
```

### Typed Snippet Props

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { row }: { row?: Snippet<[item: Item, index: number]> } = $props();
</script>

{#each items as item, i}
  {#if row}{@render row(item, i)}{/if}
{/each}
```

### Consumer Usage

```svelte
<Card title="Example">
  {#snippet header()}<h2>Custom Header</h2>{/snippet}
  <p>Default content goes here</p>
  {#snippet footer()}<button>Save</button>{/snippet}
</Card>
```

## Callback Props Pattern

```svelte
<!-- Component -->
<script lang="ts">
  let { onselect, ondelete }: {
    onselect?: (item: Item) => void;
    ondelete?: (id: string) => void;
  } = $props();
</script>
<button onclick={() => onselect?.(item)}>Select</button>
<button onclick={() => ondelete?.(item.id)}>Delete</button>

<!-- Consumer -->
<ItemList onselect={handleSelect} ondelete={handleDelete} />
```

## Type Conventions

```typescript
// Always use type, never interface
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  onclick?: () => void;
};

// Intersection types for composition
type WithLoading = { isLoading?: boolean };
type DataTableProps = BaseTableProps & WithLoading;

// Utility types
type Nullable<T> = T | null;
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

## Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Components | PascalCase `.svelte` | `DataTable.svelte` |
| State files | camelCase `.svelte.ts` | `appState.svelte.ts` |
| Type files | camelCase `.ts` | `tableTypes.ts` |
| Props types | PascalCase + `Props` | `DataTableProps` |
| Callback props | `on` + lowercase | `onselect`, `onchange` |
| State getters | `get` + PascalCase | `getItems()` |
| State setters | `set` + PascalCase | `setItems()` |

## Checklist

- [ ] All components use `$props()` (no `export let`)
- [ ] All mutable state uses `$state()`
- [ ] All computed values use `$derived()`
- [ ] Side effects use `$effect()` with cleanup
- [ ] All content composition uses snippets (no slots)
- [ ] All events use callback props (no dispatchers)
- [ ] All types use `type` keyword (no `interface`)
- [ ] TypeScript in all script blocks
- [ ] Props types exported from module script
- [ ] `pnpm check` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
