# {{PROJECT_NAME}} - Error Handling Guidelines

## Overview

Define type-safe error handling patterns for {{PROJECT_NAME}}. Use the Result pattern for expected errors (validation, not found) and exceptions only for unexpected errors (network failures, bugs). Never return `unknown` from error-handling code.

## Status

🔴 Not Started

## Dependencies

- 02-type-system.md (type patterns established)

---

## Step 1: The Result Pattern

### Core Result Type

```typescript
// {{SRC_DIR}}shared/types/result.types.ts

/**
 * Represents an operation that can succeed with T or fail with E.
 * Use for expected, recoverable errors.
 */
export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** Create a success result */
export function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Create an error result */
export function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Narrow to success */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok;
}

/** Narrow to error */
export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}

/** Unwrap a Result, throwing if it is an error */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) return result.value;
  throw result.error instanceof Error
    ? result.error
    : new Error(String(result.error));
}
```

### When to Use Result vs Throw

```text
Use Result<T, E> for:
├── Validation errors    → Result<ValidData, ValidationError>
├── Not found            → Result<User, NotFoundError>
├── Business rule errors → Result<Order, InsufficientFundsError>
└── Parse errors         → Result<Config, ParseError>

Use throw/catch for:
├── Network failures     → Unexpected, not recoverable locally
├── File system errors   → Unexpected I/O issues
├── Programming bugs     → Should crash, not be silently handled
└── Out of memory        → Cannot be handled gracefully
```

---

## Step 2: Custom Error Classes

### Base Error Class

```typescript
// {{SRC_DIR}}shared/errors/base.error.ts

export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  readonly timestamp: Date;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
    this.timestamp = new Date();

    // Fix prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** Serialize for logging/API responses */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      ...(this.cause ? { cause: String(this.cause) } : {}),
    };
  }
}
```

### Domain-Specific Errors

```typescript
// {{SRC_DIR}}shared/errors/domain.errors.ts

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND' as const;
  readonly statusCode = 404 as const;

  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`);
  }
}

export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR' as const;
  readonly statusCode = 400 as const;
  readonly fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string>) {
    super(message);
    this.fields = fields;
  }
}

export class ConflictError extends AppError {
  readonly code = 'CONFLICT' as const;
  readonly statusCode = 409 as const;
}

export class UnauthorisedError extends AppError {
  readonly code = 'UNAUTHORISED' as const;
  readonly statusCode = 401 as const;

  constructor() {
    super('Authentication required');
  }
}
```

### Error Type Union

```typescript
// Discriminated union of all domain errors (using code as discriminant)
type DomainError =
  | NotFoundError
  | ValidationError
  | ConflictError
  | UnauthorisedError;
```

---

## Step 3: Type-Safe Error Narrowing

### Narrowing `unknown` in Catch Blocks

```typescript
// ✗ NEVER: Access properties on unknown
try { /* ... */ } catch (error) {
  console.log(error.message); // ← error is unknown, unsafe
}

// ✓ ALWAYS: Narrow before accessing
try {
  await fetchData();
} catch (error: unknown) {
  if (error instanceof AppError) {
    // Narrowed to AppError
    console.error(error.code, error.message);
  } else if (error instanceof Error) {
    // Narrowed to Error
    console.error(error.message);
  } else {
    // Unknown error shape
    console.error('Unexpected error:', String(error));
  }
}
```

### Error Narrowing Utility

```typescript
// {{SRC_DIR}}shared/errors/narrow.ts

/**
 * Ensure an unknown caught value is an Error instance.
 * Wraps non-Error values in an Error.
 */
export function toError(caught: unknown): Error {
  if (caught instanceof Error) return caught;
  if (typeof caught === 'string') return new Error(caught);
  return new Error(`Non-Error thrown: ${JSON.stringify(caught)}`);
}

// Usage
try {
  await riskyOperation();
} catch (caught: unknown) {
  const error = toError(caught);
  // error is always Error, safe to access .message, .stack
}
```

---

## Step 4: Result Pattern in Services

### Service with Result Return

```typescript
// {{SRC_DIR}}features/{{MODULE_NAME}}/{{MODULE_NAME}}.service.ts

import { Ok, Err } from '../../shared/types/result.types';
import { NotFoundError, ValidationError } from '../../shared/errors/domain.errors';
import type { Result } from '../../shared/types/result.types';
import type { {{TARGET_TYPE}} } from './{{MODULE_NAME}}.types';

export class {{MODULE_NAME}}Service {
  async findById(
    id: string
  ): Promise<Result<{{TARGET_TYPE}}, NotFoundError>> {
    const item = await this.repository.findById(id);
    if (!item) {
      return Err(new NotFoundError('{{MODULE_NAME}}', id));
    }
    return Ok(item);
  }

  async create(
    input: Create{{TARGET_TYPE}}Input
  ): Promise<Result<{{TARGET_TYPE}}, ValidationError>> {
    const validation = this.validate(input);
    if (!validation.ok) return validation;

    const created = await this.repository.insert(validation.value);
    return Ok(created);
  }

  private validate(
    input: Create{{TARGET_TYPE}}Input
  ): Result<Validated{{TARGET_TYPE}}, ValidationError> {
    const errors: Record<string, string> = {};

    if (!input.name?.trim()) {
      errors.name = 'Name is required';
    }

    if (Object.keys(errors).length > 0) {
      return Err(new ValidationError('Validation failed', errors));
    }

    return Ok(input as Validated{{TARGET_TYPE}});
  }
}
```

### Consuming Results

```typescript
// In handler/controller layer
const result = await service.findById(id);

if (!result.ok) {
  // result.error is typed as NotFoundError
  return response.status(result.error.statusCode).json(result.error.toJSON());
}

// result.value is typed as {{TARGET_TYPE}}
return response.json(result.value);
```

---

## Step 5: Never Return `unknown`

### Rules for Return Types

```typescript
// ✗ NEVER return unknown
function processData(input: string): unknown { /* ... */ }

// ✓ Return a specific type
function processData(input: string): ProcessedData { /* ... */ }

// ✓ Return a Result for fallible operations
function processData(input: string): Result<ProcessedData, ParseError> { /* ... */ }

// ✓ Use generics if the output depends on input
function processData<T>(input: string, schema: Schema<T>): T { /* ... */ }
```

### Error Boundary Pattern

```typescript
// Top-level error boundary catches all unexpected errors
export async function withErrorBoundary<T>(
  operation: () => Promise<T>,
  context: string
): Promise<Result<T, AppError>> {
  try {
    const value = await operation();
    return Ok(value);
  } catch (caught: unknown) {
    const error = toError(caught);
    logger.error(`Error in ${context}:`, error);
    return Err(new AppError(error.message, { cause: error }));
  }
}
```

---

## Step 6: Async Error Guidelines

```typescript
// ✗ NEVER: Ignore Promise rejections
async function process(): Promise<void> {
  fetchData(); // ← Missing await, rejection is lost
}

// ✓ ALWAYS: Await or handle every Promise
async function process(): Promise<void> {
  await fetchData(); // ← Rejection propagates
}

// ✓ For fire-and-forget, explicitly handle errors
function scheduleCleanup(): void {
  void cleanup().catch((error: unknown) => {
    logger.error('Cleanup failed:', toError(error));
  });
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

- [ ] Result type defined with Ok/Err constructors
- [ ] Custom error classes extend a base AppError
- [ ] Error classes have `code` discriminant and `statusCode`
- [ ] All `catch` blocks narrow `unknown` before accessing properties
- [ ] `toError` utility available for catch blocks
- [ ] Services return `Result<T, E>` for expected errors
- [ ] No functions return `unknown`
- [ ] No unhandled Promise rejections
- [ ] Error narrowing uses `instanceof`, not `as`
- [ ] `tsc --noEmit` passes
- [ ] `vitest run` passes
