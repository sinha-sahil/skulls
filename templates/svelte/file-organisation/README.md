# File Organisation Template

Plan and restructure Svelte component file organisation, directory hierarchy, and module
boundaries for maintainable, scalable component libraries.

## Overview

File organisation in Svelte projects directly impacts developer experience, build performance,
and long-term maintainability. This template guides you through assessing current structure,
designing an ideal hierarchy, establishing module boundaries, and executing a safe migration.

## Svelte 5 Context

This template targets Svelte 5 projects using:

- **Runes** (`$state`, `$derived`, `$effect`, `$props`, `$bindable`) for reactivity
- **Snippets** instead of slots for content composition
- **`type`** keyword exclusively (never `interface`)
- TypeScript for all script blocks

## Critical Rules

### 1. Always Use `type`, Never `interface`

```typescript
// CORRECT
type ComponentProps = {
  title: string;
  variant: 'primary' | 'secondary';
};

// WRONG - never use interface
interface ComponentProps {
  title: string;
  variant: 'primary' | 'secondary';
}
```

### 2. Component File Naming

- Component files: `PascalCase.svelte` (e.g., `DataTable.svelte`)
- Utility modules: `camelCase.ts` (e.g., `tableUtils.ts`)
- Type files: `camelCase.ts` with descriptive suffix (e.g., `tableTypes.ts`)
- Index files: `index.ts` for barrel exports

### 3. Co-location Principle

Keep related files together. A component's types, utilities, and tests should live
near the component, not in separate global directories.

## Standard Directory Structures

### Component Library

```text
src/lib/components/
├── index.ts                    # Public API barrel export
├── Button/
│   ├── Button.svelte
│   ├── buttonTypes.ts
│   └── index.ts
├── DataTable/
│   ├── DataTable.svelte
│   ├── DataTableRow.svelte
│   ├── dataTableTypes.ts
│   ├── dataTableUtils.ts
│   └── index.ts
└── shared/
    ├── sharedTypes.ts
    └── sharedUtils.ts
```

### Feature Module

```text
src/lib/features/{{FEATURE_NAME}}/
├── index.ts
├── components/
│   ├── FeatureView.svelte
│   └── FeatureCard.svelte
├── state.svelte.ts
├── types.ts
└── utils.ts
```

## Phases

1. **Assessment** - Audit current file structure, identify problems, map dependencies
2. **Directory Structure** - Design the target hierarchy with Svelte 5 conventions
3. **Module Boundaries** - Define public APIs, internal modules, and dependency rules
4. **Naming Conventions** - Establish consistent naming for files, components, and exports
5. **Dependency Flow** - Map and enforce unidirectional dependency relationships
6. **Migration Plan** - Create a safe, incremental migration strategy

## When to Use

- Starting a new Svelte component library
- Restructuring a growing project that has outgrown its original layout
- Establishing conventions for a UI kit
- Preparing for a Svelte 5 migration that also improves structure
- Onboarding a team that needs clear file organisation guidelines

## Verification Commands

```bash
pnpm check    # Svelte type checking
pnpm lint     # Linting rules
pnpm test     # Run test suite
```
