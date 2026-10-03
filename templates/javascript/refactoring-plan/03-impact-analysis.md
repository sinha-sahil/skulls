# Phase 3: Impact Analysis

**Dependencies:** Phase 1 (Assessment)

**Can be implemented in parallel with:** Phase 2 (Goals)

## 3.1 Dependency Mapping

Map how modules depend on each other within `{{TARGET_FILES}}`.

```javascript
// Generate the import graph for the refactoring scope:
// Use madge, dependency-cruiser, or manual tracing

// High-fanout modules (imported by many files) are RISKY to change:
// src/utils/helpers.js → imported by 47 files
// src/config/index.js  → imported by 32 files
// src/db/connection.js  → imported by 18 files

// High-fanin modules (import many files) are COMPLEX:
// src/app.js            → imports 23 modules
// src/routes/index.js   → imports 15 modules
```

```bash
# Generate dependency graph
npx madge --json {{SRC_ROOT}} > deps.json

# Find circular dependencies
npx madge --circular {{SRC_ROOT}}

# Visualise (optional)
npx madge --image deps.svg {{SRC_ROOT}}
```

**Checklist:**

- [ ] Generate full dependency graph for `{{TARGET_FILES}}`
- [ ] Identify top 10 most-imported modules (highest risk)
- [ ] Identify top 10 modules with most imports (highest complexity)
- [ ] List all circular dependencies
- [ ] Map which external packages are used where
- [ ] Document the critical path (entry point → core logic → data layer)

## 3.2 CJS/ESM Boundary Analysis

Identify where CommonJS and ES Module boundaries exist.

```javascript
// CJS and ESM cannot freely interoperate:

// ESM CAN import CJS default exports:
import pkg from 'cjs-package';           // works
import { named } from 'cjs-package';     // may NOT work

// CJS CANNOT use static import:
// const mod = require('./esm-module.js');  // ERROR in "type": "module"

// Dynamic import() works in both:
const mod = await import('./any-module.js');  // works everywhere

// Identify boundary files — files that bridge CJS and ESM:
// These need special handling during migration
```

**Checklist:**

- [ ] Map which files are currently CJS vs ESM
- [ ] Identify CJS-only dependencies (no ESM build available)
- [ ] List files that use `require()` on local modules
- [ ] List files that use `module.exports` or `exports`
- [ ] Identify dynamic `require()` patterns (conditional requires)
- [ ] Check if any files rely on CJS `__dirname` or `__filename`
- [ ] Assess if dual-package output is needed for library consumers

## 3.3 Shared Utility Assessment

Evaluate shared code that multiple modules depend on.

```javascript
// Shared utilities are the HIGHEST RISK refactoring targets
// because changes ripple through the entire codebase.

// Identify shared modules and their consumers:
// src/utils/format.js
//   ├── used by: src/features/orders/orders.service.js
//   ├── used by: src/features/billing/billing.service.js
//   ├── used by: src/features/reports/reports.service.js
//   └── used by: src/api/middleware/response.js

// Categorise each shared utility:
// - Pure function (no side effects) → SAFE to refactor
// - Stateful (caches, singletons)   → MODERATE risk
// - Side-effectful (I/O, logging)   → HIGH risk — test thoroughly
```

**Checklist:**

- [ ] List all shared utility files and their consumer count
- [ ] Classify each utility: pure / stateful / side-effectful
- [ ] Identify utilities with inconsistent APIs (different return types)
- [ ] Flag utilities that mix concerns (formatting + validation in one file)
- [ ] Identify utility functions that duplicate native JS methods
- [ ] Rank shared utilities by refactoring risk (consumers × complexity)

## 3.4 Test Coverage Gap Analysis

Identify code without test coverage before refactoring.

```javascript
// CRITICAL: Never refactor code without tests.
// Tests are the safety net that ensures refactoring preserves behaviour.

// Generate coverage report:
// npx vitest run --coverage

// Coverage targets before refactoring:
// - Files being refactored: minimum 80% line coverage
// - Shared utilities: minimum 90% line coverage
// - Critical paths (auth, payments): minimum 95% line coverage

// Files with NO tests — these MUST get tests before refactoring:
// src/services/payment.js    → 0% coverage, HIGH risk
// src/utils/crypto.js        → 0% coverage, HIGH risk
// src/middleware/auth.js      → 0% coverage, MEDIUM risk
```

**Checklist:**

- [ ] Run `vitest run --coverage` and record current coverage
- [ ] List files in `{{REFACTOR_SCOPE}}` with zero test coverage
- [ ] List files with coverage below 50%
- [ ] Identify critical paths that need tests before any changes
- [ ] Estimate effort to write missing tests (hours per file)
- [ ] Prioritise test writing: shared utilities first, then features

## 3.5 External Dependency Impact

Assess how third-party packages affect refactoring.

```javascript
// Some packages only work with CJS:
// const chalk = require('chalk');        // chalk v4 is CJS
// import chalk from 'chalk';             // chalk v5 is ESM-only

// Some packages have callback-only APIs:
// import { glob } from 'glob';           // glob v10+ supports promises
// const glob = require('glob');           // glob v8 was callback-based

// Check each dependency:
// 1. Does it support ESM?
// 2. Does it have a modern async API?
// 3. Is there a native replacement?
//    - lodash → native Array/Object methods
//    - moment → Intl.DateTimeFormat or Temporal
//    - request → fetch (Node.js 18+)
//    - uuid → crypto.randomUUID()
```

**Checklist:**

- [ ] List all dependencies used in `{{REFACTOR_SCOPE}}`
- [ ] Check ESM support for each dependency
- [ ] Identify dependencies with native JS replacements
- [ ] Identify deprecated dependencies needing replacement
- [ ] Check for dependencies pinned to old versions (blocking ESM)
- [ ] Estimate effort to replace or upgrade each problematic dependency

## 3.6 Risk Summary

Compile a risk matrix for the refactoring effort.

```text
# Risk Matrix:
#
# Component              | Impact | Likelihood | Mitigation
# ────────────────────────────────────────────────────────────────
# Shared utility changes | HIGH   | MEDIUM     | Add tests first, refactor one function at a time
# CJS → ESM migration   | HIGH   | HIGH       | Incremental file-by-file, test after each
# Callback → async/await | MEDIUM | LOW        | Mechanical transform, well-tested pattern
# var → const/let        | LOW    | LOW        | Automated via eslint --fix
# String → template lit  | LOW    | LOW        | Automated via codemod
```

**Checklist:**

- [ ] Rate each refactoring category: impact (HIGH/MEDIUM/LOW)
- [ ] Rate each category: likelihood of breakage (HIGH/MEDIUM/LOW)
- [ ] Define mitigation strategy for HIGH risk items
- [ ] Identify refactoring that can be automated (low risk)
- [ ] Identify refactoring that needs manual review (high risk)
- [ ] Get team sign-off on the risk assessment
