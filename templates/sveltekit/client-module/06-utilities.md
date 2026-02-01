# Phase 6: Utilities

Implement module-specific utility functions that support internal operations.

## Objectives

- Create helper functions for data transformation
- Implement validation utilities
- Add calculation and filtering helpers
- Keep all utilities internal to the module

## Key Principle

**Utilities in utils.ts are module-private.** They should NOT be exported outside the module.
If a utility needs to be shared, it belongs in a shared utilities location, not in a module's
utils.ts.

## Utils Implementation Pattern

### utils.ts Full Structure

```typescript
import type {
  ModuleEntityType,
  ModuleStatusType,
  ModuleMetadata,
  ModuleFilters
} from './types';

// =============================================================================
// Data Transformation Utilities
// =============================================================================

/**
 * Transform raw API data to module entity format
 */
export function transformApiData(rawData: Record<string, unknown>): ModuleEntityType {
  return {
    id: String(rawData.id || ''),
    status: (rawData.status as ModuleStatusType) || 'idle',
    data: rawData.data,
    metadata: transformMetadata(rawData.metadata),
    createdAt: new Date(rawData.createdAt as string),
    updatedAt: new Date(rawData.updatedAt as string)
  };
}

/**
 * Transform metadata from API format
 */
function transformMetadata(raw: unknown): ModuleMetadata {
  const metadata = raw as Record<string, unknown> | undefined;
  return {
    lastUpdated: metadata?.lastUpdated
      ? new Date(metadata.lastUpdated as string)
      : new Date(),
    source: String(metadata?.source || 'unknown'),
    version: Number(metadata?.version || 1)
  };
}

/**
 * Transform entity for API submission
 */
export function prepareForApi(entity: Partial<ModuleEntityType>): Record<string, unknown> {
  return {
    ...entity,
    createdAt: entity.createdAt?.toISOString(),
    updatedAt: entity.updatedAt?.toISOString(),
    metadata: entity.metadata
      ? {
          ...entity.metadata,
          lastUpdated: entity.metadata.lastUpdated.toISOString()
        }
      : undefined
  };
}

// =============================================================================
// Validation Utilities
// =============================================================================

/**
 * Validate a module entity has required fields
 */
export function validateEntity(entity: Partial<ModuleEntityType>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!entity.id) {
    errors.push('ID is required');
  }

  if (!entity.status) {
    errors.push('Status is required');
  }

  if (!entity.data) {
    errors.push('Data is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if an entity can be edited
 */
export function isEditable(entity: ModuleEntityType): boolean {
  const editableStatuses: ModuleStatusType[] = ['idle', 'error'];
  return editableStatuses.includes(entity.status);
}

/**
 * Check if an entity can be deleted
 */
export function isDeletable(entity: ModuleEntityType): boolean {
  const nonDeletableStatuses: ModuleStatusType[] = ['loading'];
  return !nonDeletableStatuses.includes(entity.status);
}

// =============================================================================
// Filtering Utilities
// =============================================================================

/**
 * Filter items by status
 */
export function filterByStatus(
  items: ModuleEntityType[],
  status: ModuleStatusType
): ModuleEntityType[] {
  return items.filter(item => item.status === status);
}

/**
 * Filter items by search term
 */
export function filterBySearch(
  items: ModuleEntityType[],
  searchTerm: string,
  searchFields: (keyof ModuleEntityType)[] = ['id']
): ModuleEntityType[] {
  if (!searchTerm.trim()) return items;

  const term = searchTerm.toLowerCase();
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return String(value).toLowerCase().includes(term);
    })
  );
}

/**
 * Apply all filters to items
 */
export function applyFilters(
  items: ModuleEntityType[],
  filters: ModuleFilters
): ModuleEntityType[] {
  let result = [...items];

  if (filters.status) {
    result = filterByStatus(result, filters.status);
  }

  if (filters.search) {
    result = filterBySearch(result, filters.search);
  }

  if (filters.sortBy) {
    result = sortItems(result, filters.sortBy, filters.sortOrder || 'asc');
  }

  return result;
}

// =============================================================================
// Sorting Utilities
// =============================================================================

/**
 * Sort items by a specific field
 */
export function sortItems(
  items: ModuleEntityType[],
  sortBy: 'date' | 'name' | 'status',
  order: 'asc' | 'desc' = 'asc'
): ModuleEntityType[] {
  const sorted = [...items].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'name':
        comparison = a.id.localeCompare(b.id); // Adjust if you have a name field
        break;
    }

    return order === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

// =============================================================================
// Calculation Utilities
// =============================================================================

/**
 * Count items by status
 */
export function countByStatus(items: ModuleEntityType[]): Record<ModuleStatusType, number> {
  return items.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<ModuleStatusType, number>
  );
}

/**
 * Get statistics for the module data
 */
export function calculateStats(items: ModuleEntityType[]): {
  total: number;
  byStatus: Record<ModuleStatusType, number>;
  latestUpdate: Date | null;
} {
  if (items.length === 0) {
    return {
      total: 0,
      byStatus: {} as Record<ModuleStatusType, number>,
      latestUpdate: null
    };
  }

  const latestUpdate = items.reduce((latest, item) => {
    return item.updatedAt > latest ? item.updatedAt : latest;
  }, items[0].updatedAt);

  return {
    total: items.length,
    byStatus: countByStatus(items),
    latestUpdate
  };
}

// =============================================================================
// Formatting Utilities
// =============================================================================

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format status for display
 */
export function formatStatus(status: ModuleStatusType): string {
  const statusLabels: Record<ModuleStatusType, string> = {
    idle: 'Idle',
    loading: 'Loading',
    success: 'Success',
    error: 'Error'
  };
  return statusLabels[status] || status;
}

// =============================================================================
// Comparison Utilities
// =============================================================================

/**
 * Check if two entities are equal (by ID)
 */
export function areEqual(a: ModuleEntityType, b: ModuleEntityType): boolean {
  return a.id === b.id;
}

/**
 * Find differences between two entities
 */
export function findChanges(
  original: ModuleEntityType,
  updated: ModuleEntityType
): Partial<ModuleEntityType> {
  const changes: Partial<ModuleEntityType> = {};

  (Object.keys(updated) as (keyof ModuleEntityType)[]).forEach(key => {
    if (original[key] !== updated[key]) {
      (changes as Record<string, unknown>)[key] = updated[key];
    }
  });

  return changes;
}
```

## Utility Categories

### 1. Data Transformation

Convert data between formats (API ↔ internal).

### 2. Validation

Check data integrity and business rules.

### 3. Filtering

Apply filters to collections.

### 4. Sorting

Order collections by various criteria.

### 5. Calculations

Compute derived values and statistics.

### 6. Formatting

Prepare data for display.

### 7. Comparison

Compare entities and find differences.

## Usage Pattern

Utils are called from:

- `remote.ts` - For data transformation before/after API calls
- `store.ts` - For derived calculations
- `*.svelte` - For display formatting

```typescript
// In remote.ts
import { transformApiData, prepareForApi } from './utils';

// In store.ts
import { applyFilters } from './utils';

// In Component.svelte
import { formatDate, formatStatus } from '../utils';
```

## Verification

Before moving to the next phase:

- [ ] Transformation utilities handle API data conversion
- [ ] Validation utilities check required fields
- [ ] Filtering utilities support all filter types
- [ ] Sorting utilities handle all sort options
- [ ] Calculation utilities provide needed stats
- [ ] Formatting utilities prepare data for display
- [ ] No utilities are exported from index.ts
- [ ] All utilities have proper TypeScript types
