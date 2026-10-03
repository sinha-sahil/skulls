# Phase 3: Module Boundaries

**Dependencies:** Phase 1 (Assessment), Phase 2 (Directory Structure)

**Can be implemented in parallel with:** Phase 4, Phase 5

## Overview

Define clear responsibilities for each module, establish public API surfaces using Rust's visibility system, and plan re-export strategies. Good module boundaries reduce coupling and make the codebase navigable.

---

## 3.1 Module Responsibility Matrix

Document what each module owns. A module should have a single, clear purpose:

```text
| Module | Owns | Does NOT Own |
|--------|------|-------------|
| config | Loading env vars, config structs | Business logic |
| error | Error enum, error conversions | Handling/recovery logic |
| state | {{STATE_TYPE}} struct, constructor | Route definitions |
| middleware/auth | Token verification, claims extraction | Business rules |
| services/{{MODULE_NAME}} | {{MODULE_NAME}} CRUD, business logic | Auth, shared types |
| shared | Pagination, validation utilities | Domain-specific logic |
```

## 3.2 Visibility Levels

Rust provides granular visibility control. Use the most restrictive level that works:

```rust
// Private (default) - only accessible within the same module
fn internal_helper() { }

// pub(super) - accessible to the parent module
pub(super) fn module_internal() { }

// pub(crate) - accessible anywhere in the crate
pub(crate) fn crate_internal() { }

// pub - accessible to external consumers
pub fn public_api() { }
```

### Visibility Guidelines by Module Type

**Service modules (`services/{{MODULE_NAME}}/`):**

```rust
// mod.rs - only expose what other modules need
pub mod types;          // Types are public (used by handlers and other services)
mod handler;            // Handlers are private (only router needs them)
mod helpers;            // Helpers are private (only handlers call them)
mod storage;            // Storage is private (only helpers call them)

// Re-export the router function
pub use handler::{create_{{MODULE_NAME}}, get_{{MODULE_NAME}}, list_{{MODULE_NAME}}s};
```

**Domain modules:**

```rust
// domain/mod.rs
pub mod models;         // Models are public
pub mod services;       // Service traits are public
mod validators;         // Validators are internal

pub use models::{User, Order, Product};
pub use services::{UserService, OrderService};
```

**Infrastructure modules:**

```rust
// infra/mod.rs
pub mod db;             // Database access is public
pub(crate) mod cache;   // Cache is crate-internal
mod migrations;         // Migrations are internal

pub use db::DatabasePool;
```

## 3.3 Re-export Patterns

### Facade Pattern (recommended for service modules)

```rust
// services/{{MODULE_NAME}}/mod.rs
mod handler;
mod helpers;
mod storage;
pub mod types;

// Only expose what's needed by the router
pub fn routes() -> axum::Router<{{STATE_TYPE}}> {
    axum::Router::new()
        .route("/{{MODULE_NAME}}", axum::routing::get(handler::list))
        .route("/{{MODULE_NAME}}", axum::routing::post(handler::create))
        .route("/{{MODULE_NAME}}/:id", axum::routing::get(handler::get_by_id))
}
```

### Selective Re-exports (recommended for library crates)

```rust
// lib.rs
mod internal_utils;  // Not re-exported

pub mod config;
pub mod error;

// Cherry-pick what to expose
pub use config::AppConfig;
pub use error::{{ERROR_TYPE}};
```

### Prelude Pattern (for frequently used types)

```rust
// prelude.rs
pub use crate::error::{{ERROR_TYPE}};
pub use crate::state::{{STATE_TYPE}};
pub use crate::shared::pagination::Paginated;

// Consumer usage:
// use {{PROJECT_NAME}}::prelude::*;
```

## 3.4 Cross-Module Communication Rules

### Allowed Dependencies

```text
handlers → helpers → storage → types
              ↓
         other_service::helpers (via crate path)
```

### Forbidden Dependencies

```text
storage ✗→ handlers     (storage must not know about HTTP)
helpers ✗→ handlers     (helpers must not know about HTTP)
types   ✗→ storage      (types must not know about database)
```

### How to Share Logic Between Services

```rust
// GOOD: Import from another service's helpers
use crate::services::users::helpers as user_helpers;

pub async fn create_order_with_user_check(
    pool: &PgPool,
    user_id: &str,
    payload: &CreateOrderReq,
) -> Result<Order, {{ERROR_TYPE}}> {
    // Use another service's helper
    let _user = user_helpers::get_user_by_id(pool, user_id).await?;
    // Create order...
    storage::insert_order(pool, payload).await
}

// BAD: Duplicating the user query in order storage
```

## 3.5 Trait Boundaries Between Layers

For larger projects, use traits to define boundaries:

```rust
// domain/traits.rs
#[async_trait::async_trait]
pub trait {{MODULE_NAME}}Repository: Send + Sync {
    async fn find_by_id(&self, id: &str) -> Result<{{MODULE_NAME}}, {{ERROR_TYPE}}>;
    async fn create(&self, input: &Create{{MODULE_NAME}}Input) -> Result<{{MODULE_NAME}}, {{ERROR_TYPE}}>;
    async fn delete(&self, id: &str) -> Result<(), {{ERROR_TYPE}}>;
}

// infra/db/{{MODULE_NAME}}_repo.rs
pub struct Pg{{MODULE_NAME}}Repository {
    pool: PgPool,
}

#[async_trait::async_trait]
impl {{MODULE_NAME}}Repository for Pg{{MODULE_NAME}}Repository {
    async fn find_by_id(&self, id: &str) -> Result<{{MODULE_NAME}}, {{ERROR_TYPE}}> {
        sqlx::query_as("SELECT * FROM {{MODULE_NAME}}s WHERE id = $1")
            .bind(id)
            .fetch_one(&self.pool)
            .await
            .map_err(|e| {{ERROR_TYPE}}::Database(e))
    }
    // ...
}
```

---

## Checklist

- [ ] Documented responsibility for every module
- [ ] Each module has a single clear purpose
- [ ] Visibility levels chosen (pub, pub(crate), pub(super), private)
- [ ] Re-export strategy defined for each module
- [ ] Cross-module communication rules documented
- [ ] No circular dependencies in planned design
- [ ] Trait boundaries defined for layer separation (if applicable)
- [ ] Prelude module defined (if applicable)
- [ ] All public types have clear ownership (one canonical location)

## Verification

```bash
cargo check
cargo clippy
cargo test
```

After implementing boundaries, verify no unintended public API surface exists by checking `cargo doc --document-private-items` output.
