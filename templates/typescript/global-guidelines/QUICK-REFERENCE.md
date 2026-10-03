# Global Guidelines - Quick Reference

## Template Variables Reference

### Project Configuration

| Variable | Example | Description |
|----------|---------|-------------|
| `{{PROJECT_NAME}}` | `my-api` | Project or package name |
| `{{SRC_DIR}}` | `src/` | Source directory path |
| `{{TEST_DIR}}` | `tests/` | Test files location |
| `{{OUT_DIR}}` | `dist/` | Build output directory |
| `{{TEAM_NAME}}` | `Platform Team` | Team or organisation |
| `{{NODE_VERSION}}` | `20` | Target Node.js version |
| `{{TS_VERSION}}` | `5.5` | TypeScript version |

---

## Quick Decision Tree

```text
Writing TypeScript code?
├─ Naming a type or interface?
│  └─ PascalCase: UserProfile, OrderStatus, ApiResponse<T>
│
├─ Naming a variable or function?
│  └─ camelCase: getUserById, isValidEmail, formatDate
│
├─ Naming a constant?
│  └─ UPPER_SNAKE_CASE: MAX_RETRIES, API_BASE_URL
│
├─ Handling an error?
│  ├─ Expected error (validation, not found) → Result<T, E>
│  └─ Unexpected error (network, crash)     → throw + catch
│
├─ Using `any`?
│  └─ NO → Use `unknown`, generics, or specific type
│
├─ Using `as` assertion?
│  └─ Replace with type guard or discriminated union
│
└─ Writing a type?
   ├─ Object shape       → interface (extensible)
   ├─ Union or computed   → type alias
   ├─ Primitive wrapper   → Branded type
   └─ Utility derivation  → Pick, Omit, Partial, Required
```

---

## Naming Conventions at a Glance

| Thing | Convention | Example |
|-------|-----------|---------|
| Type / Interface | PascalCase | `UserProfile`, `ApiResponse<T>` |
| Type parameter | Single uppercase or `T` prefix | `T`, `TInput`, `TOutput` |
| Variable / Function | camelCase | `getUserById`, `isActive` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| Enum member | PascalCase | `HttpStatus.NotFound` |
| File (module) | kebab-case | `user-service.ts`, `api-client.ts` |
| File (types) | kebab-case + `.types` | `user.types.ts` |
| File (test) | kebab-case + `.test` | `user-service.test.ts` |
| Boolean variable | `is`/`has`/`should` prefix | `isLoading`, `hasPermission` |

---

## Essential tsconfig Settings

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

---

## Error Handling Pattern

```typescript
// Result type for expected errors
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Usage
async function findUser(id: string): Promise<Result<User, NotFoundError>> {
  const user = await db.find(id);
  if (!user) return { ok: false, error: new NotFoundError(id) };
  return { ok: true, value: user };
}
```

---

## Import Order

```typescript
// 1. Node built-ins
import { readFile } from 'node:fs/promises';

// 2. External packages
import { z } from 'zod';

// 3. Internal packages
import { logger } from '@{{PROJECT_NAME}}/shared';

// 4. Local modules
import { UserService } from '../user';

// 5. Relative imports
import { validate } from './helpers';

// 6. Type-only imports (always last)
import type { Config } from './types';
```

---

## Type Patterns Cheat Sheet

```typescript
// Discriminated union
type State = { status: 'idle' } | { status: 'loading' } | { status: 'done'; data: T };

// Branded type
type UserId = string & { readonly __brand: 'UserId' };

// Exhaustive check
const _exhaustive: never = value; // Compile error if cases missed

// Type guard
function isUser(v: unknown): v is User { /* ... */ }

// Const assertion
const ROUTES = ['/', '/about', '/contact'] as const;
type Route = (typeof ROUTES)[number]; // '/' | '/about' | '/contact'

// satisfies operator
const config = { port: 3000, host: 'localhost' } satisfies ServerConfig;
```

---

## Verification Commands

```bash
tsc --noEmit                  # Type check
eslint .                      # Lint
vitest run                    # Tests
```

---

## Checklist After Using Templates

- [ ] All `{{VARIABLES}}` replaced with actual values
- [ ] tsconfig strict mode configured
- [ ] ESLint rules configured to enforce conventions
- [ ] Naming conventions documented and followed
- [ ] Error handling pattern established
- [ ] Testing standards defined with coverage targets
- [ ] Documentation standards defined
- [ ] `tsc --noEmit` passes
- [ ] `eslint .` passes
- [ ] `vitest run` passes
