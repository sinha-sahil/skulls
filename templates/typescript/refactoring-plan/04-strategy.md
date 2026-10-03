# {{PROJECT_NAME}} - Refactoring Strategy

## Overview

Choose specific refactoring patterns and techniques for {{PROJECT_NAME}}. Each pattern includes before/after code examples and step-by-step transformation instructions.

## Status

🔴 Not Started

## Dependencies

- 01-assessment.md (know current problems)
- 02-goals.md (know target state)
- 03-impact-analysis.md (know affected files and order)

---

## Step 1: Strategy for Eliminating `any`

### Replace `any` Parameters with Generics

```typescript
// BEFORE
function fetch{{MODULE_NAME}}(options: any): Promise<any> {
  return api.get(options.url, options.params);
}

// AFTER
interface FetchOptions<TParams extends Record<string, string> = Record<string, string>> {
  url: string;
  params: TParams;
}

function fetch{{MODULE_NAME}}<T, TParams extends Record<string, string>>(
  options: FetchOptions<TParams>
): Promise<T> {
  return api.get<T>(options.url, options.params);
}
```

### Replace `any` with `unknown` for External Data

```typescript
// BEFORE
function parseResponse(data: any): {{TARGET_TYPE}} {
  return { id: data.id, name: data.name };
}

// AFTER
function parseResponse(data: unknown): {{TARGET_TYPE}} {
  if (!is{{TARGET_TYPE}}(data)) {
    throw new TypeError('Invalid response shape');
  }
  return data; // data is narrowed to {{TARGET_TYPE}}
}

// Type guard
function is{{TARGET_TYPE}}(value: unknown): value is {{TARGET_TYPE}} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as Record<string, unknown>).id === 'string' &&
    'name' in value &&
    typeof (value as Record<string, unknown>).name === 'string'
  );
}
```

### Replace `any` in Collections

```typescript
// BEFORE
const registry: Map<string, any> = new Map();
const handlers: Array<(event: any) => any> = [];

// AFTER
const registry = new Map<string, {{TARGET_TYPE}}>();
const handlers: Array<(event: {{TARGET_TYPE}}) => void> = [];

// Or with generics for flexible collections
class TypedRegistry<T extends { id: string }> {
  private items = new Map<string, T>();

  set(item: T): void { this.items.set(item.id, item); }
  get(id: string): T | undefined { return this.items.get(id); }
}
```

---

## Step 2: Strategy for Discriminated Unions

### Convert String Status Fields

```typescript
// BEFORE: String-based state (no exhaustive checking)
interface {{TARGET_TYPE}} {
  status: string;
  data?: unknown;
  error?: string;
}

// AFTER: Discriminated union (compile-time exhaustive)
type {{TARGET_TYPE}} =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: {{MODULE_NAME}}Data }
  | { readonly status: 'error'; readonly error: Error };

// Exhaustive handler
function handle(state: {{TARGET_TYPE}}): string {
  switch (state.status) {
    case 'idle':    return 'Waiting';
    case 'loading': return 'Loading...';
    case 'success': return `Got ${state.data}`;
    case 'error':   return `Failed: ${state.error.message}`;
    default: {
      const _exhaustive: never = state;
      throw new Error(`Unhandled state: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
```

### Convert Event Systems

```typescript
// BEFORE
interface Event {
  type: string;
  payload: any;
}

// AFTER
type {{MODULE_NAME}}Event =
  | { type: 'created'; payload: { id: string; timestamp: Date } }
  | { type: 'updated'; payload: { id: string; changes: Partial<{{TARGET_TYPE}}> } }
  | { type: 'deleted'; payload: { id: string } };

// Type-safe event handler
function handleEvent<T extends {{MODULE_NAME}}Event['type']>(
  type: T,
  handler: (payload: Extract<{{MODULE_NAME}}Event, { type: T }>['payload']) => void
): void {
  // implementation
}
```

---

## Step 3: Strategy for Type Guards

### Replace `as` Assertions with Guards

```typescript
// BEFORE: Unsafe assertion
function processUser(input: unknown): void {
  const user = input as User; // ← No runtime check
  console.log(user.name);
}

// AFTER: Runtime type guard
function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string'
  );
}

function processUser(input: unknown): void {
  if (!isUser(input)) {
    throw new TypeError(`Expected User, got: ${typeof input}`);
  }
  console.log(input.name); // ← input is narrowed to User
}
```

### Create Guard Factory

```typescript
// Reusable guard factory for common patterns
function hasProperty<K extends string>(
  value: unknown,
  key: K
): value is Record<K, unknown> {
  return typeof value === 'object' && value !== null && key in value;
}

function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

// Usage
if (hasProperty(data, 'users') && isArrayOf(data.users, isUser)) {
  // data.users is User[]
}
```

---

## Step 4: Strategy for Utility Types

### Extract Common Patterns

```typescript
// {{SRC_DIR}}shared/types/utility.types.ts

/** Make all nested properties optional */
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/** Make all nested properties readonly */
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

/** Brand a primitive type to prevent accidental mixing */
type Branded<T, Brand extends string> = T & { readonly __brand: Brand };

/** Extract the resolved type of a Promise */
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

/** Make specific keys required while keeping others unchanged */
type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Make specific keys optional while keeping others unchanged */
type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Prettify intersection types for better IDE display */
type Prettify<T> = { [K in keyof T]: T[K] } & {};
```

### Introduce Branded Types for IDs

```typescript
// {{SRC_DIR}}shared/types/brand.types.ts

type UserId = Branded<string, 'UserId'>;
type OrderId = Branded<string, 'OrderId'>;
type Email = Branded<string, 'Email'>;

// Constructor functions with validation
function createUserId(raw: string): UserId {
  if (!raw.match(/^usr_[a-zA-Z0-9]+$/)) {
    throw new Error(`Invalid user ID format: ${raw}`);
  }
  return raw as UserId;
}

function createEmail(raw: string): Email {
  if (!raw.includes('@')) {
    throw new Error(`Invalid email: ${raw}`);
  }
  return raw as Email;
}
```

---

## Step 5: Strategy for Template Literal Types

### Replace Loose String Types

```typescript
// BEFORE
type Route = string;
type EventName = string;

// AFTER: Template literal types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type Route = `/${string}`;
type ApiRoute = `/${string}/${string}`;
type EventName = `${Lowercase<string>}.${Lowercase<string>}`;

// Computed routes
type CrudRoute<Resource extends string> =
  | `/${Resource}`
  | `/${Resource}/:id`
  | `/${Resource}/:id/${string}`;

type UserRoutes = CrudRoute<'users'>;
// "/users" | "/users/:id" | "/users/:id/${string}"
```

---

## Step 6: Strategy for Error Handling

### Introduce Result Type

```typescript
// {{SRC_DIR}}shared/types/result.types.ts

type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// Constructor functions
function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Usage in services
async function find{{MODULE_NAME}}(
  id: string
): Promise<Result<{{TARGET_TYPE}}, NotFoundError | DatabaseError>> {
  try {
    const item = await db.find(id);
    if (!item) return Err(new NotFoundError(id));
    return Ok(item);
  } catch (cause) {
    return Err(new DatabaseError('Query failed', { cause }));
  }
}
```

---

## Verification

```bash
tsc --noEmit
eslint .
vitest run
```

**Checklist:**

- [ ] `any` elimination strategy chosen (generics, `unknown`, or specific type)
- [ ] Discriminated union patterns defined for state types
- [ ] Type guard patterns defined to replace `as` assertions
- [ ] Utility types extracted to shared module
- [ ] Branded types defined for domain primitives
- [ ] Template literal types defined for string patterns
- [ ] Result type defined for error handling
- [ ] Each strategy has before/after code examples
- [ ] `tsc --noEmit` passes with strategy examples
