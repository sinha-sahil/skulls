# Client Module Quick Reference

## Critical Rules

1. **Always use `type`, never `interface`**
2. **Check for type-crafter** before creating types manually
3. **Check for typesafe-api-call** for API calls (recommended)
4. **Create types manually** only for component props and types holding functions or snippets, or without
   type-crafter
5. **Detect project utilities** (network, logger) as fallback if typesafe-api-call unavailable
6. **Keep state in `store.svelte.ts`** - runes, a read-only getter object and named mutators; `$derived`, never `$effect`
7. **Write Svelte 5 components** - `$props()` with a named props type, callback props such as `onselect`,
   snippets and `onclick`

## Module Structure

```text
src/lib/client/modules/[module-name]/
├── index.ts         # Minimal exports only
├── remote.ts        # API calls (typesafe-api-call recommended)
├── store.svelte.ts  # Runes state: getter object + mutators
├── types.ts         # Types + decoders (if manual)
├── utils.ts         # Internal helpers (not exported)
└── ui/
    ├── index.ts     # Component exports
    └── *.svelte     # Components
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
// Module store (runes need no import, only the .svelte.ts file name)
import { moduleStore, setItems } from './store.svelte';

// typesafe-api-call (recommended for API calls)
import { APICaller, APISuccess, type APIRequest } from 'typesafe-api-call';

// Generated types + decoders (if type-crafter available)
import { decodeEntityType, type EntityType } from '$generated/types';
```

## Store Pattern

```typescript
// store.svelte.ts
import type { EntityType } from './types';

let items = $state.raw<EntityType[]>([]);
let isLoaded = $state(false);
let showLoader = $state(false);
let error = $state<string | null>(null);

const itemCount = $derived(items.length);

export const moduleStore = {
  get items(): EntityType[] {
    return items;
  },
  get itemCount(): number {
    return itemCount;
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

export function setItems(next: EntityType[]): void {
  items = next;
  isLoaded = true;
  error = null;
}

export function setLoadingState(isLoading: boolean): void {
  showLoader = isLoading;
}

export function setError(message: string): void {
  error = message;
  showLoader = false;
}
```

- `$state.raw` for values replaced whole, `$state` for primitives
- Functions assign new values; never `push` or write properties
- `$derived` for computed values, never `$effect`
- Components read `moduleStore.items` directly, never `$moduleStore`

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
    setItems(data);
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

```typescript
// types.ts - one named props type per component
import type { Snippet } from 'svelte';

export type EntityRowProps = {
  entity: EntityType;
  selected?: boolean;
  onselect: (entity: EntityType) => void;
  children?: Snippet;
};
```

```svelte
<!-- ui/EntityRow.svelte -->
<script lang="ts">
  import type { EntityRowProps } from '../types';

  let { entity, selected = false, onselect, children }: EntityRowProps = $props();
</script>

<div class={['entity-row', { selected }]}>
  <button aria-current={selected} onclick={() => onselect(entity)}>{entity.id}</button>
  {@render children?.()}
</div>
```

- Props: a named type destructured from `$props()`, never `export let`
- Events: callback props such as `onselect`, never `createEventDispatcher`
- DOM events: `onclick`, never `on:click`
- Content: snippets rendered with `{@render}`, never `<slot>`
- No `$:` or `$effect`: derive with `$derived`, load in `onMount`, react in event handlers
- No `tick()`: work on an element in an action (`use:`) on that element

## index.ts Exports

```typescript
export * from './types';
export { moduleStore, functionName } from './store.svelte';
export * from './ui';
export { specificRemoteFunction } from './remote';
```

## Type-Crafter Check

```bash
grep -q "type-crafter" package.json && echo "Use type-crafter"
```

**Can be generated:** Entity types, filters, unions, decoder functions
**Must be manual:** Component props, composed from generated types (type-crafter has no optional keys), and types
holding functions or snippets

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
- [ ] State in `store.svelte.ts`: getter object, named mutators, `$derived`, no `$effect`
- [ ] Loading/error states implemented
- [ ] Components are self-contained
- [ ] No utils.ts functions exported externally
