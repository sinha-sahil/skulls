# Phase 6: Testing Strategy

**Dependencies:** Phase 2 (Goals), Phase 3 (Impact Analysis)

**Can be implemented in parallel with:** Phase 4 (Strategy)

## Overview

Establish a testing plan to ensure the `{{PROJECT_NAME}}` refactoring preserves existing behaviour. Tests should be written BEFORE refactoring begins, providing a safety net for every change.

---

## 6.1 Test Inventory — Current State

Assess existing test coverage before adding new tests:

```bash
# Count existing tests
cargo test -- --list 2>&1 | grep "test$" | wc -l

# List all test modules
rg "#\[cfg\(test\)\]" {{SRC_DIR}} --type rust -l

# Check coverage (requires cargo-tarpaulin)
cargo tarpaulin --skip-clean --out html

# Find modules without any tests
find {{SRC_DIR}} -name "*.rs" ! -path "*/tests/*" -exec grep -rL "#\[cfg(test)\]" {} +

# List integration test files
ls tests/*.rs 2>/dev/null || echo "No integration tests found"
```

| Module | Unit Tests | Integration Tests | Doc Tests | Coverage |
|--------|-----------|-------------------|-----------|----------|
| `{{MODULE_NAME}}/handler` | ___ | ___ | ___ | ___% |
| `{{MODULE_NAME}}/storage` | ___ | ___ | ___ | ___% |
| `{{MODULE_NAME}}/helpers` | ___ | ___ | ___ | ___% |
| `{{MODULE_NAME}}/types` | ___ | ___ | ___ | ___% |
| `error` | ___ | ___ | ___ | ___% |

---

## 6.2 Unit Tests — Add Before Refactoring

Add unit tests in the same file, inside a `#[cfg(test)]` module:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    // Naming convention: should_[expected]_when_[condition]

    #[test]
    fn should_create_{{ENTITY_NAME_LOWER}}_from_db_row() {
        // Arrange
        let db_row = DB{{ENTITY_NAME}} {
            id: "test-id-123".to_string(),
            created_at: OffsetDateTime::now_utc(),
            updated_at: OffsetDateTime::now_utc(),
        };

        // Act
        let result = {{ENTITY_NAME}}::from_db(db_row);

        // Assert
        assert_eq!(result.id, "test-id-123");
    }

    #[test]
    fn should_display_error_message() {
        let error = {{ERROR_TYPE}}::NotFound {
            message: "User not found".into(),
        };

        assert_eq!(error.to_string(), "Not found: User not found");
    }

    #[test]
    fn should_convert_status_from_string() {
        let status = {{ENTITY_NAME}}Status::try_from("active").unwrap();
        assert_eq!(status, {{ENTITY_NAME}}Status::Active);
    }

    #[test]
    fn should_reject_invalid_status() {
        let result = {{ENTITY_NAME}}Status::try_from("invalid");
        assert!(result.is_err());
    }
}
```

---

## 6.3 Async Unit Tests

For testing async functions, use `tokio::test`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn should_return_not_found_for_missing_{{ENTITY_NAME_LOWER}}() {
        // Arrange
        let pool = setup_test_pool().await;
        let id = "nonexistent-id";

        // Act
        let result = get_{{ENTITY_NAME_LOWER}}_by_id(&pool, id).await;

        // Assert
        assert!(result.is_err());
        match result.unwrap_err() {
            {{ERROR_TYPE}}::NotFound { message } => {
                assert!(message.contains(id));
            }
            other => panic!("Expected NotFound, got: {other:?}"),
        }
    }

    #[tokio::test]
    async fn should_insert_and_retrieve_{{ENTITY_NAME_LOWER}}() {
        let pool = setup_test_pool().await;
        let req = Create{{ENTITY_NAME}}Req {
            field_name: "test value".into(),
        };

        let created = insert_{{ENTITY_NAME_LOWER}}(&pool, &req).await.unwrap();
        let retrieved = get_{{ENTITY_NAME_LOWER}}_by_id(&pool, &created.id).await.unwrap();

        assert_eq!(created.id, retrieved.id);
    }
}
```

---

## 6.4 Integration Tests

Place integration tests in `tests/` directory:

```rust
// tests/{{MODULE_NAME}}_integration.rs
use {{PROJECT_NAME}}::{{MODULE_NAME}}::*;

#[tokio::test]
async fn test_{{ENTITY_NAME_LOWER}}_crud_lifecycle() {
    // Setup
    let pool = setup_test_database().await;

    // Create
    let req = Create{{ENTITY_NAME}}Req {
        field_name: "integration test".into(),
    };
    let created = insert_{{ENTITY_NAME_LOWER}}(&pool, &req).await.unwrap();
    assert!(!created.id.is_empty());

    // Read
    let fetched = get_{{ENTITY_NAME_LOWER}}_by_id(&pool, &created.id).await.unwrap();
    assert_eq!(fetched.id, created.id);

    // Update
    let update_req = Update{{ENTITY_NAME}}Req {
        field_name: Some("updated value".into()),
    };
    let updated = update_{{ENTITY_NAME_LOWER}}(&pool, &created.id, &update_req)
        .await
        .unwrap();
    assert_eq!(updated.field_name, "updated value");

    // Delete
    delete_{{ENTITY_NAME_LOWER}}(&pool, &created.id).await.unwrap();
    let result = get_{{ENTITY_NAME_LOWER}}_by_id(&pool, &created.id).await;
    assert!(result.is_err());

    // Cleanup
    cleanup_test_database(pool).await;
}
```

---

## 6.5 Doc Tests

Add examples to public API documentation that double as tests:

```rust
/// Converts a database row into an API response type.
///
/// # Examples
///
/// ```
/// use {{PROJECT_NAME}}::{{MODULE_NAME}}::types::{DB{{ENTITY_NAME}}, {{ENTITY_NAME}}};
///
/// let db_row = DB{{ENTITY_NAME}} {
///     id: "abc-123".to_string(),
///     // ... other fields
/// };
///
/// let entity = {{ENTITY_NAME}}::from_db(db_row);
/// assert_eq!(entity.id, "abc-123");
/// ```
pub fn from_db(row: DB{{ENTITY_NAME}}) -> Self {
    // ...
}
```

---

## 6.6 Property-Based Testing with proptest

For functions with complex input domains:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use proptest::prelude::*;

    proptest! {
        #[test]
        fn should_roundtrip_{{ENTITY_NAME_LOWER}}_id(id in "[a-zA-Z0-9-]{1,64}") {
            let entity_id = {{ENTITY_NAME}}Id::new(id.clone());
            assert_eq!(entity_id.as_str(), id);
            assert_eq!(entity_id.to_string(), id);
        }

        #[test]
        fn should_serialize_deserialize_status(status in prop_oneof![
            Just({{ENTITY_NAME}}Status::Active),
            Just({{ENTITY_NAME}}Status::Inactive),
            Just({{ENTITY_NAME}}Status::Pending),
        ]) {
            let json = serde_json::to_string(&status).unwrap();
            let deserialized: {{ENTITY_NAME}}Status = serde_json::from_str(&json).unwrap();
            assert_eq!(deserialized, status);
        }
    }
}
```

---

## 6.7 Golden File Testing

Capture expected outputs and compare during refactoring:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn should_produce_expected_json_response() {
        let entity = {{ENTITY_NAME}} {
            id: "test-123".to_string(),
            // ... fixed test data
        };

        let json = serde_json::to_string_pretty(&entity).unwrap();

        // Compare against golden file
        let expected = include_str!("../testdata/{{ENTITY_NAME_LOWER}}_response.json");
        assert_eq!(json.trim(), expected.trim());
    }
}
```

---

## 6.8 Test Helper Setup

```rust
// tests/common/mod.rs or src/test_helpers.rs
#[cfg(test)]
pub mod test_helpers {
    use sqlx::PgPool;

    pub async fn setup_test_pool() -> PgPool {
        let database_url = std::env::var("TEST_DATABASE_URL")
            .unwrap_or_else(|_| "postgres://localhost/{{PROJECT_NAME}}_test".into());

        PgPool::connect(&database_url)
            .await
            .expect("Failed to connect to test database")
    }

    pub fn test_{{ENTITY_NAME_LOWER}}() -> {{ENTITY_NAME}} {
        {{ENTITY_NAME}} {
            id: "test-id-001".to_string(),
            // ... default test values
        }
    }
}
```

---

## Checklist

- [ ] Existing test coverage is documented
- [ ] Unit tests added for all functions being refactored
- [ ] Async test patterns use `#[tokio::test]`
- [ ] Integration tests cover CRUD lifecycle
- [ ] Doc tests added for public API
- [ ] Property tests added for complex input domains (optional)
- [ ] Golden file tests capture expected outputs (optional)
- [ ] Test helpers are DRY and reusable
- [ ] All tests pass BEFORE refactoring begins
- [ ] Coverage target: {{MIN_TEST_COVERAGE}}

## Verification

```bash
# Run all tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Run specific module tests
cargo test {{MODULE_NAME}}::

# Check coverage
cargo tarpaulin --skip-clean --out html
```

Tests must be green before any refactoring step in Phase 5 begins.
