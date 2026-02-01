# Phase 7: UI Components

Build self-contained Svelte components for the module's functionality.

## Objectives

- Create components that function independently
- Make components props-driven with minimal setup burden
- Integrate with module store internally
- Use event dispatching for parent communication

## Component Principles

1. **Self-Contained:** Components include all necessary logic
2. **Props-Driven:** All customization through props
3. **Store Integration:** Subscribe to module store internally
4. **Event Emission:** Use createEventDispatcher for communication
5. **No External Burden:** Importers shouldn't need complex setup

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
  import moduleStore from '../store';
  import { fetchItems } from '../remote';
  import ModuleList from './ModuleList.svelte';
  import ModuleLoader from './ModuleLoader.svelte';
  import ModuleEmpty from './ModuleEmpty.svelte';
  import type { ModuleEntityType } from '../types';

  // Props
  export let autoLoad = true;
  export let emptyMessage = 'No items found';

  // Store subscription
  $: ({ data, isLoaded, showLoader, error } = $moduleStore);
  $: items = data.items;

  // Lifecycle
  onMount(() => {
    if (autoLoad && !isLoaded) {
      fetchItems();
    }
  });

  // Event handlers
  function handleItemSelect(event: CustomEvent<ModuleEntityType>) {
    // Handle selection internally or dispatch to parent
  }
</script>

<div class="module-container">
  {#if showLoader}
    <ModuleLoader />
  {:else if error}
    <div class="error-state">
      <p>{error}</p>
      <button on:click={() => fetchItems()}>Retry</button>
    </div>
  {:else if items.length === 0}
    <ModuleEmpty message={emptyMessage} />
  {:else}
    <ModuleList {items} on:select={handleItemSelect} />
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
  import { createEventDispatcher } from 'svelte';
  import type { ModuleEntityType } from '../types';
  import ModuleItem from './ModuleItem.svelte';

  // Props
  export let items: ModuleEntityType[];
  export let selectedId: string | null = null;
  export let variant: 'default' | 'compact' = 'default';

  // Events
  const dispatch = createEventDispatcher<{
    select: ModuleEntityType;
  }>();

  function handleItemClick(item: ModuleEntityType) {
    dispatch('select', item);
  }
</script>

<ul class="module-list {variant}">
  {#each items as item (item.id)}
    <li>
      <ModuleItem
        {item}
        {variant}
        selected={item.id === selectedId}
        on:click={() => handleItemClick(item)}
      />
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

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ModuleEntityType, ModuleEventMap } from '../types';
  import { formatDate, formatStatus } from '../utils';

  // Props
  export let item: ModuleEntityType;
  export let variant: 'default' | 'compact' = 'default';
  export let selected = false;
  export let showActions = true;

  // Events
  const dispatch = createEventDispatcher<ModuleEventMap>();

  function handleAction(type: string) {
    dispatch('action', { type, data: item });
  }
</script>

<article
  class="module-item {variant}"
  class:selected
  on:click
  on:keypress
  role="button"
  tabindex="0"
>
  <div class="item-content">
    <h3 class="item-title">{item.id}</h3>
    <span class="item-status status-{item.status}">
      {formatStatus(item.status)}
    </span>
    <time class="item-date">{formatDate(item.createdAt)}</time>
  </div>

  {#if showActions && variant !== 'compact'}
    <div class="item-actions">
      <button on:click|stopPropagation={() => handleAction('edit')}>
        Edit
      </button>
      <button on:click|stopPropagation={() => handleAction('delete')}>
        Delete
      </button>
    </div>
  {/if}
</article>

<style>
  .module-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #ddd);
    border-radius: 0.5rem;
    cursor: pointer;
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
  }

  .item-title {
    margin: 0;
    font-size: 1rem;
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
  import { createEventDispatcher } from 'svelte';
  import type { ModuleEntityType, CreateModuleEntityRequest } from '../types';
  import { createItem, updateItemRemote } from '../remote';

  // Props
  export let item: ModuleEntityType | null = null;
  export let mode: 'create' | 'edit' = 'create';

  // Events
  const dispatch = createEventDispatcher<{
    submit: ModuleEntityType;
    cancel: void;
  }>();

  // Form state
  let formData = {
    name: item?.id || '',
    // Add other fields as needed
  };
  let isSubmitting = false;
  let errors: Record<string, string> = {};

  // Validation
  function validate(): boolean {
    errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    return Object.keys(errors).length === 0;
  }

  // Submit handler
  async function handleSubmit() {
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
        dispatch('submit', result);
      }
    } finally {
      isSubmitting = false;
    }
  }

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="module-form">
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
    <button type="button" on:click={handleCancel} disabled={isSubmitting}>
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
  export let message = 'Loading...';
</script>

<div class="loader">
  <div class="spinner" />
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
  export let message = 'No items found';
  export let showAction = false;
  export let actionLabel = 'Create New';
</script>

<div class="empty-state">
  <p>{message}</p>
  {#if showAction}
    <button on:click>
      {actionLabel}
    </button>
  {/if}
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

### Event Dispatching

```typescript
const dispatch = createEventDispatcher<{
  eventName: EventPayloadType;
}>();

dispatch('eventName', payload);
```

### Store Subscription

```typescript
import moduleStore from '../store';

// Reactive subscription
$: ({ data, showLoader } = $moduleStore);
```

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
- [ ] Components use props for customization
- [ ] Store subscription is handled internally
- [ ] Events are dispatched for parent communication
- [ ] Loading and error states are handled
- [ ] Components are accessible (keyboard, ARIA)
- [ ] Styles are scoped to components
