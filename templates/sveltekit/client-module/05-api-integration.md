# Phase 5: API Integration

Implement all API calls and remote data operations in remote.ts.

## Objectives

- Handle all external API calls for the module
- Use typesafe-api-call if available (recommended)
- Detect and use project's network utilities if typesafe-api-call unavailable
- Detect and use project's logger if available
- Update loading states through store functions
- Implement proper error handling

## API Calling Priority

Use utilities in this order based on Phase 1 detection:

1. **typesafe-api-call** (recommended) - Type-safe API calls with decoder validation
2. **Custom network utility** (fallback) - Project-specific NetworkController/ApiClient
3. **Native fetch** (last resort) - Standard fetch API

## Pattern A: With typesafe-api-call (Recommended)

Use this when the project has `typesafe-api-call` installed. This is the recommended approach.

**If typesafe-api-call MCP server is available, use it for detailed usage guidance.**

### With type-crafter (auto-generated decoders)

```typescript
import { APICaller, APISuccess, type APIRequest } from 'typesafe-api-call';
import { decodeModuleEntity, decodeModuleEntityList, type ModuleEntityType } from '$generated/types';
import { setItems, addItem, updateItem, removeItem, setLoadingState, setError, clearError } from './store';
import type { CreateModuleEntityRequest } from './types';

// Helper for constructing URLs safely
function constructUrl(path: string): URL | null {
  try {
    return new URL(path, window.location.origin);
  } catch {
    return null;
  }
}

export async function fetchItems(): Promise<void> {
  const url = constructUrl('/api/module-resource');
  if (url === null) {
    setError('Invalid URL');
    return;
  }

  try {
    clearError();
    setLoadingState(true);

    const request: APIRequest = {
      method: 'GET',
      url: url
    };

    const response = await APICaller.call(request, decodeModuleEntityList);

    if (response instanceof APISuccess) {
      setItems(response.response);
    } else {
      setError(response.error?.message || 'Failed to fetch items');
    }
  } finally {
    setLoadingState(false);
  }
}

export async function fetchItemById(id: string): Promise<ModuleEntityType | null> {
  const url = constructUrl(`/api/module-resource/${id}`);
  if (url === null) {
    setError('Invalid URL');
    return null;
  }

  try {
    setLoadingState(true);

    const request: APIRequest = {
      method: 'GET',
      url: url
    };

    const response = await APICaller.call(request, decodeModuleEntity);

    if (response instanceof APISuccess) {
      return response.response;
    } else {
      setError(response.error?.message || 'Failed to fetch item');
      return null;
    }
  } finally {
    setLoadingState(false);
  }
}

export async function createItem(data: CreateModuleEntityRequest): Promise<ModuleEntityType | null> {
  const url = constructUrl('/api/module-resource');
  if (url === null) {
    setError('Invalid URL');
    return null;
  }

  try {
    clearError();
    setLoadingState(true);

    const request: APIRequest = {
      method: 'POST',
      url: url,
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    };

    const response = await APICaller.call(request, decodeModuleEntity);

    if (response instanceof APISuccess) {
      addItem(response.response);
      return response.response;
    } else {
      setError(response.error?.message || 'Failed to create item');
      return null;
    }
  } finally {
    setLoadingState(false);
  }
}

export async function updateItemRemote(
  id: string,
  changes: Partial<ModuleEntityType>
): Promise<ModuleEntityType | null> {
  const url = constructUrl(`/api/module-resource/${id}`);
  if (url === null) {
    setError('Invalid URL');
    return null;
  }

  try {
    clearError();
    setLoadingState(true);

    const request: APIRequest = {
      method: 'PUT',
      url: url,
      body: JSON.stringify(changes),
      headers: { 'Content-Type': 'application/json' }
    };

    const response = await APICaller.call(request, decodeModuleEntity);

    if (response instanceof APISuccess) {
      updateItem(id, response.response);
      return response.response;
    } else {
      setError(response.error?.message || 'Failed to update item');
      return null;
    }
  } finally {
    setLoadingState(false);
  }
}

export async function deleteItem(id: string): Promise<boolean> {
  const url = constructUrl(`/api/module-resource/${id}`);
  if (url === null) {
    setError('Invalid URL');
    return false;
  }

  try {
    clearError();
    setLoadingState(true);

    const request: APIRequest = {
      method: 'DELETE',
      url: url
    };

    // For DELETE, we may not need a decoder if no response body
    const response = await APICaller.call(request, () => null);

    if (response instanceof APISuccess) {
      removeItem(id);
      return true;
    } else {
      setError(response.error?.message || 'Failed to delete item');
      return false;
    }
  } finally {
    setLoadingState(false);
  }
}
```

### Without type-crafter (manual decoders)

```typescript
import { APICaller, APISuccess, type APIRequest } from 'typesafe-api-call';
import { setItems, addItem, setLoadingState, setError, clearError } from './store';
import type { ModuleEntityType } from './types';

// Manual decoder - validate and parse API response
function decodeModuleEntity(data: unknown): ModuleEntityType | null {
  if (typeof data !== 'object' || data === null) return null;
  const obj = data as Record<string, unknown>;

  // Validate required fields
  if (typeof obj.id !== 'string') return null;
  if (typeof obj.name !== 'string') return null;
  // ... validate other fields

  return {
    id: obj.id,
    name: obj.name,
    // ... map other fields
  } as ModuleEntityType;
}

function decodeModuleEntityList(data: unknown): ModuleEntityType[] | null {
  if (!Array.isArray(data)) return null;
  const items: ModuleEntityType[] = [];
  for (const item of data) {
    const decoded = decodeModuleEntity(item);
    if (decoded === null) return null;  // Fail if any item is invalid
    items.push(decoded);
  }
  return items;
}

// Helper for constructing URLs safely
function constructUrl(path: string): URL | null {
  try {
    return new URL(path, window.location.origin);
  } catch {
    return null;
  }
}

export async function fetchItems(): Promise<void> {
  const url = constructUrl('/api/module-resource');
  if (url === null) {
    setError('Invalid URL');
    return;
  }

  try {
    clearError();
    setLoadingState(true);

    const request: APIRequest = {
      method: 'GET',
      url: url
    };

    const response = await APICaller.call(request, decodeModuleEntityList);

    if (response instanceof APISuccess) {
      setItems(response.response);
    } else {
      setError(response.error?.message || 'Failed to fetch items');
    }
  } finally {
    setLoadingState(false);
  }
}

// ... other CRUD operations follow same pattern
```

## Pattern B: With Custom Network Utility (Fallback)

Use this when project has NetworkController/ApiClient but not typesafe-api-call:

```typescript
import { NetworkController } from '$services/network/network-controller';
import appLogger from '$services/app-logger';  // If available
import { setItems, addItem, updateItem, removeItem, setLoadingState, setError, clearError } from './store';
import type { ModuleEntityType, CreateModuleEntityRequest } from './types';

export async function fetchItems(): Promise<void> {
  const tag = 'fetchItems';
  const networkController = NetworkController.getController(tag);

  try {
    clearError();
    setLoadingState(true);

    const response = await networkController.makeRequest({
      method: 'GET',
      endpoint: '/api/module-resource'
    });

    setItems(response.data);
  } catch (error) {
    appLogger.error(tag, error);  // Or console.error if no logger
    setError(error instanceof Error ? error.message : 'Failed to fetch items');
  } finally {
    setLoadingState(false);
  }
}

export async function createItem(request: CreateModuleEntityRequest): Promise<ModuleEntityType | null> {
  const tag = 'createItem';
  const networkController = NetworkController.getController(tag);

  try {
    clearError();
    setLoadingState(true);

    const response = await networkController.makeRequest({
      method: 'POST',
      endpoint: '/api/module-resource',
      body: request
    });

    addItem(response.data);
    return response.data;
  } catch (error) {
    appLogger.error(tag, error);
    setError(error instanceof Error ? error.message : 'Failed to create item');
    return null;
  } finally {
    setLoadingState(false);
  }
}
```

## Pattern C: With Native Fetch (Last Resort)

Use this when no API utilities are available:

```typescript
import { setItems, addItem, updateItem, removeItem, setLoadingState, setError, clearError } from './store';
import type { ModuleEntityType, CreateModuleEntityRequest } from './types';

const BASE_URL = '/api';

export async function fetchItems(): Promise<void> {
  try {
    clearError();
    setLoadingState(true);

    const response = await fetch(`${BASE_URL}/module-resource`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ModuleEntityType[] = await response.json();
    setItems(data);
  } catch (error) {
    console.error('[fetchItems]', error);
    setError(error instanceof Error ? error.message : 'Failed to fetch items');
  } finally {
    setLoadingState(false);
  }
}

export async function createItem(request: CreateModuleEntityRequest): Promise<ModuleEntityType | null> {
  try {
    clearError();
    setLoadingState(true);

    const response = await fetch(`${BASE_URL}/module-resource`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ModuleEntityType = await response.json();
    addItem(data);
    return data;
  } catch (error) {
    console.error('[createItem]', error);
    setError(error instanceof Error ? error.message : 'Failed to create item');
    return null;
  } finally {
    setLoadingState(false);
  }
}

export async function updateItemRemote(
  id: string,
  changes: Partial<ModuleEntityType>
): Promise<ModuleEntityType | null> {
  try {
    clearError();
    setLoadingState(true);

    const response = await fetch(`${BASE_URL}/module-resource/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ModuleEntityType = await response.json();
    updateItem(id, data);
    return data;
  } catch (error) {
    console.error('[updateItemRemote]', error);
    setError(error instanceof Error ? error.message : 'Failed to update item');
    return null;
  } finally {
    setLoadingState(false);
  }
}

export async function deleteItem(id: string): Promise<boolean> {
  try {
    clearError();
    setLoadingState(true);

    const response = await fetch(`${BASE_URL}/module-resource/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    removeItem(id);
    return true;
  } catch (error) {
    console.error('[deleteItem]', error);
    setError(error instanceof Error ? error.message : 'Failed to delete item');
    return false;
  } finally {
    setLoadingState(false);
  }
}
```

## Function Structure

Every remote function should follow this pattern:

```typescript
export async function operationName(params: ParamType): Promise<ReturnType> {
  try {
    clearError();           // Clear previous errors
    setLoadingState(true);  // Show loading

    // Make API call using detected utility
    // typesafe-api-call: APICaller.call(request, decoder)
    // custom utility: networkController.makeRequest(...)
    // fetch: await fetch(...)

    // Handle response
    // Update store on success
    // Return data if needed

  } catch (error) {
    // Log error (if logger available, otherwise console)
    console.error('[operationName]', error);

    // Update error state for UI
    setError(error instanceof Error ? error.message : 'Operation failed');

    return null;  // Or throw, depending on use case
  } finally {
    setLoadingState(false);  // Always hide loading
  }
}
```

## Export Strategy

Export functions that need to be called:

- From components directly
- From other modules
- During initialization

Keep internal helpers (constructUrl, decoders) private unless needed externally.

## Verification

Before moving to the next phase:

- [ ] Using correct API pattern based on detection results
- [ ] typesafe-api-call used if available (with proper decoders)
- [ ] All required API operations are implemented
- [ ] Decoder functions validate response data (if using typesafe-api-call)
- [ ] Loading states are managed properly
- [ ] Error handling updates store state
- [ ] Finally blocks ensure loading state is cleared
- [ ] Store update functions are called after successful operations
