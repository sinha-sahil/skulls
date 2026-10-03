# File Organisation Templates - Quick Reference

## Template Variables Reference

Replace these placeholders when using templates:

### Core Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `{{PROJECT_NAME}}` | `my_api` | Project or crate name |
| `{{WORKSPACE_ROOT}}` | `.` | Workspace root directory |
| `{{CRATE_NAME}}` | `api_server` | Individual crate name |
| `{{SRC_ROOT}}` | `src/` | Source root directory |
| `{{BIN_NAME}}` | `server` | Binary target name |
| `{{LIB_MODULES}}` | `domain, infra, api` | Top-level library modules |
| `{{SERVICES_DIR}}` | `src/services/` | Services directory path |
| `{{MODULE_NAME}}` | `auth` | Module being organised |
| `{{PARENT_MODULE}}` | `crate::services` | Parent module path |
| `{{PUBLIC_TYPES}}` | `User, UserRole` | Types re-exported from module |

---

## Quick Decision Tree

```text
Project Structure Decision?
├─ How many binaries does the project need?
│  ├─ ONE → Single crate with src/main.rs + src/lib.rs
│  ├─ MULTIPLE → src/bin/ directory or workspace
│  └─ NONE (library only) → Single crate with src/lib.rs
│
├─ Should code be shared across crates?
│  ├─ YES → Workspace with shared crate
│  └─ NO  → Single crate is sufficient
│
├─ Module declaration style?
│  ├─ Few submodules → services.rs + services/ directory (modern)
│  └─ Many submodules → services/mod.rs (traditional, keeps directory clean)
│
├─ Where do types live?
│  ├─ Used by ONE module → Inside that module's types.rs
│  └─ Used by MANY modules → Shared types crate or top-level types module
│
├─ Where do tests live?
│  ├─ Unit tests → Inline #[cfg(test)] mod tests { }
│  ├─ Integration tests → tests/ directory at crate root
│  └─ Doc tests → Inside /// doc comments
│
└─ Feature flags needed?
   ├─ YES → Cargo.toml [features] section
   └─ NO  → Skip feature gating
```

---

## Common Rust Project Structures

### Pattern 1: Simple Binary with Library

```text
{{PROJECT_NAME}}/
├── Cargo.toml
├── src/
│   ├── main.rs          # Thin entry point
│   ├── lib.rs           # Library root, re-exports
│   ├── config.rs        # Configuration
│   ├── error.rs         # Error types
│   └── services/
│       ├── mod.rs
│       ├── {{MODULE_NAME}}/
│       │   ├── mod.rs
│       │   ├── handler.rs
│       │   ├── helpers.rs
│       │   ├── storage.rs
│       │   └── types.rs
│       └── ...
├── tests/               # Integration tests
│   └── api_tests.rs
└── migrations/          # Database migrations
    └── 001_init.sql
```

### Pattern 2: Workspace with Multiple Crates

```text
{{WORKSPACE_ROOT}}/
├── Cargo.toml           # [workspace] definition
├── crates/
│   ├── api/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── main.rs
│   │       ├── lib.rs
│   │       └── routes/
│   ├── core/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── domain/
│   │       └── error.rs
│   └── db/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs
│           └── migrations/
└── tests/               # Workspace-level integration tests
```

### Pattern 3: Multiple Binaries

```text
{{PROJECT_NAME}}/
├── Cargo.toml
├── src/
│   ├── lib.rs           # Shared code
│   ├── bin/
│   │   ├── server.rs    # Binary 1
│   │   ├── cli.rs       # Binary 2
│   │   └── worker.rs    # Binary 3
│   └── ...
└── tests/
```

### Pattern 4: Domain-Driven Layout

```text
{{PROJECT_NAME}}/
├── Cargo.toml
├── src/
│   ├── lib.rs
│   ├── domain/          # Business logic, pure Rust
│   │   ├── mod.rs
│   │   ├── models.rs
│   │   └── services.rs
│   ├── infra/           # External dependencies (DB, HTTP)
│   │   ├── mod.rs
│   │   ├── db.rs
│   │   └── http_client.rs
│   └── api/             # HTTP layer (handlers, routes)
│       ├── mod.rs
│       ├── handlers.rs
│       └── routes.rs
└── tests/
```

---

## Implementation Phases

| Phase | File | Description |
|-------|------|-------------|
| 01 | Assessment | Audit current file structure |
| 02 | Directory Structure | Define target layout |
| 03 | Module Boundaries | Define module responsibilities |
| 04 | Naming Conventions | Establish naming standards |
| 05 | Dependency Flow | Plan module dependency graph |
| 06 | Migration Plan | Execute restructuring |

---

## Checklist After Using Templates

- [ ] All `{{VARIABLES}}` replaced with actual values
- [ ] Current project structure audited
- [ ] Target directory structure defined and documented
- [ ] Module boundaries clearly defined with public API surface
- [ ] Naming conventions established and documented
- [ ] Dependency flow is acyclic (no circular deps)
- [ ] Migration plan is incremental (one module at a time)
- [ ] Each migration step verified with `cargo check`
- [ ] Git history preserved (used `git mv`)
- [ ] All imports updated after file moves
- [ ] `cargo check` passes
- [ ] `cargo clippy` passes with no warnings
- [ ] `cargo test` passes
- [ ] `cargo fmt --check` passes

---

## Module Visibility Quick Reference

| Visibility | Syntax | Accessible From |
|------------|--------|-----------------|
| Private | (default) | Same module only |
| Crate-public | `pub(crate)` | Anywhere in the crate |
| Super-public | `pub(super)` | Parent module |
| Public | `pub` | External consumers |

### Rule of Thumb

```text
Start with most restrictive → loosen as needed
private → pub(super) → pub(crate) → pub
```

---

## Common Re-export Patterns

### In `lib.rs`

```rust
pub mod domain;
pub mod infra;
pub mod api;

// Re-export commonly used types
pub use domain::models::{{PUBLIC_TYPES}};
pub use error::{{ERROR_TYPE}};
```

### In module `mod.rs`

```rust
mod handler;
mod helpers;
mod storage;
pub mod types;

pub use handler::*;
// Keep storage and helpers private to module
```

---

## Getting Help

- See `templates/file-organisation/README.md` for detailed guide
- Check the Project Configuration section in README.md for placeholder values
