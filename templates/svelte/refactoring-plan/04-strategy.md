# Phase 4: Strategy

Choose the refactoring approach, define the migration order, and establish rules
for how the work will be carried out.

## Objectives

- Select the best refactoring strategy for the project scope
- Define component migration order based on dependencies and risk
- Establish rules for maintaining consistency during migration
- Plan for coexistence of legacy and modern patterns during transition

## Strategy Options

### Option A: Incremental (Recommended)

Migrate one component at a time, starting from leaf nodes. Each component is fully
migrated (props, state, slots, events) before moving to the next.

**Pros:** Low risk, easy rollback, continuous verification
**Cons:** Longer duration, temporary inconsistency between old and new patterns

**Best for:** Large projects, teams, components with many consumers

### Option B: Module-by-Module

Migrate entire feature modules at once. All components within a feature are
migrated together in a single effort.

**Pros:** Feature-level consistency, fewer intermediate states
**Cons:** Larger blast radius per step, harder to isolate failures

**Best for:** Feature-isolated projects, smaller modules

### Option C: Pattern-by-Pattern

Migrate one pattern across the entire codebase at a time (e.g., all `export let`
to `$props()` first, then all slots to snippets, etc.).

**Pros:** Pattern consistency across codebase, simpler find-and-replace
**Cons:** Components in mixed states, many files touched per pattern

**Best for:** Smaller projects with uniform component complexity

## Recommended: Incremental Strategy

### Migration Order Rules

1. **Leaf components first** - components with zero internal component dependencies
2. **Low risk before high risk** - simple components before complex ones
3. **Shared components before feature components** - update the library layer first
4. **Most consumers last** - layout wrappers and commonly-used components last

### Determining Migration Order

```bash
# Count how many other components each component imports
for file in $(find {{COMPONENT_DIR}} -name "*.svelte"); do
  name=$(basename "$file" .svelte)
  deps=$(grep -c "import.*from" "$file" 2>/dev/null || echo 0)
  consumers=$(grep -rl "$name" {{LIB_PATH}} --include="*.svelte" | wc -l)
  echo "$name: $deps deps, $consumers consumers"
done | sort -t: -k2 -n
```

### Example Migration Order

```text
Batch 1 (Leaf components, 0 internal deps):
  1. Icon        → Low risk, 0 component deps, 12 consumers
  2. Badge       → Low risk, 0 component deps, 8 consumers
  3. Spinner     → Low risk, 0 component deps, 6 consumers

Batch 2 (Simple composites, 1-2 deps):
  4. Button      → Low risk, depends on Icon
  5. Input       → Medium risk, has bind: usage
  6. Checkbox    → Medium risk, has bind: usage

Batch 3 (Complex composites, multiple deps):
  7. Modal       → Medium risk, has slots → snippets
  8. Dropdown    → High risk, slots + events + bind:
  9. DataTable   → High risk, many sub-components

Batch 4 (Layout/wrapper components):
  10. Card       → Medium risk, heavy slot usage, many consumers
  11. PageLayout → High risk, used everywhere
```

## Per-Component Migration Procedure

For each component, follow this exact order:

### Step 1: Props Migration

```svelte
<!-- Convert export let to $props() -->
<script lang="ts">
  // 1. Define the props type (always use type, never interface)
  type {{COMPONENT_NAME}}Props = {
    title: string;
    variant?: 'default' | 'compact';
    disabled?: boolean;
  };

  // 2. Destructure with defaults
  let { title, variant = 'default', disabled = false }: {{COMPONENT_NAME}}Props = $props();
</script>
```

### Step 2: State Migration

```svelte
<script lang="ts">
  // Convert let → $state for mutable values
  let isOpen = $state(false);
  let selectedIndex = $state(-1);
  let items = $state<Item[]>([]);
</script>
```

### Step 3: Reactivity Migration

```svelte
<script lang="ts">
  // Convert $: declarations → $derived
  let filteredItems = $derived(items.filter(i => !i.hidden));
  let hasSelection = $derived(selectedIndex >= 0);

  // Convert $: side effects → $effect
  $effect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
      return () => document.removeEventListener('keydown', handleKeydown);
    }
  });
</script>
```

### Step 4: Event Migration

```svelte
<script lang="ts">
  // Remove createEventDispatcher, add callback props
  type {{COMPONENT_NAME}}Props = {
    // ... existing props
    onselect?: (item: Item) => void;
    onclose?: () => void;
  };

  let { onselect, onclose, ...rest }: {{COMPONENT_NAME}}Props = $props();
</script>

<!-- Replace dispatch calls with direct invocations -->
<button onclick={() => onselect?.(item)}>Select</button>
<button onclick={onclose}>Close</button>
```

### Step 5: Slot Migration

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type {{COMPONENT_NAME}}Props = {
    // ... existing props
    header?: Snippet;
    children?: Snippet;
    actions?: Snippet<[item: Item]>;
  };

  let { header, children, actions, ...rest }: {{COMPONENT_NAME}}Props = $props();
</script>

<!-- Replace <slot> with {@render} -->
{#if header}{@render header()}{/if}
{#if children}{@render children()}{/if}
{#if actions}{@render actions(currentItem)}{/if}
```

### Step 6: Update Consumers

Update every consumer of this component to use the new API:

```svelte
<!-- Update event handlers -->
<!-- on:select → onselect -->
<!-- on:close → onclose -->

<!-- Update slot content to snippets -->
<!-- <svelte:fragment slot="header">...</svelte:fragment> → {#snippet header()}...{/snippet} -->

<!-- Ensure bind: props use $bindable() in the component -->
```

### Step 7: Verify

```bash
pnpm check && pnpm lint && pnpm test
```

## Coexistence Rules

During the migration period, both old and new patterns may coexist:

1. **Never mix patterns within a single component** - each component is fully
   migrated or fully legacy
2. **Update imports immediately** - don't leave dangling imports
3. **Mark migrated components** - use a comment or tracking document
4. **Don't refactor what isn't in scope** - resist the urge to fix unrelated issues

## Tracking Migration Progress

| Component | Props | State | Derived | Effects | Events | Slots | Consumers | Done |
|-----------|-------|-------|---------|---------|--------|-------|-----------|------|
| `Icon` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `Button` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `Modal` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

## Verification

Before moving to the next phase:

- [ ] Strategy chosen and documented
- [ ] Migration order determined (leaf → root)
- [ ] Risk levels confirmed for each component
- [ ] Per-component procedure understood
- [ ] Coexistence rules established
- [ ] Progress tracking mechanism in place
- [ ] Team aligned on approach
