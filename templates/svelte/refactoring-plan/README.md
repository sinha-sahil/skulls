# Refactoring Plan Template

Plan and execute Svelte component refactoring including migration to Svelte 5 runes,
snippet adoption, and code modernisation.

## Overview

Refactoring Svelte components requires careful planning to avoid breaking changes.
This template covers the full lifecycle: assessing the current state, defining goals,
analysing impact, choosing a strategy, executing the plan, testing thoroughly, and
preparing rollback procedures.

## Svelte 5 Context

This template specifically addresses Svelte 5 refactoring patterns:

- **Runes migration:** `$state`, `$derived`, `$effect` replacing stores and `$:` statements
- **Snippet adoption:** `{#snippet}` and `{@render}` replacing `<slot>`
- **Props rune:** `$props()` replacing `export let`
- **Bindable rune:** `$bindable()` for two-way binding props
- **Callback props:** Direct function props replacing `createEventDispatcher`
- **Type keyword:** `type` exclusively, never `interface`

## Critical Rules

### 1. Always Use `type`, Never `interface`

```typescript
// CORRECT
type ComponentProps = {
  value: string;
  onchange?: (value: string) => void;
};

// WRONG - never use interface
interface ComponentProps {
  value: string;
  onchange?: (value: string) => void;
}
```

### 2. Runes Replace Legacy Reactivity

```svelte
<!-- BEFORE (legacy) -->
<script lang="ts">
  export let count = 0;
  $: doubled = count * 2;
  $: if (count > 10) console.log('high');
</script>

<!-- AFTER (Svelte 5 runes) -->
<script lang="ts">
  let { count = $bindable(0) }: { count: number } = $props();
  let doubled = $derived(count * 2);
  $effect(() => {
    if (count > 10) console.log('high');
  });
</script>
```

### 3. Snippets Replace Slots

```svelte
<!-- BEFORE (legacy slots) -->
<div class="card">
  <slot name="header" />
  <slot />
  <slot name="footer" />
</div>

<!-- AFTER (Svelte 5 snippets) -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { header, children, footer }: {
    header?: Snippet;
    children?: Snippet;
    footer?: Snippet;
  } = $props();
</script>

<div class="card">
  {#if header}{@render header()}{/if}
  {#if children}{@render children()}{/if}
  {#if footer}{@render footer()}{/if}
</div>
```

## Phases

1. **Assessment** - Audit components for legacy patterns and refactoring opportunities
2. **Goals** - Define what the refactoring should achieve with measurable criteria
3. **Impact Analysis** - Identify affected files, breaking changes, and dependencies
4. **Strategy** - Choose refactoring approach (incremental, module-by-module, big-bang)
5. **Execution Plan** - Order the work, assign priorities, define milestones
6. **Testing Strategy** - Plan how to verify correctness at each step
7. **Rollback Plan** - Prepare recovery procedures if issues arise

## When to Use

- Migrating from Svelte 4 to Svelte 5
- Replacing stores with runes for better performance
- Adopting snippets to replace slot-based composition
- Improving component type safety
- Reducing technical debt in component libraries
- Modernising event handling from dispatchers to callback props

## Verification Commands

```bash
pnpm check    # Svelte type checking
pnpm lint     # Linting rules
pnpm test     # Run test suite
```
