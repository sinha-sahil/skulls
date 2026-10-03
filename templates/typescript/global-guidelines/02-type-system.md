# {{PROJECT_NAME}} - Type System Guidelines

## Overview

Define the type system conventions and patterns for {{PROJECT_NAME}}. Covers utility types, generics, conditional types, mapped types, branded types, discriminated unions, exhaustive checks, type guards, and template literal types.

## Status

🔴 Not Started

## Dependencies

- 01-code-style.md (naming conventions established)

---

## Step 1: Core Type Rules

### Never Use `any`

```typescript
// ✗ NEVER
function parse(data: any): any { /* ... */ }

// ✓ Use unknown for external data
function parse(data: unknown): ParsedResult { /* ... */ }

// ✓ Use generics for flexible types
function parse<T>(data: string, schema: Schema<T>): T { /* ... */ }
```

### Prefer `interface` for Object Shapes, `type` for Everything Else

```typescript
// interface: Extensible object shapes
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// type: Unions, intersections, computed types
type Status = 'active' | 'inactive' | 'pending';
type ApiResponse<T> = Result<T, ApiError>;
type UserKeys = keyof UserProfile;
```

### Always Use Explicit Return Types for Public Functions

```typescript
// ✓ Explicit return type on exported functions
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✓ Inferred return type is acceptable for private/local functions
const double = (n: number) => n * 2;
```

---

## Step 2: Built-in Utility Types

Use TypeScript's built-in utility types before creating custom ones:

```typescript
// Pick: Select specific properties
type UserSummary = Pick<UserProfile, 'id' | 'name'>;

// Omit: Remove specific properties
type CreateUserInput = Omit<UserProfile, 'id' | 'createdAt'>;

// Partial: Make all properties optional
type UpdateUserInput = Partial<Omit<UserProfile, 'id'>>;

// Required: Make all properties required
type CompleteProfile = Required<UserProfile>;

// Readonly: Make all properties readonly
type FrozenConfig = Readonly<AppConfig>;

// Record: Key-value map
type StatusMessages = Record<Status, string>;

// ReturnType / Parameters: Extract function signatures
type ServiceReturn = ReturnType<typeof fetchUser>;
type ServiceParams = Parameters<typeof fetchUser>;

// Awaited: Unwrap Promise types
type UserData = Awaited<ReturnType<typeof fetchUser>>;
```

---

## Step 3: Generic Patterns

### Constrained Generics

```typescript
// Constrain generics to ensure minimum shape
function getProperty<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  key: K
): T[K] {
  return obj[key];
}

// Constrain to objects with id
function findById<T extends { id: string }>(
  items: readonly T[],
  id: string
): T | undefined {
  return items.find((item) => item.id === id);
}

// Default generic parameter
interface Repository<T extends { id: string } = { id: string }> {
  find(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
}
```

### Conditional Types

```typescript
// Extract nested types conditionally
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type UnwrapArray<T> = T extends Array<infer U> ? U : T;

// Conditional return types
type Response<T> = T extends string
  ? TextResponse
  : T extends object
    ? JsonResponse<T>
    : never;
```

### Mapped Types

```typescript
// Make all properties nullable
type Nullable<T> = { [K in keyof T]: T[K] | null };

// Make specific properties optional
type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Transform property types
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
```

---

## Step 4: Discriminated Unions

### Always Use Discriminated Unions for State

```typescript
// ✓ Discriminated union with exhaustive handling
type RequestState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: Error };

// Handle all states exhaustively
function renderState<T>(state: RequestState<T>): string {
  switch (state.status) {
    case 'idle':    return 'Ready';
    case 'loading': return 'Loading...';
    case 'success': return `Data: ${JSON.stringify(state.data)}`;
    case 'error':   return `Error: ${state.error.message}`;
    default: {
      // Compile error if a case is missed
      const _exhaustive: never = state;
      throw new Error(`Unhandled state: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
```

### Exhaustive Check Helper

```typescript
// Utility function for exhaustive checks
export function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${JSON.stringify(value)}`);
}

// Usage
function getLabel(status: Status): string {
  switch (status) {
    case 'active':   return 'Active';
    case 'inactive': return 'Inactive';
    case 'pending':  return 'Pending';
    default:         return assertNever(status);
  }
}
```

---

## Step 5: Branded Types

### Use Branded Types for Domain Primitives

```typescript
// Brand definition
type Brand<T, B extends string> = T & { readonly __brand: B };

// Domain-specific branded types
type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;
type Email = Brand<string, 'Email'>;
type PositiveNumber = Brand<number, 'PositiveNumber'>;

// Constructor with validation
function createEmail(raw: string): Email {
  if (!raw.includes('@') || raw.length < 3) {
    throw new Error(`Invalid email: ${raw}`);
  }
  return raw as Email;
}

function createPositiveNumber(raw: number): PositiveNumber {
  if (raw <= 0) throw new Error(`Expected positive number, got: ${raw}`);
  return raw as PositiveNumber;
}

// Branded types prevent accidental mixing
function sendEmail(to: Email, subject: string): void { /* ... */ }
sendEmail(createEmail('user@example.com'), 'Hello');   // ✓
sendEmail('user@example.com', 'Hello');                 // ✗ Compile error
```

---

## Step 6: Type Guards

### Prefer Type Guards over Assertions

```typescript
// ✗ AVOID: Type assertion
const user = data as User;

// ✓ PREFER: Type guard with runtime check
function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string'
  );
}

if (isUser(data)) {
  // data is safely narrowed to User
  console.log(data.name);
}
```

### Assertion Functions

```typescript
// Assertion function: throws if condition fails
function assertIsUser(value: unknown): asserts value is User {
  if (!isUser(value)) {
    throw new TypeError(`Expected User, got: ${typeof value}`);
  }
}

// Usage: narrows type after call
assertIsUser(data);
console.log(data.name); // data is User
```

---

## Step 7: Template Literal Types

```typescript
// Event naming convention
type DomainEvent = `${string}.${string}`;
type UserEvent = `user.${'created' | 'updated' | 'deleted'}`;

// Route patterns
type ApiRoute = `/${string}`;
type VersionedRoute = `/api/v${number}/${string}`;

// CSS-like values
type CssSize = `${number}${'px' | 'rem' | 'em' | '%'}`;

// Key derivation
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

// Usage
interface User { name: string; age: number; }
type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number; }
```

---

## Verification

```bash
tsc --noEmit
eslint .
```

**Checklist:**

- [ ] No `any` in production code
- [ ] `interface` for object shapes, `type` for unions and computed types
- [ ] Explicit return types on public/exported functions
- [ ] Built-in utility types used before custom ones
- [ ] Generics properly constrained with `extends`
- [ ] Discriminated unions for state and event types
- [ ] Exhaustive checks using `never` in switch defaults
- [ ] Branded types for domain primitives (IDs, email, etc.)
- [ ] Type guards used instead of `as` assertions
- [ ] Template literal types for string patterns
- [ ] `tsc --noEmit` passes
