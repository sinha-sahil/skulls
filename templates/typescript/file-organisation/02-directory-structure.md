# {{PROJECT_NAME}} - Directory Structure

## Overview

Design the target directory layout for {{PROJECT_NAME}}, including where each type of file belongs, how configuration is organised, and how the project scales.

## Status

🔴 Not Started

## Dependencies

- 01-assessment.md (must understand current state first)

---

## Step 1: Choose Structure Pattern

### Option A: Feature-Based (Recommended for most projects)

```text
{{SRC_DIR}}
├── features/
│   ├── {{MODULE_NAME}}/
│   │   ├── index.ts              # barrel export (public API)
│   │   ├── {{MODULE_NAME}}.service.ts
│   │   ├── {{MODULE_NAME}}.types.ts
│   │   ├── {{MODULE_NAME}}.utils.ts
│   │   ├── {{MODULE_NAME}}.constants.ts
│   │   └── __tests__/
│   │       └── {{MODULE_NAME}}.service.test.ts
│   └── [other features]/
├── shared/
│   ├── types/
│   │   ├── index.ts
│   │   ├── common.types.ts
│   │   └── utility.types.ts
│   ├── utils/
│   │   ├── index.ts
│   │   └── [utility files]
│   └── constants/
│       ├── index.ts
│       └── [constant files]
├── config/
│   ├── env.ts
│   └── app.config.ts
├── index.ts                      # package entry point
└── global.d.ts                   # ambient declarations
```

### Option B: Monorepo with Project References

```text
{{WORKSPACE_ROOT}}
├── packages/
│   ├── {{PACKAGE_SCOPE}}/core/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── [core modules]
│   │   ├── tsconfig.json         # extends base, composite: true
│   │   └── package.json
│   ├── {{PACKAGE_SCOPE}}/shared/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── [shared modules]
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── {{PACKAGE_SCOPE}}/types/
│       ├── src/
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
├── apps/
│   └── {{PROJECT_NAME}}/
│       ├── src/
│       ├── tsconfig.json         # references packages
│       └── package.json
├── tsconfig.base.json            # shared compiler options
├── tsconfig.json                 # solution-level references
└── package.json                  # workspace config
```

---

## Step 2: Configure tsconfig Structure

### Single Project

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "{{OUT_DIR}}",
    "rootDir": "{{SRC_DIR}}",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./{{SRC_DIR}}*"],
      "@/shared/*": ["./{{SRC_DIR}}shared/*"],
      "@/features/*": ["./{{SRC_DIR}}features/*"]
    }
  },
  "include": ["{{SRC_DIR}}**/*"],
  "exclude": ["node_modules", "{{OUT_DIR}}", "**/*.test.ts"]
}
```

### Monorepo Base Config

```jsonc
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

### Monorepo Package Config

```jsonc
// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../shared" },
    { "path": "../types" }
  ]
}
```

### Monorepo Solution Config

```jsonc
// tsconfig.json (root)
{
  "files": [],
  "references": [
    { "path": "packages/core" },
    { "path": "packages/shared" },
    { "path": "packages/types" },
    { "path": "apps/{{PROJECT_NAME}}" }
  ]
}
```

---

## Step 3: Define File Categories

| File Type | Location | Naming Pattern | Example |
|-----------|----------|----------------|---------|
| Feature service | `features/<name>/` | `<name>.service.ts` | `auth.service.ts` |
| Feature types | `features/<name>/` | `<name>.types.ts` | `auth.types.ts` |
| Feature tests | `features/<name>/__tests__/` | `<name>.service.test.ts` | `auth.service.test.ts` |
| Shared types | `shared/types/` | `<domain>.types.ts` | `common.types.ts` |
| Utility functions | `shared/utils/` | `<purpose>.utils.ts` | `string.utils.ts` |
| Constants | `shared/constants/` | `<domain>.constants.ts` | `http.constants.ts` |
| Configuration | `config/` | `<purpose>.config.ts` | `app.config.ts` |
| Barrel exports | Any directory | `index.ts` | `index.ts` |
| Ambient types | Project root or `{{SRC_DIR}}` | `*.d.ts` | `global.d.ts` |
| Declaration files | `{{OUT_DIR}}` | Auto-generated | `index.d.ts` |

---

## Step 4: Document the Target Structure

Fill in the actual target structure for {{PROJECT_NAME}}:

```text
{{SRC_DIR}}
├── [document your actual target layout here]
└── ...
```

---

## Verification

```bash
tsc --noEmit
eslint .
vitest run
```

**Checklist:**

- [ ] Structure pattern chosen (feature-based or monorepo)
- [ ] tsconfig files designed and documented
- [ ] Path aliases configured (if using)
- [ ] Project references configured (if monorepo)
- [ ] File categories and locations defined
- [ ] Target directory structure documented
- [ ] `tsc --noEmit` passes with new config
- [ ] Build output goes to `{{OUT_DIR}}`
