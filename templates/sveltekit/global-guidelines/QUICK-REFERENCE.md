# Global Guidelines Quick Reference

## Cardinal Rules

1. **Always `type`, never `interface`**
2. **Svelte 5 runes only** - `$state`, `$derived`, `$effect`, `$props`
3. **No `any` types** - use `unknown` with narrowing if needed
4. **TypeScript strict mode** - all code must pass `pnpm check`
5. **Server code stays server-side** - use `$lib/server/` for server-only code

## File Naming

| File | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UserCard.svelte` |
| Utilities | camelCase | `formatDate.ts` |
| Types | camelCase, suffix `Type` | `userTypes.ts`, `type UserType = {}` |
| Services | camelCase | `userService.ts` |
| Constants | camelCase file, UPPER_SNAKE values | `config.ts`, `MAX_RETRIES` |
| Rune modules | camelCase with `.svelte.ts` | `counter.svelte.ts` |

## Component Structure

```svelte
<script lang="ts">
  // 1. Imports
  import { goto } from '$app/navigation';
  import Button from '$lib/client/components/Button.svelte';

  // 2. Types
  type Props = {
    title: string;
    items: ItemType[];
    onselect?: (item: ItemType) => void;
  };

  // 3. Props
  let { title, items, onselect }: Props = $props();

  // 4. State
  let selected = $state<ItemType | null>(null);

  // 5. Derived
  let count = $derived(items.length);

  // 6. Effects
  $effect(() => {
    console.log('Selected:', selected);
  });

  // 7. Functions
  function handleSelect(item: ItemType) {
    selected = item;
    onselect?.(item);
  }
</script>

<!-- 8. Markup -->
<div>
  <h2>{title} ({count})</h2>
  {#each items as item}
    <button onclick={() => handleSelect(item)}>{item.name}</button>
  {/each}
</div>

<!-- 9. Styles -->
<style>
  div { padding: 1rem; }
</style>
```

## Route File Order

```text
src/routes/items/
  +page.server.ts      ← Server load + form actions
  +page.ts             ← Client load (if needed)
  +page.svelte         ← Page component
  +error.svelte        ← Error boundary
  +layout.server.ts    ← Layout server load
  +layout.svelte       ← Layout component
```

## Type Patterns

```typescript
// Simple type
type UserType = {
  id: string;
  name: string;
  email: string;
};

// Union type
type StatusType = 'active' | 'inactive' | 'pending';

// Discriminated union
type ResultType<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Extending types
type AdminUserType = UserType & {
  role: 'admin';
  permissions: string[];
};
```

## Error Handling

```typescript
// In load functions
import { error } from '@sveltejs/kit';
if (!item) error(404, { message: 'Not found' });

// In form actions
import { fail } from '@sveltejs/kit';
if (!valid) return fail(400, { field: value, error: 'Invalid' });

// In API routes
return new Response(JSON.stringify({ error: 'message' }), { status: 400 });
```

## Testing

```bash
pnpm test              # Run all tests
pnpm test -- --watch   # Watch mode
pnpm check             # Type checking
pnpm lint              # Linting
pnpm build             # Production build
```

## Forbidden Patterns

| Pattern | Replacement |
|---------|------------|
| `interface Foo {}` | `type Foo = {}` |
| `export let prop` | `let { prop } = $props()` |
| `$: derived = expr` | `let derived = $derived(expr)` |
| `createEventDispatcher` | Callback props |
| `<slot />` | `{@render children()}` |
| `writable()` / `readable()` | `$state()` in `.svelte.ts` |
| `: any` | Specific type or `unknown` |
| `on:click` | `onclick` |

## Verification Commands

```bash
pnpm check    # svelte-check for type errors
pnpm lint     # Linter for code issues
pnpm test     # Run test suite
pnpm build    # Production build verification
```

## Checklist

- [ ] All team members have read these guidelines
- [ ] ESLint/Prettier configured to enforce style rules
- [ ] CI pipeline runs all verification commands
- [ ] Code review checklist includes guideline adherence
- [ ] New components follow the component structure template
- [ ] All types use `type` keyword, never `interface`
- [ ] No legacy Svelte 4 patterns in new code
