# Refactoring Plan Templates - Quick Reference

## Template Variables Reference

Replace these placeholders when using templates:

### Core Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `{{PROJECT_NAME}}` | `my_api` | Project or crate name |
| `{{MODULE_NAME}}` | `auth` | Module being refactored |
| `{{TARGET_MODULE}}` | `authentication` | Target module after refactor |
| `{{REFACTOR_SCOPE}}` | `error handling` | Scope of the refactoring |
| `{{ERROR_TYPE}}` | `AppError` | Error enum type |
| `{{ERROR_MODULE}}` | `crate::error` | Path to error module |
| `{{STATE_TYPE}}` | `AppState` | Application state type |
| `{{TRAIT_NAME}}` | `Repository` | Trait being introduced |
| `{{OLD_PATTERN}}` | `unwrap()` | Current pattern to replace |
| `{{NEW_PATTERN}}` | `?` operator | Target pattern |
| `{{AFFECTED_FILES}}` | `handler.rs, helpers.rs` | Files impacted by refactor |
| `{{BRANCH_NAME}}` | `refactor/error-handling` | Git branch for refactoring |

---

## Quick Decision Tree

```text
What needs refactoring?
├─ Error Handling
│  ├─ unwrap() everywhere → Replace with ? and custom error types
│  ├─ String errors → Introduce thiserror enum
│  └─ Inconsistent patterns → Standardise on Result<T, {{ERROR_TYPE}}>
│
├─ Module Structure
│  ├─ God module (>500 lines) → Split into submodules
│  ├─ Circular dependencies → Introduce trait abstraction
│  └─ Unclear boundaries → Re-draw module responsibilities
│
├─ Type System
│  ├─ String-typed IDs → Introduce newtype wrappers
│  ├─ Large enums → Split by domain
│  └─ Missing abstractions → Extract traits
│
├─ Code Duplication
│  ├─ Copy-pasted logic → Extract shared functions
│  ├─ Similar structs → Use generics or trait
│  └─ Repeated patterns → Create macros (sparingly)
│
├─ Async Code
│  ├─ Blocking in async → Move to spawn_blocking
│  ├─ Missing timeouts → Add tokio::time::timeout
│  └─ Unnecessary clones → Use Arc or references
│
└─ Performance
   ├─ Excessive allocations → Use &str, slices, Cow
   ├─ N+1 queries → Batch with WHERE IN
   └─ Missing indexes → Add database indexes
```

---

## Common Rust Refactoring Patterns

### Pattern 1: Replace unwrap() with Error Propagation

**Before:**

```rust
let value = some_operation().unwrap();
let parsed = json.parse::<MyType>().unwrap();
```

**After:**

```rust
let value = some_operation().map_err(|e| {{ERROR_TYPE}}::Internal {
    message: format!("Operation failed: {e}"),
})?;
let parsed = json.parse::<MyType>().map_err(|e| {{ERROR_TYPE}}::BadRequest {
    message: format!("Invalid JSON: {e}"),
})?;
```

### Pattern 2: Extract Trait for Testability

**Before:**

```rust
pub async fn create_user(pool: &PgPool, req: &CreateUserReq) -> Result<User, {{ERROR_TYPE}}> {
    sqlx::query_as("INSERT INTO users ...").fetch_one(pool).await?
}
```

**After:**

```rust
#[async_trait]
pub trait UserRepository {
    async fn create(&self, req: &CreateUserReq) -> Result<User, {{ERROR_TYPE}}>;
}

pub struct PgUserRepository { pool: PgPool }

#[async_trait]
impl UserRepository for PgUserRepository {
    async fn create(&self, req: &CreateUserReq) -> Result<User, {{ERROR_TYPE}}> {
        sqlx::query_as("INSERT INTO users ...").fetch_one(&self.pool).await?
    }
}
```

### Pattern 3: Introduce Newtype Wrapper

**Before:**

```rust
pub async fn get_user(pool: &PgPool, user_id: &str) -> Result<User, {{ERROR_TYPE}}> { ... }
pub async fn get_order(pool: &PgPool, order_id: &str) -> Result<Order, {{ERROR_TYPE}}> { ... }
// Easy to accidentally pass order_id where user_id is expected
```

**After:**

```rust
pub struct UserId(String);
pub struct OrderId(String);

pub async fn get_user(pool: &PgPool, user_id: &UserId) -> Result<User, {{ERROR_TYPE}}> { ... }
pub async fn get_order(pool: &PgPool, order_id: &OrderId) -> Result<Order, {{ERROR_TYPE}}> { ... }
// Compiler prevents mixing up IDs
```

### Pattern 4: Split Large Module

**Before:**

```text
services/orders.rs  (800+ lines with handlers, helpers, storage, types)
```

**After:**

```text
services/orders/
├── mod.rs       (router + re-exports)
├── handler.rs   (HTTP handlers)
├── helpers.rs   (business logic)
├── storage.rs   (database queries)
└── types.rs     (type definitions)
```

### Pattern 5: Consolidate Error Types

**Before:**

```rust
// Scattered across modules
fn handler() -> Result<Json<Resp>, StatusCode> { ... }
fn helper() -> Result<Data, String> { ... }
fn storage() -> Result<Row, sqlx::Error> { ... }
```

**After:**

```rust
// Centralised error type
fn handler() -> Result<Json<Resp>, {{ERROR_TYPE}}> { ... }
fn helper() -> Result<Data, {{ERROR_TYPE}}> { ... }
fn storage() -> Result<Row, {{ERROR_TYPE}}> { ... }
```

---

## Implementation Phases

| Phase | File | Description |
|-------|------|-------------|
| 01 | Assessment | Audit code quality, catalog debt |
| 02 | Goals | Define measurable objectives |
| 03 | Impact Analysis | Map affected files, dependencies |
| 04 | Strategy | Choose refactoring patterns |
| 05 | Execution Plan | Ordered steps with verification |
| 06 | Testing Strategy | Test coverage plan |
| 07 | Rollback Plan | Safety net for reverting |

---

## Checklist After Using Templates

- [ ] All `{{VARIABLES}}` replaced with actual values
- [ ] Code audit completed with specific findings
- [ ] Measurable goals defined (e.g., zero unwrap(), zero clippy warnings)
- [ ] All affected files identified
- [ ] Public API changes documented
- [ ] Refactoring strategy chosen with rationale
- [ ] Execution steps are ordered and each compiles independently
- [ ] Tests exist for current behaviour before changes
- [ ] Rollback plan documented
- [ ] `cargo check` passes after every step
- [ ] `cargo clippy` passes with no warnings
- [ ] `cargo test` passes
- [ ] `cargo fmt --check` passes
- [ ] Git branch strategy followed

---

## Useful Audit Commands

```bash
# Count unwrap() usage
rg "\.unwrap\(\)" --type rust -c

# Count expect() usage
rg "\.expect\(" --type rust -c

# Find large files (likely need splitting)
find src -name "*.rs" -exec wc -l {} + | sort -rn | head -20

# Check clippy warnings count
cargo clippy 2>&1 | grep "warning" | wc -l

# Find TODO/FIXME comments
rg "TODO|FIXME|HACK|XXX" --type rust

# Check test coverage (requires cargo-tarpaulin)
cargo tarpaulin --out html
```

---

## Getting Help

- See `templates/refactoring-plan/README.md` for detailed guide
- Check the Project Configuration section in README.md for placeholder values
