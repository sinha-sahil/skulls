# Phase 7: Documentation

**Dependencies:** Phase 1 (Code Style), Phase 2 (Type System)

## Objectives

- Establish documentation standards for Svelte 5 components
- Define when and how to document component APIs
- Standardise inline and external documentation

## 7.1 Component Documentation

### JSDoc for Component Props

Document the props type with JSDoc above the type definition:

```svelte
<script lang="ts">
  /**
   * Props for the {{COMPONENT_NAME}} component.
   *
   * @example
   * <{{COMPONENT_NAME}} title="Hello" variant="primary" />
   */
  type {{COMPONENT_NAME}}Props = {
    /** Display title for the component */
    title: string;
    /** Visual variant */
    variant?: 'primary' | 'secondary';
    /** Called when the user confirms the action */
    onConfirm?: () => void;
  };

  let { title, variant = 'primary', onConfirm }: {{COMPONENT_NAME}}Props = $props();
</script>
```

## 7.2 When to Document

| Item | Document? | How |
|------|-----------|-----|
| Public component props | Always | JSDoc on the props type |
| Exported functions | Always | JSDoc with `@param` and `@returns` |
| Complex derived state | Yes | Inline comment explaining the derivation |
| Obvious reactive state | No | `let count = $state(0)` is self-explanatory |
| Snippet props | Yes | JSDoc describing expected content |
| Internal helpers | Only if non-obvious | Brief inline comment |

## 7.3 Snippet Documentation

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  type {{COMPONENT_NAME}}Props = {
    /**
     * Header content rendered above the body.
     * Receives the current title as an argument.
     *
     * @example
     * {#snippet header(title)}
     *   <h2>{title}</h2>
     * {/snippet}
     */
    header?: Snippet<[string]>;
    /** Main body content */
    children: Snippet;
  };

  let { header, children }: {{COMPONENT_NAME}}Props = $props();
</script>
```

## 7.4 Utility and Module Documentation

```typescript
// {{LIB_PATH}}/utils/format.ts

/**
 * Formats a date relative to now (e.g., "2 hours ago").
 *
 * @param date - The date to format
 * @param locale - BCP 47 locale string (defaults to 'en')
 * @returns Human-readable relative time string
 */
export function formatRelativeTime(date: Date, locale = 'en'): string {
  // implementation
}
```

## 7.5 README Standards

Each component library or module should include a README with:

1. **Purpose** — what the component/module does
2. **Usage** — import and basic example
3. **Props** — table of all props with types and defaults
4. **Events/Callbacks** — list of callback props
5. **Snippets** — list of snippet slots with expected arguments

## 7.6 Inline Comment Rules

Follow the global project rule: code must be self-explanatory.

```svelte
<script lang="ts">
  // WRONG — obvious comment
  // Increment the counter
  function increment() { count++; }

  // CORRECT — explains non-obvious logic
  // Debounce search to avoid hammering the API on every keystroke
  let debounceTimer: ReturnType<typeof setTimeout>;
  function debouncedSearch(query: string) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => search(query), 300);
  }
</script>
```

## Checklist

- [ ] All public component props types have JSDoc
- [ ] All exported utility functions have JSDoc with `@param` and `@returns`
- [ ] Snippet props document expected content and arguments
- [ ] Complex derived state has explanatory comments
- [ ] No redundant comments on obvious code
- [ ] Component library has a README with usage examples
- [ ] Non-obvious logic has inline comments explaining **why**

## Verification

```bash
pnpm check
pnpm lint
```
