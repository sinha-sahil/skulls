# Phase 5: Execution Plan

**Dependencies:** Phase 3 (Impact Analysis), Phase 4 (Strategy), Phase 6 (Testing Strategy)

**Can be implemented in parallel with:** None (this is the execution phase)

## Overview

Ordered, incremental refactoring steps for `{{PROJECT_NAME}}`. Each step MUST leave the code in a compilable state. Follow the git commit strategy to maintain a clean, revertible history.

---

## 5.1 Git Branch Strategy

```bash
# Create a dedicated refactoring branch
git checkout -b {{BRANCH_NAME}}

# Commit strategy: one logical change per commit
# Prefix commits with refactor: for easy identification
git commit -m "refactor: replace unwrap() with ? in {{MODULE_NAME}} handler"
git commit -m "refactor: introduce {{ERROR_TYPE}} enum"
git commit -m "refactor: split {{MODULE_NAME}}.rs into submodules"
```

**Rules:**

- One logical change per commit (not one file per commit)
- Run `cargo check` before every commit
- Run `cargo test` before every push
- Never combine refactoring with feature work in the same commit

---

## 5.2 Execution Step Template

Use this template to document each step:

```markdown
### Step N: [Description]

**Files Modified:** `file1.rs`, `file2.rs`
**Strategy:** [Reference to Phase 4 strategy]
**Risk:** Low / Medium / High
**Estimated Time:** Xm

**Changes:**
1. [Specific change 1]
2. [Specific change 2]

**Verification:**
- [ ] `cargo check` passes
- [ ] `cargo test` passes
- [ ] `cargo clippy` passes

**Commit:** `refactor: [description]`
```

---

## 5.3 Recommended Execution Order

### Step 1: Create or Update Error Type (Leaf Module)

**Files Modified:** `{{SRC_DIR}}/error.rs`
**Strategy:** Strategy B (Consolidate Errors)
**Risk:** Low

```rust
// 1. Add new variants to {{ERROR_TYPE}} if they don't exist
// 2. Implement From<T> for common error types
// 3. Ensure IntoResponse is implemented for Axum

// Add to {{SRC_DIR}}/error.rs:
use thiserror::Error;

#[derive(Debug, Error)]
pub enum {{ERROR_TYPE}} {
    #[error("Database error: {message}")]
    Database { message: String },

    #[error("Not found: {message}")]
    NotFound { message: String },

    #[error("Bad request: {message}")]
    BadRequest { message: String },

    #[error("Internal error: {message}")]
    Internal { message: String },
}
```

**Verification:**

```bash
cargo check && cargo test
```

**Commit:** `refactor: add error variants to {{ERROR_TYPE}}`

---

### Step 2: Update Type Definitions (Leaf Module)

**Files Modified:** `{{SRC_DIR}}/{{MODULE_NAME}}/types.rs`
**Strategy:** Strategy G (Newtype Wrapper), Strategy H (String to Enum)
**Risk:** Medium — changes propagate to all users of these types

```rust
// 1. Introduce newtype wrappers for IDs
// 2. Replace String enums with proper enums
// 3. Update derive macros
```

**Verification:**

```bash
cargo check  # Expect errors in other files — fix in subsequent steps
```

**Commit:** `refactor: introduce newtypes and enums in {{MODULE_NAME}} types`

---

### Step 3: Update Storage Layer

**Files Modified:** `{{SRC_DIR}}/{{MODULE_NAME}}/storage.rs`
**Strategy:** Strategy A (Error Propagation)
**Risk:** Medium — SQL queries must remain correct

```rust
// 1. Replace unwrap() with ? and map_err()
// 2. Update function signatures to use new types
// 3. Ensure all functions return Result<T, {{ERROR_TYPE}}>
```

**Verification:**

```bash
cargo check && cargo test
```

**Commit:** `refactor: migrate {{MODULE_NAME}} storage to Result with {{ERROR_TYPE}}`

---

### Step 4: Update Helper Functions

**Files Modified:** `{{SRC_DIR}}/{{MODULE_NAME}}/helpers.rs`
**Strategy:** Strategy A (Error Propagation), Strategy C (Error Context)
**Risk:** High — business logic, test thoroughly

```rust
// 1. Update function signatures
// 2. Replace unwrap() with contextual error propagation
// 3. Update calls to storage layer
```

**Verification:**

```bash
cargo check && cargo test
```

**Commit:** `refactor: migrate {{MODULE_NAME}} helpers to proper error handling`

---

### Step 5: Update Handler Functions

**Files Modified:** `{{SRC_DIR}}/{{MODULE_NAME}}/handler.rs`
**Strategy:** Strategy A (Error Propagation)
**Risk:** Medium — affects HTTP responses

```rust
// 1. Update handler return types to Result<Json<T>, {{ERROR_TYPE}}>
// 2. Replace unwrap() with ? operator
// 3. Verify error responses match expected HTTP status codes
```

**Verification:**

```bash
cargo check && cargo test
# Also verify HTTP error responses manually or with integration tests
```

**Commit:** `refactor: migrate {{MODULE_NAME}} handlers to {{ERROR_TYPE}}`

---

### Step 6: Split Large Modules (if applicable)

**Files Modified:** Large files identified in Phase 1
**Strategy:** Strategy D (Module Splitting)
**Risk:** Medium — path changes affect imports

```bash
# 1. Create module directory
mkdir -p {{SRC_DIR}}/{{MODULE_NAME}}

# 2. Move/split file contents
# 3. Create mod.rs with re-exports
# 4. Update imports in all consuming files
```

**Verification:**

```bash
cargo check && cargo test
rg "use.*{{MODULE_NAME}}" {{SRC_DIR}} --type rust  # Verify all imports updated
```

**Commit:** `refactor: split {{MODULE_NAME}} into submodules`

---

### Step 7: Cleanup and Final Pass

**Files Modified:** All affected files
**Risk:** Low

```bash
# 1. Run final clippy pass and fix all warnings
cargo clippy --fix --allow-dirty

# 2. Format all code
cargo fmt --all

# 3. Remove any dead code identified in Phase 1
# 4. Update module-level documentation
```

**Verification:**

```bash
cargo check
cargo clippy -- -D warnings
cargo test
cargo fmt --check
```

**Commit:** `refactor: cleanup and resolve remaining clippy warnings`

---

## 5.4 Progress Tracking

| Step | Description | Status | Verified |
|------|-------------|--------|----------|
| 1 | Create/update error type | Not Started | |
| 2 | Update type definitions | Not Started | |
| 3 | Update storage layer | Not Started | |
| 4 | Update helper functions | Not Started | |
| 5 | Update handler functions | Not Started | |
| 6 | Split large modules | Not Started | |
| 7 | Cleanup and final pass | Not Started | |

---

## Checklist

- [ ] Each step has a clear scope and affected files
- [ ] Steps are ordered so each compiles independently
- [ ] Git commit messages follow the convention
- [ ] `cargo check` runs between every step
- [ ] `cargo test` runs between every step
- [ ] No step combines refactoring with feature changes
- [ ] Progress tracking table is maintained
- [ ] All steps completed and verified

## Verification

```bash
# Final verification after all steps complete
cargo check
cargo clippy -- -D warnings
cargo test
cargo fmt --check
git log --oneline {{BRANCH_NAME}} --not main  # Review commit history
```

All execution steps must pass before proceeding to merge. See Phase 7 (Rollback Plan) if issues arise.
