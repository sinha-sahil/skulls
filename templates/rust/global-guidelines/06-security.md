# Phase 6: Security

**Dependencies:** Phase 3 (Error Handling)

**Can be implemented in parallel with:** Phase 5 (Performance), Phase 7 (Documentation)

## Overview

Define security standards for `{{PROJECT_NAME}}`. These guidelines cover input validation, SQL injection prevention, secret management, dependency auditing, unsafe code policy, and CORS configuration. Security is a cross-cutting concern that affects every layer of the application.

---

## 6.1 Input Validation Patterns

Validate all external input at the boundary (handler level) before passing to business logic:

```rust
use axum::{extract::Path, Json};

pub async fn get_{{ENTITY_NAME_LOWER}}(
    State(state): State<{{STATE_TYPE}}>,
    Path(id): Path<String>,
) -> Result<Json<{{ENTITY_NAME}}>, {{ERROR_TYPE}}> {
    // Validate input at the boundary
    validate_id(&id)?;

    let entity = storage::get_by_id(&state.pool, &id).await?;
    Ok(Json(entity))
}

fn validate_id(id: &str) -> Result<(), {{ERROR_TYPE}}> {
    if id.is_empty() {
        return Err({{ERROR_TYPE}}::BadRequest {
            message: "ID cannot be empty".into(),
        });
    }
    if id.len() > 128 {
        return Err({{ERROR_TYPE}}::BadRequest {
            message: "ID exceeds maximum length of 128".into(),
        });
    }
    if !id.chars().all(|c| c.is_alphanumeric() || c == '-' || c == '_') {
        return Err({{ERROR_TYPE}}::BadRequest {
            message: "ID contains invalid characters".into(),
        });
    }
    Ok(())
}

fn validate_pagination(page: u32, limit: u32) -> Result<(), {{ERROR_TYPE}}> {
    if limit == 0 || limit > 100 {
        return Err({{ERROR_TYPE}}::BadRequest {
            message: "Limit must be between 1 and 100".into(),
        });
    }
    if page == 0 {
        return Err({{ERROR_TYPE}}::BadRequest {
            message: "Page must be >= 1".into(),
        });
    }
    Ok(())
}
```

### Parse, Don't Validate

```rust
/// A validated email address. Can only be constructed through parsing.
pub struct Email(String);

impl Email {
    pub fn parse(input: &str) -> Result<Self, {{ERROR_TYPE}}> {
        let trimmed = input.trim();
        if trimmed.is_empty() {
            return Err({{ERROR_TYPE}}::BadRequest {
                message: "Email cannot be empty".into(),
            });
        }
        if !trimmed.contains('@') || !trimmed.contains('.') {
            return Err({{ERROR_TYPE}}::BadRequest {
                message: format!("Invalid email format: {trimmed}"),
            });
        }
        if trimmed.len() > 254 {
            return Err({{ERROR_TYPE}}::BadRequest {
                message: "Email exceeds maximum length".into(),
            });
        }
        Ok(Self(trimmed.to_lowercase()))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}
```

**Checklist:**

- [ ] All external input validated at handler boundary
- [ ] String lengths bounded (prevent memory exhaustion)
- [ ] IDs validated for allowed characters
- [ ] Numeric ranges checked (pagination, limits)
- [ ] Parse-don't-validate pattern used for domain types

---

## 6.2 SQL Injection Prevention

Always use parameterised queries with sqlx. Never interpolate user input into SQL strings:

```rust
// GOOD: Parameterised query — safe from SQL injection
pub async fn search(pool: &PgPool, query: &str) -> Result<Vec<{{ENTITY_NAME}}>, {{ERROR_TYPE}}> {
    sqlx::query_as::<_, DB{{ENTITY_NAME}}>(
        "SELECT * FROM {{TABLE_NAME}} WHERE name ILIKE $1"
    )
    .bind(format!("%{query}%"))
    .fetch_all(pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::Database {
        message: format!("Search query failed: {e}"),
    })
}

// BAD: String interpolation — vulnerable to SQL injection
pub async fn bad_search(pool: &PgPool, query: &str) -> Result<Vec<{{ENTITY_NAME}}>, {{ERROR_TYPE}}> {
    let sql = format!("SELECT * FROM {{TABLE_NAME}} WHERE name LIKE '%{query}%'");
    // NEVER DO THIS — user can inject arbitrary SQL
    sqlx::query_as(&sql).fetch_all(pool).await.map_err(/* ... */)
}

// GOOD: Dynamic WHERE clauses built safely
pub async fn filter(
    pool: &PgPool,
    status: Option<&str>,
    name: Option<&str>,
) -> Result<Vec<{{ENTITY_NAME}}>, {{ERROR_TYPE}}> {
    sqlx::query_as::<_, DB{{ENTITY_NAME}}>(
        r#"
        SELECT * FROM {{TABLE_NAME}}
        WHERE ($1::text IS NULL OR status = $1)
          AND ($2::text IS NULL OR name ILIKE $2)
        ORDER BY created_at DESC
        "#,
    )
    .bind(status)
    .bind(name.map(|n| format!("%{n}%")))
    .fetch_all(pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::Database {
        message: format!("Filter query failed: {e}"),
    })
}
```

**Checklist:**

- [ ] All SQL uses parameterised queries (`$1`, `$2`, etc.)
- [ ] No string interpolation in SQL (`format!` with user input)
- [ ] Dynamic WHERE clauses use NULL parameter patterns
- [ ] `rg "format!.*SELECT\|format!.*INSERT\|format!.*UPDATE\|format!.*DELETE"` returns nothing

---

## 6.3 Secret Management

```rust
// NEVER log secrets
pub async fn authenticate(
    headers: &HeaderMap,
    state: &{{STATE_TYPE}},
) -> Result<Claims, {{ERROR_TYPE}}> {
    let token = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or({{ERROR_TYPE}}::Unauthorized {
            message: "Missing Authorization header".into(),
        })?;

    // GOOD: Log that auth happened, not the token value
    {{LOG_CRATE}}::info!("Authentication attempt received");

    // BAD: Never log the actual token
    // {{LOG_CRATE}}::info!("Token received: {token}");  // NEVER DO THIS

    verify_token(token, &state.secrets.jwt_secret)
}

// Implement Debug manually to hide secret fields
pub struct Secrets {
    pub jwt_secret: String,
    pub api_key: String,
    pub database_url: String,
}

impl std::fmt::Debug for Secrets {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Secrets")
            .field("jwt_secret", &"[REDACTED]")
            .field("api_key", &"[REDACTED]")
            .field("database_url", &"[REDACTED]")
            .finish()
    }
}
```

**Checklist:**

- [ ] Secrets loaded from environment variables only
- [ ] No secrets in source code or config files
- [ ] Secrets struct has custom `Debug` that redacts values
- [ ] Logging never includes tokens, keys, or passwords
- [ ] `.env` files are in `.gitignore`

---

## 6.4 Dependency Auditing

```bash
# Install security audit tools
cargo install cargo-audit
cargo install cargo-deny

# Run security audit (check for known vulnerabilities)
cargo audit

# Run cargo-deny for comprehensive checks
cargo deny check advisories
cargo deny check licenses
cargo deny check bans
```

### deny.toml Configuration

```toml
# deny.toml
[advisories]
vulnerability = "deny"
unmaintained = "warn"

[licenses]
allow = ["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC"]
unlicensed = "deny"

[bans]
multiple-versions = "warn"
wildcards = "deny"
```

**Checklist:**

- [ ] `cargo audit` runs in CI pipeline
- [ ] `deny.toml` configured and committed
- [ ] No known vulnerabilities in dependencies
- [ ] License compliance verified
- [ ] Dependency updates reviewed regularly

---

## 6.5 Unsafe Usage Policy

```rust
// Rule: unsafe is NEVER allowed without all of the following:
// 1. A // SAFETY: comment explaining why it's sound
// 2. Code review by at least one other team member
// 3. Documented invariants that make the unsafe block sound

// Example of properly documented unsafe (if absolutely necessary):
// SAFETY: `data` is guaranteed to be aligned and valid for the lifetime 'a
// because it comes from a Vec<u8> that outlives this reference.
// The length is checked to be >= size_of::<Header>() on the line above.
unsafe {
    std::ptr::read(data.as_ptr() as *const Header)
}

// Prefer safe alternatives:
// Instead of unsafe pointer casting, use:
// - bytemuck for safe transmutation
// - zerocopy for zero-copy parsing
// - TryFrom/TryInto for conversions
```

**Policy:**

- `unsafe` blocks require `// SAFETY:` comment immediately above
- Prefer safe crates (`bytemuck`, `zerocopy`) over raw `unsafe`
- No `unsafe` in application code without explicit justification
- `#![forbid(unsafe_code)]` in crates that don't need unsafe

```rust
// At the top of lib.rs for crates that should never use unsafe
#![forbid(unsafe_code)]
```

**Checklist:**

- [ ] All `unsafe` blocks have `// SAFETY:` comments
- [ ] Safe alternatives evaluated before using `unsafe`
- [ ] `#![forbid(unsafe_code)]` set where possible
- [ ] `rg "unsafe" --type rust` reviewed — each occurrence justified

---

## 6.6 CORS Configuration

```rust
use axum::http::{HeaderValue, Method};
use tower_http::cors::CorsLayer;

fn cors_layer() -> CorsLayer {
    CorsLayer::new()
        .allow_origin([
            "https://{{PROJECT_NAME}}.example.com".parse::<HeaderValue>().unwrap(),
            "https://admin.{{PROJECT_NAME}}.example.com".parse::<HeaderValue>().unwrap(),
        ])
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::PATCH,
            Method::DELETE,
        ])
        .allow_headers([
            axum::http::header::CONTENT_TYPE,
            axum::http::header::AUTHORIZATION,
        ])
        .max_age(std::time::Duration::from_secs(3600))
}

// BAD: Never allow all origins in production
// CorsLayer::permissive()  // NEVER in production
```

**Checklist:**

- [ ] CORS origins explicitly listed (no wildcard `*` in production)
- [ ] Allowed methods restricted to those actually used
- [ ] Allowed headers restricted to those actually needed
- [ ] `max_age` set to reduce preflight requests

---

## Checklist

- [ ] Input validation at every external boundary
- [ ] All SQL queries use parameterised queries
- [ ] Secrets never logged or committed to source control
- [ ] `cargo audit` passes with no vulnerabilities
- [ ] `deny.toml` configured for license and advisory checks
- [ ] Unsafe code policy enforced with `// SAFETY:` comments
- [ ] CORS configured with explicit origins

## Verification

```bash
cargo check
cargo clippy -- -D warnings
cargo audit
cargo deny check

# Verify no SQL string interpolation
rg "format!.*SELECT|format!.*INSERT|format!.*UPDATE|format!.*DELETE" {{SRC_DIR}} --type rust
```
