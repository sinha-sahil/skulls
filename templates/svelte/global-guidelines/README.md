# Global Guidelines Template

Establish Svelte 5 coding standards, component conventions, and best practices for
consistent development across the entire project.

## Overview

Consistent coding standards reduce friction during code reviews, make onboarding
easier, and prevent common mistakes. This template covers all aspects of Svelte 5
development: code style, type system, error handling, testing, performance,
security, and documentation.

## Svelte 5 Context

These guidelines target Svelte 5 projects using:

- **Runes** (`$state`, `$derived`, `$effect`, `$props`, `$bindable`) for reactivity
- **Snippets** (`{#snippet}`, `{@render}`) instead of slots for content composition
- **`type`** keyword exclusively (never `interface`)
- **TypeScript** for all script blocks
- **Callback props** instead of `createEventDispatcher`

## Critical Rules

### 1. Always Use `type`, Never `interface`

```typescript
// CORRECT
type ButtonProps = {
  label: string;
  variant: 'primary' | 'secondary';
  onclick?: () => void;
};

// WRONG - never use interface
interface ButtonProps {
  label: string;
}
```

### 2. Standard Component Structure

```svelte
<script lang="ts" module>
  // 1. Module-level: exported types and constants
  export type {{COMPONENT_NAME}}Props = {
    title: string;
    variant?: 'default' | 'compact';
    children?: import('svelte').Snippet;
    onaction?: (value: string) => void;
  };
</script>

<script lang="ts">
  // 2. Instance-level: props, state, derived, effects
  let {
    title,
    variant = 'default',
    children,
    onaction,
  }: {{COMPONENT_NAME}}Props = $props();

  // 3. Local state
  let isActive = $state(false);

  // 4. Derived values
  let displayTitle = $derived(isActive ? `* ${title}` : title);

  // 5. Effects (sparingly)
  $effect(() => {
    // side effects here
  });

  // 6. Functions
  function handleClick(): void {
    isActive = !isActive;
    onaction?.(title);
  }
</script>

<!-- 7. Markup -->
<div class="component {variant}">
  <h3>{displayTitle}</h3>
  {#if children}{@render children()}{/if}
  <button onclick={handleClick}>Toggle</button>
</div>

<!-- 8. Styles -->
<style>
  .component { /* ... */ }
</style>
```

### 3. Runes Usage Priority

| Need | Rune | Example |
|------|------|---------|
| Component input | `$props()` | `let { title }: Props = $props()` |
| Mutable local state | `$state()` | `let count = $state(0)` |
| Computed value | `$derived()` | `let doubled = $derived(count * 2)` |
| Side effect | `$effect()` | `$effect(() => { ... })` |
| Two-way binding | `$bindable()` | `let value = $bindable('')` |

## Phases

1. **Code Style** - Formatting, naming, component structure, and file conventions
2. **Type System** - TypeScript conventions, prop typing, generics, and type exports
3. **Error Handling** - Component error boundaries, async errors, and user feedback
4. **Testing** - Component tests, state tests, and testing patterns
5. **Performance** - Reactivity efficiency, rendering, and bundle optimisation
6. **Security** - XSS prevention, input sanitisation, and safe patterns
7. **Documentation** - Component docs, JSDoc, and code comments

## When to Use

- Starting a new Svelte 5 project and need conventions from day one
- Onboarding new team members who need a style reference
- Establishing a code review checklist
- Migrating to Svelte 5 and want to codify the new patterns
- Building a component library with consistent standards

## Verification Commands

```bash
pnpm check    # Svelte type checking
pnpm lint     # Linting rules
pnpm test     # Run test suite
```
