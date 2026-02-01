# Step 2: Storage Layer (`storage.rs`)

**Dependencies:** Step 1 (types.rs)

**Can be implemented in parallel with:** Step 6, Step 7, Step 8

## Purpose

The storage layer is the **single source of truth for ALL data persistence operations**.

This file contains:

- **Database queries** - All PostgreSQL operations (SELECT, INSERT, UPDATE, DELETE)
- **File storage** - S3, GCS, or any cloud storage operations
- **Cache operations** - Redis get/set/delete operations
- **File system** - Local file read/write operations

**IMPORTANT:** ALL queries and storage operations MUST be written in this file. Handlers should
NEVER contain raw SQL queries or direct storage client calls - they call functions defined here.

---

## 2.1 Insert Operations

```rust
use super::types::{DB{{ENTITY_NAME}}, {{ENTITY_NAME}}};
use {{ERROR_MODULE}}::{{ERROR_TYPE}};
use sqlx::PgPool;

pub async fn insert_{{ENTITY_NAME_LOWER}}(
    pool: &PgPool,
    payload: &Create{{ENTITY_NAME}}Req,
) -> Result<DB{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
    sqlx::query_as::<_, DB{{ENTITY_NAME}}>(
        r#"
        INSERT INTO {{TABLE_NAME}}
            (id, field1, field2)
        VALUES
            ($1, $2, $3)
        RETURNING *;
        "#,
    )
    .bind(&payload.id)
    .bind(&payload.field1)
    .bind(&payload.field2)
    .fetch_one(pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::DBError {
        error_values: None,
        message: Some("Failed to insert {{ENTITY_NAME_LOWER}}".into()),
        description: Some(e.to_string()),
    })
}
```

## 2.2 Query Operations

```rust
pub async fn get_{{ENTITY_NAME_LOWER}}_by_id(
    pool: &PgPool,
    id: &str,
) -> Result<DB{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
    sqlx::query_as::<_, DB{{ENTITY_NAME}}>(
        r#"SELECT * FROM {{TABLE_NAME}} WHERE id = $1"#,
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::DBError {
        error_values: None,
        message: Some("Failed to get {{ENTITY_NAME_LOWER}}".into()),
        description: Some(e.to_string()),
    })
}

// Fetch multiple by IDs
pub async fn get_{{ENTITY_NAME_LOWER}}s_by_ids(
    pool: &PgPool,
    ids: &[String],
) -> Result<Vec<DB{{ENTITY_NAME}}>, {{ERROR_TYPE}}> {
    sqlx::query_as::<_, DB{{ENTITY_NAME}}>(
        r#"SELECT * FROM {{TABLE_NAME}} WHERE id = ANY($1)"#,
    )
    .bind(ids)
    .fetch_all(pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::DBError {
        error_values: None,
        message: Some("Failed to get {{ENTITY_NAME_LOWER}}s".into()),
        description: Some(e.to_string()),
    })
}
```

## 2.3 Update Operations

```rust
pub async fn update_{{ENTITY_NAME_LOWER}}(
    pool: &PgPool,
    id: &str,
    payload: &Update{{ENTITY_NAME}}Req,
) -> Result<DB{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
    sqlx::query_as::<_, DB{{ENTITY_NAME}}>(
        r#"
        UPDATE {{TABLE_NAME}}
        SET
            field1 = $1,
            updated_at = current_timestamp
        WHERE id = $2
        RETURNING *;
        "#,
    )
    .bind(&payload.field1)
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::DBError {
        error_values: None,
        message: Some("Failed to update {{ENTITY_NAME_LOWER}}".into()),
        description: Some(e.to_string()),
    })
}
```

## 2.4 Delete Operations

```rust
pub async fn delete_{{ENTITY_NAME_LOWER}}(
    pool: &PgPool,
    id: &str,
) -> Result<(), {{ERROR_TYPE}}> {
    sqlx::query(r#"DELETE FROM {{TABLE_NAME}} WHERE id = $1"#)
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| {{ERROR_TYPE}}::DBError {
            error_values: None,
            message: Some("Failed to delete {{ENTITY_NAME_LOWER}}".into()),
            description: Some(e.to_string()),
        })?;
    Ok(())
}
```

## 2.5 Paginated Queries

```rust
pub async fn get_{{ENTITY_NAME_LOWER}}s_paginated(
    pool: &PgPool,
    page: u32,
    limit: u32,
) -> Result<(Vec<DB{{ENTITY_NAME}}>, i64), {{ERROR_TYPE}}> {
    let offset = (page - 1) * limit;

    // Count query
    let total_count: i64 = sqlx::query_scalar(
        r#"SELECT COUNT(*) FROM {{TABLE_NAME}}"#,
    )
    .fetch_one(pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::DBError {
        error_values: None,
        message: Some("Failed to count {{ENTITY_NAME_LOWER}}s".into()),
        description: Some(e.to_string()),
    })?;

    // Data query with pagination
    let data = sqlx::query_as::<_, DB{{ENTITY_NAME}}>(
        r#"
        SELECT * FROM {{TABLE_NAME}}
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
        "#,
    )
    .bind(limit as i64)
    .bind(offset as i64)
    .fetch_all(pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::DBError {
        error_values: None,
        message: Some("Failed to fetch {{ENTITY_NAME_LOWER}}s".into()),
        description: Some(e.to_string()),
    })?;

    Ok((data, total_count))
}
```

## 2.6 Transaction-aware Functions (if needed)

```rust
pub async fn insert_{{ENTITY_NAME_LOWER}}_tx(
    tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    payload: &Create{{ENTITY_NAME}}Req,
) -> Result<DB{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
    sqlx::query_as::<_, DB{{ENTITY_NAME}}>(
        r#"INSERT INTO {{TABLE_NAME}} (...) VALUES (...) RETURNING *;"#,
    )
    .bind(&payload.id)
    .fetch_one(&mut **tx)
    .await
    .map_err(|e| {{ERROR_TYPE}}::DBError {
        error_values: None,
        message: Some("Failed to insert {{ENTITY_NAME_LOWER}}".into()),
        description: Some(e.to_string()),
    })
}
```

## Checklist

- [ ] Follow naming convention: `insert_`, `get_`, `update_`, `delete_`
- [ ] Use `query_as::<_, DB{{ENTITY_NAME}}>` for typed results
- [ ] Return `Result<DB{{ENTITY_NAME}}, {{ERROR_TYPE}}>`
- [ ] Proper error mapping with descriptive messages
- [ ] Avoid unnecessary ORDER BY (sort in application layer)
- [ ] Add `_tx` variants for transaction-aware operations if needed
