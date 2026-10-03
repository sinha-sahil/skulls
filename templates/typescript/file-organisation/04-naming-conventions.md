# {{PROJECT_NAME}} - Naming Conventions

## Overview

Establish consistent naming conventions for files, directories, types, and symbols across {{PROJECT_NAME}}. Consistent naming reduces cognitive load and makes the codebase navigable.

## Status

🔴 Not Started

## Dependencies

- 02-directory-structure.md (target layout defined)

---

## Step 1: File Naming Rules

### Directory Names

```text
Convention: kebab-case

✓ user-auth/
✓ payment-gateway/
✓ shared-utils/
✗ userAuth/
✗ PaymentGateway/
✗ shared_utils/
```

### File Names

| File Type | Convention | Example |
|-----------|-----------|---------|
| Feature service | `<name>.service.ts` | `auth.service.ts` |
| Types | `<name>.types.ts` | `auth.types.ts` |
| Utility functions | `<name>.utils.ts` | `string.utils.ts` |
| Constants | `<name>.constants.ts` | `http.constants.ts` |
| Configuration | `<name>.config.ts` | `app.config.ts` |
| Tests | `<name>.<unit>.test.ts` | `auth.service.test.ts` |
| Barrel export | `index.ts` | `index.ts` |
| Declaration file | `<name>.d.ts` or `global.d.ts` | `env.d.ts` |
| Validation schemas | `<name>.schema.ts` | `auth.schema.ts` |
| Middleware | `<name>.middleware.ts` | `cors.middleware.ts` |
| Handlers/Controllers | `<name>.handler.ts` | `auth.handler.ts` |

### File Naming Rules

```text
Convention: kebab-case with dot-separated suffixes

✓ user-profile.service.ts
✓ auth-token.types.ts
✓ http-client.utils.ts
✗ UserProfile.service.ts    (PascalCase for files)
✗ user_profile.service.ts   (snake_case for files)
✗ userProfile.service.ts    (camelCase for files)
```

---

## Step 2: Type and Interface Naming

### Types vs Interfaces

```typescript
// Use `interface` for object shapes that may be extended
interface UserService {
  getUser(id: string): Promise<User>;
  createUser(data: CreateUserInput): Promise<User>;
}

// Use `type` for unions, intersections, mapped types, and utility types
type Result<T> = Success<T> | Failure;
type UserInput = Pick<User, 'name' | 'email'>;
type Nullable<T> = T | null;
```

### Naming Patterns

| Category | Convention | Example |
|----------|-----------|---------|
| Interfaces | PascalCase, noun or adjective | `UserService`, `Serializable` |
| Type aliases | PascalCase | `UserInput`, `AuthResult` |
| Generic parameters | Single uppercase or descriptive | `T`, `TData`, `TError` |
| Branded types | PascalCase with `Brand` suffix | `UserId`, `EmailAddress` |
| Utility types | PascalCase, descriptive | `DeepPartial<T>`, `Nullable<T>` |
| Discriminated unions | PascalCase with shared `kind`/`type` | `AuthEvent`, `PaymentAction` |
| Enums | PascalCase (both enum and members) | `HttpStatus.Ok` |

### Generic Parameter Conventions

```typescript
// Single type parameter - use T
function identity<T>(value: T): T { return value; }

// Multiple type parameters - use descriptive prefixed names
function transform<TInput, TOutput>(
  input: TInput,
  fn: (value: TInput) => TOutput
): TOutput {
  return fn(input);
}

// Constrained generics - name reflects the constraint
function getProperty<TObj, TKey extends keyof TObj>(
  obj: TObj,
  key: TKey
): TObj[TKey] {
  return obj[key];
}
```

---

## Step 3: Variable and Function Naming

### Functions

```typescript
// Verbs for actions
function createUser(input: CreateUserInput): Promise<User> { /* ... */ }
function validateEmail(email: string): boolean { /* ... */ }
function parseConfig(raw: string): AppConfig { /* ... */ }

// Predicates start with is/has/can/should
function isAuthenticated(ctx: Context): boolean { /* ... */ }
function hasPermission(user: User, action: string): boolean { /* ... */ }
function canAccessResource(user: User, resource: Resource): boolean { /* ... */ }

// Type guards use is return type
function isUser(value: unknown): value is User { /* ... */ }
function isError(value: unknown): value is Error { /* ... */ }
```

### Constants

```typescript
// SCREAMING_SNAKE_CASE for true constants
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT_MS = 5000;
const API_BASE_URL = 'https://api.example.com';

// PascalCase for constant objects (frozen/readonly)
const HttpStatus = {
  Ok: 200,
  NotFound: 404,
  InternalError: 500,
} as const;

// camelCase for derived/computed values
const defaultConfig: AppConfig = { /* ... */ };
```

### Variables

```text
Convention: camelCase

✓ userName
✓ isActive
✓ authToken
✗ user_name   (snake_case)
✗ UserName     (PascalCase for variables)
```

---

## Step 4: Export Naming

### Named Exports (Preferred)

```typescript
// Prefer named exports for better refactoring and tree-shaking
export function createAuthService(config: AuthConfig): AuthService { /* ... */ }
export type AuthConfig = { /* ... */ };
export const AUTH_DEFAULTS = { /* ... */ } as const;
```

### Default Exports (Avoid in Libraries)

```typescript
// Avoid default exports in library/shared code
// They make refactoring harder and imports inconsistent

// BAD - consumers can name it anything
export default class AuthService { /* ... */ }

// GOOD - consistent name across all consumers
export class AuthService { /* ... */ }
```

---

## Step 5: Test Naming

### Test Files

```text
Convention: <source-file>.test.ts, co-located or in __tests__/

✓ auth.service.test.ts
✓ __tests__/auth.service.test.ts
✗ auth.service.spec.ts        (pick one convention and stick to it)
✗ test-auth-service.ts
```

### Test Descriptions

```typescript
describe('AuthService', () => {
  describe('authenticate', () => {
    it('returns a valid token for valid credentials', () => { /* ... */ });
    it('throws AuthError for invalid password', () => { /* ... */ });
    it('throws AuthError for non-existent user', () => { /* ... */ });
  });
});
```

---

## Step 6: Summary Table

| Symbol | Convention | Example |
|--------|-----------|---------|
| Files | kebab-case.suffix.ts | `user-auth.service.ts` |
| Directories | kebab-case | `user-auth/` |
| Interfaces | PascalCase | `UserService` |
| Type aliases | PascalCase | `AuthResult` |
| Classes | PascalCase | `HttpClient` |
| Functions | camelCase, verb-first | `createUser` |
| Variables | camelCase | `authToken` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Const objects | PascalCase | `HttpStatus` |
| Generics | `T` or `TPrefixed` | `TInput`, `TOutput` |
| Enums | PascalCase | `HttpMethod.Get` |
| Test files | `<source>.test.ts` | `auth.service.test.ts` |

---

## Verification

```bash
tsc --noEmit
eslint .
vitest run
```

**Checklist:**

- [ ] File naming convention documented and applied
- [ ] Directory naming convention applied
- [ ] Type/interface naming convention applied
- [ ] Function naming convention applied
- [ ] Constant naming convention applied
- [ ] Generic parameter naming convention applied
- [ ] Export style decided (named vs default)
- [ ] Test file naming convention applied
- [ ] ESLint naming convention rules configured
- [ ] No inconsistencies across the codebase
