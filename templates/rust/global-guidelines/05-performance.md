# Phase 5: Performance

**Dependencies:** Phase 2 (Type System), Phase 3 (Error Handling)

**Can be implemented in parallel with:** Phase 4 (Testing), Phase 6 (Security)

## Overview

Define performance-aware coding patterns for `{{PROJECT_NAME}}`. Rust provides zero-cost abstractions, but certain patterns can introduce unnecessary overhead. These guidelines focus on allocation awareness, async correctness, database optimization, and measurement.

---

## 5.1 Allocation Awareness

### String vs &str

```rust
// Prefer &str for read-only parameters
pub fn validate_email(email: &str) -> Result<(), {{ERROR_TYPE}}> {
    if !email.contains('@') {
        return Err({{ERROR_TYPE}}::BadRequest {
            message: format!("Invalid email: {email}"),
        });
    }
    Ok(())
}

// Use String when ownership is needed
pub struct {{ENTITY_NAME}} {
    pub id: String,         // Owned: stored in struct
    pub name: String,       // Owned: stored in struct
}

// Use &str in function parameters when you only need to read
pub async fn get_by_id(pool: &PgPool, id: &str) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
    // id is borrowed, no allocation
    sqlx::query_as("SELECT * FROM {{TABLE_NAME}} WHERE id = $1")
        .bind(id)
        .fetch_one(pool)
        .await
        .map_err(|e| {{ERROR_TYPE}}::Database {
            message: format!("Query failed: {e}"),
        })
}
```

### Vec vs &[T]

```rust
// Prefer slices for read-only access
pub fn total_price(items: &[LineItem]) -> Cents {
    items.iter().map(|item| item.price.0 * item.quantity).sum::<u64>().into()
}

// Use Vec when you need to build or own the collection
pub async fn get_all(pool: &PgPool) -> Result<Vec<{{ENTITY_NAME}}>, {{ERROR_TYPE}}> {
    // Vec is returned, ownership transfers to caller
    sqlx::query_as("SELECT * FROM {{TABLE_NAME}}")
        .fetch_all(pool)
        .await
        .map_err(|e| {{ERROR_TYPE}}::Database {
            message: format!("Query failed: {e}"),
        })
}
```

### Cow for Conditional Ownership

```rust
use std::borrow::Cow;

/// Normalise a name — only allocates if transformation is needed.
pub fn normalise_name(name: &str) -> Cow<'_, str> {
    if name.contains(char::is_whitespace) {
        // Allocates a new String only when needed
        Cow::Owned(name.split_whitespace().collect::<Vec<_>>().join(" "))
    } else {
        // Zero allocation — returns a reference
        Cow::Borrowed(name)
    }
}
```

**Checklist:**

- [ ] Function parameters use `&str` instead of `String` where possible
- [ ] Function parameters use `&[T]` instead of `Vec<T>` where possible
- [ ] `Cow` used when allocation is only sometimes needed
- [ ] No unnecessary `.to_string()` or `.clone()` calls

---

## 5.2 Async Patterns

### Never Block the Async Runtime

```rust
// BAD: Blocks the tokio runtime thread
pub async fn bad_handler() -> Result<Json<Data>, {{ERROR_TYPE}}> {
    std::thread::sleep(std::time::Duration::from_secs(5));  // Blocks!
    let data = std::fs::read_to_string("large_file.txt")?;  // Blocks!
    Ok(Json(data))
}

// GOOD: Use async equivalents
pub async fn good_handler() -> Result<Json<Data>, {{ERROR_TYPE}}> {
    tokio::time::sleep(std::time::Duration::from_secs(5)).await;
    let data = tokio::fs::read_to_string("large_file.txt").await?;
    Ok(Json(data))
}

// GOOD: Use spawn_blocking for CPU-intensive work
pub async fn cpu_intensive_handler() -> Result<Json<Data>, {{ERROR_TYPE}}> {
    let result = tokio::task::spawn_blocking(|| {
        // CPU-intensive computation runs on a blocking thread
        expensive_computation()
    })
    .await
    .map_err(|e| {{ERROR_TYPE}}::Internal {
        message: format!("Task panicked: {e}"),
    })?;

    Ok(Json(result))
}
```

### Concurrent Operations with tokio::join!

```rust
// Sequential (slow): each await blocks the next
pub async fn sequential(pool: &PgPool) -> Result<(User, Orders), {{ERROR_TYPE}}> {
    let user = get_user(pool, "id-1").await?;
    let orders = get_orders(pool, "id-1").await?;  // Waits for user to complete
    Ok((user, orders))
}

// Concurrent (fast): both run in parallel
pub async fn concurrent(pool: &PgPool) -> Result<(User, Orders), {{ERROR_TYPE}}> {
    let (user, orders) = tokio::try_join!(
        get_user(pool, "id-1"),
        get_orders(pool, "id-1"),
    )?;
    Ok((user, orders))
}
```

### Timeouts

```rust
use tokio::time::{timeout, Duration};

pub async fn fetch_with_timeout(url: &str) -> Result<String, {{ERROR_TYPE}}> {
    timeout(Duration::from_secs(10), reqwest::get(url))
        .await
        .map_err(|_| {{ERROR_TYPE}}::ExternalService {
            message: format!("Request to {url} timed out after 10s"),
        })?
        .map_err(|e| {{ERROR_TYPE}}::ExternalService {
            message: format!("Request to {url} failed: {e}"),
        })?
        .text()
        .await
        .map_err(|e| {{ERROR_TYPE}}::ExternalService {
            message: format!("Failed to read response body: {e}"),
        })
}
```

**Checklist:**

- [ ] No `std::thread::sleep` in async context
- [ ] No `std::fs::*` in async context (use `tokio::fs`)
- [ ] CPU-intensive work wrapped in `spawn_blocking`
- [ ] Independent async operations use `tokio::join!` or `try_join!`
- [ ] External calls have timeouts

---

## 5.3 Database Query Optimisation

### Avoid N+1 Queries

```rust
// BAD: N+1 query pattern
pub async fn bad_list_with_details(pool: &PgPool) -> Result<Vec<Detail>, {{ERROR_TYPE}}> {
    let items = get_all_items(pool).await?;
    let mut details = Vec::new();
    for item in &items {
        let detail = get_detail(pool, &item.id).await?;  // N queries!
        details.push(detail);
    }
    Ok(details)
}

// GOOD: Batch query with JOIN or WHERE IN
pub async fn good_list_with_details(pool: &PgPool) -> Result<Vec<Detail>, {{ERROR_TYPE}}> {
    sqlx::query_as::<_, Detail>(
        r#"
        SELECT i.*, d.extra_field
        FROM items i
        JOIN details d ON d.item_id = i.id
        ORDER BY i.created_at DESC
        "#,
    )
    .fetch_all(pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::Database {
        message: format!("Failed to fetch items with details: {e}"),
    })
}

// GOOD: Batch with WHERE IN for separate queries
pub async fn batch_get(pool: &PgPool, ids: &[String]) -> Result<Vec<{{ENTITY_NAME}}>, {{ERROR_TYPE}}> {
    sqlx::query_as::<_, DB{{ENTITY_NAME}}>(
        "SELECT * FROM {{TABLE_NAME}} WHERE id = ANY($1)"
    )
    .bind(ids)
    .fetch_all(pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::Database {
        message: format!("Batch query failed: {e}"),
    })
}
```

### Connection Pooling

```rust
// Configure pool in application setup
let pool = sqlx::postgres::PgPoolOptions::new()
    .max_connections(20)          // Tune based on expected load
    .min_connections(5)           // Keep warm connections
    .acquire_timeout(std::time::Duration::from_secs(5))
    .idle_timeout(std::time::Duration::from_secs(600))
    .max_lifetime(std::time::Duration::from_secs(1800))
    .connect(&database_url)
    .await?;
```

**Checklist:**

- [ ] No loops containing individual database queries (use batch/JOIN)
- [ ] Connection pool configured with appropriate limits
- [ ] Complex queries use database-side aggregation
- [ ] Pagination uses `LIMIT`/`OFFSET` or cursor-based approach

---

## 5.4 Benchmarking with criterion

```rust
// benches/{{MODULE_NAME}}_bench.rs
use criterion::{black_box, criterion_group, criterion_main, Criterion};
use {{PROJECT_NAME}}::{{MODULE_NAME}}::helpers;

fn benchmark_calculation(c: &mut Criterion) {
    let items = create_test_items(1000);

    c.bench_function("calculate_total_1000_items", |b| {
        b.iter(|| helpers::calculate_total(black_box(&items)))
    });
}

fn benchmark_serialisation(c: &mut Criterion) {
    let entity = create_test_entity();

    c.bench_function("serialise_entity", |b| {
        b.iter(|| serde_json::to_string(black_box(&entity)).unwrap())
    });
}

criterion_group!(benches, benchmark_calculation, benchmark_serialisation);
criterion_main!(benches);
```

```toml
# Cargo.toml
[[bench]]
name = "{{MODULE_NAME}}_bench"
harness = false

[dev-dependencies]
criterion = { version = "0.5", features = ["html_reports"] }
```

```bash
# Run benchmarks
cargo bench

# Run specific benchmark
cargo bench -- calculate_total
```

---

## 5.5 Profiling Tools

```bash
# Memory profiling with DHAT (requires dhat crate)
cargo run --features dhat-heap

# CPU profiling with flamegraph (requires cargo-flamegraph)
cargo flamegraph --bin {{PROJECT_NAME}}

# Compile-time analysis
cargo build --timings

# Binary size analysis
cargo bloat --release --crates
```

---

## 5.6 Common Performance Pitfalls

| Pitfall | Detection | Fix |
|---------|-----------|-----|
| Unnecessary cloning | `cargo clippy` warns on redundant clones | Use references or `Arc` |
| Allocating in hot loops | Benchmark, look for `.to_string()` in loops | Pre-allocate or use `&str` |
| Blocking in async | `rg "std::thread::sleep\|std::fs::"` in async fns | Use tokio equivalents |
| N+1 database queries | Look for queries inside loops | Use JOINs or WHERE IN |
| Unbounded collections | Review `.collect()` without size hints | Add `.with_capacity()` |
| Excessive logging | Profile with logging enabled | Use `{{LOG_CRATE}}` levels appropriately |

---

## Checklist

- [ ] Function parameters prefer borrowed types (`&str`, `&[T]`)
- [ ] No blocking operations in async context
- [ ] Independent async operations run concurrently
- [ ] External calls have timeouts
- [ ] No N+1 database queries
- [ ] Connection pool configured appropriately
- [ ] Benchmarks set up for performance-critical paths
- [ ] Common pitfalls reviewed and addressed

## Verification

```bash
cargo check
cargo clippy -- -D warnings
cargo bench  # If benchmarks are configured
```
