# Phase 4: Naming Conventions

**Dependencies:** Phase 1 (Assessment)

**Can be implemented in parallel with:** Phase 3, Phase 5

## Overview

Establish consistent naming conventions for files, modules, types, and tests in the Rust project. Rust has strong community conventions (enforced by `rustfmt` and `clippy`) but projects need to standardise beyond what tooling enforces.

---

## 4.1 File Naming

All Rust source files use `snake_case`:

```text
CORRECT:
  user_service.rs
  order_handler.rs
  auth_middleware.rs
  db_pool.rs

INCORRECT:
  UserService.rs
  orderHandler.rs
  auth-middleware.rs
  DBPool.rs
```

### Standard File Names by Role

| Role | File Name | Example |
|------|-----------|---------|
| Module router / entry | `mod.rs` | `services/{{MODULE_NAME}}/mod.rs` |
| HTTP handlers | `handler.rs` | `services/{{MODULE_NAME}}/handler.rs` |
| Business logic | `helpers.rs` | `services/{{MODULE_NAME}}/helpers.rs` |
| Database operations | `storage.rs` | `services/{{MODULE_NAME}}/storage.rs` |
| Type definitions | `types.rs` | `services/{{MODULE_NAME}}/types.rs` |
| Module-specific middleware | `middleware.rs` | `services/{{MODULE_NAME}}/middleware.rs` |
| External API calls | `remote.rs` | `services/{{MODULE_NAME}}/remote.rs` |
| Scheduled tasks | `scheduler.rs` | `services/{{MODULE_NAME}}/scheduler.rs` |
| Error definitions | `error.rs` | `src/error.rs` |
| Configuration | `config.rs` | `src/config.rs` |
| Application state | `state.rs` | `src/state.rs` |

## 4.2 Module Naming

Modules follow `snake_case` and should be **nouns** (not verbs):

```rust
// CORRECT - nouns describing the domain
pub mod users;
pub mod orders;
pub mod authentication;
pub mod payments;
pub mod notifications;

// INCORRECT - verbs or unclear
pub mod process_orders;  // verb
pub mod auth;             // abbreviation (acceptable if consistently used)
pub mod utils;            // too vague
pub mod misc;             // meaningless
```

### Abbreviation Policy

Choose one policy and apply it consistently:

```text
Option A (No abbreviations):
  authentication, configuration, notification

Option B (Common abbreviations allowed):
  auth, config, notif

Document which abbreviations are acceptable for {{PROJECT_NAME}}:
  auth  → authentication
  config → configuration
  db    → database
  req   → request
  resp  → response
```

## 4.3 Test File Placement

### Unit Tests (always inline)

```rust
// Inside the file being tested (e.g., helpers.rs)
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn creates_entity_with_valid_input() {
        // ...
    }

    #[tokio::test]
    async fn returns_error_for_missing_field() {
        // ...
    }
}
```

### Integration Tests

```text
tests/
├── common/
│   └── mod.rs             # Shared test utilities, fixtures, setup
├── api_tests.rs           # End-to-end API tests
├── {{MODULE_NAME}}_tests.rs  # Module-specific integration tests
└── health_check.rs        # Health check tests
```

```rust
// tests/common/mod.rs
use {{PROJECT_NAME}}::state::{{STATE_TYPE}};

pub async fn setup_test_app() -> {{STATE_TYPE}} {
    // Create test database, configure app state
    todo!()
}
```

### Doc Tests

```rust
/// Creates a new user with the given name.
///
/// # Examples
///
/// ```
/// use {{PROJECT_NAME}}::services::users::types::User;
///
/// let user = User::new("alice");
/// assert_eq!(user.name, "alice");
/// ```
pub fn new(name: &str) -> Self {
    // ...
}
```

## 4.4 Test Naming Conventions

Test function names should describe the **behaviour**, not the implementation:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    // CORRECT - describes behaviour
    #[test]
    fn returns_error_when_name_is_empty() { }

    #[test]
    fn creates_user_with_default_role() { }

    #[tokio::test]
    async fn fetches_paginated_results_with_correct_count() { }

    // INCORRECT - describes implementation
    #[test]
    fn test_validate() { }

    #[test]
    fn test_create_user() { }
}
```

## 4.5 Benchmark Placement

```text
benches/
├── benchmarks.rs          # Single benchmark file (small projects)
├── storage_bench.rs       # Per-module benchmarks (larger projects)
└── handler_bench.rs
```

```rust
// benches/storage_bench.rs
use criterion::{criterion_group, criterion_main, Criterion};

fn storage_benchmark(c: &mut Criterion) {
    c.bench_function("insert_{{MODULE_NAME}}", |b| {
        b.iter(|| {
            // benchmark code
        })
    });
}

criterion_group!(benches, storage_benchmark);
criterion_main!(benches);
```

## 4.6 Example Placement

```text
examples/
├── basic_usage.rs         # Simple usage example
├── advanced_config.rs     # Complex configuration example
└── migration.rs           # Database migration example
```

```rust
// examples/basic_usage.rs
//! Demonstrates basic usage of the {{PROJECT_NAME}} library.

use {{PROJECT_NAME}}::config;

fn main() {
    let config = config::load();
    println!("Loaded config for: {}", config.app_name);
}
```

## 4.7 Configuration Files

```text
{{PROJECT_NAME}}/
├── Cargo.toml              # Package manifest
├── Cargo.lock              # Dependency lock file (commit for binaries)
├── rustfmt.toml            # Formatter configuration
├── clippy.toml             # Clippy configuration (optional)
├── .cargo/
│   └── config.toml         # Cargo configuration
├── .env.example            # Environment variable template
└── deny.toml               # cargo-deny configuration (optional)
```

---

## Checklist

- [ ] All source files follow `snake_case` naming
- [ ] Standard file names established for each role (handler, storage, etc.)
- [ ] Module naming convention documented (nouns, abbreviation policy)
- [ ] Test placement strategy defined (inline unit, tests/ integration)
- [ ] Test naming convention documented (behaviour-driven names)
- [ ] Benchmark placement defined (benches/ directory)
- [ ] Example placement defined (examples/ directory)
- [ ] Configuration file locations documented
- [ ] All existing files renamed to match conventions (if migrating)

## Verification

```bash
cargo check
cargo fmt --check
cargo clippy
cargo test
```

Verify no file naming violations exist after establishing conventions.
