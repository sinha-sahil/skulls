# {{PROJECT_NAME}} - Security Guidelines

## Overview

Define type-safe security patterns for {{PROJECT_NAME}}. Covers input validation with runtime checks, branded types for validated data, strict null checks, `readonly` for immutability, and safe handling of external data.

## Status

🔴 Not Started

## Dependencies

- 02-type-system.md (branded types, type guards)
- 03-error-handling.md (Result pattern for validation)

---

## Step 1: Input Validation with Runtime Checks

### Never Trust External Data

```typescript
// ✗ DANGEROUS: Trusting external input
function handleRequest(body: UserInput): void {
  // body could be anything - no runtime validation
  db.insert(body);
}

// ✓ SAFE: Validate at the boundary, then use typed data
function handleRequest(body: unknown): Result<void, ValidationError> {
  const validated = validateUserInput(body);
  if (!validated.ok) return validated;
  // validated.value is type-safe UserInput
  db.insert(validated.value);
  return Ok(undefined);
}
```

### Schema Validation with Zod

```typescript
import { z } from 'zod';
import type { Result } from '../../shared/types/result.types';

// Define schema with runtime validation
const UserInputSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive().max(150).optional(),
});

// Derive TypeScript type from schema
type UserInput = z.infer<typeof UserInputSchema>;

// Validate with Result return
function validateUserInput(data: unknown): Result<UserInput, ValidationError> {
  const result = UserInputSchema.safeParse(data);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      fields[issue.path.join('.')] = issue.message;
    }
    return Err(new ValidationError('Invalid user input', fields));
  }
  return Ok(result.data);
}
```

### Validation at System Boundaries

```text
External data enters here (VALIDATE):
├── HTTP request body      → Validate with schema
├── Query parameters       → Validate and parse types
├── URL path parameters    → Validate format
├── Environment variables  → Validate at startup
├── File contents          → Validate structure
├── Database results       → Trust (validated on write)
└── Third-party API calls  → Validate response shape

Internal data (TRUST - already validated):
├── Function parameters    → Type system guarantees shape
├── Return values          → Type system guarantees shape
└── Module imports         → Type system guarantees shape
```

---

## Step 2: Branded Types for Validated Data

### Separate Raw from Validated Data

```typescript
// Branded types ensure validated data cannot be confused with raw data
type ValidatedEmail = string & { readonly __brand: 'ValidatedEmail' };
type SanitisedHtml = string & { readonly __brand: 'SanitisedHtml' };
type HashedPassword = string & { readonly __brand: 'HashedPassword' };
type PositiveInt = number & { readonly __brand: 'PositiveInt' };

// Validation constructors - the ONLY way to create branded values
function validateEmail(raw: string): Result<ValidatedEmail, ValidationError> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(raw)) {
    return Err(new ValidationError('Invalid email format', { email: raw }));
  }
  return Ok(raw as ValidatedEmail);
}

function sanitiseHtml(raw: string): SanitisedHtml {
  const sanitised = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  return sanitised as SanitisedHtml;
}

function hashPassword(raw: string): Promise<HashedPassword> {
  // Use proper hashing library in production
  const hashed = await bcrypt.hash(raw, 12);
  return hashed as HashedPassword;
}
```

### Branded Types in Function Signatures

```typescript
// Functions accept only validated types - cannot pass raw strings
function sendEmail(to: ValidatedEmail, body: SanitisedHtml): Promise<void> {
  // to is guaranteed to be a valid email
  // body is guaranteed to be sanitised
  await mailer.send({ to, body });
}

// Compile error: raw string is not ValidatedEmail
sendEmail('user@test.com', '<p>Hello</p>');     // ✗ Compile error
sendEmail(validateEmail('user@test.com'), ...);  // Still wrong: Result, not Email

// Correct usage:
const emailResult = validateEmail('user@test.com');
if (emailResult.ok) {
  const body = sanitiseHtml('<p>Hello</p>');
  await sendEmail(emailResult.value, body);      // ✓ Correct
}
```

---

## Step 3: Strict Null Checks

### Always Enable `strictNullChecks`

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,                    // Includes strictNullChecks
    "noUncheckedIndexedAccess": true   // Array/object index returns T | undefined
  }
}
```

### Handle Null/Undefined Explicitly

```typescript
// ✗ DANGEROUS: Assumes value exists
function getUser(users: Map<string, User>, id: string): User {
  return users.get(id)!; // ← Non-null assertion hides bugs
}

// ✓ SAFE: Handle the undefined case
function getUser(
  users: Map<string, User>,
  id: string
): Result<User, NotFoundError> {
  const user = users.get(id);
  if (user === undefined) {
    return Err(new NotFoundError('User', id));
  }
  return Ok(user);
}
```

### Avoid Non-Null Assertions

```typescript
// ✗ BANNED: Non-null assertion operator
const name = user!.name;
const first = items[0]!;
document.getElementById('app')!.textContent = 'Hello';

// ✓ REQUIRED: Explicit null checks
const name = user?.name ?? 'Unknown';

const first = items[0];
if (first !== undefined) {
  // first is safely narrowed
}

const el = document.getElementById('app');
if (el !== null) {
  el.textContent = 'Hello';
}
```

---

## Step 4: `readonly` for Immutability

### Prefer `readonly` by Default

```typescript
// ✗ Mutable: Can be accidentally modified
interface User {
  id: string;
  name: string;
  roles: string[];
}

// ✓ Immutable: Cannot be modified after creation
interface User {
  readonly id: string;
  readonly name: string;
  readonly roles: readonly string[];
}

// Utility type for deep immutability
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
```

### Readonly Function Parameters

```typescript
// ✗ DANGEROUS: Function modifies input
function sortUsers(users: User[]): User[] {
  return users.sort((a, b) => a.name.localeCompare(b.name)); // Mutates!
}

// ✓ SAFE: Readonly parameter prevents mutation
function sortUsers(users: readonly User[]): User[] {
  return [...users].sort((a, b) => a.name.localeCompare(b.name));
}
```

### Readonly Return Types

```typescript
// Return readonly to prevent consumers from mutating shared state
function getConfig(): Readonly<AppConfig> {
  return config; // Caller cannot modify the shared config
}

function getPermissions(role: Role): readonly string[] {
  return ROLE_PERMISSIONS[role]; // Caller cannot push to shared array
}
```

---

## Step 5: Environment Variable Safety

### Validate at Startup

```typescript
// {{SRC_DIR}}config/env.ts

import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

type Env = z.infer<typeof EnvSchema>;

// Validate once at startup - crash early if invalid
function loadEnv(): Env {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format());
    process.exit(1);
  }
  return result.data;
}

// Export validated, typed env
export const env: Env = loadEnv();

// Usage: env.PORT is number (not string | undefined)
```

### Ambient Type Declaration

```typescript
// {{SRC_DIR}}global.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    DATABASE_URL: string;
    API_KEY: string;
    LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  }
}
```

---

## Step 6: Safe JSON Handling

```typescript
// ✗ DANGEROUS: JSON.parse returns any
const data = JSON.parse(rawJson);

// ✓ SAFE: Parse then validate
function parseJson<T>(
  raw: string,
  guard: (value: unknown) => value is T
): Result<T, Error> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (cause: unknown) {
    return Err(new Error('Invalid JSON', { cause: cause instanceof Error ? cause : undefined }));
  }

  if (!guard(parsed)) {
    return Err(new Error('JSON does not match expected shape'));
  }

  return Ok(parsed);
}

// Usage
const result = parseJson(body, isUserInput);
if (result.ok) {
  // result.value is UserInput
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

- [ ] All external data validated at system boundaries
- [ ] Schema validation (e.g. Zod) for HTTP request bodies
- [ ] Branded types for validated primitives (email, IDs, etc.)
- [ ] Functions accept branded types, not raw strings
- [ ] `strictNullChecks` enabled (via `strict: true`)
- [ ] `noUncheckedIndexedAccess` enabled
- [ ] No non-null assertions (`!`) in production code
- [ ] `readonly` used for interfaces, parameters, and return types
- [ ] Environment variables validated at startup
- [ ] `JSON.parse` results validated before use
- [ ] `tsc --noEmit` passes
- [ ] `eslint .` passes
