# Phase 2: Type System

**Dependencies:** Phase 1 (Code Style)

**Can be implemented in parallel with:** Phase 3 (Error Handling)

## Overview

Define type system conventions for `{{PROJECT_NAME}}`. Rust's type system is one of its greatest strengths — these guidelines ensure the team uses it effectively for domain modelling, compile-time safety, and clear API boundaries.

---

## 2.1 Newtype Pattern for Domain Types

Wrap primitive types to prevent accidental misuse:

```rust
use serde::{Deserialize, Serialize};

/// A unique identifier for a {{ENTITY_NAME}}.
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

impl AsRef<str> for {{ENTITY_NAME}}Id {
    fn as_ref(&self) -> &str {
        &self.0
    }
}
```

**When to use newtypes:**

- IDs (UserId, OrderId) — prevents mixing them up
- Validated strings (Email, Url) — ensures validation happened
- Units (Cents, Milliseconds) — prevents unit confusion
- Opaque wrappers (ApiKey, Token) — prevents accidental logging

**When NOT to use newtypes:**

- Internal-only values with no confusion risk
- Values that need extensive arithmetic (use type aliases instead)

**Checklist:**

- [ ] All entity IDs use newtype wrappers
- [ ] Newtypes implement `Display`, `Debug`, `Clone`, `PartialEq`, `Eq`
- [ ] Newtypes implement `Serialize`/`Deserialize` where needed
- [ ] Constructor validates input where appropriate

---

## 2.2 Type Aliases

Use type aliases for readability, not for type safety:

```rust
// Good: clarifies complex types
pub type DbResult<T> = Result<T, {{ERROR_TYPE}}>;
pub type HandlerResult<T> = Result<Json<T>, {{ERROR_TYPE}}>;

// Good: shortens repetitive generic bounds
pub type BoxFuture<'a, T> = Pin<Box<dyn Future<Output = T> + Send + 'a>>;

// Bad: does NOT provide type safety (UserId and OrderId are interchangeable)
type UserId = String;   // Use newtype instead
type OrderId = String;  // Use newtype instead
```

**Checklist:**

- [ ] Type aliases used only for readability of complex types
- [ ] Type aliases NOT used where type safety is needed (use newtypes)

---

## 2.3 Generic Constraints

### Inline Bounds vs Where Clauses

```rust
// Inline bounds: use when there are 1-2 simple bounds
pub fn process<T: Serialize + Debug>(item: T) -> String {
    format!("{:?}", item)
}

// Where clauses: use when bounds are complex or there are many
pub fn insert_and_return<T, E>(
    pool: &PgPool,
    item: T,
) -> Result<T, E>
where
    T: Serialize + DeserializeOwned + Send + Sync,
    E: From<sqlx::Error> + From<serde_json::Error>,
{
    // ...
}

// Where clauses: always use when the function signature is long
pub async fn batch_process<I, T, F, Fut>(
    items: I,
    processor: F,
) -> Result<Vec<T>, {{ERROR_TYPE}}>
where
    I: IntoIterator<Item = T>,
    T: Send + Sync + 'static,
    F: Fn(T) -> Fut + Send + Sync,
    Fut: Future<Output = Result<T, {{ERROR_TYPE}}>> + Send,
{
    // ...
}
```

**Checklist:**

- [ ] Inline bounds for simple cases (1-2 bounds)
- [ ] Where clauses for complex cases (3+ bounds or long signatures)
- [ ] Bounds are as narrow as possible (don't require `Clone` if not needed)

---

## 2.4 Lifetime Annotation Rules

```rust
// Rule 1: Let elision handle it when possible
fn first_word(s: &str) -> &str { /* ... */ }

// Rule 2: Annotate when the compiler requires it
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str { /* ... */ }

// Rule 3: Use descriptive lifetime names for clarity in complex cases
struct DbConnection<'conn> {
    pool: &'conn PgPool,
}

struct RequestContext<'req, 'db> {
    headers: &'req HeaderMap,
    pool: &'db PgPool,
}

// Rule 4: Prefer owned types in async contexts to avoid lifetime complexity
// Prefer this:
pub async fn get_user(pool: &PgPool, id: String) -> Result<User, {{ERROR_TYPE}}> { /* ... */ }

// Over this (unless performance-critical):
pub async fn get_user<'a>(pool: &PgPool, id: &'a str) -> Result<User, {{ERROR_TYPE}}> { /* ... */ }
```

**Checklist:**

- [ ] Lifetime elision used wherever possible
- [ ] Descriptive lifetime names in complex signatures (`'conn`, `'req`)
- [ ] Owned types preferred in async function parameters
- [ ] No unnecessary lifetime annotations

---

## 2.5 Trait Design

### Object Safety

```rust
// Object-safe trait (can use dyn Trait):
#[async_trait::async_trait]
pub trait {{TRAIT_NAME}}: Send + Sync {
    async fn get_by_id(&self, id: &str) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}>;
    async fn list(&self) -> Result<Vec<{{ENTITY_NAME}}>, {{ERROR_TYPE}}>;
    async fn create(&self, req: &Create{{ENTITY_NAME}}Req) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}>;
}

// NOT object-safe (returns Self, uses generics):
pub trait Builder {
    fn with_name(self, name: String) -> Self;  // Returns Self — not object-safe
    fn build<T: Default>(self) -> T;           // Generic method — not object-safe
}
```

### Blanket Implementations

```rust
// Blanket impl: provide default behaviour for all types meeting a bound
pub trait ToJson {
    fn to_json(&self) -> Result<String, serde_json::Error>;
}

impl<T: Serialize> ToJson for T {
    fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string(self)
    }
}
```

### Extension Traits

```rust
// Extend external types with project-specific methods
pub trait ResultExt<T> {
    fn with_context(self, msg: &str) -> Result<T, {{ERROR_TYPE}}>;
}

impl<T, E: std::fmt::Display> ResultExt<T> for Result<T, E> {
    fn with_context(self, msg: &str) -> Result<T, {{ERROR_TYPE}}> {
        self.map_err(|e| {{ERROR_TYPE}}::Internal {
            message: format!("{msg}: {e}"),
        })
    }
}
```

**Checklist:**

- [ ] Traits that need dynamic dispatch are object-safe
- [ ] Traits include `Send + Sync` bounds for async contexts
- [ ] Blanket impls are used sparingly and documented
- [ ] Extension traits are in a dedicated module (e.g., `ext.rs`)

---

## 2.6 Derive Macro Standards

| Type Category | Standard Derives |
|---------------|-----------------|
| Database row types | `Debug, Clone, FromRow` |
| API response types | `Debug, Clone, Serialize, Deserialize` |
| API request types | `Debug, Deserialize, Serialize` |
| Internal domain types | `Debug, Clone` |
| Newtypes (IDs) | `Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize` |
| Enums (status) | `Debug, Clone, PartialEq, Eq, Serialize, Deserialize` |
| Error types | `Debug, thiserror::Error` |

```rust
// Example: derive order should be alphabetical
#[derive(Clone, Debug, Deserialize, Eq, Hash, PartialEq, Serialize)]
pub struct {{ENTITY_NAME}}Id(String);
```

**Checklist:**

- [ ] Derives are alphabetically ordered
- [ ] Only necessary derives are included (don't derive `Clone` if never cloned)
- [ ] `FromRow` only on types used with sqlx queries
- [ ] `Serialize`/`Deserialize` only on types crossing API boundaries

---

## 2.7 Enum vs Trait Object Decision

```text
Use Enum when:
├─ Variants are known at compile time
├─ You own all the types
├─ Pattern matching is needed
└─ Performance matters (no dynamic dispatch)

Use Trait Object (dyn Trait) when:
├─ Types are determined at runtime
├─ External code needs to add implementations
├─ Plugin-style extensibility is needed
└─ The set of implementations is open-ended
```

```rust
// Enum: closed set of known types
pub enum StorageBackend {
    Postgres(PgPool),
    InMemory(HashMap<String, Vec<u8>>),
}

// Trait object: open set, extensible
pub type DynStorage = Arc<dyn StorageBackend + Send + Sync>;
```

---

## Checklist

- [ ] Newtype pattern applied to all entity IDs
- [ ] Type aliases used only for readability
- [ ] Generic bounds follow inline vs where clause convention
- [ ] Lifetime annotations are minimal and descriptive
- [ ] Traits are designed for object safety when needed
- [ ] Derive macros follow the standard table
- [ ] Enum vs trait object decisions are documented

## Verification

```bash
cargo check
cargo clippy -- -D warnings
cargo test
```
