# Phase 7: UI Components

Build self-contained Svelte components for the module's functionality.

## Objectives

- Create components that function independently
- Make components props-driven with minimal setup burden
- Integrate with module store internally
- Report events to parents through callback props

## Component Principles

1. **Self-Contained:** Components include all necessary logic
2. **Props-Driven:** All customization through props
3. **Store Integration:** Read the module store's getters internally
4. **Callback Props:** Report events through callback props such as `onselect`
5. **No External Burden:** Importers shouldn't need complex setup
6. **Runes Only:** `$props()` with a named props type, `onclick` attributes and snippets. No `export let`, `$:`,
   `on:` directives, `<slot>`, `createEventDispatcher`, `$effect` or `tick()`

## Component Directory Structure

```text
ui/
├── index.ts              # Component exports
├── ModuleContainer.svelte    # Main wrapper component
├── ModuleList.svelte         # List display component
├── ModuleItem.svelte         # Individual item component
├── ModuleForm.svelte         # Create/edit form
├── ModuleLoader.svelte       # Loading state component
└── ModuleEmpty.svelte        # Empty state component
```

## Props Types

Each component's props are a named type in `types.ts`, destructured from `$props()`. Write every props type by
hand, composed from generated types (`item: ModuleEntityType`, `Pick<…>`): type-crafter can't express optional
keys. Events are callback props such as `onselect`, and content a parent can replace is a `Snippet`.

```typescript
import type { Snippet } from 'svelte';

export type ModuleContainerProps = {
  autoLoad?: boolean;
  emptyMessage?: string;
};

export type ModuleListProps = {
  items: ModuleEntityType[];
  selectedId?: string | null;
  variant?: 'default' | 'compact';
  onselect: (item: ModuleEntityType) => void;
  onaction?: (action: ModuleActionType, item: ModuleEntityType) => void;
};

export type ModuleItemProps = {
  item: ModuleEntityType;
  variant?: 'default' | 'compact';
  selected?: boolean;
  onselect: (item: ModuleEntityType) => void;
  onaction?: (action: ModuleActionType, item: ModuleEntityType) => void;
};

export type ModuleFormProps = {
  item?: ModuleEntityType | null;
  mode?: 'create' | 'edit';
  onsave: (item: ModuleEntityType) => void;
  oncancel: () => void;
};

export type ModuleLoaderProps = {
  message?: string;
};

export type ModuleEmptyProps = {
  message?: string;
  children?: Snippet;
};
```

## Component Templates

### ui/index.ts - Component Exports

```typescript
export { default as ModuleContainer } from './ModuleContainer.svelte';
export { default as ModuleList } from './ModuleList.svelte';
export { default as ModuleItem } from './ModuleItem.svelte';
export { default as ModuleForm } from './ModuleForm.svelte';
export { default as ModuleLoader } from './ModuleLoader.svelte';
export { default as ModuleEmpty } from './ModuleEmpty.svelte';
```

### ModuleContainer.svelte - Main Wrapper

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { moduleStore, selectItem } from '../store.svelte';
  import { deleteItem, fetchItems } from '../remote';
  import ModuleList from './ModuleList.svelte';
  import ModuleLoader from './ModuleLoader.svelte';
  import ModuleEmpty from './ModuleEmpty.svelte';
  import type { ModuleActionType, ModuleContainerProps, ModuleEntityType } from '../types';

  let { autoLoad = true, emptyMessage = 'No items found' }: ModuleContainerProps = $props();

  onMount(() => {
    if (autoLoad && !moduleStore.isLoaded) {
      fetchItems();
    }
  });

  function handleSelect(item: ModuleEntityType) {
    selectItem(item.id);
  }

  function handleAction(action: ModuleActionType, item: ModuleEntityType) {
    if (action === 'delete') {
      deleteItem(item.id);
      return;
    }
    selectItem(item.id);
  }
</script>

<div class="module-container">
  {#if moduleStore.showLoader}
    <ModuleLoader />
  {:else if moduleStore.error !== null}
    <div class="error-state">
      <p>{moduleStore.error}</p>
      <button onclick={() => fetchItems()}>Retry</button>
    </div>
  {:else if moduleStore.itemCount === 0}
    <ModuleEmpty message={emptyMessage} />
  {:else}
    <ModuleList
      items={moduleStore.items}
      selectedId={moduleStore.selectedItem?.id ?? null}
      onselect={handleSelect}
      onaction={handleAction}
    />
  {/if}
</div>

<style>
  .module-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .error-state {
    padding: 1rem;
    background: var(--color-error-bg, #fee);
    border-radius: 0.5rem;
    text-align: center;
  }
</style>
```

### ModuleList.svelte - List Display

```svelte
<script lang="ts">
  import type { ModuleListProps } from '../types';
  import ModuleItem from './ModuleItem.svelte';

  let { items, selectedId = null, variant = 'default', onselect, onaction }: ModuleListProps = $props();
</script>

<ul class={['module-list', variant]}>
  {#each items as item (item.id)}
    <li>
      <ModuleItem {item} {variant} selected={item.id === selectedId} {onselect} {onaction} />
    </li>
  {/each}
</ul>

<style>
  .module-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .module-list.compact {
    gap: 0.25rem;
  }
</style>
```

### ModuleItem.svelte - Individual Item

The selection button marks the selected item with `aria-current`. It isn't a toggle: pressing the selected item
again keeps it selected, so `aria-pressed` would announce the wrong state.

```svelte
<script lang="ts">
  import type { ModuleItemProps } from '../types';
  import { formatDate, formatStatus } from '../utils';

  let { item, variant = 'default', selected = false, onselect, onaction }: ModuleItemProps = $props();
</script>

<div class={['module-item', variant, { selected }]}>
  <button class="item-content" aria-current={selected} onclick={() => onselect(item)}>
    <span class="item-title">{item.id}</span>
    <span class="item-status status-{item.status}">
      {formatStatus(item.status)}
    </span>
    <time class="item-date">{formatDate(item.createdAt)}</time>
  </button>

  {#if onaction && variant !== 'compact'}
    <div class="item-actions">
      <button onclick={() => onaction('edit', item)}>
        Edit
      </button>
      <button onclick={() => onaction('delete', item)}>
        Delete
      </button>
    </div>
  {/if}
</div>

<style>
  .module-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #ddd);
    border-radius: 0.5rem;
    transition: background 0.2s;
  }

  .module-item:hover {
    background: var(--color-surface-hover, #f5f5f5);
  }

  .module-item.selected {
    border-color: var(--color-primary, #007bff);
    background: var(--color-primary-light, #e7f1ff);
  }

  .module-item.compact {
    padding: 0.5rem;
  }

  .item-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
    text-align: start;
    cursor: pointer;
  }

  .item-title {
    font-size: 1rem;
    font-weight: 600;
  }

  .item-status {
    font-size: 0.875rem;
    padding: 0.125rem 0.5rem;
    border-radius: 1rem;
  }

  .status-idle { background: #e0e0e0; }
  .status-loading { background: #fff3cd; }
  .status-success { background: #d4edda; }
  .status-error { background: #f8d7da; }

  .item-date {
    font-size: 0.875rem;
    color: var(--color-text-muted, #666);
  }

  .item-actions {
    display: flex;
    gap: 0.5rem;
  }
</style>
```

### ModuleForm.svelte - Create/Edit Form

```svelte
<script lang="ts">
  import { untrack } from 'svelte';
  import type { ModuleEntityType, CreateModuleEntityRequest, ModuleFormProps } from '../types';
  import { createItem, updateItemRemote } from '../remote';

  let { item = null, mode = 'create', onsave, oncancel }: ModuleFormProps = $props();

  let formData = $state({
    name: untrack(() => item?.id || ''),
    // Add other fields as needed
  });
  let isSubmitting = $state(false);
  let errors = $state<Record<string, string>>({});

  function validate(): boolean {
    errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!validate()) return;

    isSubmitting = true;
    try {
      let result: ModuleEntityType | null;

      if (mode === 'create') {
        result = await createItem(formData as CreateModuleEntityRequest);
      } else {
        result = await updateItemRemote({
          id: item!.id,
          changes: formData
        });
      }

      if (result) {
        onsave(result);
      }
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="module-form">
  <div class="form-field">
    <label for="name">Name</label>
    <input
      id="name"
      type="text"
      bind:value={formData.name}
      disabled={isSubmitting}
    />
    {#if errors.name}
      <span class="error">{errors.name}</span>
    {/if}
  </div>

  <!-- Add more form fields as needed -->

  <div class="form-actions">
    <button type="button" onclick={oncancel} disabled={isSubmitting}>
      Cancel
    </button>
    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
    </button>
  </div>
</form>

<style>
  .module-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .form-field label {
    font-weight: 500;
  }

  .form-field input {
    padding: 0.5rem;
    border: 1px solid var(--color-border, #ddd);
    border-radius: 0.25rem;
  }

  .form-field .error {
    color: var(--color-error, #dc3545);
    font-size: 0.875rem;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
</style>
```

### ModuleLoader.svelte - Loading State

```svelte
<script lang="ts">
  import type { ModuleLoaderProps } from '../types';

  let { message = 'Loading...' }: ModuleLoaderProps = $props();
</script>

<div class="loader">
  <div class="spinner"></div>
  <p>{message}</p>
</div>

<style>
  .loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    gap: 1rem;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid var(--color-border, #ddd);
    border-top-color: var(--color-primary, #007bff);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
```

### ModuleEmpty.svelte - Empty State

```svelte
<script lang="ts">
  import type { ModuleEmptyProps } from '../types';

  let { message = 'No items found', children }: ModuleEmptyProps = $props();
</script>

<div class="empty-state">
  <p>{message}</p>
  {@render children?.()}
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    text-align: center;
    color: var(--color-text-muted, #666);
  }
</style>
```

## Component Patterns

### Callback Props

A child reports an event by calling a callback prop, such as `onselect(item)`. The parent passes a function like
any other prop:

```svelte
<script lang="ts">
  import { moduleStore, selectItem } from '../store.svelte';
  import type { ModuleEntityType } from '../types';
  import ModuleList from './ModuleList.svelte';

  function handleSelect(item: ModuleEntityType) {
    selectItem(item.id);
  }
</script>

<ModuleList
  items={moduleStore.items}
  selectedId={moduleStore.selectedItem?.id ?? null}
  onselect={handleSelect}
/>
```

### Snippets

Content between a component's tags becomes its `children` snippet, which the component renders with
`{@render children?.()}`. Other replaceable regions are named `Snippet` props, passed with `{#snippet name()}`.

```svelte
<script lang="ts">
  import { fetchItems } from '../remote';
  import ModuleEmpty from './ModuleEmpty.svelte';
</script>

<ModuleEmpty message="No items yet">
  <button onclick={() => fetchItems()}>Reload</button>
</ModuleEmpty>
```

### Reading the Store

```svelte
<script lang="ts">
  import { moduleStore } from '../store.svelte';
  import ModuleLoader from './ModuleLoader.svelte';
</script>

{#if moduleStore.showLoader}
  <ModuleLoader />
{:else}
  <p>{moduleStore.itemCount} items</p>
{/if}
```

Read getters in markup or `$derived`, where they stay reactive. A copy made in the script, such as
`const { items } = moduleStore` or `let items = moduleStore.items`, never updates. `$moduleStore` throws: the getter
object is not a Svelte store.

### Conditional Rendering

```svelte
{#if condition}
  <ComponentA />
{:else if otherCondition}
  <ComponentB />
{:else}
  <ComponentC />
{/if}
```

## Verification

Before moving to the next phase:

- [ ] All planned components are created
- [ ] Components are exported from ui/index.ts
- [ ] Props come from `$props()`, typed by a named props type
- [ ] Components read store getters directly, without subscriptions or copies
- [ ] Events reach parents through callback props such as `onselect`
- [ ] No `export let`, `$:`, `on:` directives, `<slot>`, `createEventDispatcher`, `$effect` or `tick()`
- [ ] Loading and error states are handled
- [ ] Components are accessible (keyboard, ARIA)
- [ ] Styles are scoped to components
