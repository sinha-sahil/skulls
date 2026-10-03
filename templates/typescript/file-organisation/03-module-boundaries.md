# {{PROJECT_NAME}} - Module Boundaries

## Overview

Define clear module boundaries, public APIs via barrel exports, and contracts between modules in {{PROJECT_NAME}}. This ensures modules are loosely coupled with well-defined interfaces.

## Status

🔴 Not Started

## Dependencies

- 01-assessment.md (understand current structure)
- 02-directory-structure.md (target layout defined)

---

## Step 1: Define Module Public APIs

Each module should expose a clear public API through its barrel export (`index.ts`). Internal implementation details stay private.

### Barrel Export Pattern

```typescript
// features/{{MODULE_NAME}}/index.ts

// Public API - only export what consumers need
export { {{MODULE_NAME}}Service } from './{{MODULE_NAME}}.service';
export { create{{MODULE_NAME}}, validate{{MODULE_NAME}} } from './{{MODULE_NAME}}.utils';

// Type exports - always use `export type` for type-only exports
export type {
  {{MODULE_NAME}}Config,
  {{MODULE_NAME}}Options,
  {{MODULE_NAME}}Result,
} from './{{MODULE_NAME}}.types';

// Constants
export { {{MODULE_NAME}}Defaults } from './{{MODULE_NAME}}.constants';
```

### Internal-Only Files

Files that should NOT be re-exported:

```typescript
// features/{{MODULE_NAME}}/internal.ts
// This file is ONLY imported within the {{MODULE_NAME}} module
// It is NOT exported from index.ts

export function internalHelper(): void {
  // implementation detail
}
```

---

## Step 2: Type-Only Export Boundaries

Use `export type` to ensure types don't create runtime dependencies:

```typescript
// shared/types/index.ts
export type { Result, AsyncResult } from './result.types';
export type { Branded, Opaque } from './brand.types';
export type { DeepPartial, DeepReadonly } from './utility.types';
```

### Isolate Type-Only Modules

```jsonc
// tsconfig.json - verbatimModuleSyntax enforces explicit type imports
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}
```

With `verbatimModuleSyntax`, consumers must use:

```typescript
// Correct - explicit type import
import type { UserConfig } from './types';
import { UserService } from './service';

// Error - type imported as value
import { UserConfig } from './types';
```

---

## Step 3: Define Dependency Rules

### Layer Rules

```text
Layer Hierarchy (higher layers can import from lower, never reverse):

┌─────────────────────────┐
│       features/         │  ← Can import from shared/, config/
├─────────────────────────┤
│       config/           │  ← Can import from shared/types/
├─────────────────────────┤
│       shared/utils/     │  ← Can import from shared/types/
├─────────────────────────┤
│       shared/types/     │  ← Imports from NOTHING internal
├─────────────────────────┤
│       shared/constants/ │  ← Can import from shared/types/
└─────────────────────────┘
```

### Feature-to-Feature Rules

```text
Feature Isolation Rules:

✓ features/auth/ → shared/types/
✓ features/auth/ → shared/utils/
✗ features/auth/ → features/users/   (NO direct cross-feature imports)
```

If two features need to communicate, extract the shared contract into `shared/types/`:

```typescript
// shared/types/user-context.types.ts
export interface UserContext {
  id: string;
  roles: readonly string[];
}

// features/auth/ exports UserContext
// features/users/ imports UserContext from shared
```

---

## Step 4: Enforce Boundaries with ESLint

### Import Restrictions

```javascript
// .eslintrc.js (or eslint.config.js)
module.exports = {
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [
        {
          group: ['../features/*'],
          message: 'Do not import across feature boundaries. Extract shared types to shared/types/.'
        },
        {
          group: ['../**/internal*'],
          message: 'Do not import internal modules from outside their feature.'
        }
      ]
    }],
    // Enforce type-only imports for type files
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
      fixStyle: 'separate-type-imports'
    }]
  }
};
```

---

## Step 5: Declaration File Strategy

### When to Generate `.d.ts`

| Scenario | Strategy |
|----------|----------|
| Library/package consumed by others | `declaration: true` in tsconfig |
| Monorepo internal package | `composite: true` + `declaration: true` |
| Application (not consumed) | `declaration: false` (not needed) |
| Third-party module without types | Hand-written `.d.ts` in `{{SRC_DIR}}` |

### Ambient Declaration Pattern

```typescript
// {{SRC_DIR}}global.d.ts

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    DATABASE_URL: string;
    API_KEY: string;
  }
}

// Untyped third-party module
declare module 'some-untyped-package' {
  export function doSomething(input: string): Promise<void>;
}
```

---

## Step 6: Document Module Map

| Module | Public Exports | Depends On | Consumed By |
|--------|---------------|------------|-------------|
| `shared/types` | Type definitions | Nothing | Everything |
| `shared/utils` | Utility functions | `shared/types` | Features |
| `shared/constants` | Constants | `shared/types` | Features |
| `config` | App configuration | `shared/types` | Features |
| `features/{{MODULE_NAME}}` | Service + types | `shared/*`, `config` | Entry point |

---

## Verification

```bash
tsc --noEmit
eslint .
vitest run
```

**Checklist:**

- [ ] Each module has a barrel export (`index.ts`) with explicit exports
- [ ] `export type` used for all type-only exports
- [ ] `verbatimModuleSyntax` enabled (or `isolatedModules`)
- [ ] No cross-feature direct imports
- [ ] Layer hierarchy documented and enforced
- [ ] ESLint rules configured for import boundaries
- [ ] Declaration file strategy decided
- [ ] Ambient declarations (`*.d.ts`) properly placed
- [ ] Module dependency map documented
- [ ] `tsc --noEmit` passes
- [ ] No circular dependencies
