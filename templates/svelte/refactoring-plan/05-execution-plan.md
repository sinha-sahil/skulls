# Phase 5: Execution Plan

Order the work into concrete steps with priorities, milestones, and verification
checkpoints for each batch of component migrations.

## Objectives

- Break migration into manageable batches with clear milestones
- Define the exact sequence of operations for each component
- Establish verification checkpoints between batches
- Plan for parallel work where possible

## Batch Structure

Organise components into ordered batches based on the strategy phase:

### Batch 1: Foundation (Shared Types and State)

Before touching components, migrate shared infrastructure:

#### 1a. Replace `interface` with `type`

```bash
# Find all interface declarations
grep -rn "^export interface\|^interface" {{LIB_PATH}} --include="*.ts"
```

For each file:

```typescript
// BEFORE
export interface BaseEntity {
  id: string;
  createdAt: string;
}

// AFTER
export type BaseEntity = {
  id: string;
  createdAt: string;
};
```

- [ ] All `interface` declarations replaced with `type`
- [ ] `pnpm check` passes

#### 1b. Migrate Store Files to Runes State

For each store file:

```typescript
// BEFORE: stores/itemStore.ts
import { writable, derived } from 'svelte/store';

export const items = writable<Item[]>([]);
export const itemCount = derived(items, $items => $items.length);
export const isLoading = writable(false);

// AFTER: state/itemState.svelte.ts
let items = $state<Item[]>([]);
let itemCount = $derived(items.length);
let isLoading = $state(false);

export function getItems(): Item[] { return items; }
export function getItemCount(): number { return itemCount; }
export function getIsLoading(): boolean { return isLoading; }

export function setItems(newItems: Item[]): void {
  items = newItems;
}

export function addItem(item: Item): void {
  items.push(item);
}

export function removeItem(id: string): void {
  items = items.filter(i => i.id !== id);
}

export async function loadItems(): Promise<void> {
  isLoading = true;
  try {
    const response = await fetch('/api/items');
    items = await response.json();
  } finally {
    isLoading = false;
  }
}
```

Update all subscribers:

```svelte
<!-- BEFORE -->
<script lang="ts">
  import { items, itemCount } from '../stores/itemStore';
</script>
<p>{$itemCount} items</p>
{#each $items as item}...{/each}

<!-- AFTER -->
<script lang="ts">
  import { getItems, getItemCount } from '../state/itemState.svelte';
</script>
<p>{getItemCount()} items</p>
{#each getItems() as item}...{/each}
```

- [ ] All store files migrated to `.svelte.ts`
- [ ] All store subscribers updated
- [ ] `pnpm check` passes
- [ ] `pnpm test` passes

### Batch 2: Leaf Components

Migrate components with zero internal dependencies:

For each leaf component, execute the full migration procedure:

```text
1. Create props type (type, not interface)
2. Replace export let with $props()
3. Replace let with $state() for mutable values
4. Replace $: with $derived() for computed values
5. Replace $: side effects with $effect()
6. Replace createEventDispatcher with callback props
7. Replace <slot> with snippet props
8. Update all consumers
9. Verify: pnpm check && pnpm lint && pnpm test
10. Commit
```

#### Example: Migrating a Button Component

```svelte
<!-- BEFORE: Button.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let label: string;
  export let variant: 'primary' | 'secondary' = 'primary';
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher<{ click: void }>();
  let isPressed = false;
</script>

<button
  class="btn btn-{variant}"
  {disabled}
  on:click={() => dispatch('click')}
  on:mousedown={() => isPressed = true}
  on:mouseup={() => isPressed = false}
>
  <slot>{label}</slot>
</button>
```

```svelte
<!-- AFTER: Button.svelte -->
<script lang="ts" module>
  import type { Snippet } from 'svelte';

  export type ButtonProps = {
    label: string;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    onclick?: () => void;
    children?: Snippet;
  };
</script>

<script lang="ts">
  let {
    label,
    variant = 'primary',
    disabled = false,
    onclick,
    children,
  }: ButtonProps = $props();

  let isPressed = $state(false);
</script>

<button
  class="btn btn-{variant}"
  {disabled}
  {onclick}
  onmousedown={() => isPressed = true}
  onmouseup={() => isPressed = false}
>
  {#if children}
    {@render children()}
  {:else}
    {label}
  {/if}
</button>
```

Update consumers:

```svelte
<!-- BEFORE -->
<Button label="Save" variant="primary" on:click={handleSave}>
  <Icon name="save" /> Save
</Button>

<!-- AFTER -->
<Button label="Save" variant="primary" onclick={handleSave}>
  {#snippet children()}<Icon name="save" /> Save{/snippet}
</Button>
```

- [ ] All leaf components migrated
- [ ] All leaf component consumers updated
- [ ] `pnpm check` passes
- [ ] `pnpm test` passes

### Batch 3: Simple Composite Components

Components with 1-2 internal dependencies (already migrated in Batch 2):

- [ ] All simple composites migrated
- [ ] Consumers updated
- [ ] Verification passes

### Batch 4: Complex Composite Components

Components with multiple dependencies, heavy slot usage, or many consumers:

- [ ] All complex composites migrated
- [ ] Sub-components migrated as internal details
- [ ] Consumers updated
- [ ] Verification passes

### Batch 5: Layout and Wrapper Components

High-consumer-count components migrated last:

- [ ] Layout components migrated
- [ ] All consumers across the application updated
- [ ] Verification passes

## Milestone Checkpoints

| Milestone | Criteria | Verification |
|-----------|----------|-------------|
| M1: Foundation | Types + stores migrated | `pnpm check` + `pnpm test` |
| M2: Leaf nodes | All leaf components done | Full test suite |
| M3: Composites | All composite components done | Full test suite |
| M4: Layout | All layout/wrappers done | Full test suite + manual QA |
| M5: Complete | Zero legacy patterns remain | All detection scripts return 0 |

## Verification Script

Run after each batch to track progress:

```bash
#!/bin/bash
echo "=== Refactoring Progress ==="
echo "export let remaining: $(grep -rl 'export let' {{LIB_PATH}} --include='*.svelte' | wc -l)"
echo "\$: remaining:         $(grep -rl '^\s*\$:' {{LIB_PATH}} --include='*.svelte' | wc -l)"
echo "slots remaining:      $(grep -rl '<slot' {{LIB_PATH}} --include='*.svelte' | wc -l)"
echo "dispatchers remaining:$(grep -rl 'createEventDispatcher' {{LIB_PATH}} --include='*.svelte' | wc -l)"
echo "stores remaining:     $(grep -rl 'writable\|readable' {{LIB_PATH}} --include='*.ts' | wc -l)"
echo "interfaces remaining: $(grep -rl '^interface\|^export interface' {{LIB_PATH}} --include='*.ts' | wc -l)"
echo ""
pnpm check && echo "Type check: PASS" || echo "Type check: FAIL"
pnpm lint && echo "Lint: PASS" || echo "Lint: FAIL"
pnpm test && echo "Tests: PASS" || echo "Tests: FAIL"
```

## Verification

Before moving to the next phase:

- [ ] Batches defined with clear component assignments
- [ ] Migration order respects dependency chain
- [ ] Each batch has a verification checkpoint
- [ ] Milestones defined with measurable criteria
- [ ] Progress tracking script prepared
- [ ] Estimated timeline for each batch documented
