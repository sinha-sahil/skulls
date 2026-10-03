# Phase 3: Module Boundaries

Establish clear rules for server vs client code separation, shared type management,
and when to use each SvelteKit module pattern.

## Objectives

- Define strict server/client/shared boundaries
- Document when to use +page.server.ts vs +server.ts
- Establish shared type and utility patterns
- Prevent server code leaking into client bundles

## Critical Rules

1. **Always use `type`, never `interface`**
2. **Server code never enters client bundles** - SvelteKit enforces this at build time
3. **`$lib/server/` is off-limits to client code** - imports will fail
4. **Shared code must be isomorphic** - runs identically on server and client

## Server vs Client Boundary

### The Three Zones

```text
┌─────────────────────────────────────────────┐
│                SERVER ONLY                   │
│  $lib/server/    +page.server.ts             │
│  +server.ts      +layout.server.ts           │
│  hooks.server.ts $env/static/private         │
│                                              │
│  Can access: DB, filesystem, secrets,        │
│  environment variables, external APIs        │
├─────────────────────────────────────────────┤
│               SHARED (ISOMORPHIC)            │
│  $lib/shared/                                │
│                                              │
│  Contains: types, constants, validation      │
│  schemas, pure utility functions             │
│  Must work: in both Node.js and browser      │
├─────────────────────────────────────────────┤
│               CLIENT ONLY                    │
│  $lib/client/    +page.svelte                │
│  +layout.svelte  +error.svelte               │
│                                              │
│  Can access: DOM, browser APIs, $app/stores  │
│  Svelte stores, component lifecycle          │
└─────────────────────────────────────────────┘
```

### Import Rules

```typescript
// FROM $lib/server/ - server files ONLY can import
// +page.server.ts, +server.ts, hooks.server.ts
import { db } from '$lib/server/db';
import { hashPassword } from '$lib/server/auth';

// FROM $lib/shared/ - ANYONE can import
import type { UserType } from '$lib/shared/types';
import { formatDate } from '$lib/shared/utils';

// FROM $lib/client/ - client files ONLY should import
// +page.svelte, +layout.svelte, other .svelte files
import { UserCard } from '$lib/client/components/domain';
import { userStore } from '$lib/client/modules/user';

// FROM $env/ - respect the privacy boundary
import { DATABASE_URL } from '$env/static/private';  // Server only!
import { PUBLIC_API_URL } from '$env/static/public';  // Safe anywhere
```

## When to Use Each Route File

### +page.server.ts vs +page.ts

```typescript
// +page.server.ts - Use when you need:
// - Database access
// - Secret environment variables
// - Server-only libraries (bcrypt, sharp, etc.)
// - Form actions (POST handling)
// - Code that must NEVER reach the client bundle

import { db } from '$lib/server/db';
import { env } from '$env/static/private';

export const load = async ({ locals }) => {
  const user = await db.user.findUnique({
    where: { id: locals.userId }
  });
  return { user };
};

export const actions = {
  updateProfile: async ({ request, locals }) => {
    const formData = await request.formData();
    // Server-side form processing
  }
};
```

```typescript
// +page.ts - Use when you need:
// - Data fetching via public APIs (fetch)
// - Client-side navigation efficiency (data loads on client too)
// - No secrets or server-only dependencies

export const load = async ({ fetch, params }) => {
  const res = await fetch(`/api/posts/${params.slug}`);
  if (!res.ok) throw error(404, 'Post not found');
  const post = await res.json();
  return { post };
};
```

### +server.ts - Standalone API Endpoints

```typescript
// +server.ts - Use when:
// - Building REST API routes (no HTML page)
// - Handling webhooks from external services
// - Providing JSON responses for client modules
// - Creating endpoints consumed by other applications

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ params, locals }) => {
  const items = await db.item.findMany({
    where: { userId: locals.userId }
  });
  return json(items);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  const item = await db.item.create({ data: body });
  return json(item, { status: 201 });
};
```

### Decision Matrix

| Need | Use | Reason |
|------|-----|--------|
| Page with DB data | +page.server.ts | Server-only access |
| Page with public API data | +page.ts | Runs on client for SPA navigation |
| Form submission | +page.server.ts (actions) | Server-side processing |
| REST API endpoint | +server.ts | No page, just data |
| Webhook handler | +server.ts | External service calls |
| Page with no data | +page.svelte only | No load needed |
| Layout with auth check | +layout.server.ts | Check session server-side |
| Layout with theme data | +layout.ts | Client-safe data |

## Shared Module Patterns

### Types Shared Between Server and Client

```typescript
// $lib/shared/types/api.ts
// These types are used by both +server.ts and client modules

type ApiResponseType<T> = {
  data: T;
  meta: PaginationType;
};

type PaginationType = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

type ApiErrorType = {
  code: string;
  message: string;
  details?: Record<string, string[]>;
};

export type { ApiResponseType, PaginationType, ApiErrorType };
```

### Validation Schemas Shared Across Boundaries

```typescript
// $lib/shared/schemas/userSchema.ts
// Used by both server form actions and client-side validation
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

// Derive the type from the schema
export type CreateUserInputType = z.infer<typeof createUserSchema>;
```

### Constants Shared Across Boundaries

```typescript
// $lib/shared/constants/config.ts
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_EXTENSIONS = ['jpg', 'png', 'webp'] as const;
export const PAGINATION_DEFAULT_SIZE = 20;
```

## Module Independence Rules

1. **`$lib/server/` modules** must never import from `$lib/client/`
2. **`$lib/client/` modules** must never import from `$lib/server/`
3. **`$lib/shared/`** must never import from `$lib/client/` or `$lib/server/`
4. **Route files** can import from any `$lib/` zone appropriate to their type
5. **Client modules** should be self-contained with clear boundaries

## Verification

Before moving to the next phase:

- [ ] Server/client/shared boundaries are clearly defined
- [ ] Each route file type decision is documented
- [ ] Import rules are established and documented
- [ ] Shared types cover all cross-boundary needs
- [ ] Validation schemas work on both server and client
- [ ] No server imports planned for client code
- [ ] +page.server.ts vs +page.ts decisions are made for each route
- [ ] +server.ts routes identified for API endpoints
- [ ] Module independence rules are documented
