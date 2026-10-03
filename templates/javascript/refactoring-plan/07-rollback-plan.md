# Phase 7: Rollback Plan

**Dependencies:** Phase 4 (Strategy)

**Can be implemented in parallel with:** Phase 5 (Execution Plan), Phase 6 (Testing Strategy)

## 7.1 Git-Based Rollback Strategy

Use Git to create safe rollback points throughout the refactoring.

```bash
# BEFORE starting: tag the baseline
git tag pre-refactor/{{REFACTOR_SCOPE}}

# Create branch for the refactoring effort
git checkout -b refactor/{{REFACTOR_SCOPE}}

# Commit after EACH discrete refactoring step:
git add -A && git commit -m "refactor: convert var to const/let in {{TARGET_FILES}}"
git add -A && git commit -m "refactor: migrate {{TARGET_FILES}} to ESM"
git add -A && git commit -m "refactor: convert callbacks to async/await in {{TARGET_FILES}}"

# If something goes wrong — revert the last step:
git revert HEAD

# If multiple steps need reverting — revert to a known-good commit:
git log --oneline  # find the commit to revert to
git revert HEAD~3..HEAD  # revert last 3 commits (creates new commits)

# Nuclear option — abandon entire refactoring:
git checkout main
git branch -D refactor/{{REFACTOR_SCOPE}}
```

**Checklist:**

- [ ] Tag baseline: `git tag pre-refactor/{{REFACTOR_SCOPE}}`
- [ ] Create dedicated refactoring branch
- [ ] Commit after each discrete, testable change
- [ ] Write descriptive commit messages for easy identification
- [ ] Never squash commits during refactoring (preserve history)
- [ ] Push branch to remote regularly for backup

## 7.2 Package.json Module Toggle

Handle `"type": "module"` rollback for CJS/ESM migration.

```json
// BEFORE ESM migration — save this state:
{
  "name": "{{PROJECT_NAME}}",
  "type": "commonjs"
}

// AFTER ESM migration:
{
  "name": "{{PROJECT_NAME}}",
  "type": "module"
}

// ROLLBACK: Revert "type" field AND all import/export syntax:
// This is why ESM migration must be its own atomic commit.
```

```javascript
// If you need to support BOTH during transition:
// Option A: Use .mjs for new ESM files, keep .js as CJS
// src/old-module.js        → stays CJS (require/module.exports)
// src/new-module.mjs       → ESM (import/export)

// Option B: Conditional exports in package.json
// {
//   "exports": {
//     ".": {
//       "import": "./src/index.js",
//       "require": "./dist/index.cjs"
//     }
//   }
// }

// Rollback from dual-package:
// 1. Remove "exports" field
// 2. Restore "main" field
// 3. Remove "type": "module"
// 4. Revert import/export to require/module.exports
```

**Checklist:**

- [ ] Commit `package.json` `"type"` change as a separate commit
- [ ] Document the exact commit hash for the ESM migration
- [ ] Keep a `.cjs` copy of critical config files during transition
- [ ] Test rollback procedure: revert ESM commit, verify CJS still works
- [ ] If using dual-package: verify both `import` and `require` paths work

## 7.3 Dependency Rollback

Handle rollback for dependency upgrades or replacements.

```bash
# Save lockfile state before dependency changes
cp package-lock.json package-lock.json.backup
# (or: cp pnpm-lock.yaml pnpm-lock.yaml.backup)

# If a dependency upgrade breaks things:
git checkout HEAD~1 -- package.json package-lock.json
npm install

# If replacing a dependency (e.g., lodash → native):
# Keep the old dependency in devDependencies until migration is complete
npm install lodash --save-dev

# Only remove after all usages are replaced and tests pass:
npm uninstall lodash
```

```javascript
// Phased dependency replacement strategy:
// Phase 1: Add wrapper functions
import _ from 'lodash';

/** @param {Array} arr  @returns {Array} */
export function unique(arr) {
  return _.uniq(arr);  // still uses lodash
}

// Phase 2: Swap implementation
/** @param {Array} arr  @returns {Array} */
export function unique(arr) {
  return [...new Set(arr)];  // native implementation
}

// Phase 3: Remove lodash (after all wrappers are native)
// npm uninstall lodash

// Rollback: Revert Phase 2 commit, lodash is still in devDependencies
```

**Checklist:**

- [ ] Backup lockfile before dependency changes
- [ ] Keep replaced dependencies as devDependencies during migration
- [ ] Commit dependency changes separately from code changes
- [ ] Test rollback: restore old lockfile, verify `npm install` works
- [ ] Only remove old dependencies after full test pass

## 7.4 Dual Build Output (Libraries)

For libraries: maintain backward-compatible output during migration.

```javascript
// rollup.config.js — dual output during transition
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.mjs',
      format: 'es',
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
    },
  ],
});
```

```json
// package.json — conditional exports
{
  "name": "{{PROJECT_NAME}}",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs"
}
```

**Checklist:**

- [ ] Configure build tool for dual ESM/CJS output
- [ ] Set up `exports` field with conditional paths
- [ ] Keep `main` field for legacy consumers
- [ ] Test CJS import: `const pkg = require('{{PROJECT_NAME}}')`
- [ ] Test ESM import: `import pkg from '{{PROJECT_NAME}}'`
- [ ] Verify consumers are not broken by the build change

## 7.5 Feature Flags for Gradual Rollout

Use feature flags to control which refactored code paths are active.

```javascript
// src/config/feature-flags.js
export const FEATURE_FLAGS = Object.freeze({
  USE_NEW_AUTH: process.env.FF_NEW_AUTH === 'true',
  USE_ASYNC_HANDLERS: process.env.FF_ASYNC_HANDLERS === 'true',
  USE_ERROR_CLASSES: process.env.FF_ERROR_CLASSES === 'true',
});

// src/services/auth.service.js
import { FEATURE_FLAGS } from '#config/feature-flags.js';
import { authenticateV1 } from './auth.legacy.js';
import { authenticateV2 } from './auth.modern.js';

/**
 * @param {Credentials} credentials
 * @returns {Promise<AuthResult>}
 */
export async function authenticate(credentials) {
  if (FEATURE_FLAGS.USE_NEW_AUTH) {
    return authenticateV2(credentials);
  }
  return authenticateV1(credentials);
}

// Rollback: Set FF_NEW_AUTH=false in environment
// Full rollback: Remove feature flag code and legacy path after validation
```

**Checklist:**

- [ ] Identify high-risk refactorings that benefit from feature flags
- [ ] Create environment-based feature flag config
- [ ] Keep legacy code alongside new code during transition
- [ ] Test both code paths (flag on AND flag off)
- [ ] Remove feature flags and legacy code after validation period
- [ ] Document feature flag cleanup deadline

## 7.6 Rollback Runbook

Document the step-by-step rollback procedure.

```text
# Rollback Runbook for {{REFACTOR_SCOPE}}
#
# Severity 1 — Tests failing after refactoring step:
#   1. git revert HEAD
#   2. npm install (in case dependencies changed)
#   3. npx vitest run (verify tests pass)
#   4. Investigate what went wrong before retrying
#
# Severity 2 — Production issue after merge:
#   1. git revert <merge-commit>  (revert the PR merge)
#   2. npm install
#   3. npm run build
#   4. Deploy reverted code
#   5. Post-mortem: identify what was missed
#
# Severity 3 — Abandon entire refactoring:
#   1. git checkout main
#   2. git tag abandoned/refactor-{{REFACTOR_SCOPE}}-$(date +%Y%m%d)
#   3. git branch -D refactor/{{REFACTOR_SCOPE}}
#   4. Document lessons learned
```

**Checklist:**

- [ ] Document rollback steps for each severity level
- [ ] Test Severity 1 rollback before starting execution
- [ ] Ensure CI/CD can build from any commit on the branch
- [ ] Identify team member responsible for rollback decisions
- [ ] Set a maximum time-to-rollback target (e.g., 15 minutes)
- [ ] Schedule a retrospective after the refactoring is complete
