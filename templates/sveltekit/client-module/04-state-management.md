# Phase 4: State Management

Implement the module's state management using Svelte stores with proper update functions and loading/error handling.

## Objectives

- Create a writable store with the defined structure
- Implement update functions (don't export raw store mutations)
- Include loading and error state management
- Follow immutable update patterns

## Store Implementation Pattern

### store.ts Full Structure

```typescript
import { writable, derived, type Writable, type Readable } from 'svelte/store';
import type {
  ModuleStoreData,
  ModuleEntityType,
  ModuleFilters,
  ModuleStatusType
} from './types';

// =============================================================================
// Store Type (always use type, never interface)
// =============================================================================

type ModuleStore = {
  // Primary data
  data: ModuleStoreData;

  // Loading states
  isLoaded: boolean;
  showLoader: boolean;

  // Error handling
  error: string | null;
};

// =============================================================================
// Initial State
// =============================================================================

const initialState: ModuleStore = {
  data: {
    items: [],
    selectedItem: null,
    filters: {}
  },
  isLoaded: false,
  showLoader: false,
  error: null
};

// =============================================================================
// Store Creation
// =============================================================================

const moduleStore: Writable<ModuleStore> = writable(initialState);

// Export store for external access (read-only pattern preferred)
export default moduleStore;

// =============================================================================
// Loading State Functions
// =============================================================================

/**
 * Set the loading state for the module
 */
export function setLoadingState(isLoading: boolean): void {
  moduleStore.update(state => ({
    ...state,
    showLoader: isLoading
  }));
}

/**
 * Mark the module as loaded
 */
export function setLoaded(): void {
  moduleStore.update(state => ({
    ...state,
    isLoaded: true,
    showLoader: false
  }));
}

// =============================================================================
// Error State Functions
// =============================================================================

/**
 * Set an error state
 */
export function setError(error: string): void {
  moduleStore.update(state => ({
    ...state,
    error,
    showLoader: false
  }));
}

/**
 * Clear the error state
 */
export function clearError(): void {
  moduleStore.update(state => ({
    ...state,
    error: null
  }));
}

// =============================================================================
// Data Update Functions
// =============================================================================

/**
 * Set the items list
 */
export function setItems(items: ModuleEntityType[]): void {
  moduleStore.update(state => ({
    ...state,
    data: {
      ...state.data,
      items
    },
    isLoaded: true,
    error: null
  }));
}

/**
 * Add a single item to the list
 */
export function addItem(item: ModuleEntityType): void {
  moduleStore.update(state => ({
    ...state,
    data: {
      ...state.data,
      items: [...state.data.items, item]
    }
  }));
}

/**
 * Update an existing item by ID
 */
export function updateItem(id: string, changes: Partial<ModuleEntityType>): void {
  moduleStore.update(state => ({
    ...state,
    data: {
      ...state.data,
      items: state.data.items.map(item =>
        item.id === id ? { ...item, ...changes } : item
      )
    }
  }));
}

/**
 * Remove an item by ID
 */
export function removeItem(id: string): void {
  moduleStore.update(state => ({
    ...state,
    data: {
      ...state.data,
      items: state.data.items.filter(item => item.id !== id),
      selectedItem: state.data.selectedItem?.id === id ? null : state.data.selectedItem
    }
  }));
}

// =============================================================================
// Selection Functions
// =============================================================================

/**
 * Select an item
 */
export function selectItem(item: ModuleEntityType | null): void {
  moduleStore.update(state => ({
    ...state,
    data: {
      ...state.data,
      selectedItem: item
    }
  }));
}

/**
 * Select an item by ID
 */
export function selectItemById(id: string): void {
  moduleStore.update(state => {
    const item = state.data.items.find(i => i.id === id) || null;
    return {
      ...state,
      data: {
        ...state.data,
        selectedItem: item
      }
    };
  });
}

// =============================================================================
// Filter Functions
// =============================================================================

/**
 * Update filters
 */
export function setFilters(filters: Partial<ModuleFilters>): void {
  moduleStore.update(state => ({
    ...state,
    data: {
      ...state.data,
      filters: {
        ...state.data.filters,
        ...filters
      }
    }
  }));
}

/**
 * Clear all filters
 */
export function clearFilters(): void {
  moduleStore.update(state => ({
    ...state,
    data: {
      ...state.data,
      filters: {}
    }
  }));
}

// =============================================================================
// Reset Function
// =============================================================================

/**
 * Reset the store to initial state
 */
export function resetStore(): void {
  moduleStore.set(initialState);
}

// =============================================================================
// Derived Stores (Optional)
// =============================================================================

/**
 * Derived store for filtered items
 */
export const filteredItems: Readable<ModuleEntityType[]> = derived(
  moduleStore,
  $store => {
    let items = $store.data.items;
    const filters = $store.data.filters;

    // Apply status filter
    if (filters.status) {
      items = items.filter(item => item.status === filters.status);
    }

    // Apply search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      items = items.filter(item =>
        // Adjust based on your entity's searchable fields
        item.id.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      items = [...items].sort((a, b) => {
        // Implement sorting logic based on sortBy field
        const order = filters.sortOrder === 'desc' ? -1 : 1;
        // Return comparison result * order
        return 0; // Implement actual comparison
      });
    }

    return items;
  }
);

/**
 * Derived store for item count
 */
export const itemCount: Readable<number> = derived(
  moduleStore,
  $store => $store.data.items.length
);
```

## Store Patterns

### Immutable Updates

Always create new objects when updating:

```typescript
// Correct - creates new object
moduleStore.update(state => ({
  ...state,
  data: { ...state.data, items: newItems }
}));

// Wrong - mutates existing state
moduleStore.update(state => {
  state.data.items = newItems; // Don't do this!
  return state;
});
```

### Atomic Updates

Combine related changes in single updates:

```typescript
// Good - single atomic update
moduleStore.update(state => ({
  ...state,
  data: { ...state.data, items },
  isLoaded: true,
  showLoader: false,
  error: null
}));

// Less optimal - multiple updates cause multiple re-renders
setItems(items);
setLoaded();
setLoadingState(false);
clearError();
```

### Type-Safe Updates

Leverage TypeScript for safety:

```typescript
export function updateItem(id: string, changes: Partial<ModuleEntityType>): void {
  // TypeScript ensures changes match the entity type
}
```

## Export Strategy

From store.ts, export:

- `default` - The store itself (for subscriptions)
- Named functions - For state mutations
- Derived stores - For computed values

Do NOT export:

- Raw `update` or `set` methods
- Internal helper functions

## Verification

Before moving to the next phase:

- [ ] Store is created with proper initial state
- [ ] Loading state functions are implemented
- [ ] Error state functions are implemented
- [ ] Data update functions use immutable patterns
- [ ] Selection functions are implemented
- [ ] Filter functions are implemented (if needed)
- [ ] Reset function is available
- [ ] Derived stores are created for computed values
- [ ] Export strategy follows the pattern
