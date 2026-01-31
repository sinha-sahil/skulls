# Step 5: Module Router (`mod.rs`)

**Dependencies:** Step 4 (handler.rs), optionally Step 6 (middleware.rs)

**Must be implemented after:** All other service files

## 5.1 Basic Module Definition

```rust
use crate::{{STATE_TYPE}};
use axum::{
    middleware::from_fn,
    routing::{delete, get, patch, post},
    Router,
};
use middleware::auth_middleware;

mod handler;
pub mod helpers;  // pub if exported for other services
mod middleware;
mod storage;
mod types;
// mod remote;     // uncomment if needed
// mod scheduler;  // uncomment if needed
```

## 5.2 Public Exports

```rust
// Export functions that other services need to access
pub use helpers::get_{{ENTITY_NAME_LOWER}}_for_user;
pub use storage::get_{{ENTITY_NAME_LOWER}}_by_id;
```

## 5.3 Router Function

```rust
pub fn {{SERVICE_NAME}}_router() -> Router<{{STATE_TYPE}}> {
    // Authenticated routes
    let authenticated_routes = Router::new()
        .route("/{{SERVICE_NAME}}", post(handler::create_{{ENTITY_NAME_LOWER}}))
        .route("/{{SERVICE_NAME}}/:id", get(handler::get_{{ENTITY_NAME_LOWER}}))
        .route("/{{SERVICE_NAME}}/:id", patch(handler::update_{{ENTITY_NAME_LOWER}}))
        .route("/{{SERVICE_NAME}}/:id", delete(handler::delete_{{ENTITY_NAME_LOWER}}))
        .route("/{{SERVICE_NAME}}/list", get(handler::list_{{ENTITY_NAME_LOWER}}s))
        .route_layer(from_fn(auth_middleware));

    // Public routes (no auth required)
    let public_routes = Router::new()
        .route("/{{SERVICE_NAME}}/public", get(handler::public_endpoint));

    // Webhook routes (different auth mechanism)
    let webhook_routes = Router::new()
        .route("/{{SERVICE_NAME}}/webhook", post(handler::webhook_handler));

    Router::new()
        .merge(authenticated_routes)
        .merge(public_routes)
        .merge(webhook_routes)
}
```

## 5.4 Router with Body Size Limit

```rust
use axum::extract::DefaultBodyLimit;

pub fn {{SERVICE_NAME}}_router() -> Router<{{STATE_TYPE}}> {
    Router::new()
        .route("/{{SERVICE_NAME}}/upload", post(handler::upload_{{ENTITY_NAME_LOWER}}))
        .layer(DefaultBodyLimit::max(1024 * 1024 * 10))  // 10MB limit
        .route_layer(from_fn(auth_middleware))
}
```

## 5.5 Router with Scheduler Export

```rust
// If scheduler is needed, add this export
pub use scheduler::create_{{SERVICE_NAME}}_scheduler_handler;
```

## 5.6 Complete Example

```rust
use crate::{{STATE_TYPE}};
use axum::{
    extract::DefaultBodyLimit,
    middleware::from_fn,
    routing::{delete, get, patch, post},
    Router,
};
use middleware::auth_middleware;

mod handler;
pub mod helpers;
mod middleware;
mod storage;
mod types;
mod scheduler;

// Public exports
pub use helpers::get_{{ENTITY_NAME_LOWER}}_for_user;
pub use storage::get_{{ENTITY_NAME_LOWER}}_by_id;
pub use scheduler::create_{{SERVICE_NAME}}_scheduler_handler;

pub fn {{SERVICE_NAME}}_router() -> Router<{{STATE_TYPE}}> {
    let authenticated_routes = Router::new()
        .route("/{{SERVICE_NAME}}", post(handler::create_{{ENTITY_NAME_LOWER}}))
        .route("/{{SERVICE_NAME}}/:id", get(handler::get_{{ENTITY_NAME_LOWER}}))
        .route("/{{SERVICE_NAME}}/:id", patch(handler::update_{{ENTITY_NAME_LOWER}}))
        .route("/{{SERVICE_NAME}}/:id", delete(handler::delete_{{ENTITY_NAME_LOWER}}))
        .route("/{{SERVICE_NAME}}/list", post(handler::list_{{ENTITY_NAME_LOWER}}s))
        .layer(DefaultBodyLimit::max(1024 * 1024 * 5))
        .route_layer(from_fn(auth_middleware));

    let webhook_routes = Router::new()
        .route("/{{SERVICE_NAME}}/webhook/provider", post(handler::webhook_handler));

    Router::new()
        .merge(authenticated_routes)
        .merge(webhook_routes)
}
```

## Checklist

- [ ] Declare all submodules
- [ ] Export public functions for cross-service access
- [ ] Define `{{SERVICE_NAME}}_router()` function
- [ ] Group routes by authentication requirements
- [ ] Apply middleware using `.route_layer(from_fn(...))`
- [ ] Use appropriate HTTP methods (get, post, patch, delete)
- [ ] Add body size limits for upload endpoints if needed
