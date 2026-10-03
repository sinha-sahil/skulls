# File Organisation Quick Reference

## Critical Rules

1. **Always use `type`, never `interface`**
2. **PascalCase** for `.svelte` component files
3. **camelCase** for `.ts` utility and type files
4. **Co-locate** related files (types, utils, tests near their component)
5. **Barrel exports** via `index.ts` at each module boundary
6. **Unidirectional** dependency flow (features depend on components, not vice versa)

## Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_ROOT}}` | Project root directory | `./` |
| `{{LIB_PATH}}` | Library source path | `src/lib` |
| `{{COMPONENT_DIR}}` | Components directory | `src/lib/components` |
| `{{FEATURE_NAME}}` | Feature module name | `dashboard` |
| `{{COMPONENT_NAME}}` | Component name (PascalCase) | `DataTable` |

## Recommended Directory Structure

```text
{{LIB_PATH}}/
├── components/              # Reusable UI components
│   ├── index.ts
│   ├── {{COMPONENT_NAME}}/
│   │   ├── {{COMPONENT_NAME}}.svelte
│   │   ├── {{camelCase}}Types.ts
│   │   ├── {{camelCase}}Utils.ts
│   │   └── index.ts
│   └── shared/
│       ├── sharedTypes.ts
│       └── sharedUtils.ts
├── features/                # Feature-specific modules
│   └── {{FEATURE_NAME}}/
│       ├── index.ts
│       ├── components/
│       ├── state.svelte.ts
│       ├── types.ts
│       └── utils.ts
├── state/                   # Global state (runes-based)
│   ├── index.ts
│   └── {{stateName}}.svelte.ts
├── types/                   # Shared type definitions
│   └── index.ts
└── utils/                   # Shared utilities
    └── index.ts
```

## File Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Components | `PascalCase.svelte` | `DataTable.svelte` |
| Runes state | `camelCase.svelte.ts` | `appState.svelte.ts` |
| Types | `camelCase.ts` | `tableTypes.ts` |
| Utilities | `camelCase.ts` | `formatUtils.ts` |
| Constants | `camelCase.ts` | `tableConstants.ts` |
| Barrel exports | `index.ts` | `index.ts` |

## Svelte 5 Component Structure

```svelte
<script lang="ts" module>
  // Module-level: types and constants shared across instances
  export type {{COMPONENT_NAME}}Props = {
    title: string;
    variant?: 'default' | 'compact';
  };
</script>

<script lang="ts">
  // Instance-level: props, state, effects
  let { title, variant = 'default' }: {{COMPONENT_NAME}}Props = $props();

  let count = $state(0);
  let doubled = $derived(count * 2);
</script>
```

## Barrel Export Pattern

```typescript
// components/DataTable/index.ts
export { default as DataTable } from './DataTable.svelte';
export type { DataTableProps, DataTableColumn } from './dataTableTypes';

// components/index.ts
export { DataTable } from './DataTable';
export type { DataTableProps, DataTableColumn } from './DataTable';
```

## Dependency Flow Rules

```text
pages/routes → features → components → shared/utils
                  ↓
               state/
```

- Components NEVER import from features
- Features NEVER import from pages/routes
- Shared utilities have ZERO internal dependencies

## Assessment Checklist

- [ ] Current file structure audited
- [ ] Circular dependencies identified
- [ ] Orphaned files found
- [ ] Target structure designed
- [ ] Module boundaries defined
- [ ] Naming conventions established
- [ ] Dependency flow mapped
- [ ] Migration plan created
- [ ] `pnpm check` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
