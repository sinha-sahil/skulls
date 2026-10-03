# Phase 2: Directory Structure

**Dependencies:** Phase 1 (Assessment)

**Can be implemented in parallel with:** Phase 3, Phase 4, Phase 5

## Overview

Define the target directory layout for the Rust project. Decide between single crate vs workspace, choose module declaration style, and establish the directory hierarchy.

---

## 2.1 Crate Structure Decision

### Single Crate (recommended for most projects)

```toml
# Cargo.toml
[package]
name = "{{PROJECT_NAME}}"
version = "0.1.0"
edition = "2021"

[[bin]]
name = "{{BIN_NAME}}"
path = "src/main.rs"

[lib]
name = "{{PROJECT_NAME}}"
path = "src/lib.rs"
```

### Workspace (for large projects with reusable components)

```toml
# Cargo.toml (workspace root)
[workspace]
resolver = "2"
members = [
    "crates/{{CRATE_NAME}}-api",
    "crates/{{CRATE_NAME}}-core",
    "crates/{{CRATE_NAME}}-db",
]

[workspace.dependencies]
# Shared dependencies across crates
serde = { version = "1", features = ["derive"] }
tokio = { version = "1", features = ["full"] }
sqlx = { version = "0.7", features = ["runtime-tokio", "postgres"] }
```

### Decision Criteria

```text
Use SINGLE CRATE when:
  - Project has one main binary
  - Code is not reused by other projects
  - Team is small (1-3 developers)
  - Compilation time is acceptable

Use WORKSPACE when:
  - Multiple binaries share significant code
  - Core logic should be reusable as a library
  - Team is large and needs independent crate compilation
  - Clear domain boundaries exist between components
```

## 2.2 Target Directory Layout

### For Single Crate with Service Modules

```text
{{PROJECT_NAME}}/
├── Cargo.toml
├── rustfmt.toml               # Formatting configuration
├── .cargo/
│   └── config.toml            # Cargo configuration
├── src/
│   ├── main.rs                # Entry point (thin)
│   ├── lib.rs                 # Library root, re-exports
│   ├── config.rs              # Environment and app configuration
│   ├── error.rs               # Error type definitions
│   ├── state.rs               # Application state ({{STATE_TYPE}})
│   ├── middleware/             # Shared middleware
│   │   ├── mod.rs
│   │   ├── auth.rs
│   │   └── logging.rs
│   ├── services/              # Feature modules
│   │   ├── mod.rs             # Service router aggregation
│   │   ├── {{MODULE_NAME}}/
│   │   │   ├── mod.rs         # Module router + re-exports
│   │   │   ├── handler.rs     # HTTP request handlers
│   │   │   ├── helpers.rs     # Business logic
│   │   │   ├── storage.rs     # Database operations
│   │   │   └── types.rs       # Module-specific types
│   │   └── ...
│   └── shared/                # Shared utilities
│       ├── mod.rs
│       ├── pagination.rs
│       └── validation.rs
├── tests/                     # Integration tests
│   ├── common/
│   │   └── mod.rs             # Shared test utilities
│   └── api_tests.rs
├── migrations/                # Database migrations
│   └── 001_init.sql
├── benches/                   # Benchmarks (optional)
│   └── benchmarks.rs
└── examples/                  # Example programs (optional)
    └── basic_usage.rs
```

### For Workspace

```text
{{WORKSPACE_ROOT}}/
├── Cargo.toml                 # Workspace definition
├── rustfmt.toml               # Shared formatting
├── crates/
│   ├── {{CRATE_NAME}}-api/    # HTTP layer
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── main.rs
│   │       ├── lib.rs
│   │       ├── routes.rs
│   │       └── handlers/
│   ├── {{CRATE_NAME}}-core/   # Business logic (no framework deps)
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── domain/
│   │       ├── error.rs
│   │       └── traits.rs
│   └── {{CRATE_NAME}}-db/     # Database layer
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs
│           ├── models.rs
│           ├── queries.rs
│           └── migrations.rs
└── tests/                     # Workspace-level integration tests
```

## 2.3 `main.rs` Pattern (Thin Entry Point)

```rust
use {{PROJECT_NAME}}::config;
use {{PROJECT_NAME}}::state::{{STATE_TYPE}};

#[tokio::main]
async fn main() {
    // Initialise tracing/logging
    tracing_subscriber::init();

    // Load configuration
    let config = config::load();

    // Build application state
    let state = {{STATE_TYPE}}::new(config).await;

    // Build router
    let app = {{PROJECT_NAME}}::routes::build_router(state);

    // Start server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

## 2.4 `lib.rs` Pattern (Library Root)

```rust
pub mod config;
pub mod error;
pub mod middleware;
pub mod routes;
pub mod services;
pub mod shared;
pub mod state;

// Re-export commonly used types
pub use error::{{ERROR_TYPE}};
pub use state::{{STATE_TYPE}};
```

## 2.5 Feature Flags

Define optional features in `Cargo.toml` to conditionally include modules:

```toml
[features]
default = []
scheduler = ["tokio-cron-scheduler"]
metrics = ["prometheus"]
test-utils = []
```

```rust
// In lib.rs
#[cfg(feature = "scheduler")]
pub mod scheduler;

#[cfg(feature = "metrics")]
pub mod metrics;
```

## 2.6 Multiple Binaries

If the project needs multiple entry points:

```text
src/
├── lib.rs           # Shared library code
├── bin/
│   ├── server.rs    # API server binary
│   ├── worker.rs    # Background worker binary
│   └── migrate.rs   # Database migration binary
└── ...
```

```toml
# Cargo.toml
[[bin]]
name = "{{BIN_NAME}}-server"
path = "src/bin/server.rs"

[[bin]]
name = "{{BIN_NAME}}-worker"
path = "src/bin/worker.rs"
```

---

## Checklist

- [ ] Decided: single crate or workspace
- [ ] Defined target directory layout with all expected files
- [ ] Established `main.rs` as thin entry point
- [ ] Defined `lib.rs` with module declarations and re-exports
- [ ] Listed feature flags if applicable
- [ ] Documented binary targets if multiple
- [ ] Target layout addresses all pain points from Phase 1
- [ ] Target layout supports planned future growth

## Verification

```bash
cargo check
cargo clippy
```

If creating a new project or workspace, verify the skeleton compiles before adding module content.
