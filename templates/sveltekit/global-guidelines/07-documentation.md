# Phase 7: Documentation

Documentation standards and practices for {{PROJECT_NAME}}.

## Objectives

- Define JSDoc conventions for components and functions
- Establish route and API documentation patterns
- Set type documentation standards
- Document project-level documentation requirements

## Component Documentation with JSDoc

### Documenting Component Files

Add a module-level JSDoc comment at the top of each component:

```svelte
<!--
  @component UserCard
  Displays a user's profile summary with avatar, name, and role badge.

  @example
  ```svelte
  <UserCard user={currentUser} onselect={handleSelect} />
  ```
-->
<script lang="ts">
  /**
   * Props for the UserCard component.
   * @property user - The user data to display
   * @property onselect - Called when the card is clicked
   * @property variant - Visual style variant
   */
  type Props = {
    user: UserType;
    onselect?: (user: UserType) => void;
    variant?: 'compact' | 'full';
  };

  let { user, onselect, variant = 'full' }: Props = $props();
</script>
```

### Documenting Complex Props

```svelte
<script lang="ts">
  /**
   * Configuration for the data table component.
   *
   * @example
   * ```typescript
   * const columns: ColumnConfigType[] = [
   *   { key: 'name', label: 'Name', sortable: true },
   *   { key: 'email', label: 'Email' },
   * ];
   * ```
   */
  type ColumnConfigType = {
    /** Unique key matching a field in the row data */
    key: string;
    /** Display label for the column header */
    label: string;
    /** Whether this column can be sorted. Defaults to false */
    sortable?: boolean;
    /** Custom width (CSS value) */
    width?: string;
  };

  type Props = {
    /** Column configuration array */
    columns: ColumnConfigType[];
    /** Row data to display */
    rows: Record<string, unknown>[];
    /** Called when a row is clicked */
    onrowclick?: (row: Record<string, unknown>) => void;
  };

  let { columns, rows, onrowclick }: Props = $props();
</script>
```

## Function Documentation

### Utility Functions

```typescript
// src/lib/client/utils/formatDate.ts

/**
 * Formats an ISO date string to a human-readable format.
 *
 * @param dateString - ISO 8601 date string
 * @param options - Optional Intl.DateTimeFormat options
 * @returns Formatted date string, or empty string if invalid
 *
 * @example
 * ```typescript
 * formatDate('2024-01-15T10:30:00Z');
 * // → "January 15, 2024"
 *
 * formatDate('2024-01-15T10:30:00Z', { month: 'short' });
 * // → "Jan 15, 2024"
 * ```
 */
export function formatDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}
```

### Server Service Functions

```typescript
// src/lib/server/services/itemService.ts

/**
 * Retrieves paginated items for a user with optional filtering.
 *
 * @param userId - The authenticated user's ID
 * @param options - Pagination and filter options
 * @returns Paginated list of items with total count
 *
 * @throws Will throw via `error()` if the database query fails
 *
 * @example
 * ```typescript
 * const result = await getItems('user-123', { page: 1, limit: 20 });
 * // → { items: [...], total: 42, page: 1, totalPages: 3 }
 * ```
 */
export async function getItems(
  userId: string,
  options: GetItemsOptionsType = {}
): Promise<PaginatedItemsType> {
  const { page = 1, limit = 20, search, status } = options;
  // implementation
}
```

## Route Documentation

### Documenting Load Functions

```typescript
// src/routes/items/[id]/+page.server.ts

/**
 * Load function for the item detail page.
 *
 * Fetches the item by ID and verifies the user has access.
 * Returns 404 if the item doesn't exist, 403 if the user lacks access.
 *
 * @requires Authentication - user must be logged in
 * @requires Authorization - user must own the item or be admin
 */
export const load: PageServerLoad = async ({ params, locals }) => {
  // implementation
};
```

### Documenting Form Actions

```typescript
// src/routes/items/+page.server.ts

/**
 * Form actions for the items page.
 *
 * @action create - Creates a new item. Requires `name` (string, 2-100 chars).
 *   Returns `fail(400)` with field errors on validation failure.
 *   Redirects to the new item's page on success.
 *
 * @action delete - Deletes an item by ID. Requires `id` (string).
 *   Returns `fail(403)` if user doesn't own the item.
 *   Returns `{ success: true }` on success.
 */
export const actions = {
  create: async ({ request, locals }) => {
    // implementation
  },
  delete: async ({ request, locals }) => {
    // implementation
  },
} satisfies Actions;
```

## API Route Documentation

```typescript
// src/routes/api/items/+server.ts

/**
 * Items API endpoint.
 *
 * GET /api/items
 *   Query params:
 *     - page (number, default: 1) - Page number
 *     - limit (number, default: 20, max: 100) - Items per page
 *     - search (string, optional) - Search term
 *   Response: { success: true, data: ItemType[] }
 *   Errors: 401 (unauthenticated), 400 (invalid params)
 *
 * POST /api/items
 *   Body: { name: string, description?: string, price: number }
 *   Response: { success: true, data: ItemType }
 *   Errors: 401 (unauthenticated), 400 (validation), 500 (server error)
 */
```

## Type Documentation

```typescript
// src/lib/types/itemTypes.ts

/**
 * Represents an item in the system.
 * Items are owned by users and can have various statuses.
 */
type ItemType = {
  /** Unique identifier (UUID) */
  id: string;
  /** Display name (2-100 characters) */
  name: string;
  /** Optional description (max 1000 characters) */
  description: string | null;
  /** Price in the smallest currency unit (e.g., cents) */
  price: number;
  /** Current status of the item */
  status: ItemStatusType;
  /** ID of the owning user */
  ownerId: string;
  /** When the item was created */
  createdAt: Date;
  /** When the item was last updated */
  updatedAt: Date;
};

/** Possible statuses for an item */
type ItemStatusType = 'draft' | 'active' | 'archived';

/**
 * Options for querying items.
 * All fields are optional - omitted fields use defaults.
 */
type GetItemsOptionsType = {
  /** Page number (1-indexed). Default: 1 */
  page?: number;
  /** Items per page. Default: 20, max: 100 */
  limit?: number;
  /** Filter by text search across name and description */
  search?: string;
  /** Filter by status */
  status?: ItemStatusType;
};
```

## Project-Level Documentation

### Required Documentation Files

```text
{{PROJECT_NAME}}/
  README.md               ← Project overview, setup instructions
  CONTRIBUTING.md          ← How to contribute, coding standards reference
  .env.example             ← Required environment variables (no real values)
  docs/
    architecture.md        ← System architecture overview
    api.md                 ← API endpoint reference
    deployment.md          ← Deployment procedures
```

### README.md Minimum Contents

```markdown
# {{APP_NAME}}

Brief description of the application.

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in values
3. `pnpm install`
4. `pnpm dev`

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Production build
- `pnpm check` - Type checking
- `pnpm lint` - Linting
- `pnpm test` - Run tests

## Architecture

Brief overview pointing to `docs/architecture.md`.
```

## Checklist

- [ ] All components have `@component` JSDoc with description
- [ ] Complex props have JSDoc field descriptions
- [ ] Utility functions have JSDoc with `@param`, `@returns`, `@example`
- [ ] Load functions document auth requirements and error cases
- [ ] Form actions document fields, validation, and responses
- [ ] API routes have endpoint documentation
- [ ] Shared types have JSDoc descriptions on each field
- [ ] README.md has setup instructions and script reference
- [ ] `.env.example` lists all required environment variables
- [ ] `pnpm check` passes with zero errors
