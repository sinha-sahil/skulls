# {{PROJECT_NAME}} - Dependency Flow

## Overview

Map, document, and enforce the dependency flow between modules in {{PROJECT_NAME}}. A clean dependency graph prevents circular imports, reduces coupling, and makes the codebase easier to reason about.

## Status

🔴 Not Started

## Dependencies

- 02-directory-structure.md (target layout defined)
- 03-module-boundaries.md (boundaries defined)

---

## Step 1: Map the Dependency Graph

### Current Dependency Flow

Document the existing import relationships:

```text
{{ENTRY_POINT}}
│
├── features/{{MODULE_NAME}}/
│   ├── → shared/types/         (type imports)
│   ├── → shared/utils/         (utility functions)
│   └── → config/               (configuration)
│
├── features/[other]/
│   ├── → shared/types/
│   └── → shared/utils/
│
├── shared/utils/
│   └── → shared/types/
│
├── shared/types/
│   └── → (no internal imports)
│
└── config/
    └── → shared/types/
```

### Detect Circular Dependencies

```bash
# Using madge (install: npm install -D madge)
npx madge --circular --extensions ts {{SRC_DIR}}

# Using tsc with project references (will error on cycles)
tsc --build --verbose
```

---

## Step 2: Define Import Rules

### Allowed Import Directions

```typescript
// ✓ ALLOWED: Feature imports shared
import type { UserId } from '@/shared/types';
import { validateEmail } from '@/shared/utils';

// ✓ ALLOWED: Feature imports config
import { appConfig } from '@/config';

// ✗ FORBIDDEN: Shared imports feature
import { AuthService } from '@/features/auth';  // NEVER do this

// ✗ FORBIDDEN: Cross-feature imports
import { UserService } from '@/features/users';  // From within features/auth

// ✓ ALLOWED: Entry point imports features
import { AuthService } from '@/features/auth';
import { UserService } from '@/features/users';
```

### Import Rule Matrix

| From ↓ / To → | shared/types | shared/utils | config | features | entry point |
|----------------|:---:|:---:|:---:|:---:|:---:|
| **shared/types** | — | ✗ | ✗ | ✗ | ✗ |
| **shared/utils** | ✓ | — | ✗ | ✗ | ✗ |
| **config** | ✓ | ✗ | — | ✗ | ✗ |
| **features** | ✓ | ✓ | ✓ | ✗ | ✗ |
| **entry point** | ✓ | ✓ | ✓ | ✓ | — |

---

## Step 3: Enforce with Path Aliases

### tsconfig Path Aliases

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/shared/*": ["{{SRC_DIR}}shared/*"],
      "@/features/*": ["{{SRC_DIR}}features/*"],
      "@/config/*": ["{{SRC_DIR}}config/*"],
      "@/types": ["{{SRC_DIR}}shared/types"]
    }
  }
}
```

### ESLint Import Ordering

```javascript
// eslint.config.js
export default [
  {
    rules: {
      'import/order': ['error', {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'type'
        ],
        pathGroups: [
          { pattern: '@/shared/**', group: 'internal', position: 'before' },
          { pattern: '@/config/**', group: 'internal', position: 'before' },
          { pattern: '@/features/**', group: 'internal', position: 'after' }
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' }
      }]
    }
  }
];
```

---

## Step 4: Monorepo Dependency Flow (If Applicable)

### Project References as Dependency Enforcement

```jsonc
// packages/core/tsconfig.json
{
  "references": [
    { "path": "../shared" },   // core depends on shared
    { "path": "../types" }     // core depends on types
  ]
}

// packages/shared/tsconfig.json
{
  "references": [
    { "path": "../types" }     // shared depends only on types
  ]
  // Note: NO reference to core (would be circular)
}

// packages/types/tsconfig.json
{
  "references": []             // types depends on nothing
}
```

### Dependency Flow Diagram

```text
apps/{{PROJECT_NAME}}
    │
    ├──→ packages/core
    │       │
    │       ├──→ packages/shared
    │       │       │
    │       │       └──→ packages/types
    │       │
    │       └──→ packages/types
    │
    └──→ packages/shared
            │
            └──→ packages/types
```

### Build Order

```bash
# tsc --build respects project reference order
tsc --build

# Build order will be:
# 1. packages/types       (no deps)
# 2. packages/shared      (depends on types)
# 3. packages/core        (depends on shared, types)
# 4. apps/{{PROJECT_NAME}} (depends on core, shared)
```

---

## Step 5: Handle Cross-Cutting Concerns

When two features need to share data, extract the contract:

### Before (Circular Risk)

```typescript
// features/auth/auth.service.ts
import { UserService } from '../users/users.service';  // BAD: cross-feature

export class AuthService {
  constructor(private users: UserService) {}
}
```

### After (Clean Dependency)

```typescript
// shared/types/user-lookup.types.ts
export interface UserLookup {
  findByEmail(email: string): Promise<User | null>;
}

// features/auth/auth.service.ts
import type { UserLookup } from '@/shared/types';

export class AuthService {
  constructor(private users: UserLookup) {}  // Depends on interface, not implementation
}

// features/users/users.service.ts
import type { UserLookup } from '@/shared/types';

export class UserService implements UserLookup {
  async findByEmail(email: string): Promise<User | null> { /* ... */ }
}
```

---

## Step 6: Visualise and Validate

### Generate Dependency Graph

```bash
# Visual graph (requires graphviz)
npx madge --image dependency-graph.svg --extensions ts {{SRC_DIR}}

# Text-based list
npx madge --extensions ts {{SRC_DIR}}
```

### Validate No Violations

```bash
# Check for circular dependencies
npx madge --circular --extensions ts {{SRC_DIR}}

# Type check (project references catch dependency errors)
tsc --noEmit
```

---

## Verification

```bash
tsc --noEmit
eslint .
vitest run
npx madge --circular --extensions ts {{SRC_DIR}}
```

**Checklist:**

- [ ] Dependency graph mapped for all modules
- [ ] No circular dependencies exist
- [ ] Import rule matrix documented
- [ ] Path aliases configured in tsconfig
- [ ] ESLint import ordering configured
- [ ] Project references set up (if monorepo)
- [ ] Cross-cutting concerns extracted to shared interfaces
- [ ] Dependency graph visualisation generated
- [ ] `tsc --noEmit` passes
- [ ] No restricted import violations
