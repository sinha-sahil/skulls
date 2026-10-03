# {{PROJECT_NAME}} - Migration Plan

## Overview

Plan the incremental migration from the current file structure to the target structure for {{PROJECT_NAME}}. Every step must leave the project in a compilable, functional state.

## Status

🔴 Not Started

## Dependencies

- All previous phases (01 through 05) should be completed

---

## Step 1: Pre-Migration Checklist

Before starting any file moves:

- [ ] All changes committed to version control
- [ ] A dedicated branch created: `refactor/file-organisation`
- [ ] Current test suite passes: `vitest run`
- [ ] Current type check passes: `tsc --noEmit`
- [ ] Current lint passes: `eslint .`
- [ ] Target structure documented (from 02-directory-structure.md)
- [ ] Module boundaries defined (from 03-module-boundaries.md)

---

## Step 2: Migration Strategy

### Approach: Incremental Bottom-Up

Migrate in dependency order — start with modules that have no internal dependencies, then work upward.

```text
Migration Order:

Step 1: shared/types/        ← No internal dependencies
Step 2: shared/constants/    ← Depends only on types
Step 3: shared/utils/        ← Depends on types
Step 4: config/              ← Depends on types
Step 5: features/*           ← Depends on shared, config
Step 6: Entry point          ← Depends on features
Step 7: tsconfig + build     ← Final configuration
```

### Per-File Migration Steps

For each file being moved or renamed:

```bash
# 1. Move/rename the file
git mv {{SRC_DIR}}old/path/file.ts {{SRC_DIR}}new/path/file.ts

# 2. Update all imports referencing the old path
# Search for: from './old/path/file' or from '../old/path/file'
# Replace with new path

# 3. Verify compilation
tsc --noEmit

# 4. Run tests
vitest run

# 5. Commit
git commit -m "refactor: move file.ts to new/path/"
```

---

## Step 3: Migrate Shared Types

```bash
# Create target directories
mkdir -p {{SRC_DIR}}shared/types
```

### Move Type Files

| Current Location | Target Location | Notes |
|-----------------|----------------|-------|
| `{{SRC_DIR}}types.ts` | `{{SRC_DIR}}shared/types/common.types.ts` | Split if large |
| `{{SRC_DIR}}models/*.ts` | `{{SRC_DIR}}shared/types/<domain>.types.ts` | Rename to .types.ts |

### Create Barrel Export

```typescript
// {{SRC_DIR}}shared/types/index.ts
export type { User, UserInput } from './user.types';
export type { Result, AsyncResult } from './result.types';
export type { AppConfig } from './config.types';
```

### Update Imports

```typescript
// Before
import { User } from '../../types';
import { Result } from '../../models/result';

// After
import type { User } from '@/shared/types';
import type { Result } from '@/shared/types';
```

**Verify after this step:**

```bash
tsc --noEmit && vitest run
```

---

## Step 4: Migrate Utilities and Constants

```bash
mkdir -p {{SRC_DIR}}shared/utils
mkdir -p {{SRC_DIR}}shared/constants
```

| Current Location | Target Location |
|-----------------|----------------|
| `{{SRC_DIR}}utils/*.ts` | `{{SRC_DIR}}shared/utils/<name>.utils.ts` |
| `{{SRC_DIR}}helpers/*.ts` | `{{SRC_DIR}}shared/utils/<name>.utils.ts` |
| `{{SRC_DIR}}constants.ts` | `{{SRC_DIR}}shared/constants/<domain>.constants.ts` |

**Verify after this step:**

```bash
tsc --noEmit && vitest run
```

---

## Step 5: Migrate Features

```bash
mkdir -p {{SRC_DIR}}features/{{MODULE_NAME}}
mkdir -p {{SRC_DIR}}features/{{MODULE_NAME}}/__tests__
```

### Gather Feature Files

| Current Location | Target Location |
|-----------------|----------------|
| `{{SRC_DIR}}{{MODULE_NAME}}.ts` | `{{SRC_DIR}}features/{{MODULE_NAME}}/{{MODULE_NAME}}.service.ts` |
| `{{SRC_DIR}}{{MODULE_NAME}}/types.ts` | `{{SRC_DIR}}features/{{MODULE_NAME}}/{{MODULE_NAME}}.types.ts` |
| `{{SRC_DIR}}{{MODULE_NAME}}.test.ts` | `{{SRC_DIR}}features/{{MODULE_NAME}}/__tests__/{{MODULE_NAME}}.service.test.ts` |

### Create Feature Barrel

```typescript
// {{SRC_DIR}}features/{{MODULE_NAME}}/index.ts
export { {{MODULE_NAME}}Service } from './{{MODULE_NAME}}.service';
export type { {{MODULE_NAME}}Config, {{MODULE_NAME}}Result } from './{{MODULE_NAME}}.types';
```

**Verify after each feature migration:**

```bash
tsc --noEmit && vitest run
```

---

## Step 6: Update Configuration

### Update tsconfig.json

```jsonc
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./{{SRC_DIR}}*"],
      "@/shared/*": ["./{{SRC_DIR}}shared/*"],
      "@/features/*": ["./{{SRC_DIR}}features/*"],
      "@/config/*": ["./{{SRC_DIR}}config/*"]
    }
  }
}
```

### Update Package Exports (if library)

```jsonc
// package.json
{
  "exports": {
    ".": {
      "types": "./{{OUT_DIR}}index.d.ts",
      "import": "./{{OUT_DIR}}index.js"
    },
    "./{{MODULE_NAME}}": {
      "types": "./{{OUT_DIR}}features/{{MODULE_NAME}}/index.d.ts",
      "import": "./{{OUT_DIR}}features/{{MODULE_NAME}}/index.js"
    }
  }
}
```

---

## Step 7: JavaScript to TypeScript Migration (If Applicable)

### Enable allowJs Temporarily

```jsonc
// tsconfig.json - during migration only
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true
  }
}
```

### Migration Order for JS Files

1. Rename `.js` → `.ts` (start with leaf files that have no dependents)
2. Add type annotations to exported functions
3. Fix type errors
4. Run `tsc --noEmit` after each file
5. Once all files are `.ts`, remove `allowJs` and `checkJs`

```bash
# Rename and fix one file at a time
mv {{SRC_DIR}}utils/helpers.js {{SRC_DIR}}utils/helpers.ts
tsc --noEmit  # Fix reported errors
vitest run    # Ensure no regressions
git commit -m "refactor: convert helpers.js to TypeScript"
```

---

## Step 8: Post-Migration Cleanup

- [ ] Remove empty directories from old structure
- [ ] Remove unused barrel exports
- [ ] Remove `allowJs` if JS migration is complete
- [ ] Update `.gitignore` for new `{{OUT_DIR}}` if changed
- [ ] Update CI/CD scripts if file paths changed
- [ ] Update documentation references to old paths
- [ ] Squash or clean up migration commits before merge

---

## Verification

```bash
tsc --noEmit
eslint .
vitest run
npx madge --circular --extensions ts {{SRC_DIR}}
```

**Checklist:**

- [ ] All files moved to target locations
- [ ] All imports updated to new paths
- [ ] All barrel exports created and correct
- [ ] tsconfig updated with path aliases
- [ ] Package exports updated (if library)
- [ ] No circular dependencies
- [ ] `tsc --noEmit` passes
- [ ] `eslint .` passes
- [ ] `vitest run` passes (all tests green)
- [ ] Old empty directories removed
- [ ] Migration branch ready for review
