# Phase 3: Module Boundaries

Define clear public APIs for each module, establish what is internal vs exported,
and enforce encapsulation rules.

## Objectives

- Define the public API surface for each module via `index.ts` barrel exports
- Distinguish between public, internal, and private files
- Establish import rules to prevent tight coupling
- Prevent internal implementation details from leaking across modules

## Module Boundary Principles

### 1. Index Files Are the Public API

Every module directory should have an `index.ts` that explicitly declares what
consumers can import:

```typescript
// components/DataTable/index.ts

// Public: These are the module's API
export { default as DataTable } from './DataTable.svelte';
export type { DataTableProps, DataTableColumn, DataTableRow } from './dataTableTypes';

// NOT exported: DataTableHeader, DataTableCell, dataTableUtils
// These are internal implementation details
```

### 2. Import Rules

Consumers must import from the module's index, never from internal files:

```typescript
// CORRECT - import from module boundary
import { DataTable } from '{{LIB_PATH}}/components/DataTable';
import type { DataTableProps } from '{{LIB_PATH}}/components/DataTable';

// WRONG - importing internal files bypasses the module boundary
import DataTableRow from '{{LIB_PATH}}/components/DataTable/DataTableRow.svelte';
import { sortRows } from '{{LIB_PATH}}/components/DataTable/dataTableUtils';
```

### 3. Visibility Levels

| Level | Access | Enforced By | Example |
|-------|--------|-------------|---------|
| **Public** | Any module | `index.ts` exports | `DataTable`, `DataTableProps` |
| **Internal** | Same module only | Not in `index.ts` | `DataTableRow.svelte` |
| **Private** | Same file only | TypeScript scope | Helper functions in utils |

## Defining Module Boundaries

### Step 1: List All Modules

For each directory that represents a logical module:

| Module | Path | Purpose |
|--------|------|---------|
| `Button` | `{{COMPONENT_DIR}}/Button/` | Primary action trigger |
| `DataTable` | `{{COMPONENT_DIR}}/DataTable/` | Tabular data display |
| `{{FEATURE_NAME}}` | `{{LIB_PATH}}/features/{{FEATURE_NAME}}/` | Feature logic |
| ... | ... | ... |

### Step 2: Define Public API Per Module

For each module, explicitly list what is exported:

```typescript
// Template for documenting module API

// Module: {{COMPONENT_NAME}}
// Path: {{COMPONENT_DIR}}/{{COMPONENT_NAME}}/index.ts

// Exported Components
export { default as {{COMPONENT_NAME}} } from './{{COMPONENT_NAME}}.svelte';

// Exported Types (always use `type`, never `interface`)
export type {
  {{COMPONENT_NAME}}Props,
  {{COMPONENT_NAME}}Variant,
} from './{{camelCase}}Types';

// Exported Utilities (only if genuinely useful to consumers)
// export { format{{COMPONENT_NAME}}Data } from './{{camelCase}}Utils';

// NOT EXPORTED (internal implementation):
// - Sub-components ({{COMPONENT_NAME}}Header.svelte, etc.)
// - Internal utility functions
// - Internal type helpers
```

### Step 3: Svelte 5 Props as Module Contract

In Svelte 5, `$props()` defines the component's public API:

```svelte
<script lang="ts" module>
  // Module-level exports define the type contract
  export type {{COMPONENT_NAME}}Props = {
    /** Primary content to display */
    title: string;
    /** Visual variant */
    variant?: 'default' | 'compact' | 'expanded';
    /** Content to render in the header area */
    header?: import('svelte').Snippet;
    /** Content to render for each item */
    row?: import('svelte').Snippet<[item: RowData]>;
    /** Called when an item is selected */
    onselect?: (item: RowData) => void;
  };

  type RowData = {
    id: string;
    label: string;
  };
</script>

<script lang="ts">
  let {
    title,
    variant = 'default',
    header,
    row,
    onselect,
  }: {{COMPONENT_NAME}}Props = $props();
</script>
```

**Rules:**
- Props type is the component contract - export it from `index.ts`
- Internal types (like `RowData` above) stay in the module-level script
- Callback props (`onselect`) replace `createEventDispatcher`
- Snippet props (`header`, `row`) replace `<slot>`

### Step 4: Feature Module Boundaries

Feature modules have a broader API surface:

```typescript
// features/{{FEATURE_NAME}}/index.ts

// Public components
export { default as {{FEATURE_NAME}}View } from './components/{{FEATURE_NAME}}View.svelte';
export { default as {{FEATURE_NAME}}Card } from './components/{{FEATURE_NAME}}Card.svelte';

// Public types
export type {
  {{FEATURE_NAME}}Config,
  {{FEATURE_NAME}}Item,
} from './types';

// Public state accessors
export {
  load{{FEATURE_NAME}},
  get{{FEATURE_NAME}}Items,
  get{{FEATURE_NAME}}Loading,
} from './state.svelte';

// NOT EXPORTED:
// - Internal components ({{FEATURE_NAME}}ListItem.svelte, etc.)
// - State mutation internals
// - Private utility functions
```

## Shared Module Rules

### Shared Types

```typescript
// types/index.ts - Only truly shared types go here
export type { BaseEntity, Pagination, SortOrder } from './common';

// WRONG: Don't put component-specific types here
// export type { DataTableColumn } from './dataTable'; // belongs in DataTable module
```

### Shared Utilities

```typescript
// utils/index.ts - Only genuinely reusable utilities
export { formatDate, formatCurrency, debounce } from './formatUtils';

// WRONG: Don't put component-specific helpers here
// export { sortTableRows } from './tableUtils'; // belongs in DataTable module
```

## Enforcing Boundaries

### ESLint Import Rules

```jsonc
// .eslintrc or eslint.config.js
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [
        {
          "group": ["{{LIB_PATH}}/components/*/!(index)*"],
          "message": "Import from the component's index.ts, not internal files."
        }
      ]
    }]
  }
}
```

### TypeScript Path Aliases

```jsonc
// tsconfig.json - encourage module-level imports
{
  "compilerOptions": {
    "paths": {
      "$components": ["{{LIB_PATH}}/components"],
      "$components/*": ["{{LIB_PATH}}/components/*"],
      "$features/*": ["{{LIB_PATH}}/features/*"],
      "$state": ["{{LIB_PATH}}/state"],
      "$types": ["{{LIB_PATH}}/types"]
    }
  }
}
```

## Verification

Before moving to the next phase:

- [ ] Every module has an `index.ts` with explicit exports
- [ ] Public vs internal files clearly distinguished
- [ ] Props types exported for all public components
- [ ] Snippet and callback prop types documented
- [ ] No internal files imported from outside their module
- [ ] Shared types directory contains only truly shared types
- [ ] Shared utils directory contains only truly reusable utilities
- [ ] Import rules documented or enforced via ESLint
