# File Organisation Quick Reference

## Critical Rules

1. **Always use `type`, never `interface`**
2. **Use `$lib` alias** for all cross-module imports
3. **Server code in `$lib/server/`** or `.server.ts` files only
4. **Route files use `+` prefix** (+page.svelte, +layout.svelte, +server.ts)
5. **Components use PascalCase** (UserCard.svelte, not user-card.svelte)

## SvelteKit Route Files

```text
src/routes/
├── +page.svelte            # Home page
├── +layout.svelte          # Root layout
├── +error.svelte           # Root error boundary
├── about/
│   └── +page.svelte        # /about
├── blog/
│   ├── +page.svelte        # /blog (list)
│   ├── +page.server.ts     # Blog list load + actions
│   └── [slug]/
│       ├── +page.svelte    # /blog/:slug
│       └── +page.server.ts # Individual post load
├── api/
│   └── health/
│       └── +server.ts      # GET /api/health
└── (auth)/                 # Route group (no URL segment)
    ├── login/
    │   └── +page.svelte    # /login
    └── register/
        └── +page.svelte    # /register
```

## Library Structure

```text
src/lib/
├── client/                 # Client-only code
│   ├── components/         # Shared UI components
│   │   ├── ui/             # Generic UI (Button, Modal)
│   │   └── domain/         # Domain-specific (UserCard)
│   ├── modules/            # Feature modules (stores, remote, UI)
│   └── utils/              # Client-only utilities
├── server/                 # Server-only code
│   ├── db/                 # Database access
│   ├── auth/               # Authentication logic
│   ├── services/           # Business logic services
│   └── utils/              # Server-only utilities
└── shared/                 # Shared between client and server
    ├── types/              # Type definitions
    ├── constants/          # Shared constants
    ├── utils/              # Isomorphic utilities
    └── schemas/            # Validation schemas (zod, etc.)
```

## Route File Decision Tree

```text
Need to fetch data?
├── Yes → Data needs secrets/DB?
│   ├── Yes → +page.server.ts (load function)
│   └── No  → +page.ts (universal load)
└── No  → Just +page.svelte

Need form handling?
├── Yes → +page.server.ts (form actions)
└── No  → Client-side handlers

Need API endpoint (no page)?
├── Yes → +server.ts (GET, POST, PUT, DELETE)
└── No  → Use load functions instead
```

## Import Patterns

```typescript
// $lib alias - for cross-module imports
import { Button } from '$lib/client/components/ui';
import type { UserType } from '$lib/shared/types';
import { db } from '$lib/server/db';  // Server files only!

// $app imports - SvelteKit built-ins
import { page } from '$app/stores';
import { goto, invalidateAll } from '$app/navigation';
import { env } from '$env/static/private';    // Server only
import { env } from '$env/static/public';     // Client safe

// Relative imports - within same module only
import { formatDate } from './utils';
import type { ItemType } from '../types';
```

## Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Route directories | kebab-case | `user-settings/` |
| Route groups | (parentheses) | `(auth)/`, `(dashboard)/` |
| Dynamic routes | [brackets] | `[slug]/`, `[id]/` |
| Rest params | [...spread] | `[...path]/` |
| Components | PascalCase.svelte | `UserCard.svelte` |
| TypeScript files | camelCase.ts | `formatDate.ts` |
| Server files | camelCase.server.ts | `auth.server.ts` |
| Type files | camelCase.ts | `types.ts`, `user.ts` |
| Constants | camelCase.ts | `config.ts` |
| Barrel exports | index.ts | `index.ts` |

## Server vs Client Decision

```text
Does the code access DB, secrets, or filesystem?
├── Yes → $lib/server/
└── No  → Can it run in the browser?
    ├── Yes → Is it UI-related?
    │   ├── Yes → $lib/client/
    │   └── No  → Used by both server and client?
    │       ├── Yes → $lib/shared/
    │       └── No  → $lib/client/
    └── No  → $lib/server/
```

## Common Patterns

### Barrel Export

```typescript
// src/lib/client/components/ui/index.ts
export { default as Button } from './Button.svelte';
export { default as Modal } from './Modal.svelte';
export { default as Input } from './Input.svelte';
```

### Type Re-export

```typescript
// src/lib/shared/types/index.ts
export type { UserType, UserRoleType } from './user';
export type { PostType, PostStatusType } from './post';
export type { ApiResponseType, PaginationType } from './api';
```

## Verification Commands

```bash
pnpm check    # svelte-check for type errors
pnpm lint     # Linter for code issues
pnpm test     # Run test suite
pnpm build    # Verify production build
```

## Checklist

- [ ] Routes follow +file naming convention
- [ ] Server code isolated in $lib/server/ or .server.ts
- [ ] Client code in $lib/client/
- [ ] Shared types/utils in $lib/shared/
- [ ] All cross-module imports use $lib alias
- [ ] Components use PascalCase naming
- [ ] No server imports in client code
- [ ] Route groups used for logical organisation
- [ ] Barrel exports for clean import paths
- [ ] No circular dependencies
