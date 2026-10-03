# Phase 3: Error Handling

**Dependencies:** Phase 1 (Code Style), Phase 2 (Type System)

**Can be implemented in parallel with:** Phase 2 (Type System)

## Overview

Define error handling standards for `{{PROJECT_NAME}}`. Consistent error handling is critical for debugging, user experience, and system reliability. These guidelines establish a single error type hierarchy, propagation patterns, and rules for when to panic vs return errors.

---

## 3.1 Custom Error Type with thiserror

Define a centralised error type for the project:

```rust
// {{SRC_DIR}}/error.rs
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum {{ERROR_TYPE}} {
    #[error("Database error: {message}")]
    Database { message: String },

    #[error("Not found: {message}")]
    NotFound { message: String },

    #[error("Bad request: {message}")]
    BadRequest { message: String },

    #[error("Unauthorized: {message}")]
    Unauthorized { message: String },

    #[error("Forbidden: {message}")]
    Forbidden { message: String },

    #[error("Conflict: {message}")]
    Conflict { message: String },

    #[error("External service error: {message}")]
    ExternalService { message: String },

    #[error("Internal error: {message}")]
    Internal { message: String },
}

impl IntoResponse for {{ERROR_TYPE}} {
    fn into_response(self) -> Response {
        let status = match &self {
            Self::Database { .. } => StatusCode::INTERNAL_SERVER_ERROR,
            Self::NotFound { .. } => StatusCode::NOT_FOUND,
            Self::BadRequest { .. } => StatusCode::BAD_REQUEST,
            Self::Unauthorized { .. } => StatusCode::UNAUTHORIZED,
            Self::Forbidden { .. } => StatusCode::FORBIDDEN,
            Self::Conflict { .. } => StatusCode::CONFLICT,
            Self::ExternalService { .. } => StatusCode::BAD_GATEWAY,
            Self::Internal { .. } => StatusCode::INTERNAL_SERVER_ERROR,
        };

        let body = serde_json::json!({
            "error": self.to_string(),
        });

        (status, axum::Json(body)).into_response()
    }
}
```

**Checklist:**

- [ ] `{{ERROR_TYPE}}` enum defined with `thiserror`
- [ ] `IntoResponse` implemented for Axum integration
- [ ] Each variant maps to a specific HTTP status code
- [ ] Error messages are user-safe (no internal details leaked)

---

## 3.2 Result<T, Error> Patterns

All fallible functions must return `Result`:

```rust
// Handler functions
pub async fn get_{{ENTITY_NAME_LOWER}}(
    State(state): State<{{STATE_TYPE}}>,
    Path(id): Path<String>,
) -> Result<Json<{{ENTITY_NAME}}>, {{ERROR_TYPE}}> {
    let entity = storage::get_by_id(&state.pool, &id).await?;
    Ok(Json(entity))
}

// Storage functions
pub async fn get_by_id(
    pool: &PgPool,
    id: &str,
) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
    sqlx::query_as::<_, DB{{ENTITY_NAME}}>("SELECT * FROM {{TABLE_NAME}} WHERE id = $1")
        .bind(id)
        .fetch_optional(pool)
        .await
        .map_err(|e| {{ERROR_TYPE}}::Database {
            message: format!("Failed to query {{TABLE_NAME}}: {e}"),
        })?
        .map({{ENTITY_NAME}}::from_db)
        .ok_or_else(|| {{ERROR_TYPE}}::NotFound {
            message: format!("{{ENTITY_NAME}} with id '{id}' not found"),
        })
}

// Helper functions
pub fn validate_{{ENTITY_NAME_LOWER}}(req: &Create{{ENTITY_NAME}}Req) -> Result<(), {{ERROR_TYPE}}> {
    if req.name.is_empty() {
        return Err({{ERROR_TYPE}}::BadRequest {
            message: "Name cannot be empty".into(),
        });
    }
    Ok(())
}
```

**Checklist:**

- [ ] All fallible functions return `Result<T, {{ERROR_TYPE}}>`
- [ ] No function returns `Result<T, String>` or `Result<T, Box<dyn Error>>`
- [ ] Handler functions return `Result<Json<T>, {{ERROR_TYPE}}>`

---

## 3.3 Error Propagation with `?`

Use `?` for clean error propagation. Add context with `map_err()`:

```rust
// Simple propagation (when From<T> is implemented)
let pool = PgPool::connect(&database_url).await?;

// Propagation with context
let user = get_user(&pool, &user_id)
    .await
    .map_err(|e| {{ERROR_TYPE}}::Internal {
        message: format!("Failed to load user {user_id} for order creation: {e}"),
    })?;

// Propagation with type conversion
let body = serde_json::to_string(&response)
    .map_err(|e| {{ERROR_TYPE}}::Internal {
        message: format!("Failed to serialise response: {e}"),
    })?;

// Chained operations with early returns
pub async fn process_order(pool: &PgPool, req: &OrderReq) -> Result<Order, {{ERROR_TYPE}}> {
    let user = get_user(pool, &req.user_id).await?;
    let product = get_product(pool, &req.product_id).await?;
    let order = create_order(pool, &user, &product).await?;
    Ok(order)
}
```

**Checklist:**

- [ ] `?` operator used instead of explicit `match` for propagation
- [ ] `map_err()` adds context at meaningful boundaries
- [ ] Context messages include relevant identifiers (IDs, names)
- [ ] No nested `match` blocks for error handling when `?` suffices

---

## 3.4 When to Panic vs Return Error

### Panic (use sparingly)

```rust
// OK: Programmer error — invariant violated, should never happen
fn get_index(slice: &[u8], verified_index: usize) -> u8 {
    // SAFETY: index was validated by caller
    slice[verified_index]
}

// OK: Application startup — fail fast if misconfigured
fn main() {
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    // ...
}

// OK: Tests — unwrap() is acceptable in test code
#[test]
fn test_create_user() {
    let user = create_user(&req).unwrap();
    assert_eq!(user.name, "test");
}
```

### Return Error (default choice)

```rust
// ALWAYS return errors for:
// - User input validation
// - Network/IO operations
// - Database queries
// - File operations
// - External API calls
// - Any operation that can reasonably fail at runtime

pub async fn get_config(path: &str) -> Result<Config, {{ERROR_TYPE}}> {
    let content = tokio::fs::read_to_string(path)
        .await
        .map_err(|e| {{ERROR_TYPE}}::Internal {
            message: format!("Failed to read config from {path}: {e}"),
        })?;

    toml::from_str(&content).map_err(|e| {{ERROR_TYPE}}::Internal {
        message: format!("Failed to parse config: {e}"),
    })
}
```

### Decision Table

| Scenario | Approach | Rationale |
|----------|----------|-----------|
| Missing env var at startup | `expect()` | Fail fast, nothing to recover |
| Missing env var at runtime | `Result` + `{{ERROR_TYPE}}` | Graceful error response |
| Invalid user input | `Result` + `BadRequest` | User can fix and retry |
| Database connection failure | `Result` + `Database` | Temporary, may recover |
| Logic bug (impossible state) | `unreachable!()` | Bug, should be investigated |
| Test assertions | `unwrap()` | Test failure is the signal |

**Checklist:**

- [ ] No `unwrap()` in production code paths
- [ ] No `expect()` in production code paths (except startup)
- [ ] `unreachable!()` used only for truly impossible states
- [ ] `todo!()` never committed to main branch

---

## 3.5 Adding Context with map_err()

```rust
// Pattern: Add WHERE the error occurred and WHY it matters
let user = get_user(pool, &id)
    .await
    .map_err(|e| {{ERROR_TYPE}}::Internal {
        message: format!("Failed to fetch user {id} during order validation: {e}"),
    })?;

// Pattern: Convert external errors to your error type
let response = reqwest::get(&url)
    .await
    .map_err(|e| {{ERROR_TYPE}}::ExternalService {
        message: format!("Payment gateway request failed: {e}"),
    })?;

// Pattern: Provide user-friendly messages for bad input
let age: u32 = req.age_str.parse().map_err(|_| {{ERROR_TYPE}}::BadRequest {
    message: format!("Invalid age '{}': must be a positive integer", req.age_str),
})?;
```

---

## 3.6 Error Type Hierarchy

```text
{{ERROR_TYPE}}
├── BadRequest        → 400 (client sent invalid data)
├── Unauthorized      → 401 (missing or invalid credentials)
├── Forbidden         → 403 (valid credentials, insufficient permissions)
├── NotFound          → 404 (resource does not exist)
├── Conflict          → 409 (duplicate or state conflict)
├── Database          → 500 (query failure, connection error)
├── ExternalService   → 502 (third-party API failure)
└── Internal          → 500 (unexpected server error)
```

---

## 3.7 thiserror for Libraries vs anyhow for Applications

```rust
// For library crates: use thiserror for structured, typed errors
// Consumers can match on specific variants
#[derive(Debug, thiserror::Error)]
pub enum MyLibError {
    #[error("parse error: {0}")]
    Parse(#[from] serde_json::Error),
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}

// For application crates (binaries): anyhow is acceptable for one-off scripts
// or prototyping, but prefer thiserror for production APIs
use anyhow::{Context, Result};

fn load_config() -> Result<Config> {
    let content = std::fs::read_to_string("config.toml")
        .context("Failed to read config.toml")?;
    let config: Config = toml::from_str(&content)
        .context("Failed to parse config.toml")?;
    Ok(config)
}
```

**Checklist:**

- [ ] Library crates use `thiserror` exclusively
- [ ] Application crate uses `thiserror` for the main error type
- [ ] `anyhow` only used in scripts, CLI tools, or prototypes (not in the API server)
- [ ] `From` impls provided for common error conversions

---

## Checklist

- [ ] Centralised `{{ERROR_TYPE}}` enum defined
- [ ] `IntoResponse` implemented for HTTP error responses
- [ ] All functions use `Result<T, {{ERROR_TYPE}}>`
- [ ] `?` operator used for propagation
- [ ] `map_err()` adds context at module boundaries
- [ ] No `unwrap()`/`expect()` in production code
- [ ] Panic vs error decision table followed
- [ ] Error messages include relevant identifiers

## Verification

```bash
cargo check
cargo clippy -- -D warnings
cargo test

# Verify no unwrap() in production code
rg "\.unwrap\(\)" {{SRC_DIR}} --type rust --glob '!*test*' --glob '!*main.rs'
```
