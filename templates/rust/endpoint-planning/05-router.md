# {{SERVICE_NAME}} {{FEATURE_NAME}} - Router & Middleware

## Overview

Add the {{ENDPOINT_PATH}} endpoint to the router with appropriate authentication.

## Status

🔴 Not Started

## Dependencies

- Handler function must exist
- Middleware (if creating new auth pattern)

---

## Authentication Type Selection

Choose the appropriate authentication for your endpoint:

### Option A: JWT Access Token

**Use for:** User-authenticated endpoints

- Header: `x-access-token` (configurable)
- Token claims: `{{TOKEN_CLAIMS_TYPE}}`

### Option B: Admin API Key

**Use for:** Internal admin-only endpoints

- Header: `x-api-key`

### Option C: HMAC Verification

**Use for:** Webhook endpoints

- Header: `x-signature` (or provider-specific header)
- Verified in handler (not middleware)

### Option D: Public (No Auth)

**Use for:** Public endpoints

- No middleware
- No authentication

---

## Implementation

### Step 1: Create Middleware (if needed)

**File:** `{{SERVICES_DIR}}{{SERVICE_NAME}}/middleware.rs` (NEW or EXISTING)

#### Option A: JWT Authentication Middleware

```rust
use crate::auth::{{TOKEN_CLAIMS_TYPE}};
use crate::auth::{{JWT_VERIFY_FN}};
use crate::error::{{ERROR_TYPE}};
use crate::{{STATE_TYPE}};
use axum::{extract::Request, http::HeaderMap, middleware, response::Response, Extension};

pub async fn auth_middleware(
    Extension(app_state): Extension<{{STATE_TYPE}}>,
    headers: HeaderMap,
    mut request: Request,
    next: middleware::Next,
) -> Result<Response, {{ERROR_TYPE}}> {
    let access_token = headers.get("x-access-token");
    if let Some(access_token_val) = access_token {
        let auth_result = {{JWT_VERIFY_FN}}::<{{TOKEN_CLAIMS_TYPE}}>(
            access_token_val.to_str().unwrap(),
            &app_state.secrets.{{JWT_SECRET_FIELD}},
            None,
        );

        match auth_result {
            Ok(result) => {
                request.extensions_mut().insert(result.claims);
                let response = next.run(request).await;
                return Ok(response);
            }
            Err(_) => {
                return Err({{ERROR_TYPE}}::Unauthorized);
            }
        }
    }

    Err({{ERROR_TYPE}}::Unauthorized)
}
```

#### Option B: Admin API Key Middleware

```rust
use axum::{extract::Request, http::HeaderMap, middleware, response::Response, Extension};
use crate::error::{{ERROR_TYPE}};
use crate::{{STATE_TYPE}};

pub async fn api_key_middleware(
    Extension(state): Extension<{{STATE_TYPE}}>,
    headers: HeaderMap,
    request: Request,
    next: middleware::Next,
) -> Result<Response, {{ERROR_TYPE}}> {
    let expected_key = &state.secrets.admin_api_key;
    let header_value = headers.get("x-api-key");

    if let Some(value) = header_value {
        if let Ok(api_key) = value.to_str() {
            if api_key == expected_key {
                let response = next.run(request).await;
                return Ok(response);
            }
        }
    }
    Err({{ERROR_TYPE}}::Unauthorized)
}
```

---

### Step 2: Update Router

**File:** `{{SERVICES_DIR}}{{SERVICE_NAME}}/mod.rs`

#### Pattern 1: Single Route (No Auth)

```rust
use axum::{routing::{{HTTP_METHOD_LOWER}}, Router};
use crate::{{STATE_TYPE}};

mod handler;
// Add if created: mod types;
// Add if created: pub mod storage;

pub fn {{SERVICE_NAME}}_router() -> Router<{{STATE_TYPE}}> {
    Router::new()
        .route("{{ENDPOINT_PATH}}", {{HTTP_METHOD_LOWER}}(handler::{{HANDLER_NAME}}))
}
```

#### Pattern 2: Single Route (With Auth)

```rust
use axum::{middleware::from_fn, routing::{{HTTP_METHOD_LOWER}}, Router};
use crate::{{STATE_TYPE}};

mod handler;
mod middleware;
// Add if created: mod types;
// Add if created: pub mod storage;

pub fn {{SERVICE_NAME}}_router() -> Router<{{STATE_TYPE}}> {
    Router::new()
        .route("{{ENDPOINT_PATH}}", {{HTTP_METHOD_LOWER}}(handler::{{HANDLER_NAME}}))
        .route_layer(from_fn(middleware::auth_middleware))
}
```

#### Pattern 3: Multiple Routes (Mixed Auth)

```rust
use axum::{middleware::from_fn, routing::{get, post, put}, Router};
use crate::{{STATE_TYPE}};

mod handler;
mod middleware;
pub mod storage;
pub mod types;

pub fn {{SERVICE_NAME}}_router() -> Router<{{STATE_TYPE}}> {
    // Protected routes (require authentication)
    let protected_routes = Router::new()
        .route("/{{SERVICE_NAME}}/config", put(handler::update_config))
        .route("/{{SERVICE_NAME}}/list", get(handler::list_items))
        .route_layer(from_fn(middleware::auth_middleware));

    // Public routes (no authentication)
    let public_routes = Router::new()
        .route("/{{SERVICE_NAME}}/webhooks", post(handler::webhook_handler))
        .route("/{{SERVICE_NAME}}/public", get(handler::public_handler));

    // Merge routers
    protected_routes.merge(public_routes)
}
```

#### Pattern 4: Path Parameters

```rust
use axum::{routing::{get, delete}, Router};
use crate::{{STATE_TYPE}};

pub fn {{SERVICE_NAME}}_router() -> Router<{{STATE_TYPE}}> {
    Router::new()
        .route("/{{SERVICE_NAME}}/:id", get(handler::get_item))
        .route("/{{SERVICE_NAME}}/:id", delete(handler::delete_item))
}
```

---

## Module Declarations

Add these to `mod.rs` as needed:

```rust
mod handler;           // Always needed
mod middleware;       // If creating auth middleware
mod storage;          // If using storage layer
pub mod types;        // If using types (make public)
```

**Note:** Use `pub mod` for modules that might be used by other services.

---

## HTTP Method Imports

Import the methods you need:

```rust
use axum::routing::{get, post, put, patch, delete};
```

Common patterns:

- `GET` → `get`
- `POST` → `post`
- `PUT` → `put`
- `PATCH` → `patch`
- `DELETE` → `delete`

---

## Router Registration

The router should be registered in your main application file:

```rust
// In main.rs or app.rs
let app = Router::new()
    // ... other routers ...
    .merge({{SERVICE_NAME}}::{{SERVICE_NAME}}_router())
    // ... rest of the app ...
```

---

## Complete Examples

### Example 1: Simple Public Endpoint

```rust
use axum::{routing::get, Router};
use crate::{{STATE_TYPE}};

mod handler;

pub fn stats_router() -> Router<{{STATE_TYPE}}> {
    Router::new()
        .route("/stats", get(handler::get_stats))
}
```

### Example 2: CRUD with JWT Auth

```rust
use axum::{middleware::from_fn, routing::{get, post, put, delete}, Router};
use crate::{{STATE_TYPE}};

mod handler;
mod middleware;
pub mod types;

pub fn items_router() -> Router<{{STATE_TYPE}}> {
    Router::new()
        .route("/items", get(handler::list_items))
        .route("/items", post(handler::create_item))
        .route("/items/:id", get(handler::get_item))
        .route("/items/:id", put(handler::update_item))
        .route("/items/:id", delete(handler::delete_item))
        .route_layer(from_fn(middleware::auth_middleware))
}
```

### Example 3: Protected + Public Routes

```rust
use axum::{middleware::from_fn, routing::{get, post, put}, Router};
use crate::{{STATE_TYPE}};

mod handler;
mod middleware;
pub mod storage;
pub mod types;

pub fn products_router() -> Router<{{STATE_TYPE}}> {
    let protected_routes = Router::new()
        .route("/products", post(handler::create_product))
        .route("/products/:id", put(handler::update_product))
        .route_layer(from_fn(middleware::auth_middleware));

    let public_routes = Router::new()
        .route("/products", get(handler::list_products))
        .route("/products/:id", get(handler::get_product))
        .route("/webhooks/products", post(handler::webhook_handler));

    protected_routes.merge(public_routes)
}
```

---

## Testing the Endpoint

After implementation, test with curl:

### Test 1: No Authentication (should fail if auth required)

```bash
curl -X {{HTTP_METHOD}} http://localhost:3000{{ENDPOINT_PATH}} \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Test 2: With JWT Token

```bash
curl -X {{HTTP_METHOD}} http://localhost:3000{{ENDPOINT_PATH}} \
  -H "Content-Type: application/json" \
  -H "x-access-token: YOUR_JWT_TOKEN" \
  -d '{"name": "test"}'
```

### Test 3: With API Key

```bash
curl -X {{HTTP_METHOD}} http://localhost:3000{{ENDPOINT_PATH}} \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"name": "test"}'
```

---

## Verification

Run these commands to verify:

```bash
cargo check
cargo fmt --all
cargo clippy --all-targets --all-features
```

**Checklist:**

- [ ] `cargo check` passes
- [ ] `cargo fmt --all` applied
- [ ] `cargo clippy` passes with no warnings
- [ ] Middleware created (if needed)
- [ ] Router updated with new route
- [ ] Module declarations added
- [ ] Authentication applied correctly
- [ ] Public/protected routes separated properly

---

## Notes

- DO NOT run `cargo build` - only use `cargo check`
- Webhook routes should be public (no middleware)
- Protected routes should always have authentication
- Use `route_layer()` to apply middleware to specific routes
- Use `merge()` to combine routers
- Path parameters use `:param_name` syntax
- Make storage/types modules public if needed by other services

---

## Authentication Flow Summary

### JWT Flow

1. Client sends request with `x-access-token` header
2. Middleware extracts and verifies JWT
3. Token claims inserted into request extensions
4. Handler accesses claims if needed
5. Request proceeds or returns 401

### API Key Flow

1. Client sends request with `x-api-key` header
2. Middleware compares with configured API key
3. Request proceeds or returns 401

### HMAC Flow (Webhooks)

1. External service sends request with signature header
2. Handler verifies HMAC signature
3. Request proceeds or returns 401
4. No middleware used

### Public Flow

1. Client sends request
2. No authentication check
3. Request proceeds directly to handler
