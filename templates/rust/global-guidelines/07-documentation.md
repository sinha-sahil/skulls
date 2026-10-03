# Phase 7: Documentation

**Dependencies:** All previous phases (documents conventions established in Phases 1-6)

**Can be implemented in parallel with:** Phase 6 (Security)

## Overview

Define documentation standards for `{{PROJECT_NAME}}`. Good documentation makes the codebase accessible to new contributors, serves as a reference for the team, and enables `cargo doc` to generate useful API documentation.

---

## 7.1 Doc Comment Standards

### Item-Level Documentation (`///`)

Use `///` for documenting public items (functions, structs, enums, traits, constants):

```rust
/// Retrieves a {{ENTITY_NAME}} by its unique identifier.
///
/// Queries the `{{TABLE_NAME}}` table and returns the matching entity.
/// Returns `NotFound` if no entity exists with the given ID.
///
/// # Arguments
///
/// * `pool` - Database connection pool
/// * `id` - The unique identifier of the {{ENTITY_NAME}}
///
/// # Errors
///
/// Returns [`{{ERROR_TYPE}}::NotFound`] if no entity matches the ID.
/// Returns [`{{ERROR_TYPE}}::Database`] if the query fails.
///
/// # Examples
///
/// ```no_run
/// # use {{PROJECT_NAME}}::{{MODULE_NAME}}::storage;
/// # async fn example(pool: &sqlx::PgPool) -> Result<(), Box<dyn std::error::Error>> {
/// let entity = storage::get_by_id(pool, "abc-123").await?;
/// println!("Found: {}", entity.name);
/// # Ok(())
/// # }
/// ```
pub async fn get_by_id(pool: &PgPool, id: &str) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
    // ...
}
```

### Module-Level Documentation (`//!`)

Use `//!` at the top of a file to document the module:

```rust
//! # {{MODULE_NAME}} Storage Layer
//!
//! This module contains all database operations for the {{MODULE_NAME}} service.
//! All PostgreSQL queries are defined here — handlers and helpers call these
//! functions rather than executing queries directly.
//!
//! ## Query Naming Convention
//!
//! - `insert_*` — INSERT operations
//! - `get_*` — SELECT single row
//! - `list_*` — SELECT multiple rows
//! - `update_*` — UPDATE operations
//! - `delete_*` — DELETE operations
//!
//! ## Error Handling
//!
//! All functions return `Result<T, {{ERROR_TYPE}}>`. Database errors are
//! converted to `{{ERROR_TYPE}}::Database` with a descriptive message.

use sqlx::PgPool;
use super::types::*;
use {{ERROR_MODULE}}::{{ERROR_TYPE}};
```

**Checklist:**

- [ ] All `pub` items have `///` doc comments
- [ ] All modules have `//!` module-level documentation
- [ ] Doc comments describe WHAT and WHY, not HOW
- [ ] First line is a concise summary (used by `cargo doc` in listings)

---

## 7.2 When to Document

### Always Document (Public API)

```rust
/// The application-wide error type.
///
/// All fallible functions in the project return this error type.
/// Each variant maps to a specific HTTP status code via the
/// `IntoResponse` implementation.
#[derive(Debug, thiserror::Error)]
pub enum {{ERROR_TYPE}} {
    /// Database query or connection failure (500 Internal Server Error).
    #[error("Database error: {message}")]
    Database { message: String },

    /// Requested resource does not exist (404 Not Found).
    #[error("Not found: {message}")]
    NotFound { message: String },
}
```

### Document If Non-Obvious (Private Code)

```rust
// Good: explains non-obvious business rule
/// Price is stored in cents to avoid floating-point precision issues.
/// Divide by 100 to get the display value.
fn format_price(cents: i64) -> String {
    format!("{:.2}", cents as f64 / 100.0)
}

// Not needed: implementation is self-explanatory
fn is_empty(s: &str) -> bool {
    s.trim().is_empty()
}
```

### Skip Documentation When

- The function name fully describes its behaviour (`fn is_active(&self) -> bool`)
- It's a trivial getter/setter
- It's a test function (test name should be descriptive enough)
- It's a private helper that's only called from one place and the call site is documented

---

## 7.3 Examples in Doc Comments

Examples serve as both documentation and tests (they're compiled and run by `cargo test`):

```rust
/// Parses a comma-separated list of tags into a vector.
///
/// Trims whitespace from each tag and filters out empty entries.
///
/// # Examples
///
/// ```
/// use {{PROJECT_NAME}}::helpers::parse_tags;
///
/// let tags = parse_tags("rust, web, api");
/// assert_eq!(tags, vec!["rust", "web", "api"]);
/// ```
///
/// Empty input returns an empty vector:
///
/// ```
/// use {{PROJECT_NAME}}::helpers::parse_tags;
///
/// let tags = parse_tags("");
/// assert!(tags.is_empty());
/// ```
pub fn parse_tags(input: &str) -> Vec<String> {
    input
        .split(',')
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect()
}
```

### Doc Test Annotations

```rust
/// # Examples
///
/// ```no_run
/// // Compiles but doesn't run (useful for network/DB examples)
/// ```
///
/// ```ignore
/// // Not compiled at all (use sparingly, prefer no_run)
/// ```
///
/// ```should_panic
/// // Expected to panic
/// ```
///
/// ```
/// # // Lines starting with # are hidden from docs but still compiled
/// # use {{PROJECT_NAME}}::types::*;
/// let entity = {{ENTITY_NAME}} { id: "test".into() };
/// assert_eq!(entity.id, "test");
/// ```
```

**Checklist:**

- [ ] All public functions with non-trivial logic have at least one example
- [ ] Examples are compilable (verified by `cargo test --doc`)
- [ ] Hidden setup code uses `#` prefix
- [ ] Network/DB examples use `no_run`

---

## 7.4 Struct and Enum Documentation

```rust
/// Configuration for the {{PROJECT_NAME}} application.
///
/// Loaded from environment variables at startup. All fields are required
/// unless marked as `Option`.
#[derive(Debug, Clone)]
pub struct Config {
    /// Base URL for the API server (e.g., `https://api.example.com`).
    pub base_url: String,

    /// Maximum number of concurrent database connections.
    /// Defaults to 20 if not specified.
    pub max_db_connections: u32,

    /// Feature flag to enable experimental endpoints.
    pub enable_experimental: bool,
}

/// Status of an {{ENTITY_NAME}} in the system.
///
/// Transitions follow this state machine:
///
/// ```text
/// Pending → Active → Completed
///              ↓
///          Cancelled
/// ```
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum {{ENTITY_NAME}}Status {
    /// Initial state after creation. Awaiting processing.
    Pending,

    /// Currently being processed or in use.
    Active,

    /// Successfully finished all processing.
    Completed,

    /// Manually cancelled by user or system.
    Cancelled,
}
```

---

## 7.5 Rustdoc Conventions

### Linking to Other Items

```rust
/// Creates a new [`{{ENTITY_NAME}}`] and stores it in the database.
///
/// Uses [`storage::insert`] for persistence and validates input
/// with [`validate_{{ENTITY_NAME_LOWER}}`].
///
/// See [`{{ERROR_TYPE}}`] for possible error conditions.
pub async fn create(/* ... */) { }
```

### Section Headers

Use these standard section headers in doc comments:

```rust
/// Brief summary line.
///
/// Longer description if needed.
///
/// # Arguments
///
/// * `param1` - Description of the first parameter
/// * `param2` - Description of the second parameter
///
/// # Returns
///
/// Description of the return value.
///
/// # Errors
///
/// Describe each error condition.
///
/// # Panics
///
/// Describe panic conditions (if any — prefer returning errors).
///
/// # Safety
///
/// Required for unsafe functions — explain invariants.
///
/// # Examples
///
/// ```
/// // Example code
/// ```
```

### Generate and Review Documentation

```bash
# Generate docs and open in browser
cargo doc --open --no-deps

# Generate docs for the entire workspace
cargo doc --workspace --no-deps

# Check for broken doc links
RUSTDOCFLAGS="-D warnings" cargo doc --no-deps
```

**Checklist:**

- [ ] Intra-doc links use [`Type`] syntax
- [ ] Standard section headers used consistently
- [ ] `cargo doc --no-deps` generates without warnings
- [ ] Broken links caught by `RUSTDOCFLAGS="-D warnings"`

---

## 7.6 CHANGELOG Maintenance

Maintain a `CHANGELOG.md` at the project root:

```markdown
# Changelog

All notable changes to {{PROJECT_NAME}} are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- New feature description

### Changed
- Modified behaviour description

### Fixed
- Bug fix description

### Removed
- Removed feature description

## [0.1.0] - 2024-01-15

### Added
- Initial release with core CRUD operations
- Authentication middleware
- Error handling framework
```

**Categories:** Added, Changed, Deprecated, Removed, Fixed, Security

**Checklist:**

- [ ] CHANGELOG.md exists at project root
- [ ] Every PR updates the `[Unreleased]` section
- [ ] Entries are categorised correctly
- [ ] Entries are user-facing (not internal implementation details)

---

## Checklist

- [ ] All `pub` items have `///` doc comments
- [ ] All modules have `//!` module-level docs
- [ ] Examples compile and run via `cargo test --doc`
- [ ] Intra-doc links used for cross-references
- [ ] Standard section headers applied consistently
- [ ] `cargo doc` generates without warnings
- [ ] CHANGELOG.md maintained
- [ ] Private code documented when non-obvious

## Verification

```bash
cargo test --doc
cargo doc --no-deps
RUSTDOCFLAGS="-D warnings" cargo doc --no-deps
```
