# {{PROJECT_NAME}} - Documentation Guidelines

## Overview

Define TSDoc standards, parameter documentation, declaration file documentation, and type-level documentation patterns for {{PROJECT_NAME}}. Good documentation helps consumers understand types without reading implementation.

## Status

🔴 Not Started

## Dependencies

- 01-code-style.md (naming conventions)
- 02-type-system.md (type patterns to document)

---

## Step 1: TSDoc Standard

### Basic TSDoc Tags

```typescript
/**
 * Retrieves a user by their unique identifier.
 *
 * @param id - The unique user identifier (UUID format)
 * @returns The user if found, or a NotFoundError if no user exists with the given id
 *
 * @example
 * ```typescript
 * const result = await findUser('usr_abc123');
 * if (result.ok) {
 *   console.log(result.value.name);
 * }
 * ```
 *
 * @throws Never - uses Result pattern instead of exceptions
 *
 * @see {@link UserService.create} for creating new users
 * @since 1.0.0
 */
export async function findUser(
  id: string
): Promise<Result<User, NotFoundError>> {
  // implementation
}
```

### Required TSDoc Tags by Context

| Context | Required Tags | Optional Tags |
|---------|--------------|---------------|
| Public function | `@param`, `@returns` | `@example`, `@throws`, `@see` |
| Public class | Description | `@example`, `@see` |
| Public interface | Description | `@example` |
| Type alias | Description | `@example` |
| Constant | Description | N/A |
| Generic parameter | `@typeParam` | N/A |
| Deprecated API | `@deprecated` | `@see` (replacement) |

---

## Step 2: Documenting Parameters and Returns

### `@param` Tag

```typescript
/**
 * Creates a new order for a customer.
 *
 * @param customerId - The customer's branded identifier
 * @param items - Array of order items (must contain at least one item)
 * @param options - Optional order configuration
 * @param options.priority - Processing priority (defaults to 'normal')
 * @param options.notes - Free-text notes attached to the order
 *
 * @returns Ok with the created Order, or Err with a ValidationError
 * if the items array is empty or any item has invalid quantity
 */
export async function createOrder(
  customerId: CustomerId,
  items: readonly OrderItem[],
  options?: CreateOrderOptions
): Promise<Result<Order, ValidationError>> {
  // implementation
}
```

### `@returns` Tag

```typescript
/**
 * Parses a raw JSON string into a validated configuration object.
 *
 * @param raw - The JSON string to parse
 *
 * @returns Ok with the parsed AppConfig if valid, or Err with:
 * - `ParseError` if the JSON is malformed
 * - `ValidationError` if the JSON doesn't match the AppConfig schema
 */
export function parseConfig(
  raw: string
): Result<AppConfig, ParseError | ValidationError> {
  // implementation
}
```

---

## Step 3: Documenting Types and Interfaces

### Interface Documentation

```typescript
/**
 * Represents a user in the system.
 *
 * Users are created via {@link UserService.create} and retrieved
 * via {@link UserService.findById}.
 *
 * @example
 * ```typescript
 * const user: User = {
 *   id: createUserId('usr_abc123'),
 *   name: 'Jane Doe',
 *   email: createEmail('jane@example.com'),
 *   role: 'admin',
 *   createdAt: new Date(),
 * };
 * ```
 */
export interface User {
  /** Unique identifier (branded type, format: usr_*) */
  readonly id: UserId;

  /** Display name (1-100 characters) */
  readonly name: string;

  /** Validated email address */
  readonly email: ValidatedEmail;

  /** User's role in the system */
  readonly role: UserRole;

  /** Timestamp of account creation */
  readonly createdAt: Date;
}
```

### Discriminated Union Documentation

```typescript
/**
 * Represents the state of an asynchronous operation.
 *
 * Use the `status` field to discriminate between states.
 * Always handle all variants using a switch statement with
 * an exhaustive check.
 *
 * @typeParam T - The type of the data payload on success
 *
 * @example
 * ```typescript
 * function render(state: AsyncState<User>): string {
 *   switch (state.status) {
 *     case 'idle':    return 'Ready';
 *     case 'loading': return 'Loading...';
 *     case 'success': return `Hello, ${state.data.name}`;
 *     case 'error':   return `Error: ${state.error.message}`;
 *   }
 * }
 * ```
 */
export type AsyncState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: Error };
```

### Utility Type Documentation

```typescript
/**
 * Brands a primitive type to prevent accidental mixing of
 * semantically different values with the same underlying type.
 *
 * @typeParam T - The base primitive type (string, number, etc.)
 * @typeParam B - A unique string literal identifying the brand
 *
 * @example
 * ```typescript
 * type UserId = Branded<string, 'UserId'>;
 * type OrderId = Branded<string, 'OrderId'>;
 *
 * // These are not interchangeable:
 * declare function getUser(id: UserId): User;
 * const orderId: OrderId = 'ord_123' as OrderId;
 * getUser(orderId); // ← Compile error
 * ```
 */
export type Branded<T, B extends string> = T & { readonly __brand: B };
```

---

## Step 4: `@typeParam` for Generics

```typescript
/**
 * A type-safe repository for persisting entities.
 *
 * @typeParam T - The entity type, must have a string `id` property
 *
 * @example
 * ```typescript
 * class UserRepository implements Repository<User> {
 *   async find(id: string): Promise<User | null> { ... }
 *   async save(entity: User): Promise<User> { ... }
 * }
 * ```
 */
export interface Repository<T extends { id: string }> {
  /**
   * Find an entity by its unique identifier.
   *
   * @param id - The entity's unique identifier
   * @returns The entity if found, or null if not
   */
  find(id: string): Promise<T | null>;

  /**
   * Persist an entity (create or update).
   *
   * @param entity - The entity to save
   * @returns The saved entity (may have server-generated fields)
   */
  save(entity: T): Promise<T>;
}
```

---

## Step 5: `@deprecated` and Migration Guides

```typescript
/**
 * Fetches user data from the API.
 *
 * @deprecated Since v2.0.0. Use {@link UserService.findById} instead,
 * which returns a `Result` type for better error handling.
 *
 * @example
 * ```typescript
 * // Before (deprecated):
 * const user = await getUser('123'); // throws on error
 *
 * // After (recommended):
 * const result = await userService.findById('123');
 * if (result.ok) {
 *   const user = result.value;
 * }
 * ```
 *
 * @param id - The user ID
 * @returns The user object
 * @throws {NotFoundError} When user does not exist
 */
export async function getUser(id: string): Promise<User> {
  // legacy implementation
}
```

---

## Step 6: Declaration File Documentation

### Documenting `.d.ts` Files

```typescript
// {{SRC_DIR}}global.d.ts

/**
 * Ambient type declarations for {{PROJECT_NAME}}.
 *
 * These declarations provide types for:
 * - Environment variables (process.env)
 * - Untyped third-party modules
 * - Global augmentations
 *
 * @packageDocumentation
 */

/**
 * Typed environment variables.
 * Validated at runtime by `{{SRC_DIR}}config/env.ts`.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    /** Application environment */
    NODE_ENV: 'development' | 'production' | 'test';

    /** HTTP server port */
    PORT: string;

    /** PostgreSQL connection string */
    DATABASE_URL: string;

    /** API authentication key */
    API_KEY: string;
  }
}
```

### Package Entry Point Documentation

```typescript
// {{SRC_DIR}}index.ts

/**
 * {{PROJECT_NAME}} - [brief description]
 *
 * @example
 * ```typescript
 * import { UserService, createUserId } from '{{PROJECT_NAME}}';
 * import type { User, UserId } from '{{PROJECT_NAME}}';
 *
 * const service = new UserService();
 * const result = await service.findById(createUserId('usr_abc'));
 * ```
 *
 * @packageDocumentation
 */

export { UserService } from './features/user';
export { createUserId, createEmail } from './shared/types/brand.types';
export type { User, UserId, ValidatedEmail } from './shared/types';
export type { Result } from './shared/types/result.types';
```

---

## Step 7: Documentation Anti-Patterns

### What NOT to Document

```typescript
// ✗ USELESS: Restates the type signature
/** Returns a string */
function getName(): string { }

// ✗ USELESS: Restates the parameter name
/**
 * @param name - The name
 * @param age - The age
 */
function createUser(name: string, age: number): User { }

// ✓ USEFUL: Explains constraints, format, behaviour
/**
 * @param name - Display name (1-100 characters, trimmed)
 * @param age - Age in years (must be positive integer, max 150)
 */
function createUser(name: string, age: number): User { }
```

### Documentation Quality Rules

| Rule | Example |
|------|---------|
| Document **why**, not **what** | "Validates email format per RFC 5322" not "Checks if email is valid" |
| Document **constraints** | "Must be positive integer", "Max 100 characters" |
| Document **side effects** | "Sends notification email on success" |
| Document **error conditions** | "Returns Err if user already exists" |
| Include **@example** for non-obvious APIs | Show typical usage with imports |
| Use **@see** for related APIs | Link to alternatives or related functions |

---

## Verification

```bash
tsc --noEmit
eslint .
```

**Checklist:**

- [ ] All public functions have `@param` and `@returns` TSDoc
- [ ] All public interfaces and types have description TSDoc
- [ ] All generic type parameters documented with `@typeParam`
- [ ] All deprecated APIs have `@deprecated` with migration guide
- [ ] Discriminated unions document all variants
- [ ] Utility types include `@example` showing usage
- [ ] Declaration files (`.d.ts`) have `@packageDocumentation`
- [ ] No useless documentation (restating signatures)
- [ ] `@example` blocks use valid TypeScript
- [ ] `@see` links point to existing APIs
- [ ] `tsc --noEmit` passes
