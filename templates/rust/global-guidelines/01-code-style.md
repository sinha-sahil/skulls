# Phase 1: Code Style

**Dependencies:** None

**Can be implemented in parallel with:** All other phases

## Overview

Establish formatting, naming, import ordering, and module structure conventions for `{{PROJECT_NAME}}`. These rules should be enforceable by tooling wherever possible. Consistency is the primary goal — specific choices matter less than uniform application.

---

## 1.1 Rust Formatting Configuration

Create a `rustfmt.toml` at the project root:

```toml
# rustfmt.toml
edition = "2021"
max_width = {{MAX_LINE_LENGTH}}
tab_spaces = 4
use_small_heuristics = "Default"
imports_granularity = "Module"
group_imports = "StdExternalCrate"
reorder_imports = true
reorder_modules = true
newline_style = "Unix"
format_code_in_doc_comments = true
```

Enforce formatting in CI:

```bash
cargo fmt --all --check
```

**Checklist:**

- [ ] `rustfmt.toml` committed to repository root
- [ ] CI pipeline runs `cargo fmt --all --check`
- [ ] All existing code formatted: `cargo fmt --all`
- [ ] Editor configured to format on save

---

## 1.2 Naming Conventions

| Item | Convention | Example | Anti-pattern |
|------|-----------|---------|--------------|
| Structs | `PascalCase` | `UserProfile` | `user_profile`, `userProfile` |
| Enums | `PascalCase` | `OrderStatus` | `order_status` |
| Enum variants | `PascalCase` | `OrderStatus::Pending` | `OrderStatus::PENDING` |
| Traits | `PascalCase` (adjective/noun) | `Serializable`, `Repository` | `IRepository` (no `I` prefix) |
| Functions | `snake_case` | `get_user_by_id` | `getUserById` |
| Methods | `snake_case` | `self.process_order()` | `self.processOrder()` |
| Local variables | `snake_case` | `user_count` | `userCount` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES` | `maxRetries` |
| Statics | `SCREAMING_SNAKE_CASE` | `GLOBAL_CONFIG` | `globalConfig` |
| Modules / files | `snake_case` | `user_service.rs` | `UserService.rs` |
| Type parameters | Single uppercase or short `PascalCase` | `T`, `E`, `Item` | `type_param` |
| Lifetimes | Short lowercase with `'` | `'a`, `'ctx`, `'conn` | `'lifetime` |
| Crate name (Cargo.toml) | `kebab-case` | `my-api-server` | `my_api_server` |
| Feature flags | `kebab-case` | `full-logging` | `full_logging` |

### Specific Naming Patterns

```rust
// Constructor: use new() or with_*()
impl {{ENTITY_NAME}} {
    pub fn new(id: String) -> Self { /* ... */ }
    pub fn with_status(id: String, status: Status) -> Self { /* ... */ }
}

// Conversion: use from_*() or into_*()
impl {{ENTITY_NAME}} {
    pub fn from_db(row: DB{{ENTITY_NAME}}) -> Self { /* ... */ }
    pub fn into_response(self) -> {{ENTITY_NAME}}Response { /* ... */ }
}

// Boolean methods: use is_*, has_*, can_*
impl {{ENTITY_NAME}} {
    pub fn is_active(&self) -> bool { /* ... */ }
    pub fn has_permission(&self, perm: &str) -> bool { /* ... */ }
    pub fn can_edit(&self) -> bool { /* ... */ }
}

// Fallible operations: use try_*()
impl {{ENTITY_NAME}} {
    pub fn try_from_str(s: &str) -> Result<Self, {{ERROR_TYPE}}> { /* ... */ }
}

// Async operations: same naming, rely on async fn signature
pub async fn get_{{ENTITY_NAME_LOWER}}_by_id(pool: &PgPool, id: &str) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
    // ...
}
```

**Checklist:**

- [ ] Naming conventions documented and shared with team
- [ ] Existing code audited for naming violations
- [ ] Clippy lint `#![warn(clippy::all)]` enabled

---

## 1.3 Import Ordering

Imports must follow this grouping order, separated by blank lines:

```rust
// 1. Standard library
use std::collections::HashMap;
use std::sync::Arc;

// 2. External crates (from Cargo.toml dependencies)
use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use {{LOG_CRATE}}::{info, warn, error};

// 3. Crate-level imports (use crate::)
use crate::error::{{ERROR_TYPE}};
use crate::{{STATE_TYPE}};

// 4. Parent / sibling module imports (use super::)
use super::types::{DB{{ENTITY_NAME}}, {{ENTITY_NAME}}};
use super::storage;
```

This is enforced by `rustfmt.toml` with `group_imports = "StdExternalCrate"`.

**Checklist:**

- [ ] `group_imports = "StdExternalCrate"` set in `rustfmt.toml`
- [ ] No wildcard imports (`use module::*`) except in test modules and preludes
- [ ] No unused imports (enforced by `cargo check`)

---

## 1.4 Module Structure Conventions

### Single-File Module

Use when the module is under 300 lines:

```text
{{SRC_DIR}}/
├── main.rs
├── error.rs
├── config.rs
└── {{MODULE_NAME}}.rs        # < 300 lines
```

### Directory Module

Use when the module exceeds 300 lines or has distinct sub-responsibilities:

```text
{{SRC_DIR}}/
├── main.rs
├── error.rs
├── config.rs
└── {{MODULE_NAME}}/
    ├── mod.rs              # Module declarations and re-exports
    ├── types.rs            # Type definitions
    ├── storage.rs          # Database queries
    ├── helpers.rs          # Business logic
    └── handler.rs          # HTTP handlers
```

```rust
// {{MODULE_NAME}}/mod.rs
mod handler;
mod helpers;
mod storage;
pub mod types;

// Re-export handler functions for the router
pub use handler::{
    create_{{ENTITY_NAME_LOWER}},
    get_{{ENTITY_NAME_LOWER}},
    update_{{ENTITY_NAME_LOWER}},
    delete_{{ENTITY_NAME_LOWER}},
};
```

**Checklist:**

- [ ] No file exceeds 300 lines (split into directory module if so)
- [ ] `mod.rs` only contains declarations and re-exports
- [ ] Public API is explicit (no `pub use module::*`)

---

## 1.5 Attribute Ordering

Apply attributes in this order:

```rust
// 1. Outer doc comments
/// Description of the struct.

// 2. Derive macros (alphabetical within)
#[derive(Clone, Debug, Deserialize, Serialize)]

// 3. Serde attributes
#[serde(rename_all = "camelCase")]

// 4. SQLx attributes
#[sqlx(rename_all = "snake_case")]

// 5. Allow/deny/warn attributes
#[allow(dead_code)]

// 6. cfg attributes
#[cfg(test)]
#[cfg(feature = "full-logging")]

// Combined example:
/// A user profile returned from the API.
#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[allow(dead_code)]
pub struct UserProfile {
    pub id: String,
    pub display_name: String,
}
```

---

## 1.6 Clippy Configuration

Add to `Cargo.toml` or `clippy.toml`:

```rust
// At the top of lib.rs or main.rs
#![warn(clippy::all)]
#![warn(clippy::pedantic)]
#![allow(clippy::module_name_repetitions)]
#![allow(clippy::must_use_candidate)]
```

Or in `clippy.toml`:

```toml
too-many-arguments-threshold = 7
type-complexity-threshold = 250
```

**Checklist:**

- [ ] Clippy lints configured
- [ ] CI runs `cargo clippy -- -D warnings`
- [ ] Zero clippy warnings in codebase

---

## Checklist

- [ ] `rustfmt.toml` created and committed
- [ ] Naming conventions documented
- [ ] Import ordering enforced by tooling
- [ ] Module structure guidelines established
- [ ] Attribute ordering convention defined
- [ ] Clippy configured with appropriate lint levels
- [ ] CI enforces all formatting and linting rules
- [ ] Existing codebase conforms to all style rules

## Verification

```bash
cargo fmt --all --check
cargo clippy -- -D warnings
cargo check
```
