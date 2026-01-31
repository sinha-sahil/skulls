# {{SERVICE_NAME}} {{FEATURE_NAME}} - Storage Layer

## Overview

Create storage functions for {{DESCRIPTION}}.

## Status

🔴 Not Started

## Dependencies

- Environment setup (if using S3 or external storage)

## When to Use This Template

Use this template when your endpoint needs:

- AWS S3 storage operations
- External API calls
- File system operations
- Non-database persistence

**Skip this template if:** Your endpoint only uses PostgreSQL/Redis (handle in handler directly).

---

## Files to Create

### `{{SERVICES_DIR}}{{SERVICE_NAME}}/storage.rs` (NEW FILE or MODIFY EXISTING)

---

## Storage Pattern: AWS S3

### Upload Function

```rust
use aws_sdk_s3::{primitives::ByteStream, Client};
use crate::error::{{ERROR_TYPE}};

pub async fn upload_to_s3(
    s3_client: Client,
    key_identifier: String,
    content: String,
    s3_bucket: String,
) -> Result<String, {{ERROR_TYPE}}> {
    let s3_path = format!("{{SERVICE_NAME}}/{{resource}}/{}/file.json", key_identifier);
    
    let result = s3_client
        .put_object()
        .bucket(s3_bucket.clone())
        .key(s3_path.clone())
        .body(ByteStream::from(content.into_bytes()))
        .content_type("application/json")  // or "image/png", etc.
        .send()
        .await;
    
    match result {
        Err(e) => Err({{ERROR_TYPE}}::InternalError {
            error: "S3 Upload Failed".to_string(),
            message: Some(format!("Unable to upload to S3: {}", e)),
        }),
        Ok(_) => Ok(s3_path),
    }
}
```

### Download Function

```rust
pub async fn get_from_s3(
    s3_client: Client,
    key_identifier: String,
    s3_bucket: String,
) -> Result<String, {{ERROR_TYPE}}> {
    let s3_path = format!("{{SERVICE_NAME}}/{{resource}}/{}/file.json", key_identifier);
    
    let result = s3_client
        .get_object()
        .bucket(s3_bucket)
        .key(s3_path)
        .send()
        .await;
    
    match result {
        Err(_e) => Err({{ERROR_TYPE}}::BadRequest {
            error_values: None,
            message: Some("Resource not found".to_string()),
            description: Some("No data exists for this identifier".to_string()),
        }),
        Ok(output) => {
            let bytes = output.body.collect().await.map_err(|e| {
                {{ERROR_TYPE}}::InternalError {
                    error: "S3 Read Failed".to_string(),
                    message: Some(format!("Unable to read from S3: {}", e)),
                }
            })?;
            
            let content = String::from_utf8(bytes.to_vec()).map_err(|e| {
                {{ERROR_TYPE}}::InternalError {
                    error: "Invalid UTF-8".to_string(),
                    message: Some(format!("File is not valid UTF-8: {}", e)),
                }
            })?;
            
            Ok(content)
        }
    }
}
```

### Delete Function (Optional)

```rust
pub async fn delete_from_s3(
    s3_client: Client,
    key_identifier: String,
    s3_bucket: String,
) -> Result<(), {{ERROR_TYPE}}> {
    let s3_path = format!("{{SERVICE_NAME}}/{{resource}}/{}/file.json", key_identifier);
    
    s3_client
        .delete_object()
        .bucket(s3_bucket)
        .key(s3_path)
        .send()
        .await
        .map_err(|e| {{ERROR_TYPE}}::InternalError {
            error: "S3 Delete Failed".to_string(),
            message: Some(format!("Unable to delete from S3: {}", e)),
        })?;
    
    Ok(())
}
```

---

## Storage Pattern: PostgreSQL

### Insert/Create

```rust
use sqlx::PgPool;
use crate::error::{{ERROR_TYPE}};

pub async fn insert_record(
    pool: &PgPool,
    data: &RecordData,
) -> Result<DBRecord, {{ERROR_TYPE}}> {
    let record = sqlx::query_as::<_, DBRecord>(
        r#"
        INSERT INTO records (shop_url, name, value)
        VALUES ($1, $2, $3)
        RETURNING id, shop_url, name, value, created_at
        "#
    )
    .bind(&data.shop_url)
    .bind(&data.name)
    .bind(&data.value)
    .fetch_one(pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::InternalError {
        error: "Database Error".to_string(),
        message: Some(format!("Failed to insert record: {}", e)),
    })?;
    
    Ok(record)
}
```

### Fetch/Read

```rust
pub async fn get_record(
    pool: &PgPool,
    id: &str,
) -> Result<DBRecord, {{ERROR_TYPE}}> {
    let record = sqlx::query_as::<_, DBRecord>(
        "SELECT id, shop_url, name, value, created_at FROM records WHERE id = $1"
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| match e {
        sqlx::Error::RowNotFound => {{ERROR_TYPE}}::BadRequest {
            error_values: None,
            message: Some("Record not found".to_string()),
            description: None,
        },
        _ => {{ERROR_TYPE}}::InternalError {
            error: "Database Error".to_string(),
            message: Some(format!("Failed to fetch record: {}", e)),
        },
    })?;
    
    Ok(record)
}
```

### Update

```rust
pub async fn update_record(
    pool: &PgPool,
    id: &str,
    data: &UpdateData,
) -> Result<DBRecord, {{ERROR_TYPE}}> {
    let record = sqlx::query_as::<_, DBRecord>(
        r#"
        UPDATE records 
        SET name = $2, value = $3
        WHERE id = $1
        RETURNING id, shop_url, name, value, created_at
        "#
    )
    .bind(id)
    .bind(&data.name)
    .bind(&data.value)
    .fetch_one(pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::InternalError {
        error: "Database Error".to_string(),
        message: Some(format!("Failed to update record: {}", e)),
    })?;
    
    Ok(record)
}
```

### Delete

```rust
pub async fn delete_record(pool: &PgPool, id: &str) -> Result<(), {{ERROR_TYPE}}> {
    sqlx::query("DELETE FROM records WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| {{ERROR_TYPE}}::InternalError {
            error: "Database Error".to_string(),
            message: Some(format!("Failed to delete record: {}", e)),
        })?;
    
    Ok(())
}
```

### List/Query

```rust
pub async fn list_records(
    pool: &PgPool,
    shop_url: &str,
) -> Result<Vec<DBRecord>, {{ERROR_TYPE}}> {
    let records = sqlx::query_as::<_, DBRecord>(
        "SELECT id, shop_url, name, value, created_at FROM records WHERE shop_url = $1 ORDER BY created_at DESC"
    )
    .bind(shop_url)
    .fetch_all(pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::InternalError {
        error: "Database Error".to_string(),
        message: Some(format!("Failed to list records: {}", e)),
    })?;
    
    Ok(records)
}
```

---

## Storage Pattern: Redis Cache

```rust
use redis::AsyncCommands;
use crate::error::{{ERROR_TYPE}};

pub async fn cache_set(
    redis_conn: &mut redis::aio::Connection,
    key: &str,
    value: &str,
    ttl_seconds: usize,
) -> Result<(), {{ERROR_TYPE}}> {
    redis_conn
        .set_ex(key, value, ttl_seconds)
        .await
        .map_err(|e| {{ERROR_TYPE}}::InternalError {
            error: "Cache Error".to_string(),
            message: Some(format!("Failed to set cache: {}", e)),
        })?;
    
    Ok(())
}

pub async fn cache_get(
    redis_conn: &mut redis::aio::Connection,
    key: &str,
) -> Result<Option<String>, {{ERROR_TYPE}}> {
    let value: Option<String> = redis_conn
        .get(key)
        .await
        .map_err(|e| {{ERROR_TYPE}}::InternalError {
            error: "Cache Error".to_string(),
            message: Some(format!("Failed to get cache: {}", e)),
        })?;
    
    Ok(value)
}
```

---

## S3 Path Conventions

### Standard Pattern

```text
{service}/{resource_type}/{identifier}/{filename}

Examples:
- products/images/product-123/image.png
- users/avatars/user-456/avatar.jpg
- orders/invoices/order-789/invoice.pdf
```

### With Date/Version

```text
{service}/{resource_type}/{identifier}/{date}/{filename}

Examples:
- analytics/reports/tenant-abc/2024-01-15/report.json
- exports/data/user-789/v2/export.csv
```

---

## Error Handling Patterns

### S3 Errors

```rust
match result {
    Err(e) => Err({{ERROR_TYPE}}::InternalError {
        error: "S3 Operation Failed".to_string(),
        message: Some(format!("S3 error: {}", e)),
    }),
    Ok(data) => Ok(data),
}
```

### Database Errors

```rust
.map_err(|e| match e {
    sqlx::Error::RowNotFound => {{ERROR_TYPE}}::BadRequest {
        error_values: None,
        message: Some("Resource not found".to_string()),
        description: None,
    },
    _ => {{ERROR_TYPE}}::InternalError {
        error: "Database Error".to_string(),
        message: Some(format!("Database operation failed: {}", e)),
    },
})
```

---

## Verification

Run these commands to verify:

```bash
cargo check
cargo fmt --all
cargo clippy
```

**Checklist:**

- [ ] `cargo check` passes
- [ ] `cargo fmt --all` applied
- [ ] `cargo clippy` passes with no warnings
- [ ] File created at `{{SERVICES_DIR}}{{SERVICE_NAME}}/storage.rs`
- [ ] All functions have proper error handling
- [ ] S3 paths follow conventions
- [ ] Database queries use parameterized queries (never string interpolation)

---

## Notes

- DO NOT run `cargo build` - only use `cargo check`
- Always use parameterized queries for SQL (never string concatenation)
- S3 paths should be predictable and consistent
- Include proper error messages for debugging
- Consider adding delete/cleanup functions
- Use transactions for multi-step database operations
