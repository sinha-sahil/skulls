# File Organisation - Quick Reference

## Template Variables Reference

### Project Configuration

| Variable | Example | Description |
|----------|---------|-------------|
| `{{PROJECT_NAME}}` | `my-app` | Project or package name |
| `{{SRC_DIR}}` | `src/` | Source directory path |
| `{{OUT_DIR}}` | `dist/` | Build output directory |
| `{{CONFIG_DIR}}` | `./` | Config files location |
| `{{TEST_DIR}}` | `tests/` | Test files location |
| `{{ENTRY_POINT}}` | `src/index.ts` | Package entry point |

### Module Configuration

| Variable | Example | Description |
|----------|---------|-------------|
| `{{MODULE_NAME}}` | `auth` | Module being organised |
| `{{PACKAGE_SCOPE}}` | `@acme` | npm scope for monorepo |
| `{{PACKAGES_DIR}}` | `packages/` | Packages directory |
| `{{APPS_DIR}}` | `apps/` | Applications directory |

---

## Quick Decision Tree

```text
Organising a TypeScript project?
├─ Is this a monorepo?
│  ├─ YES → Use project references + composite tsconfigs
│  └─ NO  → Single tsconfig with path aliases
│
├─ Does the project have >20 files in one directory?
│  └─ YES → Split into feature modules with barrel exports
│
├─ Are there circular import errors?
│  └─ YES → Phase 03 (Module Boundaries) is critical
│
├─ Is the project migrating from JavaScript?
│  └─ YES → Phase 06 (Migration Plan) with allowJs
│
└─ Is build time slow?
   └─ YES → Check barrel exports, consider project references
```

---

## Common Directory Patterns

### Pattern 1: Feature-Based (Recommended)

```text
{{SRC_DIR}}
├── features/
│   ├── auth/
│   │   ├── index.ts          # barrel export
│   │   ├── auth.service.ts
│   │   ├── auth.types.ts
│   │   └── auth.test.ts
│   └── users/
│       ├── index.ts
│       ├── users.service.ts
│       ├── users.types.ts
│       └── users.test.ts
├── shared/
│   ├── types/
│   ├── utils/
│   └── constants/
└── index.ts
```

### Pattern 2: Layer-Based

```text
{{SRC_DIR}}
├── types/
├── services/
├── utils/
├── handlers/
└── index.ts
```

### Pattern 3: Monorepo

```text
{{WORKSPACE_ROOT}}
├── packages/
│   ├── core/
│   │   ├── src/
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── shared/
│       ├── src/
│       ├── tsconfig.json
│       └── package.json
├── apps/
│   └── api/
│       ├── src/
│       ├── tsconfig.json
│       └── package.json
├── tsconfig.base.json
└── package.json
```

---

## tsconfig Patterns

### Base Config (monorepo root)

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true
  }
}
```

### Package Config (extends base)

```jsonc
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../shared" }
  ]
}
```

---

## Barrel Export Rules

### Safe Barrel Pattern

```typescript
// features/auth/index.ts
export { AuthService } from './auth.service';
export type { AuthConfig, AuthToken } from './auth.types';
```

### Avoid Re-exporting Everything

```typescript
// BAD - causes tree-shaking issues and circular deps
export * from './auth.service';
export * from './auth.types';
export * from './auth.utils';
```

---

## Import Order Convention

```typescript
// 1. Node built-ins
import { readFile } from 'node:fs/promises';

// 2. External packages
import { z } from 'zod';

// 3. Internal packages (monorepo)
import { logger } from '{{PACKAGE_SCOPE}}/shared';

// 4. Local modules
import { AuthService } from '../auth';

// 5. Relative imports
import { validate } from './helpers';

// 6. Type-only imports
import type { Config } from './types';
```

---

## Verification Commands

```bash
tsc --noEmit                  # Type check
eslint .                      # Lint
vitest run                    # Tests
madge --circular {{SRC_DIR}}  # Circular dependency check (optional)
```

---

## Checklist After Using Templates

- [ ] All `{{VARIABLES}}` replaced with actual values
- [ ] Directory structure created and documented
- [ ] Barrel exports follow safe patterns
- [ ] tsconfig properly configured
- [ ] Import paths updated across all files
- [ ] `tsc --noEmit` passes
- [ ] `eslint .` passes
- [ ] No circular dependencies
- [ ] Tests pass after restructuring
