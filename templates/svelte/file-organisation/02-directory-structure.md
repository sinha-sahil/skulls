# Phase 2: Directory Structure

Design the target directory hierarchy following Svelte 5 conventions and co-location
principles.

## Objectives

- Define a clear, scalable directory hierarchy
- Establish where components, features, state, types, and utilities live
- Design for Svelte 5 runes-based state files (`.svelte.ts`)
- Ensure the structure supports both small and large projects

## Svelte 5 File Categories

Before designing the structure, understand the file categories:

| File Type | Extension | Purpose | Example |
|-----------|-----------|---------|---------|
| Component | `.svelte` | UI component | `Button.svelte` |
| Runes state | `.svelte.ts` | Reactive state with `$state`, `$derived` | `counter.svelte.ts` |
| Types | `.ts` | Type definitions using `type` | `buttonTypes.ts` |
| Utilities | `.ts` | Pure functions, helpers | `formatUtils.ts` |
| Constants | `.ts` | Static values, config | `themeConstants.ts` |
| Barrel | `index.ts` | Re-exports for public API | `index.ts` |

## Structure: Component Library

For projects that are primarily a reusable component library:

```text
{{LIB_PATH}}/
├── components/
│   ├── index.ts                          # Public API
│   │
│   ├── primitives/                       # Atomic components
│   │   ├── index.ts
│   │   ├── Button/
│   │   │   ├── Button.svelte
│   │   │   ├── buttonTypes.ts
│   │   │   └── index.ts
│   │   ├── Input/
│   │   │   ├── Input.svelte
│   │   │   ├── inputTypes.ts
│   │   │   └── index.ts
│   │   └── Icon/
│   │       ├── Icon.svelte
│   │       ├── iconTypes.ts
│   │       ├── iconRegistry.ts
│   │       └── index.ts
│   │
│   ├── composites/                       # Multi-component compositions
│   │   ├── index.ts
│   │   ├── DataTable/
│   │   │   ├── DataTable.svelte
│   │   │   ├── DataTableHeader.svelte
│   │   │   ├── DataTableRow.svelte
│   │   │   ├── DataTableCell.svelte
│   │   │   ├── dataTableTypes.ts
│   │   │   ├── dataTableUtils.ts
│   │   │   └── index.ts
│   │   └── Form/
│   │       ├── Form.svelte
│   │       ├── FormField.svelte
│   │       ├── formTypes.ts
│   │       └── index.ts
│   │
│   └── layout/                           # Layout components
│       ├── index.ts
│       ├── Stack.svelte
│       ├── Grid.svelte
│       └── layoutTypes.ts
│
├── types/                                # Shared types
│   ├── index.ts
│   └── common.ts
│
└── utils/                                # Shared utilities
    ├── index.ts
    └── styleUtils.ts
```

## Structure: Feature-Based Application

For applications organised around features:

```text
{{LIB_PATH}}/
├── components/                           # Shared, reusable components
│   ├── index.ts
│   ├── Button/
│   │   ├── Button.svelte
│   │   ├── buttonTypes.ts
│   │   └── index.ts
│   └── Modal/
│       ├── Modal.svelte
│       ├── modalTypes.ts
│       └── index.ts
│
├── features/                             # Feature modules
│   ├── {{FEATURE_NAME}}/
│   │   ├── index.ts                      # Feature public API
│   │   ├── components/
│   │   │   ├── FeatureView.svelte
│   │   │   ├── FeatureCard.svelte
│   │   │   └── index.ts
│   │   ├── state.svelte.ts               # Feature state (runes)
│   │   ├── types.ts
│   │   └── utils.ts
│   └── auth/
│       ├── index.ts
│       ├── components/
│       │   ├── LoginForm.svelte
│       │   └── index.ts
│       ├── state.svelte.ts
│       └── types.ts
│
├── state/                                # Global application state
│   ├── index.ts
│   ├── app.svelte.ts                     # App-wide state
│   └── theme.svelte.ts                   # Theme state
│
├── types/                                # Shared type definitions
│   ├── index.ts
│   └── common.ts
│
└── utils/                                # Shared utilities
    ├── index.ts
    └── formatUtils.ts
```

## Runes State File Convention

Svelte 5 introduces `.svelte.ts` files for reactive state outside components:

```typescript
// state/counter.svelte.ts
// The .svelte.ts extension enables runes in plain TS files

let count = $state(0);
let doubled = $derived(count * 2);

export function increment(): void {
  count++;
}

export function decrement(): void {
  count--;
}

export function getCount(): number {
  return count;
}

export function getDoubled(): number {
  return doubled;
}
```

**Placement rules:**

- Feature-specific state: `features/{{FEATURE_NAME}}/state.svelte.ts`
- Global state: `state/{{stateName}}.svelte.ts`
- Component-internal state: co-located with the component

## Index File Patterns

### Component Index

```typescript
// components/DataTable/index.ts
export { default as DataTable } from './DataTable.svelte';
export type { DataTableProps, DataTableColumn } from './dataTableTypes';
```

### Feature Index

```typescript
// features/dashboard/index.ts
export { default as DashboardView } from './components/DashboardView.svelte';
export { default as DashboardCard } from './components/DashboardCard.svelte';
export type { DashboardConfig, DashboardMetric } from './types';
export { loadDashboard, refreshMetrics } from './state.svelte';
```

### Top-Level Library Index

```typescript
// components/index.ts
export { Button } from './primitives/Button';
export type { ButtonProps } from './primitives/Button';

export { DataTable } from './composites/DataTable';
export type { DataTableProps, DataTableColumn } from './composites/DataTable';

export { Stack, Grid } from './layout';
```

## Design Checklist

- [ ] File categories identified (components, state, types, utils)
- [ ] Top-level directory structure decided
- [ ] Component grouping strategy chosen (flat, category, feature)
- [ ] `.svelte.ts` state file locations defined
- [ ] Index file strategy established
- [ ] Shared types directory planned
- [ ] Shared utilities directory planned
- [ ] Structure supports current project size
- [ ] Structure scales for expected growth

## Verification

Before moving to the next phase:

- [ ] Target directory structure documented
- [ ] All existing files have a place in the new structure
- [ ] `.svelte.ts` files are correctly placed
- [ ] Index files planned at each module boundary
- [ ] No unnecessary nesting (max 3-4 levels)
- [ ] Structure follows co-location principle
