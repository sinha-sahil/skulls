# Phase 1: Code Style

Establish formatting, naming, component structure, and file conventions for
consistent Svelte 5 code across the project.

## Objectives

- Define the canonical component file structure
- Establish naming conventions for files, variables, and exports
- Set formatting rules compatible with automated tooling
- Create patterns that all team members follow

## Component File Structure

Every Svelte component follows this exact section order:

```svelte
<!-- Section 1: Module script (types and constants shared across instances) -->
<script lang="ts" module>
  import type { Snippet } from 'svelte';

  export type {{COMPONENT_NAME}}Props = {
    title: string;
    variant?: 'default' | 'compact';
    header?: Snippet;
    children?: Snippet;
    onaction?: (id: string) => void;
  };

  // Module-level constants (shared across all instances)
  const VARIANTS = ['default', 'compact'] as const;
</script>

<!-- Section 2: Instance script (props, state, logic) -->
<script lang="ts">
  // 2a. Props destructuring
  let {
    title,
    variant = 'default',
    header,
    children,
    onaction,
  }: {{COMPONENT_NAME}}Props = $props();

  // 2b. Local state ($state)
  let isExpanded = $state(false);
  let searchQuery = $state('');

  // 2c. Derived values ($derived)
  let isValid = $derived(title.length > 0);
  let displayTitle = $derived(isExpanded ? title.toUpperCase() : title);

  // 2d. Effects ($effect) - use sparingly
  $effect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  });

  // 2e. Functions
  function toggle(): void {
    isExpanded = !isExpanded;
  }

  function handleAction(id: string): void {
    onaction?.(id);
  }
</script>

<!-- Section 3: Markup -->
<div class="{{COMPONENT_NAME}} {variant}" class:expanded={isExpanded}>
  {#if header}
    <div class="header">{@render header()}</div>
  {:else}
    <h3>{displayTitle}</h3>
  {/if}

  {#if children}
    <div class="body">{@render children()}</div>
  {/if}

  <button onclick={toggle}>
    {isExpanded ? 'Collapse' : 'Expand'}
  </button>
</div>

<!-- Section 4: Styles (scoped by default) -->
<style>
  .expanded {
    border-color: var(--color-accent);
  }
</style>
```

## Script Organisation Rules

### Ordering Within `<script lang="ts">`

1. Props destructuring (`$props()`)
2. Local state (`$state()`)
3. Derived values (`$derived()`)
4. Effects (`$effect()`)
5. Helper functions
6. Event handlers

```svelte
<script lang="ts">
  // 1. Props
  let { items, onselect }: ListProps = $props();

  // 2. State
  let selectedIndex = $state(-1);
  let filter = $state('');

  // 3. Derived
  let filtered = $derived(items.filter(i => i.label.includes(filter)));
  let hasSelection = $derived(selectedIndex >= 0);

  // 4. Effects
  $effect(() => {
    // Reset selection when items change
    selectedIndex = -1;
  });

  // 5. Helpers
  function isSelected(index: number): boolean {
    return index === selectedIndex;
  }

  // 6. Event handlers
  function handleSelect(index: number): void {
    selectedIndex = index;
    onselect?.(filtered[index]);
  }
</script>
```

## Naming Conventions

### Files

| Category | Convention | Example |
|----------|-----------|---------|
| Component | PascalCase `.svelte` | `UserProfile.svelte` |
| Sub-component | ParentChild `.svelte` | `DataTableRow.svelte` |
| State file | camelCase `.svelte.ts` | `appState.svelte.ts` |
| Types | camelCase `.ts` | `userTypes.ts` |
| Utilities | camelCase `.ts` | `formatUtils.ts` |
| Constants | camelCase `.ts` | `themeConstants.ts` |
| Barrel export | `index.ts` | `index.ts` |

### Variables and Functions

```typescript
// Local state: camelCase, descriptive
let isLoading = $state(false);
let selectedItem = $state<Item | null>(null);
let errorMessage = $state('');

// Derived: camelCase, noun or adjective
let itemCount = $derived(items.length);
let isValid = $derived(name.length > 0);
let sortedItems = $derived([...items].sort((a, b) => a.order - b.order));

// Functions: camelCase, verb prefix
function handleClick(): void { /* ... */ }
function formatDate(date: Date): string { /* ... */ }
function validateInput(value: string): boolean { /* ... */ }

// Constants: UPPER_SNAKE_CASE for true constants
const MAX_ITEMS = 100;
const DEFAULT_VARIANT = 'primary' as const;
const VALID_STATES = ['idle', 'loading', 'error'] as const;
```

### Callback Props

```typescript
// Convention: on + action (all lowercase after 'on')
type Props = {
  onclick?: () => void;           // DOM event mirror
  onselect?: (item: Item) => void; // custom action
  onfilterchange?: (value: string) => void; // compound action
  ondismiss?: () => void;          // custom action
};
```

## Formatting Rules

### Prettier Configuration

```jsonc
// .prettierrc
{
  "useTabs": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-svelte"],
  "overrides": [
    { "files": "*.svelte", "options": { "parser": "svelte" } }
  ]
}
```

### Props Formatting

```svelte
<!-- Single prop: inline -->
<Button label="Save" />

<!-- 2-3 props: inline if fits in printWidth -->
<Button label="Save" variant="primary" onclick={handleSave} />

<!-- 4+ props or long values: one per line -->
<DataTable
  {items}
  columns={tableColumns}
  sortable
  onrowclick={handleRowClick}
  onselect={handleSelect}
/>
```

### Conditional Rendering

```svelte
<!-- Simple condition -->
{#if isVisible}
  <p>Content</p>
{/if}

<!-- If/else -->
{#if isLoading}
  <Spinner />
{:else if error}
  <ErrorMessage message={error} />
{:else}
  <Content {data} />
{/if}

<!-- Each blocks with key -->
{#each items as item (item.id)}
  <ListItem {item} onselect={() => handleSelect(item)} />
{/each}
```

## Anti-Patterns

### Never Do This

```svelte
<!-- WRONG: Using interface -->
<script lang="ts">
  interface Props { title: string; }
</script>

<!-- WRONG: Using export let -->
<script lang="ts">
  export let title: string;
</script>

<!-- WRONG: Using $: reactive declarations -->
<script lang="ts">
  $: doubled = count * 2;
</script>

<!-- WRONG: Using slots -->
<slot name="header" />

<!-- WRONG: Using createEventDispatcher -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<!-- WRONG: Using on: directive for custom events -->
<button on:click={handler}>Click</button>

<!-- WRONG: Using legacy store syntax -->
<script lang="ts">
  import { writable } from 'svelte/store';
</script>
```

## Verification

Before moving to the next phase:

- [ ] Component file structure template documented
- [ ] Script section ordering rules defined
- [ ] File naming conventions established
- [ ] Variable and function naming rules set
- [ ] Callback prop naming convention agreed
- [ ] Prettier configuration applied
- [ ] Markup formatting patterns documented
- [ ] Anti-patterns listed and communicated
- [ ] `pnpm check` passes
- [ ] `pnpm lint` passes
