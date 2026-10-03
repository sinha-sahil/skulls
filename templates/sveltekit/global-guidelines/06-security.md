# Phase 6: Security

Security guidelines and patterns for {{PROJECT_NAME}}.

## Objectives

- Establish CSRF protection conventions for form actions
- Define input validation patterns
- Set rules for secrets management with `$env`
- Document CSP headers and sanitisation
- Define authentication and authorisation patterns

## CSRF Protection in Form Actions

SvelteKit form actions have built-in CSRF protection. Ensure it is not disabled:

```typescript
// svelte.config.js - DO NOT disable CSRF
const config = {
  kit: {
    // csrf: { checkOrigin: false } // NEVER do this in production
  },
};
```

### Using `use:enhance` for Progressive Enhancement

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  type Props = { form: ActionData };
  let { form }: Props = $props();

  let submitting = $state(false);
</script>

<form
  method="POST"
  action="?/create"
  use:enhance={() => {
    submitting = true;
    return async ({ update }) => {
      submitting = false;
      await update();
    };
  }}
>
  <input name="title" required />
  <button type="submit" disabled={submitting}>
    {submitting ? 'Creating...' : 'Create'}
  </button>
</form>
```

## Input Validation

### Server-Side Validation (Required)

Always validate on the server. Client-side validation is UX only.

```typescript
// src/routes/items/+page.server.ts
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions } from './$types';

const createItemSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  description: z.string().max(1000).trim().optional(),
  price: z.coerce.number().positive().finite(),
});

type CreateItemInputType = z.infer<typeof createItemSchema>;

export const actions = {
  create: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Not authenticated' });
    }

    const formData = await request.formData();
    const raw = Object.fromEntries(formData);

    const parsed = createItemSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(400, {
        errors: parsed.error.flatten().fieldErrors,
        values: raw as Record<string, string>,
      });
    }

    const item = await createItem(parsed.data, locals.user.id);
    redirect(303, `/items/${item.id}`);
  },
} satisfies Actions;
```

### API Route Validation

```typescript
// src/routes/api/items/+server.ts
import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
});

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    error(401, { message: 'Unauthorized' });
  }

  const params = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!params.success) {
    return json(
      { success: false, error: 'Invalid query parameters', code: 'VALIDATION' },
      { status: 400 }
    );
  }

  const items = await getItems({ ...params.data, userId: locals.user.id });
  return json({ success: true, data: items });
};
```

## Secrets Management with $env

### Private Secrets (Server Only)

```typescript
// Only accessible in server-side code (+page.server.ts, +server.ts, $lib/server/)
import { DATABASE_URL, API_SECRET_KEY } from '$env/static/private';
import { env } from '$env/dynamic/private';

// Use static imports when values are known at build time
const db = createClient(DATABASE_URL);

// Use dynamic imports when values may change at runtime
const apiKey = env.API_SECRET_KEY;
```

### Public Environment Variables

```typescript
// Accessible everywhere, but NEVER put secrets here
import { PUBLIC_APP_URL, PUBLIC_ANALYTICS_ID } from '$env/static/public';
```

### Rules

```typescript
// NEVER do this - exposes secrets to client
// import { SECRET_KEY } from '$env/static/private'; // in +page.svelte

// NEVER do this - hardcoded secrets
// const API_KEY = 'sk-abc123...';

// CORRECT - secrets in .env, accessed via $env/static/private in server code
// .env
// DATABASE_URL=postgresql://...
// API_SECRET_KEY=sk-abc123...
```

## CSP Headers

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // SvelteKit needs unsafe-inline
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
};
```

## HTML Sanitisation

```typescript
// Svelte automatically escapes expressions in templates:
// {userInput} is safe - Svelte escapes HTML

// DANGEROUS - only use with trusted content
// {@html userInput}  // XSS risk!

// If you must render HTML, sanitise first:
import DOMPurify from 'dompurify';

type Props = { rawHtml: string };
let { rawHtml }: Props = $props();
let safeHtml = $derived(DOMPurify.sanitize(rawHtml));
```

```svelte
<!-- Safe - auto-escaped -->
<p>{userComment}</p>

<!-- Only for sanitised content -->
{@html safeHtml}
```

## Authentication Pattern

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get('session');

  if (session) {
    const user = await validateSession(session);
    event.locals.user = user;
  } else {
    event.locals.user = null;
  }

  // Protect authenticated routes
  if (event.url.pathname.startsWith('/app') && !event.locals.user) {
    redirect(303, `/login?redirect=${event.url.pathname}`);
  }

  return resolve(event);
};
```

### Authorisation in Load Functions

```typescript
// src/routes/(app)/admin/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    error(401, { message: 'Not authenticated' });
  }

  if (locals.user.role !== 'admin') {
    error(403, { message: 'Admin access required' });
  }

  return { stats: await getAdminStats() };
};
```

## Checklist

- [ ] CSRF protection enabled (default, not disabled)
- [ ] All form inputs validated server-side with Zod schemas
- [ ] API route inputs validated before processing
- [ ] Secrets stored in `.env` and accessed via `$env/static/private`
- [ ] No secrets in `$env/static/public` or client-side code
- [ ] CSP headers configured in `hooks.server.ts`
- [ ] `{@html}` only used with sanitised content
- [ ] Authentication implemented in server hooks
- [ ] Authorisation checked in load functions and form actions
- [ ] `.env` file listed in `.gitignore`
- [ ] `pnpm check` passes with zero errors
