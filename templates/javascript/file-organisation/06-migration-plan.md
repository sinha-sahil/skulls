# Phase 6: Migration Plan

**Dependencies:** Phases 1-5 (all design phases)

**Can be implemented in parallel with:** Nothing — execute sequentially

## 6.1 Pre-Migration Preparation

Set up safety measures before moving any files.

```bash
# Ensure clean working tree
git status

# Create a migration branch
git checkout -b refactor/file-organisation

# Run tests to establish baseline
pnpm test

# Generate current import graph for comparison
npx madge --json {{SRC_ROOT}} > import-graph-before.json
```

**Checklist:**

- [ ] Create a dedicated branch for the migration
- [ ] Verify all tests pass before starting
- [ ] Snapshot current import graph
- [ ] Notify team of in-progress restructuring
- [ ] Set up CI to run on the migration branch

## 6.2 Migration Order

Execute changes in a safe order to minimise breakage.

```text
# Step 1: Create new directory structure (empty)
mkdir -p src/features/{{MODULE_NAME}}
mkdir -p src/shared/utils
mkdir -p src/shared/errors
mkdir -p src/config

# Step 2: Move shared utilities first (fewest dependents)
git mv src/utils/date.js src/shared/utils/date.js
git mv src/utils/string.js src/shared/utils/string.js

# Step 3: Create barrel files for shared modules
# src/shared/utils/index.js
export { formatDate } from './date.js';
export { slugify } from './string.js';

# Step 4: Move feature modules one at a time
git mv src/auth/ src/features/auth/

# Step 5: Update imports in moved module
# Step 6: Run tests after EACH module move
# Step 7: Commit after each successful module migration
```

**Checklist:**

- [ ] Create target directory structure
- [ ] Move shared utilities first
- [ ] Create barrel files for shared modules
- [ ] Move feature modules one at a time
- [ ] Update imports after each move
- [ ] Run tests after each move
- [ ] Commit after each successful migration step

## 6.3 Module System Migration (CJS to ESM)

If migrating from CommonJS to ES Modules:

```javascript
// Step 1: Update package.json
// Add: "type": "module"

// Step 2: Rename files that MUST stay CJS
// .js → .cjs for files that cannot be ESM
// (e.g., older config files: .eslintrc.cjs)

// Step 3: Convert require() to import
// BEFORE:
const express = require('express');
const { readFile } = require('fs/promises');
const { helper } = require('./utils');

// AFTER:
import express from 'express';
import { readFile } from 'node:fs/promises';
import { helper } from './utils.js';  // .js extension required in ESM

// Step 4: Convert module.exports to export
// BEFORE:
module.exports = { createUser, getUser };

// AFTER:
export { createUser, getUser };

// Step 5: Replace __dirname and __filename
// BEFORE:
const configPath = path.join(__dirname, 'config.json');

// AFTER:
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, 'config.json');
```

**Checklist:**

- [ ] Set `"type": "module"` in `package.json`
- [ ] Rename files requiring CJS to `.cjs` extension
- [ ] Convert all `require()` to `import` statements
- [ ] Convert all `module.exports` to `export` statements
- [ ] Add `.js` extension to all relative import paths
- [ ] Replace `__dirname`/`__filename` with `import.meta.url` pattern
- [ ] Update `require.resolve()` to `import.meta.resolve()`
- [ ] Test each file after conversion

## 6.4 Import Path Updates

Systematically update all import paths.

```javascript
// Use search-and-replace to update import paths:

// BEFORE: Deep relative imports
import { config } from '../../../config/index.js';
import { logger } from '../../../shared/utils/logger.js';

// AFTER: Path aliases
import { config } from '#config';
import { logger } from '#shared/utils/logger.js';

// BEFORE: Importing module internals
import { hashPassword } from '../auth/auth.helpers.js';

// AFTER: Import from barrel
import { hashPassword } from '#features/auth';
```

**Checklist:**

- [ ] Replace deep relative imports with path aliases
- [ ] Replace internal module imports with barrel imports
- [ ] Verify all import paths resolve correctly
- [ ] Run `eslint .` to catch broken imports
- [ ] Run full test suite to verify nothing broke

## 6.5 Post-Migration Verification

Verify the migration is complete and correct.

```bash
# Run full test suite
pnpm test

# Run linter
pnpm lint

# Check for circular dependencies
npx madge --circular {{SRC_ROOT}}

# Compare import graph
npx madge --json {{SRC_ROOT}} > import-graph-after.json

# Build project (if applicable)
pnpm build
```

**Checklist:**

- [ ] All tests pass
- [ ] Linter reports no errors
- [ ] No circular dependencies detected
- [ ] Build succeeds (if applicable)
- [ ] Import graph matches designed dependency flow
- [ ] Update project README with new structure
- [ ] Create PR with clear description of changes
- [ ] Request team review before merging
