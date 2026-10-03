# {{PROJECT_NAME}} - Code Style Guidelines

## Overview

Define the code style, naming conventions, formatting rules, import ordering, and file structure standards for {{PROJECT_NAME}}. These guidelines should be enforced via ESLint and tsconfig where possible.

## Status

🔴 Not Started

## Dependencies

None - This is a foundational guideline

---

## Step 1: tsconfig Strict Configuration

All projects must enable strict mode with additional safety flags:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    // Strict type checking
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,

    // Module system
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "verbatimModuleSyntax": true,

    // Output
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "{{OUT_DIR}}",
    "rootDir": "{{SRC_DIR}}",

    // Consistency
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["{{SRC_DIR}}**/*"],
  "exclude": ["node_modules", "{{OUT_DIR}}"]
}
```

### Flag Justification

| Flag | Why |
|------|-----|
| `strict: true` | Enables all strict checks as a baseline |
| `noUncheckedIndexedAccess` | Array/object index access returns `T \| undefined` |
| `exactOptionalPropertyTypes` | `undefined` is not assignable to optional props |
| `verbatimModuleSyntax` | Enforces explicit `import type` |
| `noImplicitReturns` | Every code path must return a value |

---

## Step 2: Naming Conventions

### Types and Interfaces

```typescript
// PascalCase for types, interfaces, enums, and classes
interface UserProfile {
  id: string;
  displayName: string;
}

type ApiResponse<T> = {
  data: T;
  metadata: ResponseMetadata;
};

enum HttpStatus {
  Ok = 200,
  NotFound = 404,
  InternalError = 500,
}

class UserService { /* ... */ }
```

### Variables and Functions

```typescript
// camelCase for variables, functions, methods, and parameters
const maxRetryCount = 3;
const isAuthenticated = true;

function getUserById(userId: string): Promise<User | null> {
  // ...
}

// Boolean variables: is/has/should/can prefix
const isLoading = false;
const hasPermission = true;
const shouldRetry = attempts < maxRetryCount;
const canEdit = user.role === 'admin';
```

### Constants

```typescript
// UPPER_SNAKE_CASE for true constants (compile-time known values)
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 5_000;
const API_BASE_URL = 'https://api.example.com';

// Use as const for constant objects
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];
```

### Generic Type Parameters

```typescript
// Descriptive generics for complex types
function transform<TInput, TOutput>(
  input: TInput,
  fn: (item: TInput) => TOutput
): TOutput {
  return fn(input);
}

// Single letter for simple, well-understood generics
function identity<T>(value: T): T {
  return value;
}

// Constrained generics
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

---

## Step 3: File Naming and Structure

### File Naming

```text
{{SRC_DIR}}
├── features/
│   └── {{MODULE_NAME}}/
│       ├── {{MODULE_NAME}}.service.ts        # kebab-case + suffix
│       ├── {{MODULE_NAME}}.types.ts          # Type definitions
│       ├── {{MODULE_NAME}}.constants.ts      # Constants
│       ├── {{MODULE_NAME}}.utils.ts          # Utility functions
│       └── {{MODULE_NAME}}.test.ts           # Tests (co-located)
├── shared/
│   ├── types/
│   │   ├── common.types.ts
│   │   └── utility.types.ts
│   └── utils/
│       └── type-guards.ts
└── index.ts
```

### File Suffixes

| Suffix | Purpose | Example |
|--------|---------|---------|
| `.types.ts` | Type/interface definitions | `user.types.ts` |
| `.service.ts` | Business logic / services | `auth.service.ts` |
| `.utils.ts` | Utility/helper functions | `string.utils.ts` |
| `.constants.ts` | Constant values | `http.constants.ts` |
| `.test.ts` | Test files | `auth.service.test.ts` |
| `.d.ts` | Declaration/ambient types | `global.d.ts` |

---

## Step 4: Import Ordering and Style

### Import Order (enforced by ESLint)

```typescript
// 1. Node built-in modules (with node: prefix)
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// 2. External packages
import { z } from 'zod';
import express from 'express';

// 3. Internal packages (monorepo scope)
import { logger } from '@{{PROJECT_NAME}}/shared';

// 4. Parent directory imports
import { UserService } from '../user';

// 5. Same directory imports
import { validate } from './helpers';

// 6. Type-only imports (always separate, always last)
import type { Request, Response } from 'express';
import type { UserConfig } from './types';
```

### Import Rules

```typescript
// ALWAYS use type-only imports for types
import type { User } from './user.types';      // ✓ Correct
import { User } from './user.types';            // ✗ Wrong (with verbatimModuleSyntax)

// NEVER use default exports (except for framework requirements)
export default class UserService { }            // ✗ Avoid
export class UserService { }                    // ✓ Prefer named exports

// NEVER use wildcard re-exports in barrel files
export * from './user.service';                 // ✗ Causes tree-shaking issues
export { UserService } from './user.service';   // ✓ Explicit exports
```

---

## Step 5: Formatting Rules

### ESLint Configuration

```javascript
// eslint.config.js
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.strictTypeChecked,
  {
    rules: {
      // Import style
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      }],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // Type safety
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',

      // Code quality
      '@typescript-eslint/explicit-function-return-type': ['error', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
      '@typescript-eslint/naming-convention': ['error',
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'function', format: ['camelCase'] },
      ],
    },
  }
);
```

### Formatting Standards

| Rule | Standard |
|------|----------|
| Indentation | {{INDENT_SIZE}} {{INDENT_STYLE}} |
| Quotes | {{QUOTE_STYLE}} quotes |
| Semicolons | Required |
| Trailing commas | Always (multiline) |
| Line length | {{LINE_LENGTH}} characters max |
| Braces | Same line (K&R style) |

---

## Verification

```bash
tsc --noEmit
eslint .
```

**Checklist:**

- [ ] tsconfig.json configured with strict flags
- [ ] Naming conventions documented (PascalCase types, camelCase values)
- [ ] File naming pattern established (kebab-case + suffix)
- [ ] Import ordering defined and enforced by ESLint
- [ ] `import type` used for all type imports
- [ ] No default exports (unless framework requires it)
- [ ] No wildcard re-exports in barrel files
- [ ] ESLint configured with TypeScript strict rules
- [ ] Formatting rules documented
- [ ] `tsc --noEmit` passes
- [ ] `eslint .` passes
