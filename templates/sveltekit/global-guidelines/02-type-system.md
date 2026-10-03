# Phase 2: Type System

TypeScript conventions and type patterns for {{PROJECT_NAME}}.

## Objectives

- Define standard type patterns for the project
- Establish conventions for generated types
- Set rules for PageData, LayoutData, and form action types
- Document discriminated union and utility type patterns

## Rule: Always `type`, Never `interface`

This rule bears repeating. Every type definition uses the `type` keyword.

```typescript
// CORRECT
type UserType = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

// WRONG
interface UserType {
  id: string;
  name: string;
}
```

## Type Naming Convention

All custom types use a `Type` suffix to distinguish them from runtime values:

```typescript
type UserType = { id: string; name: string };
type ApiResponseType<T> = { data: T; error: string | null };
type RouteParamsType = { id: string; slug: string };
```

Exception: Props types within a single component can use `Props`:

```svelte
<script lang="ts">
  type Props = {
    title: string;
  };
  let { title }: Props = $props();
</script>
```

## Generated Types with type-crafter

Use type-crafter YAML specs as the source of truth for shared types:

```yaml
# specs/user.yaml
version: "1.0"
title: User Types
types:
  UserType:
    fields:
      id: string
      name: string
      email: string
      role: UserRoleType
  UserRoleType:
    enum:
      - admin
      - editor
      - viewer
```

Generate types with:

```bash
type-crafter generate specs/user.yaml --lang typescript --output src/lib/types/
```

## SvelteKit Page and Layout Types

### PageData Typing

```typescript
// src/routes/items/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const page = Number(url.searchParams.get('page') ?? '1');
  const items = await getItems({ page, userId: locals.user.id });

  return {
    items,
    page,
    totalPages: items.totalPages,
  };
};
```

```svelte
<!-- src/routes/items/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  type Props = { data: PageData };
  let { data }: Props = $props();

  // data.items, data.page, data.totalPages are all typed
</script>
```

### LayoutData Typing

```typescript
// src/routes/(app)/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    user: locals.user,
    notifications: await getNotifications(locals.user.id),
  };
};
```

### Client-Side Load Typing

```typescript
// src/routes/items/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, fetch }) => {
  // data comes from +page.server.ts
  const enriched = await fetch(`/api/items/metadata`).then((r) => r.json());

  return {
    ...data,
    metadata: enriched,
  };
};
```

## Form Action Return Types

```typescript
// src/routes/items/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  create: async ({ request, locals }) => {
    const formData = await request.formData();
    const name = formData.get('name');

    if (!name || typeof name !== 'string') {
      return fail(400, {
        error: 'Name is required',
        values: { name: '' },
      });
    }

    if (name.length < 3) {
      return fail(400, {
        error: 'Name must be at least 3 characters',
        values: { name },
      });
    }

    const item = await createItem({ name, userId: locals.user.id });
    redirect(303, `/items/${item.id}`);
  },

  delete: async ({ request, locals }) => {
    const formData = await request.formData();
    const id = formData.get('id');

    if (!id || typeof id !== 'string') {
      return fail(400, { error: 'Invalid item ID' });
    }

    await deleteItem(id, locals.user.id);
    return { success: true };
  },
} satisfies Actions;
```

**Consuming action data in the page:**

```svelte
<script lang="ts">
  import type { ActionData, PageData } from './$types';

  type Props = {
    data: PageData;
    form: ActionData;
  };

  let { data, form }: Props = $props();
</script>

{#if form?.error}
  <p class="error">{form.error}</p>
{/if}
```

## API Response Types

```typescript
// src/lib/types/apiTypes.ts
type ApiSuccessType<T> = {
  success: true;
  data: T;
};

type ApiErrorType = {
  success: false;
  error: string;
  code: string;
};

type ApiResponseType<T> = ApiSuccessType<T> | ApiErrorType;

// Usage in API routes
// src/routes/api/items/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
  try {
    const items = await getItems(locals.user.id);
    return json({ success: true, data: items } satisfies ApiResponseType<ItemType[]>);
  } catch (e) {
    return json(
      { success: false, error: 'Failed to fetch items', code: 'FETCH_ERROR' } satisfies ApiErrorType,
      { status: 500 }
    );
  }
};
```

## Discriminated Unions

Use discriminated unions for state machines and result types:

```typescript
type LoadingStateType<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// Usage
function handleState(state: LoadingStateType<UserType>) {
  switch (state.status) {
    case 'idle':
      return 'Ready';
    case 'loading':
      return 'Loading...';
    case 'success':
      return state.data.name; // TypeScript knows data exists
    case 'error':
      return state.error; // TypeScript knows error exists
  }
}
```

## Utility Type Patterns

```typescript
// Make all fields optional for update operations
type UpdateUserType = Partial<Omit<UserType, 'id' | 'createdAt'>>;

// Pick specific fields
type UserSummaryType = Pick<UserType, 'id' | 'name'>;

// Record for maps
type UserMapType = Record<string, UserType>;

// Extract from union
type ActiveStatusType = Extract<StatusType, 'active' | 'verified'>;
```

## Checklist

- [ ] All types use `type` keyword with `Type` suffix
- [ ] Generated types configured via type-crafter specs
- [ ] All load functions have explicit types from `$types`
- [ ] Form actions use `fail()` with typed return values
- [ ] API response types follow `ApiResponseType<T>` pattern
- [ ] Discriminated unions used for state machines
- [ ] No `any` types in the codebase
- [ ] TypeScript strict mode enabled
- [ ] `pnpm check` passes with zero errors
