# Global Guidelines Template

Establish and document SvelteKit coding standards, conventions, and best practices
for {{PROJECT_NAME}}.

## Overview

Consistent coding standards across a SvelteKit project reduce code review friction,
make onboarding faster, and prevent entire categories of bugs. This template covers
code style, type system conventions, error handling, testing, performance, security,
and documentation practices.

## Critical Rules

### 1. Always Use `type`, Never `interface`

```typescript
// CORRECT
type UserType = {
  id: string;
  name: string;
  email: string;
};

// WRONG - never use interface
interface User {
  id: string;
  name: string;
  email: string;
}
```

### 2. Svelte 5 Runes Only

Use `$state`, `$derived`, `$effect`, and `$props` exclusively. Never use legacy
Svelte 4 patterns (stores, `$:`, `export let`, `createEventDispatcher`, `<slot>`).

```svelte
<script lang="ts">
  type Props = {
    title: string;
    count?: number;
  };

  let { title, count = 0 }: Props = $props();
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log('Title changed:', title);
  });
</script>
```

### 3. TypeScript Strict Mode

All code must pass `pnpm check` with zero errors. No `any` types allowed.

## Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project identifier | `my-saas-app` |
| `{{APP_NAME}}` | Application display name | `My SaaS App` |
| `{{LIB_PATH}}` | Lib directory path | `$lib` |

## Phases

1. **Code Style** - File structure, component conventions, naming rules
2. **Type System** - TypeScript patterns, generated types, API response types
3. **Error Handling** - SvelteKit error patterns, load functions, form actions
4. **Testing** - Unit, component, and E2E testing standards
5. **Performance** - SSR/CSR decisions, streaming, lazy loading, optimisation
6. **Security** - CSRF, input validation, secrets management, auth patterns
7. **Documentation** - JSDoc, route docs, API docs, type docs

## When to Use

- Starting a new SvelteKit project
- Onboarding new team members
- Establishing coding standards for an existing project
- Resolving inconsistencies in code style
- Preparing for a code quality initiative

## File Conventions

```text
src/
  lib/
    client/
      components/     ← Shared UI components
      utils/          ← Client-side utilities
    server/
      services/       ← Business logic
      db/             ← Database access
      utils/          ← Server-side utilities
    types/            ← Shared type definitions
  routes/
    (app)/            ← Authenticated routes
    (public)/         ← Public routes
    api/              ← API endpoints
```
