# Client Module Quick Reference

## Critical Rules

1. **Always use `type`, never `interface`**
2. **Check for type-crafter** before creating types manually
3. **Check for typesafe-api-call** for API calls (recommended)
4. **Only create types manually** if they contain functions or type-crafter unavailable
5. **Detect project utilities** (network, logger) as fallback if typesafe-api-call unavailable

## Module Structure

```text
src/lib/client/modules/[module-name]/
├── index.ts      # Minimal exports only
├── remote.ts     # API calls (typesafe-api-call recommended)
├── store.ts      # Svelte stores + update functions
├── types.ts      # Types + decoders (if manual)
├── utils.ts      # Internal helpers (not exported)
└── ui/
    ├── index.ts  # Component exports
    └── *.svelte  # Components
```

## Utility Detection

```bash
# Check for type-crafter (for types + decoders)
grep -q "type-crafter" package.json && echo "type-crafter available"

# Check for typesafe-api-call (recommended for API calls)
grep -q "typesafe-api-call" package.json && echo "typesafe-api-call available"

# Fallback: Check for custom network utilities
grep -r "NetworkController\|ApiClient\|httpClient" src/

# Check for logger
grep -r "appLogger\|logger\|Logger" src/
```

## Key Imports

```typescript
// Svelte stores (always needed)
import { writable, type Writable } from 'svelte/store';

// typesafe-api-call (recommended for API calls)
import { APICaller, APISuccess, type APIRequest } from 'typesafe-api-call';

// Generated types + decoders (if type-crafter available)
import { decodeEntityType, type EntityType } from '$generated/types';
```

## Store Pattern

```typescript
// Always use type, never interface
type ModuleStore = {
  data: DataType | null;
  isLoaded: boolean;
  showLoader: boolean;
  error: string | null;
};

const store: Writable<ModuleStore> = writable({
  data: null,
  isLoaded: false,
  showLoader: false,
  error: null
});

export default store;

export function updateData(data: DataType): void {
  store.update(s => ({ ...s, data, isLoaded: true, error: null }));
}
```

## Remote Pattern (typesafe-api-call - Recommended)

```typescript
import { APICaller, APISuccess, type APIRequest } from 'typesafe-api-call';
import { decodeEntityList } from '$generated/types';  // Or manual decoder

function constructUrl(path: string): URL | null {
  try {
    return new URL(path, window.location.origin);
  } catch {
    return null;
  }
}

export async function fetchData(): Promise<void> {
  const url = constructUrl('/api/resource');
  if (url === null) {
    setError('Invalid URL');
    return;
  }

  try {
    setLoadingState(true);

    const request: APIRequest = { method: 'GET', url };
    const response = await APICaller.call(request, decodeEntityList);

    if (response instanceof APISuccess) {
      setItems(response.response);
    } else {
      setError(response.error?.message || 'Failed');
    }
  } finally {
    setLoadingState(false);
  }
}
```

## Remote Pattern (native fetch - Fallback)

```typescript
export async function fetchData(): Promise<void> {
  try {
    setLoadingState(true);
    const response = await fetch('/api/resource');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    updateData(data);
  } catch (error) {
    console.error('[fetchData]', error);
    setError(error instanceof Error ? error.message : 'Failed');
  } finally {
    setLoadingState(false);
  }
}
```

## Manual Decoder Pattern (if no type-crafter)

```typescript
function decodeEntity(data: unknown): EntityType | null {
  if (typeof data !== 'object' || data === null) return null;
  const obj = data as Record<string, unknown>;
  if (typeof obj.id !== 'string') return null;
  // ... validate other fields
  return obj as EntityType;
}
```

## Component Pattern

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ItemType } from '../types';
  import store from '../store';

  export let item: ItemType;
  export let variant: 'default' | 'compact' = 'default';

  const dispatch = createEventDispatcher<{
    select: ItemType;
    action: { type: string; data: unknown };
  }>();
</script>
```

## index.ts Exports

```typescript
export * from './types';
export { functionName } from './store';
export * from './ui';
export { specificRemoteFunction } from './remote';
```

## Type-Crafter Check

```bash
grep -q "type-crafter" package.json && echo "Use type-crafter"
```

**Can be generated:** Entity types, store data, filters, unions, decoder functions
**Must be manual:** Types with functions (callbacks, event maps)

## API Priority

1. **typesafe-api-call** (recommended) - with decoder functions
2. **Custom network utility** (fallback) - NetworkController, etc.
3. **Native fetch** (last resort)

## Principles Checklist

- [ ] Checked for type-crafter before creating types
- [ ] Checked for typesafe-api-call before implementing API calls
- [ ] All types use `type`, not `interface`
- [ ] Decoder functions available for typesafe-api-call
- [ ] Module functions independently
- [ ] Single responsibility scope
- [ ] Minimal exports in index.ts
- [ ] Loading/error states implemented
- [ ] Components are self-contained
- [ ] No utils.ts functions exported externally
