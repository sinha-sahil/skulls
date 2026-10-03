# Phase 5: Dependency Flow

**Dependencies:** Phase 2 (Directory Structure), Phase 3 (Module Boundaries)

**Can be implemented in parallel with:** Phase 4

## Overview

Plan the module dependency graph to ensure clean, acyclic relationships between modules. Define which modules may depend on which, establish patterns for dependency injection, and document the intended flow of data and control through the system.

---

## 5.1 Dependency Graph

Define the intended dependency flow. Dependencies should form a **directed acyclic graph (DAG)** - no cycles allowed.

### Layered Architecture

```text
┌─────────────────────────────┐
│         main.rs             │  Entry point
├─────────────────────────────┤
│         routes              │  HTTP routing layer
├─────────────────────────────┤
│      handlers (HTTP)        │  Request/response handling
├─────────────────────────────┤
│      helpers (business)     │  Business logic
├─────────────────────────────┤
│      storage (data)         │  Database/storage access
├─────────────────────────────┤
│      types (domain)         │  Type definitions
├─────────────────────────────┤
│  config │ error │ state     │  Foundation modules
└─────────────────────────────┘

Arrow direction: top depends on bottom
Each layer may only depend on layers below it
```

### Module Dependency Diagram

```text
main.rs
  │
  ├──→ config
  ├──→ state ──→ config
  └──→ routes
         │
         └──→ services/{{MODULE_NAME}}/mod.rs
                │
                ├──→ handler ──→ helpers ──→ storage ──→ types
                │                   │
                │                   └──→ other_service::helpers
                │
                ├──→ middleware ──→ state, error
                └──→ types (pub)

Shared dependencies (any module may use):
  - error ({{ERROR_MODULE}})
  - config (read-only)
  - state (via axum extractors)
  - shared/* (utility modules)
```

## 5.2 Dependency Rules

### Allowed Dependencies

```rust
// handlers CAN import:
use super::helpers;              // ✓ Own helpers
use super::types;                // ✓ Own types
use crate::error::{{ERROR_TYPE}};  // ✓ Shared error type
use crate::state::{{STATE_TYPE}};  // ✓ App state (via extractor)

// helpers CAN import:
use super::storage;              // ✓ Own storage
use super::types;                // ✓ Own types
use crate::services::other::helpers as other_helpers;  // ✓ Other service helpers
use crate::error::{{ERROR_TYPE}};  // ✓ Shared error type
use crate::shared::pagination;   // ✓ Shared utilities

// storage CAN import:
use super::types;                // ✓ Own types
use crate::error::{{ERROR_TYPE}};  // ✓ Shared error type
use sqlx::PgPool;                // ✓ Database driver
```

### Forbidden Dependencies

```rust
// storage MUST NOT import:
use super::handler;              // ✗ Storage must not know about HTTP
use super::helpers;              // ✗ Storage must not call business logic
use axum::*;                     // ✗ Storage must not depend on web framework

// types MUST NOT import:
use super::storage;              // ✗ Types must not know about storage
use super::helpers;              // ✗ Types must not know about business logic
use sqlx::PgPool;                // ✗ Types should not depend on DB driver
                                 //   (except DB types with FromRow)

// helpers MUST NOT import:
use super::handler;              // ✗ Helpers must not know about HTTP
use axum::Json;                  // ✗ Helpers must not depend on web framework
```

## 5.3 Avoiding Circular Dependencies

### Problem: Two Modules Need Each Other

```rust
// CIRCULAR - will not compile
// services/orders/helpers.rs
use crate::services::users::helpers::get_user;

// services/users/helpers.rs
use crate::services::orders::helpers::get_user_orders;  // Circular!
```

### Solution 1: Extract to a Third Module

```rust
// services/shared/user_orders.rs
use crate::services::orders::storage as order_storage;
use crate::services::users::storage as user_storage;

pub async fn get_user_with_orders(pool: &PgPool, user_id: &str) -> Result<UserWithOrders, {{ERROR_TYPE}}> {
    let user = user_storage::get_user_by_id(pool, user_id).await?;
    let orders = order_storage::get_orders_by_user(pool, user_id).await?;
    Ok(UserWithOrders { user, orders })
}
```

### Solution 2: Dependency Inversion (Trait)

```rust
// Define trait in the module that NEEDS the dependency
#[async_trait::async_trait]
pub trait UserLookup: Send + Sync {
    async fn find_user(&self, id: &str) -> Result<User, {{ERROR_TYPE}}>;
}

// Implement in the module that PROVIDES the dependency
impl UserLookup for UserService {
    async fn find_user(&self, id: &str) -> Result<User, {{ERROR_TYPE}}> {
        self.storage.get_user_by_id(id).await
    }
}

// Inject via function parameter
pub async fn create_order<U: UserLookup>(
    user_lookup: &U,
    pool: &PgPool,
    payload: &CreateOrderReq,
) -> Result<Order, {{ERROR_TYPE}}> {
    let _user = user_lookup.find_user(&payload.user_id).await?;
    // ...
}
```

### Solution 3: Depend on Storage, Not Helpers

```rust
// Instead of calling another service's helpers (which may create cycles),
// call their storage directly for simple data retrieval:
use crate::services::users::storage as user_storage;

pub async fn create_order(pool: &PgPool, user_id: &str) -> Result<Order, {{ERROR_TYPE}}> {
    // Direct storage call - no cycle risk
    let _user = user_storage::get_user_by_id(pool, user_id).await?;
    // ...
}
```

## 5.4 Dependency Injection Patterns

### Via Application State

```rust
pub struct {{STATE_TYPE}} {
    pub db_pool: PgPool,
    pub config: AppConfig,
    pub http_client: reqwest::Client,
}

// Handler receives state via Axum extractor
pub async fn handler(
    State(state): State<{{STATE_TYPE}}>,
) -> Result<Json<Response>, {{ERROR_TYPE}}> {
    helpers::process(&state.db_pool, &state.config).await
}
```

### Via Generic Trait Bounds

```rust
pub async fn process<R: Repository>(
    repo: &R,
    input: &Input,
) -> Result<Output, {{ERROR_TYPE}}> {
    let data = repo.find(input.id).await?;
    // Business logic using abstract repository
    Ok(transform(data))
}
```

### Via Extension Trait

```rust
use axum::Extension;

// Inject specific dependencies via Extension
pub async fn handler(
    Extension(user_service): Extension<Arc<dyn UserService>>,
    Json(req): Json<Request>,
) -> Result<Json<Response>, {{ERROR_TYPE}}> {
    let user = user_service.find(&req.user_id).await?;
    // ...
}
```

## 5.5 Workspace Dependency Flow

For workspace projects, define inter-crate dependencies:

```text
{{CRATE_NAME}}-api
  └──→ {{CRATE_NAME}}-core (business logic)
  └──→ {{CRATE_NAME}}-db   (database access)

{{CRATE_NAME}}-db
  └──→ {{CRATE_NAME}}-core (shared types)

{{CRATE_NAME}}-core
  └──→ (no internal crate dependencies)
```

```toml
# crates/{{CRATE_NAME}}-api/Cargo.toml
[dependencies]
{{CRATE_NAME}}-core = { path = "../{{CRATE_NAME}}-core" }
{{CRATE_NAME}}-db = { path = "../{{CRATE_NAME}}-db" }
```

---

## Checklist

- [ ] Dependency graph documented (text or diagram)
- [ ] Dependency flow is acyclic (no circular dependencies)
- [ ] Allowed dependencies per module type documented
- [ ] Forbidden dependencies per module type documented
- [ ] Strategy for cross-service communication defined
- [ ] Dependency injection pattern chosen
- [ ] Circular dependency resolution strategy documented
- [ ] Workspace inter-crate dependencies defined (if applicable)
- [ ] All team members understand the dependency rules

## Verification

```bash
cargo check
cargo clippy
cargo test

# Optional: generate and verify module graph
cargo modules generate graph --lib
```

After implementing the dependency flow, verify no unintended cross-module imports exist by reviewing `use` statements.
