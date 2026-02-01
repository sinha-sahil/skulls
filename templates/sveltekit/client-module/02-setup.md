# Phase 2: Setup

Create the module directory structure and initial files with proper scaffolding.

## Objectives

- Create the module directory at the correct location
- Set up all required files with basic structure
- Establish the export pattern in index.ts

## Critical Rules

1. **Always use `type`, never `interface`**
2. Use detection results from Phase 1 to determine imports

## Module Location

All client-side modules are located in:

```text
src/lib/client/modules/[module-name]/
```

## Directory Structure

Create the following structure:

```text
src/lib/client/modules/[module-name]/
├── index.ts           # Main export file
├── remote.ts          # API calls
├── store.ts           # State management
├── types.ts           # Type definitions
├── utils.ts           # Internal utilities
└── ui/                # Components directory
    └── index.ts       # Component exports
```

## File Scaffolds

### index.ts

```typescript
// Module: [module-name]
// Purpose: [brief description]

// Type exports
export * from './types';

// Store exports (specific functions, not raw store)
// export { updateFunction, anotherFunction } from './store';

// UI component exports
export * from './ui';

// Remote function exports (if needed externally)
// export { fetchFunction } from './remote';
```

### remote.ts

Choose the appropriate scaffold based on Phase 1 detection results:

#### Option A: With typesafe-api-call (Recommended)

```typescript
// Use this if project has typesafe-api-call (recommended approach)
import { APICaller, APISuccess, type APIRequest } from 'typesafe-api-call';
import { decodeEntityType, type EntityType } from '$generated/types';  // If type-crafter available
import { setItems, setLoadingState, setError, clearError } from './store';

// Helper for constructing URLs safely
function constructUrl(path: string): URL | null {
  try {
    return new URL(path, window.location.origin);
  } catch {
    return null;
  }
}

// API operations will be implemented here using APICaller
```

#### Option B: With typesafe-api-call but no type-crafter (manual decoders)

```typescript
// Use this if project has typesafe-api-call but no type-crafter
import { APICaller, APISuccess, type APIRequest } from 'typesafe-api-call';
import { setItems, setLoadingState, setError, clearError } from './store';
import type { EntityType } from './types';

// Manual decoder function (write for each response type)
function decodeEntityType(data: unknown): EntityType | null {
  // Implement safe decoding logic
  if (typeof data !== 'object' || data === null) return null;
  // ... validate and return typed data
  return data as EntityType;
}

// API operations will be implemented here using APICaller
```

#### Option C: With custom network utility (fallback)

```typescript
// Use this if project has custom network utility but not typesafe-api-call
import { NetworkController } from '$services/network/network-controller';  // Adjust path
import appLogger from '$services/app-logger';  // If logger available
import { setLoadingState, setError, clearError } from './store';

// API operations will be implemented here
```

#### Option D: With native fetch (no utilities)

```typescript
// Use this if project does not have any network utilities
import { setLoadingState, setError, clearError } from './store';

const BASE_URL = '/api';

// API operations will be implemented here using fetch
```

### store.ts

```typescript
import { writable, type Writable } from 'svelte/store';
// import type { StoreType } from './types';

// Store type - always use type, never interface
type ModuleStore = {
  data: unknown | null;
  isLoaded: boolean;
  showLoader: boolean;
  error: string | null;
};

// Initial state
const initialState: ModuleStore = {
  data: null,
  isLoaded: false,
  showLoader: false,
  error: null
};

// Create store
const moduleStore: Writable<ModuleStore> = writable(initialState);

// Export store for external access
export default moduleStore;

// Update functions will be added here
```

### types.ts

Choose based on Phase 1 type-crafter detection:

#### Option A: With type-crafter (import generated types and decoders)

```typescript
// Import generated types and decoders from type-crafter
import type {
  ModuleEntityType,
  ModuleStatusType
} from '$generated/types';

// Import decoders for use with typesafe-api-call
export { decodeModuleEntityType, decodeModuleEntityList } from '$generated/types';

// Re-export types for module consumers
export type { ModuleEntityType, ModuleStatusType };

// Only define types that contain functions (cannot be generated)
// export type ModuleEventMap = { ... };
```

#### Option B: Without type-crafter (define types and decoders manually)

```typescript
// Define all types manually - always use type, never interface

// Module-specific types
export type ModuleEntityType = {
  id: string;
  // ... other fields
};

// Manual decoder for typesafe-api-call (if using it)
export function decodeModuleEntityType(data: unknown): ModuleEntityType | null {
  if (typeof data !== 'object' || data === null) return null;
  const obj = data as Record<string, unknown>;
  if (typeof obj.id !== 'string') return null;
  // ... validate other fields
  return obj as ModuleEntityType;
}
```

### utils.ts

```typescript
// Internal utility functions
// These should NOT be exported outside the module

// import type { ModuleType } from './types';

// Utility functions will be added here
```

### ui/index.ts

```typescript
// UI component exports
// export { default as ComponentName } from './ComponentName.svelte';
```

## Setup Commands

```bash
# Create module directory
mkdir -p src/lib/client/modules/[module-name]/ui

# Create files
touch src/lib/client/modules/[module-name]/index.ts
touch src/lib/client/modules/[module-name]/remote.ts
touch src/lib/client/modules/[module-name]/store.ts
touch src/lib/client/modules/[module-name]/types.ts
touch src/lib/client/modules/[module-name]/utils.ts
touch src/lib/client/modules/[module-name]/ui/index.ts
```

## Verification

Before moving to the next phase:

- [ ] Module directory exists at correct location
- [ ] All required files are created
- [ ] index.ts has basic export structure
- [ ] remote.ts uses correct imports based on detection results
- [ ] types.ts uses correct approach based on type-crafter availability
- [ ] Decoder functions planned if using typesafe-api-call
- [ ] store.ts has initial store scaffold with `type` (not `interface`)
- [ ] ui/index.ts exists for component exports
- [ ] Files follow the naming convention
