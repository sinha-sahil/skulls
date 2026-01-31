# {{SERVICE_NAME}} {{FEATURE_NAME}} - Handler Function

## Overview

Create the handler function for the {{ENDPOINT_PATH}} endpoint.

## Status

🔴 Not Started

## Dependencies

- Type definitions must exist
- Storage layer (if using external storage)

---

## Files to Modify

### `{{SERVICES_DIR}}{{SERVICE_NAME}}/handler.rs`

Add the following handler function to the file:

```rust
use axum::{extract::State, Json};
use crate::error::{{ERROR_TYPE}};
use crate::{{STATE_TYPE}};
use super::types::{{{REQUEST_TYPE}}, {{RESPONSE_TYPE}}};

pub async fn {{HANDLER_NAME}}(
    State(app_state): State<{{STATE_TYPE}}>,
    Json(req): Json<{{REQUEST_TYPE}}>,
) -> Result<Json<{{RESPONSE_TYPE}}>, {{ERROR_TYPE}}> {
    // 1. Validate input
    // 2. Process business logic
    // 3. Call storage/database
    // 4. Return response

    todo!("Implement handler logic")
}
```

---

## Handler Patterns

### Pattern 1: Simple GET with Query Params

```rust
use axum::extract::{Query, State};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct QueryParams {
    pub user_id: String,
    pub limit: Option<i32>,
}

pub async fn get_items(
    State(app_state): State<{{STATE_TYPE}}>,
    Query(params): Query<QueryParams>,
) -> Result<Json<GetItemsResp>, {{ERROR_TYPE}}> {
    let limit = params.limit.unwrap_or(10);

    let items = sqlx::query_as::<_, DBItem>(
        "SELECT * FROM items WHERE user_id = $1 LIMIT $2"
    )
    .bind(&params.user_id)
    .bind(limit)
    .fetch_all(&app_state.db_pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::InternalError {
        error: "Database Error".to_string(),
        message: Some(format!("Failed to fetch items: {}", e)),
    })?;

    Ok(Json(GetItemsResp {
        success: true,
        items,
    }))
}
```

### Pattern 2: POST with JSON Body

```rust
pub async fn create_item(
    State(app_state): State<{{STATE_TYPE}}>,
    Json(req): Json<CreateItemReq>,
) -> Result<Json<CreateItemResp>, {{ERROR_TYPE}}> {
    // Validate input (add your validation logic)
    if req.name.is_empty() {
        return Err({{ERROR_TYPE}}::BadRequest {
            message: Some("Name is required".to_string()),
        });
    }

    // Insert into database
    let item = sqlx::query_as::<_, DBItem>(
        r#"
        INSERT INTO items (user_id, name, description)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, name, description, created_at
        "#
    )
    .bind(&req.user_id)
    .bind(&req.name)
    .bind(&req.description)
    .fetch_one(&app_state.db_pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::InternalError {
        error: "Database Error".to_string(),
        message: Some(format!("Failed to create item: {}", e)),
    })?;

    Ok(Json(CreateItemResp {
        success: true,
        message: "Item created successfully".to_string(),
        item_id: item.id,
    }))
}
```

### Pattern 3: PUT with S3 Upload

```rust
use super::storage;

pub async fn update_config(
    State(app_state): State<{{STATE_TYPE}}>,
    Json(req): Json<UpdateConfigReq>,
) -> Result<Json<UpdateConfigResp>, {{ERROR_TYPE}}> {
    // Extract identifier for S3 path
    let identifier = req.id.clone();

    // Serialize config to JSON
    let config_json = serde_json::to_string(&req.config)
        .map_err(|_| {{ERROR_TYPE}}::InternalError {
            error: "Serialization Failed".to_string(),
            message: Some("Failed to serialize config".to_string()),
        })?;

    // Upload to S3
    let s3_path = storage::upload_to_s3(
        app_state.s3_client.clone(),
        identifier,
        config_json,
        app_state.config.{{SERVICE_NAME}}_s3_bucket.clone(),
    )
    .await?;

    Ok(Json(UpdateConfigResp {
        success: true,
        message: "Config updated successfully".to_string(),
        s3_path,
    }))
}
```

### Pattern 4: DELETE with Path Parameter

```rust
use axum::extract::Path;

pub async fn delete_item(
    State(app_state): State<{{STATE_TYPE}}>,
    Path(item_id): Path<String>,
) -> Result<Json<DeleteItemResp>, {{ERROR_TYPE}}> {
    let result = sqlx::query("DELETE FROM items WHERE id = $1")
        .bind(&item_id)
        .execute(&app_state.db_pool)
        .await
        .map_err(|e| {{ERROR_TYPE}}::InternalError {
            error: "Database Error".to_string(),
            message: Some(format!("Failed to delete item: {}", e)),
        })?;

    if result.rows_affected() == 0 {
        return Err({{ERROR_TYPE}}::NotFound {
            message: Some("Item not found".to_string()),
        });
    }

    Ok(Json(DeleteItemResp {
        success: true,
        message: "Item deleted successfully".to_string(),
    }))
}
```

### Pattern 5: GET with Path and Query

```rust
use axum::extract::{Path, Query, State};

#[derive(Deserialize)]
pub struct ListParams {
    pub limit: Option<i32>,
    pub offset: Option<i32>,
}

pub async fn list_user_items(
    State(app_state): State<{{STATE_TYPE}}>,
    Path(user_id): Path<String>,
    Query(params): Query<ListParams>,
) -> Result<Json<ListItemsResp>, {{ERROR_TYPE}}> {
    let limit = params.limit.unwrap_or(10);
    let offset = params.offset.unwrap_or(0);

    let items = sqlx::query_as::<_, DBItem>(
        "SELECT * FROM items WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
    )
    .bind(&user_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(&app_state.db_pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::InternalError {
        error: "Database Error".to_string(),
        message: Some(format!("Failed to list items: {}", e)),
    })?;

    Ok(Json(ListItemsResp {
        success: true,
        items,
        total: items.len() as i32,
    }))
}
```

### Pattern 6: Webhook Handler (HMAC Verification)

```rust
use axum::{body::Bytes, http::HeaderMap};
use serde_json::Value;

pub async fn webhook_handler(
    State(app_state): State<{{STATE_TYPE}}>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<Json<WebhookResp>, {{ERROR_TYPE}}> {
    // Extract signature header (customize header name for your webhook provider)
    let signature = headers
        .get("x-signature")
        .and_then(|h| h.to_str().ok())
        .ok_or({{ERROR_TYPE}}::Unauthorized)?;

    // Verify HMAC signature (implement your verification logic)
    let secret = &app_state.secrets.webhook_secret;
    verify_webhook_signature(signature, &body, secret)
        .map_err(|_| {{ERROR_TYPE}}::Unauthorized)?;

    // Parse payload
    let payload: Value = serde_json::from_slice(&body)
        .map_err(|_| {{ERROR_TYPE}}::UnprocessableEntity {
            message: Some("Invalid JSON payload".to_string()),
        })?;

    // Process webhook based on event type
    let event_type = payload.get("type")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown");

    match event_type {
        "order.created" => {
            // Handle order created event
        }
        "payment.completed" => {
            // Handle payment completed event
        }
        _ => {
            // Log unknown event type
        }
    }

    Ok(Json(WebhookResp {
        success: true,
        message: "Webhook processed".to_string(),
    }))
}

// Helper function for HMAC verification
fn verify_webhook_signature(
    signature: &str,
    body: &[u8],
    secret: &str,
) -> Result<(), ()> {
    use hmac::{Hmac, Mac};
    use sha2::Sha256;

    let mut mac = Hmac::<Sha256>::new_from_slice(secret.as_bytes())
        .map_err(|_| ())?;
    mac.update(body);

    let expected = hex::encode(mac.finalize().into_bytes());
    if signature == expected {
        Ok(())
    } else {
        Err(())
    }
}
```

---

## Common Validation Patterns

### Entity Validation

```rust
// Validate entity exists before operation
let entity = sqlx::query_as::<_, Entity>(
    "SELECT * FROM entities WHERE id = $1"
)
.bind(&req.entity_id)
.fetch_optional(&app_state.db_pool)
.await
.map_err(|e| {{ERROR_TYPE}}::InternalError {
    error: "Database Error".to_string(),
    message: Some(e.to_string()),
})?
.ok_or({{ERROR_TYPE}}::NotFound {
    message: Some("Entity not found".to_string()),
})?;
```

### Input Validation

```rust
if req.name.is_empty() {
    return Err({{ERROR_TYPE}}::BadRequest {
        message: Some("Name cannot be empty".to_string()),
    });
}

if req.amount < 0 {
    return Err({{ERROR_TYPE}}::BadRequest {
        message: Some("Amount must be positive".to_string()),
    });
}
```

### ID Extraction

```rust
let id = req.identifier
    .parse::<i64>()
    .map_err(|_| {{ERROR_TYPE}}::BadRequest {
        message: Some("Invalid ID format".to_string()),
    })?;
```

---

## Error Handling

### Standard Error Returns

```rust
// Unauthorized
Err({{ERROR_TYPE}}::Unauthorized)

// Bad Request
Err({{ERROR_TYPE}}::BadRequest {
    message: Some("Invalid input".to_string()),
})

// Not Found
Err({{ERROR_TYPE}}::NotFound {
    message: Some("Resource not found".to_string()),
})

// Not Found (from database)
.map_err(|e| match e {
    sqlx::Error::RowNotFound => {{ERROR_TYPE}}::NotFound {
        message: Some("Resource not found".to_string()),
    },
    _ => {{ERROR_TYPE}}::InternalError {
        error: "Database Error".to_string(),
        message: Some(format!("Operation failed: {}", e)),
    },
})

// Internal Server Error
Err({{ERROR_TYPE}}::InternalError {
    error: "Operation Failed".to_string(),
    message: Some("Detailed error message".to_string()),
})
```

---

## Imports Needed

Add these imports at the top of the file:

```rust
use axum::extract::State;
use axum::Json;
// For path params: use axum::extract::Path;
// For query params: use axum::extract::Query;
// For webhooks: use axum::{body::Bytes, http::HeaderMap};

use crate::error::{{ERROR_TYPE}};
use crate::{{STATE_TYPE}};
use super::types::{{{REQUEST_TYPE}}, {{RESPONSE_TYPE}}};
// If using storage: use super::storage;
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
- [ ] Handler function implemented
- [ ] Proper error handling
- [ ] Input validation included
- [ ] Returns correct response type

---

## Notes

- DO NOT run `cargo build` - only use `cargo check`
- DO NOT add redundant comments
- Use descriptive variable names
- Validate required fields early in the handler
- Use `?` operator for error propagation
- Match database errors appropriately (RowNotFound vs other errors)
