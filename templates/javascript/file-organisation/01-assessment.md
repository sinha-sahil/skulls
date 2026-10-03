# Phase 1: Assessment

**Dependencies:** None

**Can be implemented in parallel with:** Nothing — this must be completed first

## 1.1 Module System Audit

Determine the current module system and identify inconsistencies.

```javascript
// Check package.json for module system
// "type": "module"  → ESM
// "type": "commonjs" or absent → CJS

// Look for mixed usage patterns:
// ESM indicators:
import { something } from './module.js';
export const value = 42;

// CJS indicators:
const something = require('./module');
module.exports = { value };
```

**Checklist:**

- [ ] Check `package.json` for `"type"` field
- [ ] Count files using `import`/`export` vs `require`/`module.exports`
- [ ] Identify files mixing both systems
- [ ] Note any `.mjs` or `.cjs` file extensions in use
- [ ] Check if `exports` field is configured in `package.json`

## 1.2 Directory Structure Audit

Map the current file organisation and identify problems.

```text
# Generate a file tree excluding node_modules and build output
# Note:
# - Deeply nested files (> 4 levels)
# - Inconsistent directory naming
# - Files in wrong directories
# - Missing index.js barrel files
# - Orphaned files not imported anywhere
```

**Checklist:**

- [ ] Generate full directory tree of `{{SRC_ROOT}}`
- [ ] Identify maximum nesting depth
- [ ] List directories with more than 15 files (candidates for splitting)
- [ ] List files at project root that belong in `{{SRC_ROOT}}`
- [ ] Identify orphaned files not imported by anything

## 1.3 Import Graph Analysis

Analyse the dependency flow between modules.

```javascript
// Look for circular dependency patterns:
// a.js imports from b.js AND b.js imports from a.js

// Look for deep relative imports:
import { helper } from '../../../utils/shared/helpers/string.js';
// This suggests the file is in the wrong location or needs a path alias

// Look for inconsistent import patterns:
import utils from './utils/index.js';   // explicit barrel
import utils from './utils';             // implicit barrel (CJS only)
import { fn } from './utils/helpers.js'; // bypassing barrel
```

**Checklist:**

- [ ] Identify circular dependencies between modules
- [ ] List imports with more than 3 `../` levels
- [ ] Check for barrel file bypass (importing internals directly)
- [ ] Note any path aliases configured (tsconfig paths, package imports)
- [ ] Identify the most-imported files (dependency hotspots)

## 1.4 Configuration File Audit

Review configuration that affects module resolution.

```json
// package.json fields to check:
{
  "type": "module|commonjs",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "exports": { ".": {} },
  "imports": { "#utils/*": "./src/utils/*" },
  "files": ["dist"]
}
```

**Checklist:**

- [ ] Document `package.json` module-related fields
- [ ] Check for `jsconfig.json` or `tsconfig.json` path aliases
- [ ] Review bundler config (vite.config.js, rollup.config.js, etc.)
- [ ] Check `.eslintrc` for import-related rules
- [ ] Note any custom module resolution in use

## 1.5 Pain Points Summary

Document specific problems to address in subsequent phases.

**Checklist:**

- [ ] List the top 5 structural issues by impact
- [ ] Note which issues cause developer friction daily
- [ ] Identify issues that slow down onboarding
- [ ] Flag security concerns (exposed internals, missing encapsulation)
- [ ] Estimate effort for each issue (small / medium / large)
