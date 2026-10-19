# Phase 3: Type Definitions

Define module-specific types, prioritizing type-crafter generation where available.

## Objectives

- Check if project uses type-crafter for type generation
- Generate types via type-crafter when available
- Only create types manually when type-crafter cannot handle them
- Always use `type`, never use `interface`

## Critical Rules

### 1. Always Use `type`, Never `interface`

```typescript
// CORRECT - Always use type
type ModuleEntityType = {
  id: string;
  status: ModuleStatusType;
};

// WRONG - Never use interface
interface ModuleEntityType {
  id: string;
  status: ModuleStatusType;
}
```

### 2. Type-Crafter First Approach

Before creating any types manually, check if the project uses type-crafter:

**Detection Steps:**

1. Check for `type-crafter` in `package.json` dependencies
2. Look for `.type-crafter.yaml` or `type-crafter.config.*` files
3. Check for existing generated types in `$generated/types` or similar paths

**If type-crafter is available:**

- Define types in type-crafter YAML spec files
- Run type-crafter to generate TypeScript types
- Import generated types into the module

**If type-crafter is NOT available:**

- Create types manually in `types.ts`
- Follow the patterns below

### 3. Exception: Component Props and Types Holding Functions or Snippets

Type-crafter cannot generate types that hold functions or snippets, and it can't express optional keys. Write
those types by hand, and every component's props type too, composed from generated types:

```typescript
// Must be created manually - holds callback props
type ModuleListProps = {
  items: ModuleEntityType[];
  selectedId?: string | null;
  variant?: 'default' | 'compact';
  onselect: (item: ModuleEntityType) => void;  // Function - can't be generated
  onaction?: (action: ModuleActionType, item: ModuleEntityType) => void;
};

// Must be created manually - holds a snippet
type ModuleEmptyProps = {
  message?: string;
  children?: Snippet;  // Snippet - can't be generated
};

// Can be generated via type-crafter - no functions
type ModuleEntityType = {
  id: string;
  status: ModuleStatusType;
  createdAt: Date;
  updatedAt: Date;
};
```

## Type-Crafter Workflow

### Step 1: Check for Type-Crafter

```bash
# Check package.json
grep -q "type-crafter" package.json && echo "type-crafter available"

# Check for config files
ls -la *.type-crafter.yaml type-crafter.config.* 2>/dev/null
```

### Step 2: Define Types in YAML (if available)

Only the `required` array controls nullability. A field left out of it comes out as `T | null`, and the key
stays required, so type-crafter has no optional keys. For dates, `format: date` generates a `Date` whose decoder
also reads full timestamps, while `format: date-time` stays a `string`; the spec uses `format: date` to match the
`Date` fields that Phase 6 works with.

```yaml
# specs/module-name.type-crafter.yaml
info:
  version: '1.0.0'
  title: 'Module Name Types'

types:
  ModuleEntityType:
    type: object
    required:
      - id
      - status
      - data
      - metadata
      - createdAt
      - updatedAt
    properties:
      id:
        type: string
      status:
        $ref: '#/types/ModuleStatusType'
      data:
        type: unknown
      metadata:
        $ref: '#/types/ModuleMetadata'
      createdAt:
        type: string
        format: date
      updatedAt:
        type: string
        format: date

  ModuleMetadata:
    type: object
    required:
      - lastUpdated
      - source
      - version
    properties:
      lastUpdated:
        type: string
        format: date
      source:
        type: string
      version:
        type: number

  ModuleStatusType:
    type: string
    enum:
      - idle
      - loading
      - success
      - error

  ModuleActionType:
    type: string
    enum:
      - edit
      - delete

  ModuleSortBy:
    type: string
    enum:
      - date
      - name
      - status

  ModuleSortOrder:
    type: string
    enum:
      - asc
      - desc

  ModuleFilters:
    type: object
    properties:
      status:
        $ref: '#/types/ModuleStatusType'
      search:
        type: string
      sortBy:
        $ref: '#/types/ModuleSortBy'
      sortOrder:
        $ref: '#/types/ModuleSortOrder'
```

### Step 3: Generate Types

```bash
# Run type-crafter generation
pnpm type-crafter generate
```

### Step 4: Import Generated Types

```typescript
// types.ts - Import generated types, write props types and types holding functions or snippets by hand

// =============================================================================
// Generated Type Imports (from type-crafter)
// =============================================================================
import type { Snippet } from 'svelte';
import type {
  ModuleEntityType,
  ModuleMetadata,
  ModuleStatusType,
  ModuleActionType,
  ModuleFilters
} from '$generated/types';

// Re-export for module consumers
export type { ModuleEntityType, ModuleMetadata, ModuleStatusType, ModuleActionType, ModuleFilters };

// =============================================================================
// Manual Types (component props and types holding functions or snippets)
// =============================================================================

/**
 * Props for the list component - holds callbacks
 */
export type ModuleListProps = {
  items: ModuleEntityType[];
  selectedId?: string | null;
  variant?: 'default' | 'compact';
  onselect: (item: ModuleEntityType) => void;
  onaction?: (action: ModuleActionType, item: ModuleEntityType) => void;
};

/**
 * Props for the empty state - holds a snippet
 */
export type ModuleEmptyProps = {
  message?: string;
  children?: Snippet;
};
```

## Manual Type Creation (when type-crafter unavailable)

If type-crafter is not available, create all types manually in `types.ts`:

```typescript
// =============================================================================
// Generated Type Imports (from API codegen if available)
// =============================================================================
import type { Snippet } from 'svelte';
import type {
  GeneratedApiType,
  AnotherGeneratedType,
  ApiResponseType
} from '$generated/types';

// =============================================================================
// Module-Specific Unions
// =============================================================================

/**
 * Actions available within this module
 */
export type ModuleActionType = 'edit' | 'delete';

/**
 * Status states for module entities
 */
export type ModuleStatusType = 'idle' | 'loading' | 'success' | 'error';

// =============================================================================
// Core Module Types
// =============================================================================

/**
 * Primary entity type for the module
 */
export type ModuleEntityType = {
  id: string;
  status: ModuleStatusType;
  data: GeneratedApiType;
  metadata: ModuleMetadata;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Metadata associated with module entities
 */
export type ModuleMetadata = {
  lastUpdated: Date;
  source: string;
  version: number;
};

// =============================================================================
// Filter Types
// =============================================================================

/**
 * Filter options for the module
 */
export type ModuleFilters = {
  status: ModuleStatusType | null;
  search: string | null;
  sortBy: 'date' | 'name' | 'status' | null;
  sortOrder: 'asc' | 'desc' | null;
};

// =============================================================================
// Component Props Types (always hand-written)
// =============================================================================

/**
 * Props for the list component - holds callbacks
 */
export type ModuleListProps = {
  items: ModuleEntityType[];
  selectedId?: string | null;
  variant?: 'default' | 'compact';
  onselect: (item: ModuleEntityType) => void;
  onaction?: (action: ModuleActionType, item: ModuleEntityType) => void;
};

/**
 * Props for the empty state - holds a snippet
 */
export type ModuleEmptyProps = {
  message?: string;
  children?: Snippet;
};

// =============================================================================
// API Types (if not generated)
// =============================================================================

/**
 * Request type for creating a new entity
 */
export type CreateModuleEntityRequest = {
  name: string;
  data: Partial<GeneratedApiType>;
  metadata?: Partial<ModuleMetadata>;
};

/**
 * Request type for updating an entity
 */
export type UpdateModuleEntityRequest = {
  id: string;
  changes: Partial<ModuleEntityType>;
};
```

## Type Categories

| Category | Type-Crafter | Manual | Reason |
|----------|--------------|--------|--------|
| Entity types | Yes | Fallback | Pure data structures |
| Union/enum types | Yes | Fallback | Simple values |
| Filter types | Yes | Fallback | Pure data structures |
| Component props | No | Always | Optional keys, callbacks or snippets; composed from generated types |
| Handler types | No | Always | Function signatures |

## Naming Conventions

| Type Category | Naming Pattern | Example |
|--------------|----------------|---------|
| Entity | `Module` + `Entity` + `Type` | `OrderEntityType` |
| Props | `Component` + `Props` | `OrderListProps` |
| Status | `Module` + `Status` + `Type` | `OrderStatusType` |

## Verification

Before moving to the next phase:

- [ ] Checked if project uses type-crafter
- [ ] Types defined in type-crafter YAML (if available)
- [ ] Generated types imported from `$generated/types`
- [ ] Component props and types holding functions or snippets written by hand
- [ ] All types use `type`, not `interface`
- [ ] Type names are descriptive and module-prefixed
- [ ] Component prop types are defined
