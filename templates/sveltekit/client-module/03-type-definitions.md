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
type ModuleStore = {
  data: DataType | null;
  isLoaded: boolean;
};

// WRONG - Never use interface
interface ModuleStore {
  data: DataType | null;
  isLoaded: boolean;
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

### 3. Exception: Function-Containing Types

Type-crafter cannot generate types that contain functions. These must be created manually:

```typescript
// Must be created manually - contains function
type ModuleListProps = {
  items: ModuleEntityType[];
  onSelect?: (item: ModuleEntityType) => void;  // Function - can't be generated
  emptyMessage?: string;
};

// Must be created manually - event dispatcher types
type ModuleEventMap = {
  select: ModuleEntityType;
  action: { type: ModuleActionType; data: ModuleEntityType };
};

// Can be generated via type-crafter - no functions
type ModuleEntityType = {
  id: string;
  status: ModuleStatusType;
  createdAt: string;
  updatedAt: string;
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

```yaml
# specs/module-name.type-crafter.yaml
version: "1.0"
types:
  ModuleEntityType:
    id: string
    status: ModuleStatusType
    metadata: ModuleMetadata
    createdAt: string
    updatedAt: string

  ModuleMetadata:
    lastUpdated: string
    source: string
    version: number

  ModuleStatusType:
    enum:
      - idle
      - loading
      - success
      - error

  ModuleFilters:
    status?: ModuleStatusType
    search?: string
    sortBy?: string
    sortOrder?: string
```

### Step 3: Generate Types

```bash
# Run type-crafter generation
pnpm type-crafter generate
```

### Step 4: Import Generated Types

```typescript
// types.ts - Import generated, define function-containing types manually

// =============================================================================
// Generated Type Imports (from type-crafter)
// =============================================================================
import type {
  ModuleEntityType,
  ModuleMetadata,
  ModuleStatusType,
  ModuleFilters
} from '$generated/types';

// Re-export for module consumers
export type { ModuleEntityType, ModuleMetadata, ModuleStatusType, ModuleFilters };

// =============================================================================
// Manual Types (contain functions - cannot be generated)
// =============================================================================

/**
 * Props for list components - contains function callback
 */
export type ModuleListProps = {
  items: ModuleEntityType[];
  onSelect?: (item: ModuleEntityType) => void;
  emptyMessage?: string;
};

/**
 * Events dispatched by module components
 */
export type ModuleEventMap = {
  select: ModuleEntityType;
  action: { type: string; data: ModuleEntityType };
  update: { id: string; changes: Partial<ModuleEntityType> };
  delete: { id: string };
};
```

## Manual Type Creation (when type-crafter unavailable)

If type-crafter is not available, create all types manually in `types.ts`:

```typescript
// =============================================================================
// Generated Type Imports (from API codegen if available)
// =============================================================================
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
export type ModuleActionType = 'action1' | 'action2' | 'action3';

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
// Store Types
// =============================================================================

/**
 * Shape of the module's store data
 */
export type ModuleStoreData = {
  items: ModuleEntityType[];
  selectedItem: ModuleEntityType | null;
  filters: ModuleFilters;
};

/**
 * Filter options for the module
 */
export type ModuleFilters = {
  status?: ModuleStatusType;
  search?: string;
  sortBy?: 'date' | 'name' | 'status';
  sortOrder?: 'asc' | 'desc';
};

// =============================================================================
// Component Props Types (contain functions - always manual)
// =============================================================================

/**
 * Props for the main display component
 */
export type ModuleDisplayProps = {
  item: ModuleEntityType;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
};

/**
 * Props for list components
 */
export type ModuleListProps = {
  items: ModuleEntityType[];
  onSelect?: (item: ModuleEntityType) => void;
  emptyMessage?: string;
};

// =============================================================================
// Event Types (always manual - used with createEventDispatcher)
// =============================================================================

/**
 * Events dispatched by module components
 */
export type ModuleEventMap = {
  select: ModuleEntityType;
  action: { type: ModuleActionType; data: ModuleEntityType };
  update: { id: string; changes: Partial<ModuleEntityType> };
  delete: { id: string };
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
| Store data types | Yes | Fallback | Pure data structures |
| Union/enum types | Yes | Fallback | Simple values |
| Filter types | Yes | Fallback | Pure data structures |
| Props with callbacks | No | Always | Contains functions |
| Event map types | No | Always | Used with dispatcher |
| Handler types | No | Always | Function signatures |

## Naming Conventions

| Type Category | Naming Pattern | Example |
|--------------|----------------|---------|
| Entity | `Module` + `Entity` + `Type` | `OrderEntityType` |
| Store | `Module` + `Store` + `Data` | `OrderStoreData` |
| Props | `Component` + `Props` | `OrderListProps` |
| Events | `Module` + `EventMap` | `OrderEventMap` |
| Status | `Module` + `Status` + `Type` | `OrderStatusType` |

## Verification

Before moving to the next phase:

- [ ] Checked if project uses type-crafter
- [ ] Types defined in type-crafter YAML (if available)
- [ ] Generated types imported from `$generated/types`
- [ ] Function-containing types created manually
- [ ] All types use `type`, not `interface`
- [ ] Type names are descriptive and module-prefixed
- [ ] Store shape type is defined
- [ ] Component prop types are defined
- [ ] Event types are defined
