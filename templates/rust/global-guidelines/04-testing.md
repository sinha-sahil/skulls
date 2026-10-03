# Phase 4: Testing

**Dependencies:** Phase 3 (Error Handling)

**Can be implemented in parallel with:** Phase 5 (Performance)

## Overview

Define testing standards for `{{PROJECT_NAME}}`. Tests are the safety net that enables confident refactoring and fast iteration. These guidelines cover test organisation, naming, patterns, and coverage targets.

---

## 4.1 Test Organisation

### Unit Tests — Same File

```rust
// {{SRC_DIR}}/{{MODULE_NAME}}/helpers.rs

pub fn calculate_total(items: &[LineItem]) -> Result<Cents, {{ERROR_TYPE}}> {
    // ... implementation
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn should_calculate_total_for_single_item() {
        let items = vec![LineItem { price: Cents(1000), quantity: 2 }];
        let total = calculate_total(&items).unwrap();
        assert_eq!(total, Cents(2000));
    }

    #[test]
    fn should_return_zero_for_empty_items() {
        let total = calculate_total(&[]).unwrap();
        assert_eq!(total, Cents(0));
    }
}
```

### Integration Tests — `tests/` Directory

```text
tests/
├── common/
│   └── mod.rs              # Shared test helpers
├── {{MODULE_NAME}}_test.rs # Integration tests for {{MODULE_NAME}}
└── api_test.rs             # HTTP API endpoint tests
```

```rust
// tests/common/mod.rs
use sqlx::PgPool;

pub async fn setup_test_pool() -> PgPool {
    let url = std::env::var("TEST_DATABASE_URL")
        .unwrap_or_else(|_| "postgres://localhost/{{PROJECT_NAME}}_test".into());
    PgPool::connect(&url).await.expect("Failed to connect to test DB")
}

pub async fn cleanup(pool: &PgPool) {
    sqlx::query("DELETE FROM {{TABLE_NAME}} WHERE id LIKE 'test-%'")
        .execute(pool)
        .await
        .expect("Failed to clean up test data");
}
```

### Doc Tests — Public API

```rust
/// Validates that an email address has a valid format.
///
/// # Examples
///
/// ```
/// use {{PROJECT_NAME}}::validation::validate_email;
///
/// assert!(validate_email("user@example.com").is_ok());
/// assert!(validate_email("invalid").is_err());
/// ```
pub fn validate_email(email: &str) -> Result<(), {{ERROR_TYPE}}> {
    // ...
}
```

**Checklist:**

- [ ] Unit tests in `#[cfg(test)] mod tests` in the same file
- [ ] Integration tests in `tests/` directory
- [ ] Shared helpers in `tests/common/mod.rs`
- [ ] Doc tests on all public API functions

---

## 4.2 Test Naming Convention

Use the pattern: `should_[expected_behaviour]_when_[condition]`

```rust
#[cfg(test)]
mod tests {
    use super::*;

    // Good: descriptive, tells you what broke
    #[test]
    fn should_return_not_found_when_user_does_not_exist() { /* ... */ }

    #[test]
    fn should_reject_empty_name_when_creating_user() { /* ... */ }

    #[test]
    fn should_hash_password_when_user_is_created() { /* ... */ }

    #[tokio::test]
    async fn should_return_paginated_results_when_limit_is_set() { /* ... */ }

    // Bad: vague, doesn't explain intent
    #[test]
    fn test_user() { /* ... */ }

    #[test]
    fn it_works() { /* ... */ }
}
```

**Checklist:**

- [ ] All tests follow `should_*_when_*` naming convention
- [ ] Test names describe expected behaviour, not implementation

---

## 4.3 Test Structure — Arrange, Act, Assert

```rust
#[tokio::test]
async fn should_create_{{ENTITY_NAME_LOWER}}_with_valid_input() {
    // Arrange
    let pool = setup_test_pool().await;
    let req = Create{{ENTITY_NAME}}Req {
        name: "Test Entity".into(),
        status: "active".into(),
    };

    // Act
    let result = create_{{ENTITY_NAME_LOWER}}(&pool, &req).await;

    // Assert
    assert!(result.is_ok());
    let entity = result.unwrap();
    assert_eq!(entity.name, "Test Entity");
    assert!(!entity.id.is_empty());

    // Cleanup
    cleanup(&pool).await;
}
```

---

## 4.4 Test Helpers and Fixtures

```rust
#[cfg(test)]
mod tests {
    use super::*;

    // Factory functions for test data
    fn make_{{ENTITY_NAME_LOWER}}() -> {{ENTITY_NAME}} {
        {{ENTITY_NAME}} {
            id: "test-id-001".to_string(),
            name: "Test Entity".to_string(),
            status: {{ENTITY_NAME}}Status::Active,
            created_at: OffsetDateTime::now_utc(),
        }
    }

    fn make_create_req() -> Create{{ENTITY_NAME}}Req {
        Create{{ENTITY_NAME}}Req {
            name: "New Entity".into(),
        }
    }

    // Parameterised-style testing with a helper
    fn assert_validation_error(input: &str, expected_field: &str) {
        let req = Create{{ENTITY_NAME}}Req { name: input.into() };
        let result = validate_{{ENTITY_NAME_LOWER}}(&req);
        assert!(result.is_err());
        let err = result.unwrap_err().to_string();
        assert!(err.contains(expected_field), "Error should mention {expected_field}: {err}");
    }

    #[test]
    fn should_reject_empty_name() {
        assert_validation_error("", "name");
    }

    #[test]
    fn should_reject_whitespace_only_name() {
        assert_validation_error("   ", "name");
    }
}
```

---

## 4.5 Mocking with mockall

```rust
use mockall::automock;

#[automock]
#[async_trait::async_trait]
pub trait {{TRAIT_NAME}}: Send + Sync {
    async fn get_by_id(&self, id: &str) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}>;
    async fn create(&self, req: &Create{{ENTITY_NAME}}Req) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}>;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn should_handle_repository_error() {
        // Arrange
        let mut mock = Mock{{TRAIT_NAME}}::new();
        mock.expect_get_by_id()
            .with(mockall::predicate::eq("bad-id"))
            .returning(|_| Err({{ERROR_TYPE}}::NotFound {
                message: "Not found".into(),
            }));

        // Act
        let result = mock.get_by_id("bad-id").await;

        // Assert
        assert!(matches!(result, Err({{ERROR_TYPE}}::NotFound { .. })));
    }

    #[tokio::test]
    async fn should_return_entity_from_repository() {
        let mut mock = Mock{{TRAIT_NAME}}::new();
        mock.expect_get_by_id()
            .with(mockall::predicate::eq("test-123"))
            .returning(|_| Ok(make_{{ENTITY_NAME_LOWER}}()));

        let result = mock.get_by_id("test-123").await.unwrap();
        assert_eq!(result.id, "test-id-001");
    }
}
```

**Checklist:**

- [ ] `mockall` used for trait-based mocking
- [ ] Mocks set up in Arrange phase
- [ ] Each mock expectation tests one scenario

---

## 4.6 Async Testing with tokio::test

```rust
#[cfg(test)]
mod tests {
    use super::*;

    // Standard async test
    #[tokio::test]
    async fn should_fetch_{{ENTITY_NAME_LOWER}}_from_database() {
        let pool = setup_test_pool().await;
        let result = get_{{ENTITY_NAME_LOWER}}_by_id(&pool, "existing-id").await;
        assert!(result.is_ok());
    }

    // Multi-threaded async test (for testing concurrent access)
    #[tokio::test(flavor = "multi_thread", worker_threads = 2)]
    async fn should_handle_concurrent_writes() {
        let pool = setup_test_pool().await;

        let (r1, r2) = tokio::join!(
            create_{{ENTITY_NAME_LOWER}}(&pool, &make_create_req()),
            create_{{ENTITY_NAME_LOWER}}(&pool, &make_create_req()),
        );

        assert!(r1.is_ok());
        assert!(r2.is_ok());
    }

    // Test with timeout
    #[tokio::test]
    async fn should_not_hang_on_missing_connection() {
        let result = tokio::time::timeout(
            std::time::Duration::from_secs(5),
            connect_to_nonexistent_db(),
        )
        .await;

        assert!(result.is_err() || result.unwrap().is_err());
    }
}
```

---

## 4.7 Assertion Patterns

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn assertion_examples() {
        // Equality
        assert_eq!(actual, expected);
        assert_ne!(actual, unexpected);

        // Boolean
        assert!(result.is_ok());
        assert!(result.is_err());

        // Pattern matching with matches!
        assert!(matches!(error, {{ERROR_TYPE}}::NotFound { .. }));
        assert!(matches!(status, {{ENTITY_NAME}}Status::Active | {{ENTITY_NAME}}Status::Pending));

        // Contains (for strings)
        assert!(error.to_string().contains("not found"));

        // Custom message on failure
        assert_eq!(
            result.id, expected_id,
            "Expected entity ID {expected_id}, but got {}",
            result.id
        );
    }
}
```

---

## 4.8 Test Coverage Targets

| Category | Target | Rationale |
|----------|--------|-----------|
| Overall project | {{MIN_TEST_COVERAGE}} | Baseline quality gate |
| Error handling paths | 100% | Every error variant must be tested |
| Public API functions | 100% | Contract must be verified |
| Business logic (helpers) | 90%+ | Core domain logic |
| Storage layer | 80%+ | SQL queries need verification |
| Handler functions | 70%+ | Mostly wiring, tested via integration |

```bash
# Check coverage
cargo tarpaulin --skip-clean --out html

# Check coverage for a specific module
cargo tarpaulin --skip-clean --packages {{PROJECT_NAME}} --out html
```

---

## Checklist

- [ ] Unit tests in same file as implementation
- [ ] Integration tests in `tests/` directory
- [ ] Doc tests on public API
- [ ] Test naming follows `should_*_when_*` convention
- [ ] Arrange/Act/Assert structure in all tests
- [ ] Test helpers and factories for common data
- [ ] Mocking via `mockall` for trait boundaries
- [ ] Async tests use `#[tokio::test]`
- [ ] Coverage meets targets: {{MIN_TEST_COVERAGE}} overall

## Verification

```bash
cargo test
cargo test -- --nocapture  # See println! output
cargo tarpaulin --skip-clean --out html
```
