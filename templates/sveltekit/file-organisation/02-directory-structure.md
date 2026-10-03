# Phase 2: Directory Structure

Define the target directory layout covering routes, library code, and static assets
using SvelteKit conventions.

## Objectives

- Design the complete target directory structure
- Define the route hierarchy with proper SvelteKit file conventions
- Establish the `$lib` subdirectory layout
- Plan static asset organisation

## Critical Rules

1. **Always use `type`, never `interface`**
2. **Route files must use `+` prefix** (+page.svelte, +layout.svelte, +server.ts)
3. **Server code lives in `$lib/server/`** or `.server.ts` suffixed files
4. **Use `$lib` alias** for all cross-boundary imports

## Target Root Structure

```text
{{LIB_PATH}}/
├── src/
│   ├── routes/              # File-based routing
│   ├── lib/                 # Importable via $lib alias
│   │   ├── client/          # Client-only code
│   │   ├── server/          # Server-only code
│   │   └── shared/          # Isomorphic code
│   ├── params/              # Route parameter matchers
│   ├── app.html             # HTML shell
│   ├── app.css              # Global styles (if used)
│   ├── app.d.ts             # App-level type declarations
│   └── hooks.server.ts      # Server hooks (auth, logging)
├── static/                  # Served as-is (favicon, robots.txt)
├── tests/                   # E2E tests (Playwright)
├── svelte.config.js
├── vite.config.ts
└── tsconfig.json
```

## Route Structure Design

### Route Hierarchy Pattern

```text
src/routes/
├── +page.svelte                    # / (home)
├── +page.ts                        # Home load function
├── +layout.svelte                  # Root layout (nav, footer)
├── +layout.ts                      # Root layout data
├── +error.svelte                   # Root error boundary
│
├── (marketing)/                    # Group: public marketing pages
│   ├── +layout.svelte              # Marketing layout (no sidebar)
│   ├── about/
│   │   └── +page.svelte            # /about
│   ├── pricing/
│   │   └── +page.svelte            # /pricing
│   └── blog/
│       ├── +page.svelte            # /blog (list)
│       ├── +page.server.ts         # Blog list data from DB
│       └── [slug]/
│           ├── +page.svelte        # /blog/:slug
│           └── +page.server.ts     # Single post data
│
├── (app)/                          # Group: authenticated app
│   ├── +layout.svelte              # App layout (sidebar, auth check)
│   ├── +layout.server.ts           # Auth guard load function
│   ├── dashboard/
│   │   ├── +page.svelte            # /dashboard
│   │   └── +page.server.ts         # Dashboard data
│   └── settings/
│       ├── +page.svelte            # /settings
│       ├── +page.server.ts         # Settings load + form actions
│       └── profile/
│           ├── +page.svelte        # /settings/profile
│           └── +page.server.ts     # Profile form actions
│
├── (auth)/                         # Group: authentication pages
│   ├── +layout.svelte              # Auth layout (centered, minimal)
│   ├── login/
│   │   ├── +page.svelte            # /login
│   │   └── +page.server.ts         # Login form action
│   └── register/
│       ├── +page.svelte            # /register
│       └── +page.server.ts         # Registration form action
│
└── api/                            # API endpoints (no pages)
    ├── health/
    │   └── +server.ts              # GET /api/health
    └── v1/
        └── [resource]/
            ├── +server.ts          # GET/POST /api/v1/:resource
            └── [id]/
                └── +server.ts      # GET/PUT/DELETE /api/v1/:resource/:id
```

### Route File Selection Guide

For each route, decide which files are needed:

```typescript
// +page.svelte - ALWAYS needed for visible pages
// The page component rendered in the browser

// +page.ts - Universal load (runs on server AND client)
// Use when: data fetching doesn't need secrets, good for client navigation
export const load = async ({ fetch, params }) => {
  const res = await fetch(`/api/posts/${params.slug}`);
  const post = await res.json();
  return { post };
};

// +page.server.ts - Server-only load + form actions
// Use when: need DB access, secrets, or form handling
export const load = async ({ locals, params }) => {
  const post = await db.post.findUnique({ where: { slug: params.slug } });
  return { post };
};

export const actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    // Process form...
  }
};

// +server.ts - API endpoint (no page rendered)
// Use when: building REST APIs, webhooks, programmatic endpoints
export const GET = async ({ params }) => {
  return new Response(JSON.stringify({ status: 'ok' }));
};
```

## Library Structure Design

### Client Code (`$lib/client/`)

```text
src/lib/client/
├── components/
│   ├── ui/                     # Generic, reusable UI components
│   │   ├── Button.svelte
│   │   ├── Modal.svelte
│   │   ├── Input.svelte
│   │   └── index.ts            # Barrel export
│   └── domain/                 # Domain-specific components
│       ├── UserAvatar.svelte
│       ├── PostCard.svelte
│       └── index.ts
├── modules/                    # Feature modules (self-contained)
│   ├── auth/                   # Auth module (store, remote, UI)
│   ├── notifications/          # Notification module
│   └── [module-name]/          # Standard module structure
│       ├── index.ts
│       ├── store.ts
│       ├── remote.ts
│       ├── types.ts
│       ├── utils.ts
│       └── ui/
└── utils/                      # Client-only utility functions
    ├── format.ts
    ├── validation.ts
    └── index.ts
```

### Server Code (`$lib/server/`)

```text
src/lib/server/
├── db/                         # Database layer
│   ├── client.ts               # DB client initialisation
│   ├── schema.ts               # Schema definitions (if applicable)
│   └── index.ts
├── auth/                       # Authentication
│   ├── session.ts              # Session management
│   ├── password.ts             # Hashing, comparison
│   └── index.ts
├── services/                   # Business logic
│   ├── userService.ts
│   ├── postService.ts
│   └── index.ts
└── utils/                      # Server-only utilities
    ├── email.ts
    ├── crypto.ts
    └── index.ts
```

### Shared Code (`$lib/shared/`)

```text
src/lib/shared/
├── types/                      # Type definitions
│   ├── user.ts                 # User-related types
│   ├── post.ts                 # Post-related types
│   ├── api.ts                  # API response/request types
│   └── index.ts                # Barrel re-exports
├── constants/                  # Shared constants
│   ├── config.ts               # App configuration constants
│   ├── routes.ts               # Route path constants
│   └── index.ts
├── schemas/                    # Validation schemas (zod, etc.)
│   ├── userSchema.ts
│   └── index.ts
└── utils/                      # Isomorphic utilities
    ├── date.ts                 # Date formatting (works everywhere)
    ├── string.ts               # String manipulation
    └── index.ts
```

### Type Definition Pattern

```typescript
// src/lib/shared/types/user.ts
// Always use type, never interface

type UserRoleType = 'admin' | 'editor' | 'viewer';

type UserType = {
  id: string;
  email: string;
  name: string;
  role: UserRoleType;
  createdAt: string;
  updatedAt: string;
};

type CreateUserRequestType = {
  email: string;
  name: string;
  password: string;
  role?: UserRoleType;
};

export type { UserType, UserRoleType, CreateUserRequestType };
```

## Static Assets Structure

```text
static/
├── favicon.ico
├── favicon.png
├── robots.txt
├── sitemap.xml
├── images/
│   ├── logo.svg
│   └── og-image.png
└── fonts/                      # Self-hosted fonts (if any)
    └── inter-var.woff2
```

## Verification

Before moving to the next phase:

- [ ] Complete route hierarchy is designed
- [ ] Route groups defined for logical sections
- [ ] Each route has appropriate +file types selected
- [ ] `$lib/client/` structure is planned
- [ ] `$lib/server/` structure is planned
- [ ] `$lib/shared/` structure is planned
- [ ] Static assets location defined
- [ ] Barrel export files planned for each directory
- [ ] Type files use `type` not `interface`
- [ ] Structure diagram is documented
