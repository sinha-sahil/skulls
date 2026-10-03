# Refactoring Plan Template

Plan and execute a structured code refactoring effort in a SvelteKit project,
covering assessment through execution with rollback safety.

## Overview

Refactoring in a SvelteKit project spans multiple concerns: migrating to Svelte 5
runes, improving type safety, extracting shared components, consolidating API routes,
and reducing technical debt. This template provides a phased approach that keeps the
project functional at every step.

## Critical Rules

### 1. Always Use `type`, Never `interface`

```typescript
// CORRECT
type RefactorTargetType = {
  file: string;
  priority: 'high' | 'medium' | 'low';
  effort: number;
};

// WRONG - never use interface
interface RefactorTarget {
  file: string;
  priority: 'high' | 'medium' | 'low';
  effort: number;
}
```

### 2. Svelte 5 Runes Pattern

When refactoring to Svelte 5, use runes instead of legacy patterns:

```svelte
<script lang="ts">
  // Svelte 5 runes - CORRECT
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log('Count changed:', count);
  });

  // Legacy patterns - REPLACE THESE
  // let count = 0;  (no reactivity declaration)
  // $: doubled = count * 2;  (reactive statement)
  // $: { console.log('Count changed:', count); }  (reactive block)
</script>
```

### 3. Verify at Every Step

Every refactoring change must pass the verification suite before proceeding:

```bash
pnpm check    # Type checking (svelte-check)
pnpm lint     # Linting
pnpm test     # Unit and integration tests
pnpm build    # Production build
```

## Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project identifier | `my-saas-app` |
| `{{REFACTOR_SCOPE}}` | Area being refactored | `auth module`, `store layer` |
| `{{TARGET_VERSION}}` | Target Svelte version | `5.0` |
| `{{BRANCH_NAME}}` | Git branch for refactoring | `refactor/svelte5-migration` |

## Phases

1. **Assessment** - Audit current codebase, identify refactoring targets
2. **Goals** - Define measurable refactoring objectives
3. **Impact Analysis** - Map dependencies and blast radius of changes
4. **Strategy** - Choose refactoring approach and sequencing
5. **Execution Plan** - Detailed step-by-step implementation plan
6. **Testing Strategy** - How to verify each change preserves behaviour
7. **Rollback Plan** - Safety nets and revert procedures

## When to Use

- Migrating from Svelte 4 to Svelte 5 (runes, snippets)
- Replacing Svelte stores with Svelte 5 runes
- Extracting shared components from duplicated code
- Consolidating scattered API routes
- Improving TypeScript strictness
- Reducing bundle size through code splitting
- Cleaning up accumulated technical debt

## Common Refactoring Targets in SvelteKit

| Target | From | To |
|--------|------|----|
| Reactive declarations | `$: value = expr` | `let value = $derived(expr)` |
| Reactive statements | `$: { ... }` | `$effect(() => { ... })` |
| Stores | `writable()` | `$state()` (component-level) |
| Event dispatching | `createEventDispatcher` | Callback props or snippets |
| Slots | `<slot>` | `{@render children()}` |
| Interface types | `interface Foo {}` | `type Foo = {}` |
| Any types | `data: any` | `data: SpecificType` |
