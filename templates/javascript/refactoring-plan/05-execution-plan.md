# Phase 5: Execution Plan

**Dependencies:** Phase 4 (Strategy)

**Can be implemented in parallel with:** Phase 6 (Testing Strategy), Phase 7 (Rollback Plan)

## 5.1 Pre-Refactoring Setup

Prepare the codebase and tooling before making any changes.

```bash
# Create a dedicated refactoring branch
git checkout -b refactor/{{REFACTOR_SCOPE}}

# Install tooling
npm install --save-dev eslint vitest @vitest/coverage-v8

# Verify baseline
npx eslint .
npx vitest run --coverage

# Save baseline metrics
npx eslint . --format json > metrics/eslint-before.json
npx vitest run --coverage --reporter=json > metrics/coverage-before.json
```

```javascript
// eslint.config.js — enable refactoring-relevant rules
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'no-throw-literal': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'no-prototype-builtins': 'error',
    },
  },
];
```

**Checklist:**

- [ ] Create dedicated branch
- [ ] Install / update tooling (eslint, vitest)
- [ ] Save baseline eslint report
- [ ] Save baseline coverage report
- [ ] Enable strict eslint rules for target patterns
- [ ] Verify all existing tests pass

## 5.2 Step 1 — Automated Syntax Fixes

Run automated fixes for low-risk, mechanical changes.

```bash
# Fix var → const/let
npx eslint --fix --rule '{"no-var": "error", "prefer-const": "error"}' {{TARGET_FILES}}

# Fix string concatenation → template literals
npx eslint --fix --rule '{"prefer-template": "error"}' {{TARGET_FILES}}

# Fix arrow function preferences
npx eslint --fix --rule '{"prefer-arrow-callback": "error"}' {{TARGET_FILES}}

# Fix spread operator usage
npx eslint --fix --rule '{"prefer-spread": "error", "prefer-rest-params": "error"}' {{TARGET_FILES}}

# Verify after automated fixes
npx vitest run
```

```javascript
// Review automated changes for correctness:

// var in switch needs manual review:
switch (action) {
  case 'create': {  // ADD block scope with braces
    const item = buildItem(data);
    return save(item);
  }
  case 'delete': {
    const id = extractId(data);
    return remove(id);
  }
}
```

**Checklist:**

- [ ] Run eslint `--fix` for `no-var` and `prefer-const`
- [ ] Run eslint `--fix` for `prefer-template`
- [ ] Run eslint `--fix` for `prefer-arrow-callback`
- [ ] Run eslint `--fix` for `prefer-spread` and `prefer-rest-params`
- [ ] Review diff for hoisting-dependent code
- [ ] Review switch/case blocks for scoping issues
- [ ] Run full test suite — all tests must pass
- [ ] Commit: `refactor: automated syntax modernisation`

## 5.3 Step 2 — ESM Migration

Convert CommonJS to ES Modules file by file.

```text
# Migration order (leaf modules first, entry points last):
#
# Round 1: Utility modules (no local dependencies)
#   {{SRC_ROOT}}/utils/format.js
#   {{SRC_ROOT}}/utils/validate.js
#   {{SRC_ROOT}}/config/index.js
#
# Round 2: Service modules (depend on utilities)
#   {{SRC_ROOT}}/services/user.service.js
#   {{SRC_ROOT}}/services/order.service.js
#
# Round 3: Route handlers (depend on services)
#   {{SRC_ROOT}}/routes/users.js
#   {{SRC_ROOT}}/routes/orders.js
#
# Round 4: Entry point
#   {{SRC_ROOT}}/index.js
#   package.json ("type": "module")
```

```javascript
// Per-file migration checklist:
// 1. Convert require() → import
// 2. Convert module.exports → export
// 3. Add .js extension to relative imports
// 4. Replace __dirname if used
// 5. Run tests
// 6. Commit

// If dual-package support is needed:
// package.json:
// {
//   "type": "module",
//   "exports": {
//     ".": {
//       "import": "./src/index.js",
//       "require": "./dist/index.cjs"
//     }
//   }
// }
```

**Checklist:**

- [ ] Order files by dependency depth (leaves first)
- [ ] Convert each file: `require` → `import`, `module.exports` → `export`
- [ ] Add `.js` extension to all relative import paths
- [ ] Replace `__dirname`/`__filename` with `import.meta.url`
- [ ] Convert dynamic `require()` to dynamic `import()`
- [ ] Rename CJS-only config files to `.cjs`
- [ ] Set `"type": "module"` in `package.json` (after all files converted)
- [ ] Run tests after each round — commit after each passing round
- [ ] Commit: `refactor: migrate {{REFACTOR_SCOPE}} to ESM`

## 5.4 Step 3 — Async/Await Conversion

Convert callbacks and promise chains to async/await.

```text
# Conversion order:
#
# 1. Leaf functions (no internal async calls)
#    - Database query wrappers
#    - File I/O helpers
#    - HTTP client wrappers
#
# 2. Mid-level functions (call leaf async functions)
#    - Service methods
#    - Business logic functions
#
# 3. Top-level handlers (call service functions)
#    - Route handlers
#    - CLI commands
#    - Event handlers
```

```javascript
// For each function:
// 1. Add async keyword
// 2. Replace .then() with await
// 3. Replace .catch() with try/catch
// 4. Update callers to await the result
// 5. Add JSDoc @returns {Promise<T>}

// BEFORE:
function getUser(id) {
  return db.query('SELECT * FROM users WHERE id = ?', [id])
    .then((rows) => rows[0]);
}

// AFTER:
/** @param {string} id  @returns {Promise<User | undefined>} */
async function getUser(id) {
  const rows = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
}
```

**Checklist:**

- [ ] Convert leaf async functions first
- [ ] Convert mid-level functions next
- [ ] Convert top-level handlers last
- [ ] Use `node:*/promises` APIs (e.g., `node:fs/promises`)
- [ ] Preserve parallel execution with `Promise.all()`
- [ ] Add `try/catch` at service boundaries
- [ ] Update all callers of converted functions
- [ ] Run tests after each function — commit in batches
- [ ] Commit: `refactor: convert {{REFACTOR_SCOPE}} to async/await`

## 5.5 Step 4 — Error Handling and JSDoc

Add consistent error handling and type annotations.

```javascript
// 1. Create error classes
// src/shared/errors/index.js
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} not found: ${id}`, 404);
  }
}

// 2. Replace throw strings and plain objects
// BEFORE:
throw 'User not found';
throw { code: 404, message: 'missing' };

// AFTER:
throw new NotFoundError('User', userId);

// 3. Add JSDoc to all public functions
/** @param {string} id  @returns {Promise<User>}  @throws {NotFoundError} */
export async function getUserById(id) {
  const user = await db.findUser(id);
  if (!user) throw new NotFoundError('User', id);
  return user;
}
```

**Checklist:**

- [ ] Create `AppError` base class and subclasses
- [ ] Replace all `throw 'string'` with `throw new Error()`
- [ ] Replace all empty `catch` blocks with proper handling
- [ ] Remove `console.log` / `console.debug` debugging statements
- [ ] Add JSDoc `@param`, `@returns`, `@throws` to exported functions
- [ ] Add `@typedef` for domain objects
- [ ] Run tests — commit
- [ ] Commit: `refactor: add error handling and JSDoc to {{REFACTOR_SCOPE}}`

## 5.6 Post-Refactoring Verification

Verify the refactoring is complete and correct.

```bash
# Run all checks
npx eslint .
npx vitest run --coverage

# Compare metrics to baseline
# eslint warnings: before → after
# test coverage: before → after
# var count: before → 0
# require count: before → 0

# Check for circular dependencies
npx madge --circular {{SRC_ROOT}}

# Build if applicable
npm run build
```

**Checklist:**

- [ ] All tests pass
- [ ] eslint reports zero errors
- [ ] Coverage meets or exceeds baseline
- [ ] No circular dependencies
- [ ] Build succeeds (if applicable)
- [ ] All `{{PLACEHOLDER}}` goals from Phase 2 are met
- [ ] Create PR with summary of changes and metrics comparison
