# Phase 5: Dependency Flow

Define import rules, prevent circular dependencies, and establish the dependency
graph for the SvelteKit project.

## Objectives

- Map the allowed import directions between modules
- Prevent circular dependency formation
- Establish $lib, $app, and relative import rules
- Document server-only import boundaries

## Critical Rules

1. **Always use `type`, never `interface`**
2. **Dependencies flow downward** - higher layers depend on lower, never reverse
3. **No circular imports** - if A imports B, B must never import A
4. **$lib alias for cross-boundary** - relative imports only within same module

## Dependency Hierarchy

```text
Layer 5: Routes (+page.svelte, +page.server.ts, +server.ts)
    ↓ imports from
Layer 4: Client Modules ($lib/client/modules/)
    ↓ imports from
Layer 3: Client Components ($lib/client/components/)
    ↓ imports from
Layer 2: Shared ($lib/shared/types, utils, constants, schemas)
    ↓ imports from
Layer 1: External packages (svelte, zod, etc.)

Server-side ($lib/server/) sits alongside Layers 3-4
    ↓ imports from
Layer 2: Shared
    ↓ imports from
Layer 1: External packages
```

### Allowed Import Directions

```text
✓ Routes → Client Modules → Shared → External
✓ Routes → Client Components → Shared → External
✓ Routes (server) → Server Services → Shared → External
✓ Client Modules → Client Components → Shared
✓ Server Services → Shared

✗ Shared → Client (breaks server-side usage)
✗ Shared → Server (breaks client-side usage)
✗ Client → Server (build error)
✗ Server → Client (no reason, wrong direction)
✗ Components → Modules (keep components pure)
```

## Import Pattern Rules

### $lib Alias Usage

```typescript
// ALWAYS use $lib for cross-boundary imports
import { Button } from '$lib/client/components/ui';
import type { UserType } from '$lib/shared/types';
import { formatDate } from '$lib/shared/utils';
import { db } from '$lib/server/db';  // Only in server files!

// NEVER use relative paths to cross boundaries
// BAD: import { Button } from '../../../client/components/ui';
// BAD: import type { UserType } from '../../shared/types';
```

### $app Imports

```typescript
// $app/stores - Reactive SvelteKit stores (client-side)
import { page, navigating } from '$app/stores';

// $app/navigation - Client-side navigation
import { goto, invalidateAll, beforeNavigate } from '$app/navigation';

// $app/forms - Form enhancement utilities
import { enhance, applyAction, deserialize } from '$app/forms';

// $app/environment - Runtime environment info
import { browser, dev, building } from '$app/environment';
```

### $env Imports

```typescript
// Private env vars - SERVER ONLY
// Only in: +page.server.ts, +server.ts, hooks.server.ts, $lib/server/
import { DATABASE_URL, JWT_SECRET } from '$env/static/private';
import { env } from '$env/dynamic/private';

// Public env vars - safe anywhere
import { PUBLIC_API_URL, PUBLIC_APP_NAME } from '$env/static/public';
import { env } from '$env/dynamic/public';
```

### Relative Import Rules

```typescript
// WITHIN a module - relative imports are fine
// src/lib/client/modules/user/remote.ts
import { setItems, setError } from './store';
import type { UserType } from './types';
import { transformUser } from './utils';

// WITHIN a component directory - relative imports are fine
// src/lib/client/components/ui/Modal.svelte
import Button from './Button.svelte';

// CROSSING boundaries - MUST use $lib
// src/lib/client/modules/user/store.ts
import type { UserType } from '$lib/shared/types';  // Correct
// import type { UserType } from '../../shared/types';  // Wrong
```

## Circular Dependency Prevention

### Detection

```bash
# Check for potential circular imports
# Look for modules importing from each other
grep -rn "from '\./store'" src/lib/client/modules/ | grep -v "store.ts"
grep -rn "from '\./remote'" src/lib/client/modules/ | grep -v "remote.ts"

# Check if store imports from remote (common circular dep)
grep -n "from '\./remote'" src/lib/client/modules/*/store.ts
```

### Common Circular Dependency Patterns and Fixes

```typescript
// PROBLEM: store.ts imports from remote.ts, remote.ts imports from store.ts
// store.ts
import { fetchItems } from './remote';  // ← Creates circular if remote imports store

// remote.ts
import { setItems } from './store';     // ← Creates circular with above

// SOLUTION: remote.ts imports from store.ts (one direction only)
// store.ts - NEVER imports from remote.ts
export function setItems(items: ItemType[]): void { /* ... */ }

// remote.ts - imports from store.ts (dependency flows: remote → store)
import { setItems } from './store';
export async function fetchItems(): Promise<void> {
  const data = await fetch('/api/items').then(r => r.json());
  setItems(data);
}

// +page.svelte - orchestrates both
import store from '$lib/client/modules/items/store';
import { fetchItems } from '$lib/client/modules/items/remote';
```

### Shared Type Pattern (Breaking Circular Types)

```typescript
// PROBLEM: Two modules need to reference each other's types

// SOLUTION: Extract shared types to $lib/shared/types/
// $lib/shared/types/relationships.ts
type UserWithPostsType = {
  user: UserType;
  posts: PostType[];
};

type PostWithAuthorType = {
  post: PostType;
  author: UserType;
};

export type { UserWithPostsType, PostWithAuthorType };
```

## Server-Only Import Enforcement

SvelteKit automatically prevents `$lib/server/` imports in client code at build time.
Additional safeguards:

```typescript
// hooks.server.ts - runs on every server request
// Safe to import server modules here
import { db } from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

export const handle = async ({ event, resolve }) => {
  const session = await validateSession(event.cookies.get('session'));
  event.locals.user = session?.user ?? null;
  return resolve(event);
};
```

```typescript
// src/app.d.ts - Type-safe locals
declare global {
  namespace App {
    type Locals = {
      user: UserType | null;
    };

    type PageData = {
      user: UserType | null;
    };
  }
}

export {};
```

## Import Organisation Standard

Within each file, organise imports in this order:

```typescript
// 1. SvelteKit/Svelte imports
import { error, json } from '@sveltejs/kit';
import { page } from '$app/stores';

// 2. $env imports
import { PUBLIC_API_URL } from '$env/static/public';

// 3. $lib imports (shared first, then specific)
import type { UserType } from '$lib/shared/types';
import { formatDate } from '$lib/shared/utils';
import { Button } from '$lib/client/components/ui';

// 4. Relative imports (within same module)
import { setItems } from './store';
import type { LocalType } from './types';

// 5. External package imports
import { z } from 'zod';
```

## Verification

Before moving to the next phase:

- [ ] Dependency hierarchy documented (5 layers)
- [ ] Allowed import directions mapped
- [ ] $lib alias usage rules established
- [ ] $app and $env import rules documented
- [ ] Relative import boundaries defined
- [ ] Circular dependency prevention strategies in place
- [ ] Server-only import enforcement verified
- [ ] Import organisation order standardised
- [ ] No planned imports violate the dependency flow
- [ ] Cross-module type sharing strategy established
