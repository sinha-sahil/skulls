# Phase 4: Naming Conventions

Document SvelteKit-specific naming patterns for routes, components, utilities,
and all project files.

## Objectives

- Establish consistent naming rules for all file types
- Document route naming patterns including groups and dynamic segments
- Define component naming standards
- Standardise utility and type file naming

## Critical Rules

1. **Always use `type`, never `interface`**
2. **Components are PascalCase** - `UserCard.svelte`, not `user-card.svelte`
3. **TypeScript files are camelCase** - `formatDate.ts`, not `FormatDate.ts`
4. **Route directories are kebab-case** - `user-settings/`, not `userSettings/`
5. **Barrel exports use `index.ts`** - always for clean import paths

## Route Naming

### Directory Naming

```text
src/routes/
├── about/                      # Static routes: kebab-case
├── user-settings/              # Multi-word: kebab-case with hyphens
├── blog/
│   └── [slug]/                 # Dynamic param: [paramName]
├── api/
│   └── v1/
│       └── [resource]/
│           └── [id]/           # Nested dynamic params
├── (marketing)/                # Route group: (groupName) camelCase
├── (auth)/                     # Route group: logical grouping
├── [...path]/                  # Rest/catch-all params
└── [[optional]]/               # Optional params: [[paramName]]
```

### Route Group Conventions

Route groups `(name)` organise routes without affecting URLs:

```text
# Groups by access level
(public)/           # No auth required
(auth)/             # Auth-related pages (login, register)
(app)/              # Authenticated users only
(admin)/            # Admin-only pages

# Groups by section
(marketing)/        # Landing, about, pricing
(dashboard)/        # Main app interface
(settings)/         # User/account settings
```

### Dynamic Route Naming

```text
[id]/               # Simple identifier
[slug]/             # URL-friendly string
[...path]/          # Catch-all (404 pages, CMS routes)
[[lang]]/           # Optional parameter
```

### Route Parameter Matchers

```typescript
// src/params/integer.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return /^\d+$/.test(param);
};

// Usage in route: src/routes/posts/[id=integer]/
```

## Component Naming

### Svelte Component Files

```text
# PascalCase for all component files
Button.svelte
UserCard.svelte
NavigationBar.svelte
PostListItem.svelte

# WRONG - never use these patterns
button.svelte           # lowercase
user-card.svelte        # kebab-case
navigation_bar.svelte   # snake_case
```

### Component Naming Patterns

| Category | Pattern | Example |
|----------|---------|---------|
| Generic UI | `{Element}.svelte` | `Button.svelte`, `Modal.svelte` |
| Domain-specific | `{Domain}{Element}.svelte` | `UserCard.svelte`, `PostPreview.svelte` |
| Layout parts | `{Section}.svelte` | `Header.svelte`, `Sidebar.svelte` |
| List items | `{Entity}ListItem.svelte` | `PostListItem.svelte` |
| Forms | `{Entity}Form.svelte` | `UserForm.svelte`, `LoginForm.svelte` |
| Containers | `{Feature}Container.svelte` | `DashboardContainer.svelte` |
| State display | `{Feature}{State}.svelte` | `PostLoader.svelte`, `EmptyState.svelte` |

### Component Directory Structure

```text
src/lib/client/components/
├── ui/                             # Generic, reusable
│   ├── Button.svelte
│   ├── Input.svelte
│   ├── Modal.svelte
│   ├── Tooltip.svelte
│   └── index.ts                    # export { default as Button } from './Button.svelte'
└── domain/                         # Business-specific
    ├── UserAvatar.svelte
    ├── PostCard.svelte
    ├── PricingTable.svelte
    └── index.ts
```

## TypeScript File Naming

### General Rules

```text
# camelCase for all TypeScript files
formatDate.ts
validateInput.ts
userService.ts
apiClient.ts

# WRONG patterns
FormatDate.ts           # PascalCase (reserved for components)
format-date.ts          # kebab-case
format_date.ts          # snake_case
```

### Special File Names

```text
# Standard names (always lowercase, no variation)
index.ts                # Barrel exports
types.ts                # Type definitions within a module
utils.ts                # Utility functions within a module
constants.ts            # Constants within a module
```

### Server File Naming

```text
# .server.ts suffix for server-only modules
auth.server.ts          # Can be imported in +page.server.ts
email.server.ts
stripe.server.ts

# Or place in $lib/server/ directory (preferred)
$lib/server/auth.ts     # Automatically server-only by location
$lib/server/email.ts
```

## Type Naming

### Type Suffix Convention

```typescript
// Always suffix types with 'Type'
type UserType = {
  id: string;
  name: string;
};

type UserRoleType = 'admin' | 'editor' | 'viewer';

type ApiResponseType<T> = {
  data: T;
  meta: PaginationType;
};

// Request/Response types
type CreateUserRequestType = {
  email: string;
  name: string;
};

type UpdateUserResponseType = {
  user: UserType;
  message: string;
};
```

### Type File Organisation

```typescript
// src/lib/shared/types/user.ts
// Group related types in a single file

type UserRoleType = 'admin' | 'editor' | 'viewer';

type UserStatusType = 'active' | 'suspended' | 'deleted';

type UserType = {
  id: string;
  email: string;
  name: string;
  role: UserRoleType;
  status: UserStatusType;
  createdAt: string;
};

type CreateUserRequestType = {
  email: string;
  name: string;
  password: string;
};

export type { UserType, UserRoleType, UserStatusType, CreateUserRequestType };
```

## Barrel Export Conventions

### Pattern

```typescript
// index.ts - re-export public API of a directory

// For components (re-export default as named)
export { default as Button } from './Button.svelte';
export { default as Modal } from './Modal.svelte';

// For types (re-export named)
export type { UserType, UserRoleType } from './user';
export type { PostType, PostStatusType } from './post';

// For utilities (re-export named)
export { formatDate, formatCurrency } from './format';
export { validateEmail, validatePassword } from './validation';
```

### When to Use Barrel Exports

| Directory | Barrel Export? | Reason |
|-----------|---------------|--------|
| `$lib/client/components/ui/` | Yes | Clean component imports |
| `$lib/client/components/domain/` | Yes | Clean component imports |
| `$lib/shared/types/` | Yes | Central type imports |
| `$lib/shared/utils/` | Yes | Utility discovery |
| `$lib/client/modules/[name]/` | Yes | Module public API |
| `$lib/client/modules/[name]/ui/` | Yes | Module component exports |
| `$lib/server/services/` | Optional | May prefer direct imports |
| Individual route directories | No | SvelteKit handles routing |

## Verification

Before moving to the next phase:

- [ ] Route directories use kebab-case
- [ ] Route groups documented with (camelCase) convention
- [ ] Dynamic route parameters named consistently
- [ ] Components use PascalCase.svelte naming
- [ ] TypeScript files use camelCase.ts naming
- [ ] Types suffixed with 'Type' and use `type` not `interface`
- [ ] Barrel export strategy defined for each directory
- [ ] Server file naming convention established
- [ ] Naming decision table is complete
- [ ] Examples provided for each convention
