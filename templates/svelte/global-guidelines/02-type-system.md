# Phase 2: Type System

Establish TypeScript conventions for Svelte 5 components including prop typing,
generics, type exports, and composition patterns.

## Objectives

- Define how component props are typed using `type` (never `interface`)
- Establish patterns for snippet typing, callback props, and generics
- Set rules for type exports and module-level declarations
- Create reusable type utilities for common patterns

## Rule: Always `type`, Never `interface`

This is non-negotiable. Every type definition uses the `type` keyword:

```typescript
// CORRECT - always
type ButtonProps = {
  label: string;
  variant: 'primary' | 'secondary';
};

type UserRole = 'admin' | 'editor' | 'viewer';

type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

// WRONG - never
interface ButtonProps {
  label: string;
}
```

## Props Type Patterns

### Basic Props

```svelte
<script lang="ts" module>
  export type {{COMPONENT_NAME}}Props = {
    // Required props (no ?)
    title: string;
    items: Item[];

    // Optional props (with ?)
    variant?: 'default' | 'compact' | 'expanded';
    disabled?: boolean;
    maxItems?: number;
  };
</script>

<script lang="ts">
  let {
    title,
    items,
    variant = 'default',
    disabled = false,
    maxItems = 50,
  }: {{COMPONENT_NAME}}Props = $props();
</script>
```

### Props with Snippets

```svelte
<script lang="ts" module>
  import type { Snippet } from 'svelte';

  export type CardProps = {
    title: string;
    header?: Snippet;
    children?: Snippet;
    footer?: Snippet;
    actions?: Snippet<[item: CardAction]>;
  };

  type CardAction = {
    id: string;
    label: string;
    variant: 'primary' | 'danger';
  };
</script>

<script lang="ts">
  let { title, header, children, footer, actions }: CardProps = $props();
</script>
```

### Props with Callbacks

```svelte
<script lang="ts" module>
  export type SelectableListProps = {
    items: Item[];
    onselect?: (item: Item) => void;
    ondelete?: (id: string) => void;
    onreorder?: (items: Item[]) => void;
    onfilterchange?: (query: string) => void;
  };
</script>

<script lang="ts">
  let { items, onselect, ondelete, onreorder, onfilterchange }: SelectableListProps = $props();
</script>
```

### Props with $bindable

```svelte
<script lang="ts" module>
  export type TextInputProps = {
    value: string;
    label?: string;
    placeholder?: string;
    oninput?: (value: string) => void;
  };
</script>

<script lang="ts">
  let {
    value = $bindable(''),
    label,
    placeholder = '',
    oninput,
  }: TextInputProps = $props();
</script>

<label>
  {#if label}<span>{label}</span>{/if}
  <input
    bind:value
    {placeholder}
    oninput={() => oninput?.(value)}
  />
</label>
```

## Generic Components

For components that work with arbitrary data types:

```svelte
<script lang="ts" module>
  import type { Snippet } from 'svelte';

  export type DataListProps<T> = {
    items: T[];
    getKey: (item: T) => string;
    renderItem: Snippet<[item: T, index: number]>;
    emptyState?: Snippet;
    onselect?: (item: T) => void;
  };
</script>

<script lang="ts" generics="T">
  let {
    items,
    getKey,
    renderItem,
    emptyState,
    onselect,
  }: DataListProps<T> = $props();
</script>

{#if items.length === 0}
  {#if emptyState}{@render emptyState()}{:else}<p>No items</p>{/if}
{:else}
  <ul>
    {#each items as item, index (getKey(item))}
      <li onclick={() => onselect?.(item)}>
        {@render renderItem(item, index)}
      </li>
    {/each}
  </ul>
{/if}
```

Consumer usage:

```svelte
<script lang="ts">
  type User = { id: string; name: string; email: string };
  let users = $state<User[]>([]);
</script>

<DataList
  items={users}
  getKey={(u) => u.id}
  onselect={(user) => console.log(user.name)}
>
  {#snippet renderItem(user, index)}
    <span>{index + 1}. {user.name} ({user.email})</span>
  {/snippet}
  {#snippet emptyState()}
    <p>No users found</p>
  {/snippet}
</DataList>
```

## Type Export Rules

### Module-Level Exports

Types that consumers need should be exported from the module script:

```svelte
<script lang="ts" module>
  // PUBLIC: Exported for consumers
  export type {{COMPONENT_NAME}}Props = { /* ... */ };
  export type {{COMPONENT_NAME}}Variant = 'default' | 'compact';

  // PRIVATE: Not exported, internal only
  type InternalState = { /* ... */ };
</script>
```

### Barrel Export Types

```typescript
// components/DataTable/index.ts
export { default as DataTable } from './DataTable.svelte';
export type { DataTableProps, DataTableColumn } from './DataTable.svelte';

// Re-export with type keyword for type-only exports
export type { SortDirection, FilterConfig } from './dataTableTypes';
```

### Shared Type Definitions

```typescript
// types/common.ts - Only truly cross-cutting types
export type Nullable<T> = T | null;

export type AsyncState<T> = {
  data: Nullable<T>;
  isLoading: boolean;
  error: Nullable<string>;
};

export type SortDirection = 'asc' | 'desc';

export type PaginationState = {
  page: number;
  perPage: number;
  total: number;
};

// Utility type for making specific keys optional
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

## Discriminated Unions

Use discriminated unions for state machines and variants:

```typescript
type LoadingState = { status: 'idle' };
type ActiveState = { status: 'loading' };
type SuccessState<T> = { status: 'success'; data: T };
type ErrorState = { status: 'error'; error: string };

type AsyncResult<T> =
  | LoadingState
  | ActiveState
  | SuccessState<T>
  | ErrorState;

// Usage in component
let result = $state<AsyncResult<User[]>>({ status: 'idle' });

// Type-safe narrowing in markup
{#if result.status === 'loading'}
  <Spinner />
{:else if result.status === 'error'}
  <ErrorBanner message={result.error} />
{:else if result.status === 'success'}
  <UserList users={result.data} />
{/if}
```

## Type Composition

### Intersection Types for Mixins

```typescript
type WithId = { id: string };
type WithTimestamps = { createdAt: string; updatedAt: string };
type WithSoftDelete = { deletedAt: string | null };

type BaseEntity = WithId & WithTimestamps;
type SoftDeletableEntity = BaseEntity & WithSoftDelete;

// Component props composition
type WithLoading = { isLoading?: boolean };
type WithError = { error?: string | null };

type DataViewProps = BaseTableProps & WithLoading & WithError;
```

### Mapped Types

```typescript
type FormFields = {
  name: string;
  email: string;
  age: number;
};

// Create validation error type from form fields
type FormErrors = {
  [K in keyof FormFields]?: string;
};

// Create touched state from form fields
type FormTouched = {
  [K in keyof FormFields]?: boolean;
};
```

## Verification

Before moving to the next phase:

- [ ] All types use `type` keyword (zero `interface` usage)
- [ ] Props types exported from module script
- [ ] Snippet props properly typed with `Snippet<[...]>`
- [ ] Callback props follow `on` + lowercase naming
- [ ] `$bindable` used for two-way binding props
- [ ] Generic components use `generics="T"` attribute
- [ ] Type barrel exports use `export type`
- [ ] Shared types contain only cross-cutting definitions
- [ ] Discriminated unions used for state machines
- [ ] `pnpm check` passes with zero type errors
