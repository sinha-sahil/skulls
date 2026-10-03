# Phase 4: Naming Conventions

Establish consistent naming rules for files, components, types, state, and exports
across the entire Svelte project.

## Objectives

- Define clear naming patterns for every file category
- Ensure component names, file names, and export names align
- Establish conventions for Svelte 5 specific files (`.svelte.ts`)
- Create a reference that all contributors can follow

## File Naming Rules

### Components (`.svelte`)

| Rule | Convention | Example |
|------|-----------|---------|
| Component files | PascalCase | `DataTable.svelte` |
| Sub-components | ParentChild pattern | `DataTableRow.svelte` |
| Page components | PascalCase + context | `DashboardView.svelte` |
| Layout wrappers | PascalCase | `PageLayout.svelte` |

```text
# CORRECT
Button.svelte
DataTable.svelte
DataTableRow.svelte
UserProfileCard.svelte

# WRONG
button.svelte          # not PascalCase
data-table.svelte      # kebab-case
dataTable.svelte       # camelCase
Datatable.svelte       # inconsistent casing
```

### Runes State Files (`.svelte.ts`)

| Rule | Convention | Example |
|------|-----------|---------|
| Feature state | descriptive `camelCase.svelte.ts` | `dashboardState.svelte.ts` |
| Global state | domain `camelCase.svelte.ts` | `appState.svelte.ts` |
| Component state | `state.svelte.ts` (co-located) | `state.svelte.ts` |

```typescript
// dashboardState.svelte.ts
// The .svelte.ts extension enables $state, $derived, $effect in plain TS

let metrics = $state<DashboardMetric[]>([]);
let isLoading = $state(false);
let filteredMetrics = $derived(
  metrics.filter(m => m.value > 0)
);

export function getMetrics(): DashboardMetric[] {
  return metrics;
}

export function getIsLoading(): boolean {
  return isLoading;
}

export async function loadMetrics(): Promise<void> {
  isLoading = true;
  try {
    const response = await fetch('/api/metrics');
    metrics = await response.json();
  } finally {
    isLoading = false;
  }
}
```

### Type Files (`.ts`)

| Rule | Convention | Example |
|------|-----------|---------|
| Component types | `camelCaseTypes.ts` | `dataTableTypes.ts` |
| Feature types | `types.ts` (co-located) | `types.ts` |
| Shared types | descriptive `camelCase.ts` | `common.ts` |

**Always use `type`, never `interface`:**

```typescript
// dataTableTypes.ts

// CORRECT
type DataTableColumn = {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
};

type DataTableProps = {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  onrowclick?: (row: DataTableRow) => void;
  header?: import('svelte').Snippet;
};

// WRONG - never use interface
interface DataTableColumn {
  key: string;
  label: string;
}
```

### Utility Files (`.ts`)

| Rule | Convention | Example |
|------|-----------|---------|
| Component utils | `camelCaseUtils.ts` | `dataTableUtils.ts` |
| Feature utils | `utils.ts` (co-located) | `utils.ts` |
| Shared utils | descriptive `camelCase.ts` | `formatUtils.ts` |

### Constants Files (`.ts`)

| Rule | Convention | Example |
|------|-----------|---------|
| Component constants | `camelCaseConstants.ts` | `iconConstants.ts` |
| App-wide constants | descriptive `camelCase.ts` | `themeConstants.ts` |

## Export Naming Rules

### Component Exports

```typescript
// index.ts - export component with same name as file
export { default as DataTable } from './DataTable.svelte';

// WRONG: Don't rename on export
export { default as Table } from './DataTable.svelte'; // confusing
```

### Type Exports

```typescript
// Use descriptive suffixes
export type DataTableProps = { /* ... */ };      // component props
export type DataTableColumn = { /* ... */ };     // domain concept
export type DataTableSortState = { /* ... */ };  // state shape
export type DataTableVariant = 'default' | 'compact' | 'striped'; // union
```

### State Function Exports

```typescript
// Prefix with verb describing the action
export function loadItems(): Promise<void> { /* ... */ }
export function getItems(): Item[] { /* ... */ }
export function getIsLoading(): boolean { /* ... */ }
export function setFilter(filter: string): void { /* ... */ }
export function resetState(): void { /* ... */ }

// WRONG: Ambiguous names
export function items(): Item[] { /* ... */ }    // verb missing
export function loading(): boolean { /* ... */ } // verb missing
```

### Event Callback Props

Svelte 5 replaces event dispatchers with callback props:

```typescript
// Naming convention: on + action (lowercase, no camelCase after 'on')
type ButtonProps = {
  onclick?: (event: MouseEvent) => void;      // standard DOM event
  onselect?: (item: Item) => void;            // custom action
  onfilterchange?: (filters: Filters) => void; // compound action
};

// WRONG: Don't use camelCase after 'on' for Svelte 5
type ButtonProps = {
  onClick?: () => void;    // wrong casing
  on_select?: () => void;  // wrong separator
};
```

## Directory Naming Rules

| Rule | Convention | Example |
|------|-----------|---------|
| Component dirs | PascalCase | `DataTable/` |
| Feature dirs | camelCase or kebab-case | `dashboard/` or `user-profile/` |
| Category dirs | camelCase | `primitives/`, `composites/` |
| Shared dirs | camelCase | `types/`, `utils/`, `state/` |

## Naming Convention Table

| Category | File Name | Export Name | Type Suffix |
|----------|-----------|-------------|-------------|
| Component | `Button.svelte` | `Button` | `ButtonProps` |
| Sub-component | `DataTableRow.svelte` | (internal) | (internal) |
| Types file | `buttonTypes.ts` | N/A | various |
| Utils file | `buttonUtils.ts` | named functions | N/A |
| State file | `appState.svelte.ts` | named functions | state types |
| Constants | `themeConstants.ts` | named constants | N/A |
| Barrel | `index.ts` | re-exports | re-exports |

## Verification

Before moving to the next phase:

- [ ] All component files follow PascalCase convention
- [ ] All `.svelte.ts` state files follow camelCase convention
- [ ] All type files use `type`, not `interface`
- [ ] All type exports have descriptive suffixes
- [ ] Event callback props follow `on` + lowercase pattern
- [ ] Export names match file names (no renaming)
- [ ] Directory naming is consistent
- [ ] State functions prefixed with appropriate verbs
- [ ] Naming convention table documented for the team
