# Phase 4: State Management

Implement the module's state in `store.svelte.ts` with Svelte 5 runes: module-level state, a read-only getter
object, and named functions that change the state.

## Objectives

- Hold each value in a module-level `$state` or `$state.raw` variable
- Expose state and computed values through one read-only getter object
- Change state only through exported functions that assign new values
- Compute values with `$derived`
- Include loading and error state

## Critical Rules

1. **Name the file `store.svelte.ts`.** Outside components, runes compile only in `.svelte.ts` and `.svelte.js`
   files.
2. **Never export a state variable.** Svelte can't export state that is reassigned, or any `$derived` value.
   Export a getter object that reads them.
3. **`$state.raw` for values replaced whole,** such as API lists and filter objects. `$state` for primitives.
4. **Assign new values.** `$state.raw` ignores mutation: `items.push(item)` changes nothing on screen.
5. **`$derived` for computed values.** No `$effect` or `$effect.pre`.
6. **Components read the getters directly:** `moduleStore.items`, never `$moduleStore`.

## Store Implementation Pattern

### store.svelte.ts Full Structure

The store imports `applyFilters` from `utils.ts`, which Phase 6 adds.

```typescript
import type { ModuleEntityType, ModuleFilters } from './types';
import { applyFilters } from './utils';

let items = $state.raw<ModuleEntityType[]>([]);
let selectedId = $state<string | null>(null);
let filters = $state.raw<ModuleFilters>({});
let isLoaded = $state(false);
let showLoader = $state(false);
let error = $state<string | null>(null);

const visibleItems = $derived(applyFilters(items, filters));
const selectedItem = $derived(items.find(item => item.id === selectedId) ?? null);
const itemCount = $derived(items.length);

export const moduleStore = {
  get items(): ModuleEntityType[] {
    return items;
  },
  get visibleItems(): ModuleEntityType[] {
    return visibleItems;
  },
  get selectedItem(): ModuleEntityType | null {
    return selectedItem;
  },
  get itemCount(): number {
    return itemCount;
  },
  get filters(): ModuleFilters {
    return filters;
  },
  get isLoaded(): boolean {
    return isLoaded;
  },
  get showLoader(): boolean {
    return showLoader;
  },
  get error(): string | null {
    return error;
  }
};

export function setLoadingState(isLoading: boolean): void {
  showLoader = isLoading;
}

export function setError(message: string): void {
  error = message;
  showLoader = false;
}

export function clearError(): void {
  error = null;
}

export function setItems(next: ModuleEntityType[]): void {
  items = next;
  isLoaded = true;
  error = null;
}

export function addItem(item: ModuleEntityType): void {
  items = [...items, item];
}

export function updateItem(id: string, changes: Partial<ModuleEntityType>): void {
  items = items.map(item => (item.id === id ? { ...item, ...changes } : item));
}

export function removeItem(id: string): void {
  items = items.filter(item => item.id !== id);
}

export function selectItem(id: string | null): void {
  selectedId = id;
}

export function setFilters(changes: Partial<ModuleFilters>): void {
  filters = { ...filters, ...changes };
}

export function clearFilters(): void {
  filters = {};
}

export function resetStore(): void {
  items = [];
  selectedId = null;
  filters = {};
  isLoaded = false;
  showLoader = false;
  error = null;
}
```

## Store Patterns

### Read-Only Getter Object

Every value a component reads, computed ones included, is a getter on `moduleStore`. A getter without a setter
blocks reassignment: TypeScript rejects `moduleStore.items = []`. It doesn't block mutation:
`moduleStore.items.push(item)` type-checks, changes the raw array and leaves the page stale. Never mutate a value a
getter returns; change state through the store's functions.

```typescript
// Correct - state read through a getter
let items = $state.raw<ModuleEntityType[]>([]);

export const moduleStore = {
  get items(): ModuleEntityType[] {
    return items;
  }
};

// Wrong - fails to compile: Svelte can't export state that is reassigned
export let items = $state.raw<ModuleEntityType[]>([]);
```

### Immutable Updates

Always assign a new value:

```typescript
// Correct - assigns a new array
items = [...items, item];

// Wrong - $state.raw ignores mutation, so nothing updates
items.push(item);
```

### Atomic Updates

Set everything that changes together in one function, so no caller can leave the state half-updated. Svelte
batches synchronous assignments into a single update.

```typescript
export function setItems(next: ModuleEntityType[]): void {
  items = next;
  isLoaded = true;
  error = null;
}
```

### Derived Values

Store the source and derive the rest. Keeping `selectedId` and deriving `selectedItem` means the selection never
holds a stale copy of an item.

```typescript
// Correct - recomputed when items or filters change
const visibleItems = $derived(applyFilters(items, filters));

// Wrong - an effect copying state into other state
let visibleItems = $state.raw<ModuleEntityType[]>([]);
$effect(() => {
  visibleItems = applyFilters(items, filters);
});
```

### Browser-Only Writes

Module-level state is shared by everything that imports it, and during server-side rendering by every request.
Write it only in the browser: from `onMount`, event handlers and the remote calls they start. Never from a `load`
function or a component's top-level script.

### Reading State

Read a getter where the value is used, in markup or in `$derived`, and it stays reactive:

```svelte
<script lang="ts">
  import { moduleStore } from '../store.svelte';
</script>

<p>{moduleStore.itemCount} items</p>
```

A copy never updates: `const { items } = moduleStore` and `$: items = moduleStore.items` read once. `$moduleStore`
throws, because the getter object is not a Svelte store.

## Export Strategy

From store.svelte.ts, export:

- `moduleStore` - The read-only getter object, derived values included
- Named functions - For state changes

Do NOT export:

- The `$state` and `$derived` variables
- Internal helper functions

## Verification

Before moving to the next phase:

- [ ] Store file is named `store.svelte.ts`
- [ ] Each value is a module-level `$state` (primitives) or `$state.raw` (replaced whole)
- [ ] One read-only getter object exposes every value components read
- [ ] Loading and error state functions are implemented
- [ ] Data update functions assign new values, never mutate
- [ ] Selection and filter functions are implemented (if needed)
- [ ] Reset function restores every value
- [ ] Computed values use `$derived`, with no `$effect` or `$effect.pre`
- [ ] State is written only in the browser
- [ ] Export strategy follows the pattern
