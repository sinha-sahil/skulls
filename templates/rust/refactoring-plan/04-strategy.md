# Phase 4: Refactoring Strategy

**Dependencies:** Phase 1 (Assessment), Phase 2 (Goals), Phase 3 (Impact Analysis)

**Can be implemented in parallel with:** Phase 6 (Testing Strategy)

## Overview

Select the specific refactoring patterns and approaches for `{{PROJECT_NAME}}`. Each strategy includes concrete Rust code examples showing the before and after transformation. Use the decision tree to choose the right approach for each identified issue.

---

## 4.1 Decision Tree

```text
What pattern needs refactoring?
│
├─ Error Handling
│  ├─ unwrap()/expect() in production → Strategy A: Error Propagation
│  ├─ Mixed error types (String, StatusCode) → Strategy B: Consolidate Errors
│  └─ Missing context on errors → Strategy C: Error Context
│
├─ Module Structure
│  ├─ File > 300 lines → Strategy D: Module Splitting
│  ├─ Tight coupling between modules → Strategy E: Extract Trait
│  └─ God struct with too many methods → Strategy F: Decompose Struct
│
├─ Type Safety
│  ├─ String-typed IDs → Strategy G: Newtype Wrapper
│  ├─ String-typed enums → Strategy H: Replace String with Enum
│  └─ Boolean parameters → Strategy I: Enum Parameters
│
├─ Code Quality
│  ├─ Duplicate logic → Strategy J: Extract Function
│  ├─ Complex construction → Strategy K: Builder Pattern
│  └─ Missing validation → Strategy L: Parse Don't Validate
│
└─ Async Issues
   ├─ Blocking in async → Strategy M: Spawn Blocking
   └─ Missing timeouts → Strategy N: Add Timeouts
```

---

## 4.2 Strategy A: Replace unwrap() with Error Propagation

**When:** Functions use `unwrap()` or `expect()` on fallible operations.

**Before:**

```rust
pub async fn get_{{ENTITY_NAME_LOWER}}(
    pool: &PgPool,
    id: &str,
) -> {{ENTITY_NAME}} {
    let row = sqlx::query_as::<_, DB{{ENTITY_NAME}}>(
        "SELECT * FROM {{TABLE_NAME}} WHERE id = $1"
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .unwrap();

    let config = std::fs::read_to_string("config.toml").unwrap();
    let parsed: Config = toml::from_str(&config).unwrap();

    {{ENTITY_NAME}}::from_db(row)
}
```

**After:**

```rust
pub async fn get_{{ENTITY_NAME_LOWER}}(
    pool: &PgPool,
    id: &str,
) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
    let row = sqlx::query_as::<_, DB{{ENTITY_NAME}}>(
        "SELECT * FROM {{TABLE_NAME}} WHERE id = $1"
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::Database {
        message: format!("Failed to fetch {{ENTITY_NAME_LOWER}} {id}: {e}"),
    })?;

    let config = std::fs::read_to_string("config.toml")
        .map_err(|e| {{ERROR_TYPE}}::Internal {
            message: format!("Failed to read config: {e}"),
        })?;

    let parsed: Config = toml::from_str(&config)
        .map_err(|e| {{ERROR_TYPE}}::Internal {
            message: format!("Failed to parse config: {e}"),
        })?;

    Ok({{ENTITY_NAME}}::from_db(row))
}
```

---

## 4.3 Strategy B: Consolidate Error Types with thiserror

**When:** Multiple error representations exist across the codebase.

```rust
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

    #[error("Internal error: {message}")]
    Internal { message: String },

    #[error("External service error: {message}")]
    ExternalService { message: String },
}

// Implement IntoResponse for Axum integration
impl axum::response::IntoResponse for {{ERROR_TYPE}} {
    fn into_response(self) -> axum::response::Response {
        let (status, message) = match &self {
            Self::Database { message } => (StatusCode::INTERNAL_SERVER_ERROR, message),
            Self::NotFound { message } => (StatusCode::NOT_FOUND, message),
            Self::BadRequest { message } => (StatusCode::BAD_REQUEST, message),
            Self::Unauthorized { message } => (StatusCode::UNAUTHORIZED, message),
            Self::Internal { message } => (StatusCode::INTERNAL_SERVER_ERROR, message),
            Self::ExternalService { message } => (StatusCode::BAD_GATEWAY, message),
        };

        let body = serde_json::json!({ "error": message });
        (status, axum::Json(body)).into_response()
    }
}

// Enable automatic conversion from sqlx::Error
impl From<sqlx::Error> for {{ERROR_TYPE}} {
    fn from(e: sqlx::Error) -> Self {
        Self::Database {
            message: e.to_string(),
        }
    }
}
```

---

## 4.4 Strategy C: Add Error Context with map_err

**When:** Errors propagate but lack context about where they occurred.

```rust
// Before: raw propagation loses context
let user = get_user(pool, &id).await?;

// After: add context at each propagation point
let user = get_user(pool, &id)
    .await
    .map_err(|e| {{ERROR_TYPE}}::Internal {
        message: format!("Failed to load user {id} during {{ENTITY_NAME_LOWER}} creation: {e}"),
    })?;
```

---

## 4.5 Strategy D: Split Large Modules

**When:** A single file exceeds 300 lines or mixes multiple responsibilities.

**Before:** Single file `{{SRC_DIR}}/{{MODULE_NAME}}.rs` (600+ lines)

**After:** Module directory structure:

```text
{{SRC_DIR}}/{{MODULE_NAME}}/
├── mod.rs          # Re-exports and module declarations
├── handler.rs      # HTTP handler functions
├── helpers.rs      # Business logic
├── storage.rs      # Database queries
└── types.rs        # Type definitions
```

```rust
// {{SRC_DIR}}/{{MODULE_NAME}}/mod.rs
mod handler;
mod helpers;
mod storage;
pub mod types;

pub use handler::*;
```

---

## 4.6 Strategy E: Extract Trait for Abstraction

**When:** Code is tightly coupled to a concrete implementation (e.g., direct database calls).

```rust
use async_trait::async_trait;

#[async_trait]
pub trait {{TRAIT_NAME}} {
    async fn get_by_id(&self, id: &str) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}>;
    async fn create(&self, req: &Create{{ENTITY_NAME}}Req) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}>;
    async fn delete(&self, id: &str) -> Result<(), {{ERROR_TYPE}}>;
}

pub struct Pg{{TRAIT_NAME}} {
    pool: PgPool,
}

impl Pg{{TRAIT_NAME}} {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait]
impl {{TRAIT_NAME}} for Pg{{TRAIT_NAME}} {
    async fn get_by_id(&self, id: &str) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
        sqlx::query_as::<_, DB{{ENTITY_NAME}}>(
            "SELECT * FROM {{TABLE_NAME}} WHERE id = $1"
        )
        .bind(id)
        .fetch_one(&self.pool)
        .await
        .map(|row| {{ENTITY_NAME}}::from_db(row))
        .map_err(|e| {{ERROR_TYPE}}::Database {
            message: format!("Failed to get {{ENTITY_NAME_LOWER}} {id}: {e}"),
        })
    }

    // ... other implementations
}
```

---

## 4.7 Strategy G: Introduce Newtype Wrapper

**When:** Multiple `String` parameters can be accidentally swapped.

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct {{ENTITY_NAME}}Id(String);

impl {{ENTITY_NAME}}Id {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for {{ENTITY_NAME}}Id {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

// Use in function signatures for compile-time safety:
pub async fn get_{{ENTITY_NAME_LOWER}}(
    pool: &PgPool,
    id: &{{ENTITY_NAME}}Id,  // Cannot accidentally pass an OrderId here
) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
    // ...
}
```

---

## 4.8 Strategy H: Replace String with Enum

**When:** A field has a known set of valid values stored as strings.

```rust
// Before: stringly typed
pub struct {{ENTITY_NAME}} {
    pub status: String,  // "active", "inactive", "pending" — anything goes
}

// After: type-safe enum
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum {{ENTITY_NAME}}Status {
    Active,
    Inactive,
    Pending,
}

pub struct {{ENTITY_NAME}} {
    pub status: {{ENTITY_NAME}}Status,  // Compiler enforces valid values
}
```

---

## 4.9 Strategy K: Introduce Builder Pattern

**When:** Structs have many optional fields or complex construction logic.

```rust
pub struct {{ENTITY_NAME}}Builder {
    name: String,
    description: Option<String>,
    status: {{ENTITY_NAME}}Status,
    tags: Vec<String>,
}

impl {{ENTITY_NAME}}Builder {
    pub fn new(name: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            description: None,
            status: {{ENTITY_NAME}}Status::Pending,
            tags: Vec::new(),
        }
    }

    pub fn description(mut self, desc: impl Into<String>) -> Self {
        self.description = Some(desc.into());
        self
    }

    pub fn status(mut self, status: {{ENTITY_NAME}}Status) -> Self {
        self.status = status;
        self
    }

    pub fn tag(mut self, tag: impl Into<String>) -> Self {
        self.tags.push(tag.into());
        self
    }

    pub fn build(self) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
        if self.name.is_empty() {
            return Err({{ERROR_TYPE}}::BadRequest {
                message: "Name cannot be empty".into(),
            });
        }
        Ok({{ENTITY_NAME}} {
            name: self.name,
            description: self.description,
            status: self.status,
            tags: self.tags,
        })
    }
}
```

---

## Checklist

- [ ] Decision tree consulted for each identified issue
- [ ] Strategy selected for each refactoring goal
- [ ] Before/after code examples documented
- [ ] Strategies are compatible (no conflicting changes)
- [ ] Complex strategies have intermediate steps
- [ ] Each strategy preserves compilation at every step
- [ ] Strategies align with Phase 2 goals and Phase 3 impact analysis

## Verification

```bash
# Verify chosen strategies don't conflict
cargo check
cargo clippy
```

Strategy selection must be complete before proceeding to Phase 5 (Execution Plan).
