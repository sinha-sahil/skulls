# Phase 3: Error Handling

Error handling patterns and conventions for {{PROJECT_NAME}}.

## Objectives

- Standardise error handling across server and client code
- Define patterns for load functions, form actions, and API routes
- Establish error boundary conventions with `+error.svelte`
- Document server-side vs client-side error handling

## SvelteKit Error Primitives

### `error()` - For Load Functions and API Routes

Throws an HTTP error that SvelteKit catches and renders via `+error.svelte`:

```typescript
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    error(401, { message: 'You must be logged in' });
  }

  const item = await db.item.findUnique({ where: { id: params.id } });

  if (!item) {
    error(404, { message: 'Item not found' });
  }

  if (item.ownerId !== locals.user.id) {
    error(403, { message: 'You do not have access to this item' });
  }

  return { item };
};
```

### `fail()` - For Form Actions

Returns validation errors without triggering the error page:

```typescript
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  create: async ({ request, locals }) => {
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');

    // Validate each field
    type FormErrorsType = {
      name?: string;
      email?: string;
    };

    const errors: FormErrorsType = {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      errors.email = 'Valid email is required';
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, {
        errors,
        values: { name: name?.toString() ?? '', email: email?.toString() ?? '' },
      });
    }

    try {
      const user = await createUser({
        name: name as string,
        email: email as string,
      });
      redirect(303, `/users/${user.id}`);
    } catch (e) {
      return fail(500, {
        errors: { name: 'An unexpected error occurred' },
        values: { name: name?.toString() ?? '', email: email?.toString() ?? '' },
      });
    }
  },
} satisfies Actions;
```

### Consuming Form Errors in Components

```svelte
<script lang="ts">
  import type { ActionData } from './$types';
  import { enhance } from '$app/forms';

  type Props = { form: ActionData };
  let { form }: Props = $props();
</script>

<form method="POST" action="?/create" use:enhance>
  <label>
    Name
    <input name="name" value={form?.values?.name ?? ''} />
    {#if form?.errors?.name}
      <span class="error">{form.errors.name}</span>
    {/if}
  </label>

  <label>
    Email
    <input name="email" type="email" value={form?.values?.email ?? ''} />
    {#if form?.errors?.email}
      <span class="error">{form.errors.email}</span>
    {/if}
  </label>

  <button type="submit">Create</button>
</form>
```

## Error Boundary with +error.svelte

### Root Error Boundary

```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="error-page">
  <h1>{page.status}</h1>
  <p>{page.error?.message ?? 'An unexpected error occurred'}</p>

  {#if page.status === 404}
    <a href="/">Go home</a>
  {:else}
    <button onclick={() => window.location.reload()}>Try again</button>
  {/if}
</div>
```

### Route-Specific Error Boundaries

```svelte
<!-- src/routes/items/+error.svelte -->
<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="error-container">
  {#if page.status === 404}
    <h2>Item not found</h2>
    <p>The item you're looking for doesn't exist or has been removed.</p>
    <a href="/items">Back to items</a>
  {:else if page.status === 403}
    <h2>Access denied</h2>
    <p>You don't have permission to view this item.</p>
  {:else}
    <h2>Something went wrong</h2>
    <p>{page.error?.message}</p>
  {/if}
</div>
```

## API Route Error Handling

```typescript
// src/routes/api/items/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.user) {
    error(401, { message: 'Unauthorized' });
  }

  try {
    const items = await getItems(locals.user.id);
    return json({ success: true, data: items });
  } catch (e) {
    console.error('Failed to fetch items:', e);
    return json(
      { success: false, error: 'Failed to fetch items', code: 'FETCH_ERROR' },
      { status: 500 }
    );
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    error(401, { message: 'Unauthorized' });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(
      { success: false, error: 'Invalid JSON body', code: 'INVALID_JSON' },
      { status: 400 }
    );
  }

  // Validate with zod or manual checks
  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { success: false, error: parsed.error.message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  const item = await createItem(parsed.data, locals.user.id);
  return json({ success: true, data: item }, { status: 201 });
};
```

## Server-Side vs Client-Side Error Handling

| Context | Pattern | Effect |
|---------|---------|--------|
| Load function | `error(status, { message })` | Renders `+error.svelte` |
| Form action | `fail(status, data)` | Returns data to form, no page change |
| API route | `json({ error }, { status })` | Returns JSON error response |
| Client fetch | `try/catch` with error state | Update `$state` to show error |
| Hooks | `error(status, { message })` | Renders `+error.svelte` |

## Client-Side Error State Pattern

```svelte
<script lang="ts">
  type ErrorStateType = {
    message: string;
    code: string;
  } | null;

  let error = $state<ErrorStateType>(null);
  let loading = $state(false);

  async function fetchData() {
    loading = true;
    error = null;

    try {
      const response = await fetch('/api/items');
      if (!response.ok) {
        const body = await response.json();
        error = { message: body.error, code: body.code };
        return;
      }
      const data = await response.json();
      // process data
    } catch (e) {
      error = { message: 'Network error', code: 'NETWORK' };
    } finally {
      loading = false;
    }
  }
</script>

{#if error}
  <div class="error" role="alert">
    <p>{error.message}</p>
    <button onclick={fetchData}>Retry</button>
  </div>
{/if}
```

## Checklist

- [ ] All load functions use `error()` for HTTP errors
- [ ] All form actions use `fail()` for validation errors
- [ ] All API routes return consistent error JSON
- [ ] Root `+error.svelte` handles common status codes
- [ ] Route-specific error boundaries where needed
- [ ] Client-side error states use typed `$state`
- [ ] No raw `throw new Error()` in server route handlers
- [ ] Error messages are user-friendly (no stack traces in production)
- [ ] `pnpm check` passes with zero errors
