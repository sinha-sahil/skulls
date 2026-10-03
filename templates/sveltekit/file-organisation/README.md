# File Organisation Template

Plan and document the file and route organisation for a SvelteKit project
following established conventions and best practices.

## Overview

A well-organised SvelteKit project separates concerns between routes, client code,
server code, and shared utilities. This template guides you through auditing,
planning, and executing a file structure that scales with your project.

## Project Location

SvelteKit projects follow a standard layout rooted in `src/`:

```text
{{LIB_PATH}}/
├── src/
│   ├── routes/          # File-based routing (+page.svelte, +layout.svelte, +server.ts)
│   ├── lib/
│   │   ├── client/      # Client-only code (components, stores, modules)
│   │   ├── server/      # Server-only code (db, auth, services)
│   │   └── shared/      # Shared types, constants, utilities
│   ├── params/          # Route param matchers
│   └── app.html         # HTML template
├── static/              # Static assets (favicon, robots.txt)
├── tests/               # E2E and integration tests
└── svelte.config.js     # SvelteKit configuration
```

## Critical Rules

### 1. Always Use `type`, Never `interface`

```typescript
// CORRECT
type RouteParams = {
  slug: string;
  id: number;
};

// WRONG - never use interface
interface RouteParams {
  slug: string;
  id: number;
}
```

### 2. SvelteKit Route File Conventions

Every route directory can contain these special files:

| File | Purpose | Runs On |
|------|---------|---------|
| `+page.svelte` | Page component | Client |
| `+page.ts` | Universal load function | Client + Server |
| `+page.server.ts` | Server-only load, form actions | Server only |
| `+layout.svelte` | Layout component | Client |
| `+layout.ts` | Universal layout load | Client + Server |
| `+layout.server.ts` | Server-only layout load | Server only |
| `+server.ts` | API endpoint (GET, POST, etc.) | Server only |
| `+error.svelte` | Error boundary | Client |

### 3. $lib Alias

Always import from `$lib` rather than relative paths when crossing module boundaries:

```typescript
// CORRECT - use $lib alias
import { formatDate } from '$lib/shared/utils';
import type { UserType } from '$lib/shared/types';

// WRONG - fragile relative path
import { formatDate } from '../../../lib/shared/utils';
```

### 4. Server vs Client Code Separation

Server-only code must live in `$lib/server/` or use `.server.ts` suffix.
SvelteKit prevents accidental server code imports in client bundles.

## Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project identifier | `my-saas-app` |
| `{{APP_NAME}}` | Application display name | `My SaaS App` |
| `{{LIB_PATH}}` | Root project path | `/home/dev/my-saas-app` |

## Phases

1. **Assessment** - Audit current file structure, identify pain points and violations
2. **Directory Structure** - Define the target layout with SvelteKit conventions
3. **Module Boundaries** - Establish server/client/shared separation rules
4. **Naming Conventions** - Document naming patterns for routes, components, utilities
5. **Dependency Flow** - Define import rules, prevent circular dependencies
6. **Migration Plan** - Plan the reorganisation steps with rollback safety

## When to Use

- Starting a new SvelteKit project and need a solid structure
- Restructuring an existing project that has grown disorganised
- Establishing conventions before a team scales
- Migrating from another framework to SvelteKit
- Separating server and client code that has become intertwined

## Best Practices

- **Route Groups:** Use `(group)` directories to organise routes without affecting URLs
- **Co-location:** Keep route-specific components near their routes
- **Barrel Exports:** Use `index.ts` files for clean import paths from `$lib`
- **Server Isolation:** Never import `$lib/server/` code in client components
- **Shared Types:** Keep types used by both server and client in `$lib/shared/`
