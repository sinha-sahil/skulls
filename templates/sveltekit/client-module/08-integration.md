# Phase 8: Integration

Finalize the module's public interface and verify independence.

## Objectives

- Configure exports in index.ts for external consumption
- Test module independence
- Document integration patterns
- Verify all components work together

## Final index.ts Configuration

```typescript
// =============================================================================
// Module: [module-name]
// Description: [Brief description of what this module does]
// =============================================================================

// -----------------------------------------------------------------------------
// Type Exports
// Export types that external modules need for type safety
// -----------------------------------------------------------------------------
export type {
  ModuleEntityType,
  ModuleStatusType,
  ModuleFilters,
  CreateModuleEntityRequest,
  UpdateModuleEntityRequest
} from './types';

// -----------------------------------------------------------------------------
// Store Exports
// Export the getter object (derived values included) and the functions other code calls
// -----------------------------------------------------------------------------
export { moduleStore, resetStore } from './store.svelte';

// -----------------------------------------------------------------------------
// Remote Exports
// Export API functions that might be called externally
// -----------------------------------------------------------------------------
export {
  fetchItems,
  createItem,
  deleteItem
  // Only export what's needed externally
} from './remote';

// -----------------------------------------------------------------------------
// UI Component Exports
// Export all UI components for use in other parts of the application
// -----------------------------------------------------------------------------
export {
  ModuleContainer,
  ModuleList,
  ModuleItem,
  ModuleForm,
  ModuleLoader,
  ModuleEmpty
} from './ui';
```

## Export Guidelines

### What to Export

| Category | Export | Reason |
|----------|--------|--------|
| Types | Entity types | Type safety for consumers |
| Store | Getter object (`moduleStore`) | Read-only state and derived values |
| Store | Functions other code calls | Such as `resetStore` |
| Remote | Fetch functions | For manual refresh |
| Remote | CRUD functions | If called from outside |
| UI | All components | Primary module output |

### What NOT to Export

| Category | Do Not Export | Reason |
|----------|---------------|--------|
| Store | Internal update functions | Use via remote functions |
| Utils | Any utilities | Module-private |
| Remote | Internal helpers | Implementation detail |

## Integration Patterns

### Basic Usage

```typescript
// Import the container component
import { ModuleContainer } from '$client/modules/module-name';

// Use in a Svelte page/component
<ModuleContainer />
```

### With Store Access

Outside markup, a getter returns the value at the moment it is read:

```typescript
import { moduleStore, resetStore } from '$client/modules/module-name';

export function clearAfterError(): void {
  if (moduleStore.error !== null) {
    resetStore();
  }
}
```

The store has no `subscribe`. To act on a change, act where it happens: in the event handler or remote function
that makes it.

### Reading State in Svelte

```svelte
<script lang="ts">
  import { moduleStore } from '$client/modules/module-name';
</script>

{#if moduleStore.showLoader}
  <p>Loading...</p>
{:else}
  <p>Found {moduleStore.itemCount} items</p>
{/if}
```

Read getters in markup or `$derived`, where they stay reactive. A destructured copy never updates.

### Manual Data Fetching

```typescript
import { fetchItems, createItem } from '$client/modules/module-name';

// Trigger refresh
await fetchItems();

// Create new item
const newItem = await createItem({
  name: 'New Item',
  data: { /* ... */ }
});
```

### Individual Component Usage

```svelte
<script lang="ts">
  import { ModuleItem, moduleStore, type ModuleEntityType } from '$client/modules/module-name';

  let selectedId = $state<string | null>(null);

  function handleSelect(item: ModuleEntityType) {
    selectedId = item.id;
  }
</script>

{#each moduleStore.items as item (item.id)}
  <ModuleItem {item} variant="compact" selected={item.id === selectedId} onselect={handleSelect} />
{/each}
```

## Independence Testing

### Checklist

Verify the module works independently:

- [ ] Module can be imported without errors
- [ ] Components render without external setup
- [ ] Store initializes with default values
- [ ] API calls work (with mocked backend if needed)
- [ ] No circular dependencies
- [ ] No missing imports

### Test in Isolation

Create a test page to verify:

```svelte
<!-- src/routes/test/module-name/+page.svelte -->
<script lang="ts">
  import { ModuleContainer } from '$client/modules/module-name';
</script>

<h1>Module Test Page</h1>
<ModuleContainer />
```

### Verify Imports

```bash
# Check for import errors
pnpm check

# Run linter
pnpm lint
```

## Documentation

Add a brief README inside the module if needed:

```markdown
# Module Name

Brief description of what this module does.

## Usage

\`\`\`svelte
<script>
  import { ModuleContainer } from '$client/modules/module-name';
</script>

<ModuleContainer />
\`\`\`

## Components

- `ModuleContainer` - Main wrapper with auto-loading
- `ModuleList` - List display
- `ModuleItem` - Individual item

## Store

Read `moduleStore` getters, such as `moduleStore.items`, for reactive data access.

## API

- `fetchItems()` - Load items from API
- `createItem(request)` - Create new item
```

## Final Verification

Before marking the module complete:

- [ ] index.ts exports are minimal and intentional
- [ ] All exported types are documented
- [ ] Module imports work from `$client/modules/module-name`
- [ ] Components render correctly in isolation
- [ ] Store updates propagate to components
- [ ] API calls update store correctly
- [ ] No console errors or warnings
- [ ] TypeScript types are correct
- [ ] Linting passes
- [ ] Module functions without external dependencies

## Integration Complete

The module is ready for use when:

1. All files are in place following the structure
2. Exports are configured in index.ts
3. The module works independently
4. Other parts of the application can import and use it

```typescript
// The module is now ready to use
import {
  ModuleContainer,
  moduleStore,
  fetchItems,
  type ModuleEntityType
} from '$client/modules/module-name';
```
