# Phase 6: Migration Plan

**Dependencies:** Phase 2 (Directory Structure), Phase 3 (Module Boundaries), Phase 4 (Naming Conventions), Phase 5 (Dependency Flow)

**Can be implemented in parallel with:** None (this is the execution phase)

## Overview

Step-by-step plan to reorganise existing code from the current structure (assessed in Phase 1) to the target structure (designed in Phases 2-5). Each step should leave the project in a compilable state. Use `git mv` to preserve file history.

---

## 6.1 Pre-Migration Preparation

### Create a Dedicated Branch

```bash
git checkout -b refactor/file-organisation
```

### Verify Current State Compiles

```bash
cargo check && cargo test && cargo clippy
```

If the project does not compile cleanly, fix issues before migrating.

### Record Current Test Count

```bash
cargo test 2>&1 | tail -1
# Example output: test result: ok. 42 passed; 0 failed; 0 ignored
```

Save this number. After migration, the same number of tests must pass.

## 6.2 Migration Order

Migrate one module at a time. Follow this order (foundation first, dependents last):

```text
Step 1: Foundation modules (config, error, state)
Step 2: Shared utilities (shared/*)
Step 3: Service modules (one at a time, least dependencies first)
Step 4: Router aggregation
Step 5: Entry point (main.rs, lib.rs)
Step 6: Tests
```

## 6.3 Step-by-Step: Move a Module

For each module being moved, follow this exact sequence:

### Step A: Create the Target Directory

```bash
mkdir -p {{SRC_ROOT}}services/{{MODULE_NAME}}
```

### Step B: Move Files with Git

```bash
# Move source files (preserves git history)
git mv {{SRC_ROOT}}old_path/{{MODULE_NAME}}.rs {{SRC_ROOT}}services/{{MODULE_NAME}}/helpers.rs
git mv {{SRC_ROOT}}old_path/{{MODULE_NAME}}_types.rs {{SRC_ROOT}}services/{{MODULE_NAME}}/types.rs
git mv {{SRC_ROOT}}old_path/{{MODULE_NAME}}_storage.rs {{SRC_ROOT}}services/{{MODULE_NAME}}/storage.rs
```

### Step C: Create the Module Entry Point

```rust
// {{SRC_ROOT}}services/{{MODULE_NAME}}/mod.rs
mod handler;
mod helpers;
mod storage;
pub mod types;

use axum::{routing::{get, post, patch, delete}, Router};
use crate::state::{{STATE_TYPE}};

pub fn routes() -> Router<{{STATE_TYPE}}> {
    Router::new()
        .route("/{{MODULE_NAME}}", get(handler::list))
        .route("/{{MODULE_NAME}}", post(handler::create))
        .route("/{{MODULE_NAME}}/:id", get(handler::get_by_id))
        .route("/{{MODULE_NAME}}/:id", patch(handler::update))
        .route("/{{MODULE_NAME}}/:id", delete(handler::delete))
}
```

### Step D: Update Module Declarations

```rust
// {{SRC_ROOT}}services/mod.rs - Add the new module
pub mod {{MODULE_NAME}};
```

```rust
// {{SRC_ROOT}}lib.rs - Ensure services module is declared
pub mod services;
```

### Step E: Fix Imports in the Moved File

Update all `use` statements to reflect the new module path:

```rust
// BEFORE (old path):
use crate::old_path::types::MyType;
use crate::old_path::storage;

// AFTER (new path):
use super::types::MyType;
use super::storage;
```

### Step F: Fix Imports in Other Files

Find and update all files that imported from the old path:

```bash
# Find all files importing from the old location
rg "use crate::old_path::{{MODULE_NAME}}" {{SRC_ROOT}} --type rust

# Update imports to new path
# OLD: use crate::old_path::{{MODULE_NAME}}::SomeType;
# NEW: use crate::services::{{MODULE_NAME}}::types::SomeType;
```

### Step G: Verify Compilation

```bash
cargo check
```

**If compilation fails:** Fix all errors before proceeding to the next module. Common issues:
- Missing `mod` declarations
- Incorrect `use` paths
- Visibility changes needed (`pub` vs `pub(crate)`)

### Step H: Run Tests

```bash
cargo test
```

Verify the same number of tests pass as before.

### Step I: Commit

```bash
git add -A
git commit -m "refactor: move {{MODULE_NAME}} module to services/{{MODULE_NAME}}/"
```

**Repeat Steps A-I for each module.**

## 6.4 Updating Re-exports

After all modules are moved, update `lib.rs` re-exports:

```rust
// {{SRC_ROOT}}lib.rs
pub mod config;
pub mod error;
pub mod middleware;
pub mod services;
pub mod shared;
pub mod state;

// Re-export commonly used types for convenience
pub use error::{{ERROR_TYPE}};
pub use state::{{STATE_TYPE}};
```

## 6.5 Cleanup

### Remove Empty Directories

```bash
find {{SRC_ROOT}} -type d -empty -delete
```

### Remove Old Module Declarations

Check for orphaned `mod` declarations that reference files that no longer exist:

```bash
cargo check  # Will catch any missing modules
```

### Update Test Imports

```bash
# Find test files with old import paths
rg "use crate::old_path" tests/ --type rust
```

Update all test files to use the new paths.

## 6.6 Post-Migration Verification

Run the full verification suite:

```bash
# Compilation
cargo check

# Formatting
cargo fmt --check

# Linting
cargo clippy

# Tests (must match pre-migration count)
cargo test

# Documentation (check for broken links)
cargo doc --no-deps
```

### Final Comparison

```bash
# Verify the new structure matches the design
find {{SRC_ROOT}} -name "*.rs" | sort

# Verify no old paths remain in imports
rg "use crate::old_path" {{SRC_ROOT}} --type rust
```

## 6.7 Merge Strategy

```bash
# Ensure all checks pass
cargo check && cargo test && cargo clippy && cargo fmt --check

# Merge to main
git checkout main
git merge refactor/file-organisation

# If conflicts arise, prefer the refactored version
# but verify compilation after resolution
```

---

## Checklist

- [ ] Created dedicated branch for migration
- [ ] Pre-migration: all tests pass, clippy clean
- [ ] Recorded pre-migration test count
- [ ] Foundation modules migrated (config, error, state)
- [ ] Shared utilities migrated
- [ ] Service modules migrated (one at a time)
- [ ] Router aggregation updated
- [ ] Entry point (main.rs, lib.rs) updated
- [ ] All imports updated to new paths
- [ ] No old import paths remain in codebase
- [ ] Empty directories removed
- [ ] Post-migration: `cargo check` passes
- [ ] Post-migration: `cargo fmt --check` passes
- [ ] Post-migration: `cargo clippy` passes
- [ ] Post-migration: same number of tests pass
- [ ] Post-migration: `cargo doc` builds without warnings
- [ ] Committed with clear commit messages per module move
- [ ] Branch merged to main

## Verification

```bash
cargo check
cargo clippy
cargo test
cargo fmt --check
```
