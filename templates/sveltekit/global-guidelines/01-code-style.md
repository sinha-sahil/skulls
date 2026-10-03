# Phase 1: Code Style

Establish code style conventions for {{PROJECT_NAME}}.

## Objectives

- Define component structure and ordering conventions
- Establish file naming and organisation rules
- Set Svelte 5 runes as the only accepted reactive pattern
- Enforce `type` over `interface` everywhere

## Rule: Always `type`, Never `interface`

Every type definition must use the `type` keyword. This applies to all files:
`.ts`, `.svelte`, `.svelte.ts`.

```typescript
// CORRECT
type UserType = {
  id: string;
  name: string;
  email: string;
};

type PropsType = {
  user: UserType;
  onselect: (user: UserType) => void;
};

// WRONG - never use interface
interface UserType {
  id: string;
  name: string;
}
```

**Why:** `type` is more versatile (unions, intersections, mapped types) and provides
a consistent syntax across the codebase. `interface` has implicit declaration merging
which can cause unexpected behaviour.

## Rule: Svelte 5 Runes Only

All reactive code must use Svelte 5 runes. Legacy patterns are prohibited.

### $state - Reactive State

```svelte
<script lang="ts">
  // Simple state
  let count = $state(0);

  // Object state
  let user = $state<UserType>({ id: '', name: '', email: '' });

  // Array state
  let items = $state<ItemType[]>([]);
</script>
```

### $derived - Computed Values

```svelte
<script lang="ts">
  let items = $state<ItemType[]>([]);
  let count = $derived(items.length);
  let hasItems = $derived(count > 0);

  // Complex derivation
  let summary = $derived.by(() => {
    const active = items.filter((i) => i.status === 'active');
    return {
      total: items.length,
      active: active.length,
      inactive: items.length - active.length,
    };
  });
</script>
```

### $effect - Side Effects

```svelte
<script lang="ts">
  let query = $state('');

  // Effect with cleanup
  $effect(() => {
    const controller = new AbortController();
    fetch(`/api/search?q=${query}`, { signal: controller.signal });
    return () => controller.abort();
  });

  // Effect for logging/debugging
  $effect(() => {
    console.log('Query changed:', query);
  });
</script>
```

### $props - Component Props

```svelte
<script lang="ts">
  type Props = {
    title: string;
    description?: string;
    variant?: 'primary' | 'secondary';
    onclick?: () => void;
  };

  let { title, description = '', variant = 'primary', onclick }: Props = $props();
</script>
```

## Component File Structure

Every `.svelte` file follows this section order:

```svelte
<script lang="ts">
  // Section 1: Imports
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import Button from '{{LIB_PATH}}/client/components/Button.svelte';

  // Section 2: Types (if not imported)
  type Props = {
    title: string;
  };

  // Section 3: Props destructuring
  let { title }: Props = $props();

  // Section 4: Local state ($state)
  let isOpen = $state(false);

  // Section 5: Derived values ($derived)
  let displayTitle = $derived(title.toUpperCase());

  // Section 6: Effects ($effect)
  $effect(() => {
    document.title = displayTitle;
  });

  // Section 7: Functions
  function toggle() {
    isOpen = !isOpen;
  }
</script>

<!-- Section 8: Markup -->
<div class="wrapper">
  <h1>{displayTitle}</h1>
  <button onclick={toggle}>
    {isOpen ? 'Close' : 'Open'}
  </button>
</div>

<!-- Section 9: Styles (scoped) -->
<style>
  .wrapper {
    padding: 1rem;
  }
</style>
```

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase `.svelte` | `UserCard.svelte` |
| Rune modules | camelCase `.svelte.ts` | `authState.svelte.ts` |
| Utilities | camelCase `.ts` | `formatDate.ts` |
| Types | camelCase `.ts` | `userTypes.ts` |
| Server services | camelCase `.ts` | `userService.ts` |
| Constants | camelCase `.ts` | `appConfig.ts` |
| Test files | match source `.test.ts` | `UserCard.test.ts` |

## Route File Conventions

Standard route directory structure:

```text
src/routes/items/
  +page.server.ts      ← Server load function + form actions
  +page.ts             ← Client load function (optional)
  +page.svelte         ← Page component
  +error.svelte        ← Error boundary (optional)

src/routes/items/[id]/
  +page.server.ts
  +page.svelte
```

## TypeScript Configuration

Enforce strict mode in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Import Order

```typescript
// 1. SvelteKit imports
import { goto, invalidateAll } from '$app/navigation';
import { page } from '$app/state';

// 2. Third-party imports
import { z } from 'zod';

// 3. $lib server imports (server files only)
import { db } from '$lib/server/db';

// 4. $lib client imports
import Button from '$lib/client/components/Button.svelte';
import { formatDate } from '$lib/client/utils/formatDate';

// 5. $lib shared imports (types, constants)
import type { UserType } from '$lib/types/userTypes';
```

## Checklist

- [ ] `type` enforced over `interface` (lint rule configured)
- [ ] Svelte 5 runes are the only reactive pattern
- [ ] Component structure order documented and followed
- [ ] File naming conventions applied
- [ ] Route file conventions applied
- [ ] TypeScript strict mode enabled
- [ ] Import order convention documented
- [ ] ESLint and Prettier configured to enforce rules
- [ ] All existing code migrated to follow these conventions
