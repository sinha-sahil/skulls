# Global Guidelines Templates - Quick Reference

## Template Variables Reference

Replace these placeholders when using templates:

### Core Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `{{PROJECT_NAME}}` | `my_api` | Project or crate name |
| `{{ERROR_TYPE}}` | `AppError` | Project error enum type |
| `{{ERROR_MODULE}}` | `crate::error` | Path to error module |
| `{{STATE_TYPE}}` | `AppState` | Application state type |
| `{{LOG_CRATE}}` | `tracing` | Logging crate used |
| `{{DB_CRATE}}` | `sqlx` | Database crate used |
| `{{HTTP_CRATE}}` | `axum` | HTTP framework crate |
| `{{ASYNC_RUNTIME}}` | `tokio` | Async runtime |
| `{{MAX_LINE_LENGTH}}` | `100` | Maximum line length |
| `{{MIN_TEST_COVERAGE}}` | `80%` | Minimum test coverage |
| `{{MSRV}}` | `1.75.0` | Minimum supported Rust version |

---

## Naming Conventions at a Glance

| Item | Convention | Example |
|------|-----------|---------|
| Types / Structs / Enums | `PascalCase` | `UserProfile`, `OrderStatus` |
| Functions / Methods | `snake_case` | `get_user_by_id`, `process_order` |
| Local variables | `snake_case` | `user_name`, `order_count` |
| Constants | `SCREAMING_SNAKE` | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| Static variables | `SCREAMING_SNAKE` | `GLOBAL_CONFIG` |
| Modules / Files | `snake_case` | `user_service.rs`, `order_handler` |
| Traits | `PascalCase` (adjective/noun) | `Serializable`, `Repository` |
| Type parameters | Single uppercase or `PascalCase` | `T`, `E`, `Item` |
| Lifetimes | Short lowercase | `'a`, `'ctx`, `'conn` |
| Crate names | `kebab-case` in Cargo.toml | `my-api-server` |
| Feature flags | `kebab-case` | `full-logging`, `test-utils` |

---

## Must / Must-Not Rules

### MUST

- Use `cargo fmt` before every commit
- Use `cargo clippy` with zero warnings
- Return `Result<T, {{ERROR_TYPE}}>` from fallible functions
- Use `?` operator for error propagation
- Write doc comments (`///`) for all public items
- Use `#[cfg(test)]` for unit test modules
- Use parameterised queries (never string interpolation for SQL)
- Run `cargo audit` in CI

### MUST NOT

- Use `unwrap()` or `expect()` in production code (only in tests)
- Use `unsafe` without a `// SAFETY:` comment and team review
- Commit code with `todo!()` or `unimplemented!()` to main branch
- Use `println!()` for logging (use `{{LOG_CRATE}}` instead)
- Store secrets in code or version control
- Use `String` when `&str` suffices
- Block the async runtime (no `std::thread::sleep` in async context)

---

## Common Patterns Quick Reference

### Error Handling

```rust
// Define with thiserror
#[derive(Debug, thiserror::Error)]
pub enum {{ERROR_TYPE}} {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Not found: {message}")]
    NotFound { message: String },
    #[error("Bad request: {message}")]
    BadRequest { message: String },
}

// Propagate with ?
let user = get_user(pool, &id).await?;

// Add context
let data = fetch_data()
    .map_err(|e| {{ERROR_TYPE}}::Internal {
        message: format!("Failed to fetch data: {e}"),
    })?;
```

### Type Design

```rust
// Newtype for type safety
pub struct UserId(String);
pub struct Email(String);

// Builder pattern for complex construction
pub struct Config { /* ... */ }
pub struct ConfigBuilder { /* ... */ }

// Enum over boolean for clarity
pub enum Visibility { Public, Private }
// Instead of: pub is_public: bool
```

### Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_function_name_describes_behaviour() {
        // Arrange
        let input = create_test_input();
        // Act
        let result = function_under_test(input);
        // Assert
        assert_eq!(result, expected_value);
    }

    #[tokio::test]
    async fn test_async_operation() {
        // ...
    }
}
```

---

## Implementation Phases

| Phase | File | Description |
|-------|------|-------------|
| 01 | Code Style | Formatting, naming, imports |
| 02 | Type System | Type design, traits, generics |
| 03 | Error Handling | Error types and propagation |
| 04 | Testing | Test organisation and coverage |
| 05 | Performance | Allocation, async, benchmarks |
| 06 | Security | Validation, secrets, auditing |
| 07 | Documentation | Doc comments and project docs |

---

## Checklist After Using Templates

- [ ] All `{{VARIABLES}}` replaced with actual values
- [ ] `rustfmt.toml` configured and committed
- [ ] Clippy configuration documented
- [ ] Naming conventions documented and consistent
- [ ] Error type hierarchy defined
- [ ] Test structure established (unit, integration, doc tests)
- [ ] Performance-sensitive patterns identified
- [ ] Security requirements documented
- [ ] Doc comment standards established with examples
- [ ] CI pipeline enforces all guidelines
- [ ] `cargo check` passes
- [ ] `cargo clippy` passes with no warnings
- [ ] `cargo test` passes
- [ ] `cargo fmt --check` passes

---

## Import Ordering Convention

```rust
// 1. Standard library
use std::collections::HashMap;
use std::sync::Arc;

// 2. External crates
use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

// 3. Crate-level imports
use crate::error::{{ERROR_TYPE}};
use crate::{{STATE_TYPE}};

// 4. Module-level imports
use super::types::{Request, Response};
```

---

## Getting Help

- See `templates/global-guidelines/README.md` for detailed guide
- Check the Project Configuration section in README.md for placeholder values
