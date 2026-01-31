# Step 4: Handler Layer (`handler.rs`)

**Dependencies:** Step 1 (types.rs), Step 3 (helpers.rs)

**Can be implemented in parallel with:** Step 6, Step 7, Step 8 (after dependencies are met)

## 4.1 Basic Handler Template

```rust
use super::{
    helpers,
    types::{Create{{ENTITY_NAME}}Req, {{ENTITY_NAME}}},
};
use {{ERROR_MODULE}}::{{ERROR_TYPE}};
use crate::{{STATE_TYPE}};
use axum::{extract::State, Extension, Json};

pub async fn create_{{ENTITY_NAME_LOWER}}(
    State(app_state): State<{{STATE_TYPE}}>,
    Extension(claims): Extension<{{AUTH_CLAIMS_TYPE}}>,
    Json(req): Json<Create{{ENTITY_NAME}}Req>,
) -> Result<Json<{{ENTITY_NAME}}>, {{ERROR_TYPE}}> {
    let user_id = claims.{{AUTH_USER_ID_FIELD}}.clone();

    let result = helpers::create_{{ENTITY_NAME_LOWER}}(
        &app_state.{{DB_POOL_FIELD}},
        &user_id,
        &req,
    ).await?;

    Ok(Json(result))
}
```

## 4.2 Handler with Path Parameters

```rust
use axum::extract::Path;

pub async fn get_{{ENTITY_NAME_LOWER}}(
    State(app_state): State<{{STATE_TYPE}}>,
    Extension(claims): Extension<{{AUTH_CLAIMS_TYPE}}>,
    Path(id): Path<String>,
) -> Result<Json<{{ENTITY_NAME}}>, {{ERROR_TYPE}}> {
    let _user_id = claims.{{AUTH_USER_ID_FIELD}}.clone();

    let result = helpers::get_{{ENTITY_NAME_LOWER}}_by_id(
        &app_state.{{DB_POOL_FIELD}},
        &id,
    ).await?;

    Ok(Json(result))
}
```

## 4.3 Handler with Query Parameters

```rust
use axum::extract::Query;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct List{{ENTITY_NAME}}Params {
    pub page: Option<u32>,
    pub limit: Option<u32>,
    pub status: Option<String>,
}

pub async fn list_{{ENTITY_NAME_LOWER}}s(
    State(app_state): State<{{STATE_TYPE}}>,
    Extension(claims): Extension<{{AUTH_CLAIMS_TYPE}}>,
    Query(params): Query<List{{ENTITY_NAME}}Params>,
) -> Result<Json<Paginated{{ENTITY_NAME}}Response>, {{ERROR_TYPE}}> {
    let user_id = claims.{{AUTH_USER_ID_FIELD}}.clone();

    let page = params.page.unwrap_or(1);
    let limit = params.limit.unwrap_or(10).min(50);

    let result = helpers::list_{{ENTITY_NAME_LOWER}}s(
        &app_state.{{DB_POOL_FIELD}},
        &user_id,
        page,
        limit,
    ).await?;

    Ok(Json(result))
}
```

## 4.4 Handler without Authentication (Public Endpoint)

```rust
pub async fn public_endpoint(
    State(app_state): State<{{STATE_TYPE}}>,
    Json(req): Json<PublicRequestType>,
) -> Result<Json<PublicResponseType>, {{ERROR_TYPE}}> {
    let result = helpers::process_public_request(
        &app_state.{{DB_POOL_FIELD}},
        &req,
    ).await?;

    Ok(Json(result))
}
```

## 4.5 Handler with Multipart Upload

```rust
use axum::extract::Multipart;

pub async fn upload_{{ENTITY_NAME_LOWER}}(
    State(app_state): State<{{STATE_TYPE}}>,
    Extension(claims): Extension<{{AUTH_CLAIMS_TYPE}}>,
    mut multipart: Multipart,
) -> Result<Json<{{ENTITY_NAME}}>, {{ERROR_TYPE}}> {
    let user_id = claims.{{AUTH_USER_ID_FIELD}}.clone();

    let mut file_data: Option<Vec<u8>> = None;
    let mut metadata: Option<UploadMetadata> = None;

    while let Some(field) = multipart.next_field().await.unwrap() {
        let name = field.name().unwrap().to_string();

        if name == "file" {
            file_data = Some(field.bytes().await.map_err(|_| {
                {{ERROR_TYPE}}::UnprocessableEntity {
                    error_values: None,
                    message: Some("Failed to read file".into()),
                    description: None,
                }
            })?.to_vec());
        } else if name == "data" {
            let data_bytes = field.bytes().await.map_err(|_| {
                {{ERROR_TYPE}}::UnprocessableEntity {
                    error_values: None,
                    message: Some("Failed to read data".into()),
                    description: None,
                }
            })?;
            metadata = serde_json::from_slice(&data_bytes).ok();
        }
    }

    let result = helpers::process_upload(
        &app_state.{{DB_POOL_FIELD}},
        &user_id,
        file_data,
        metadata,
    ).await?;

    Ok(Json(result))
}
```

## 4.6 Webhook Handler

```rust
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct WebhookPayload {
    pub event_type: String,
    pub data: serde_json::Value,
}

pub async fn webhook_handler(
    State(app_state): State<{{STATE_TYPE}}>,
    Json(payload): Json<WebhookPayload>,
) -> Result<(), {{ERROR_TYPE}}> {
    tracing::info!("Received webhook: {:?}", payload.event_type);

    helpers::process_webhook(
        &app_state.{{DB_POOL_FIELD}},
        &payload,
    ).await?;

    Ok(())
}
```

## 4.7 Update Handler

```rust
use super::types::Update{{ENTITY_NAME}}Req;

pub async fn update_{{ENTITY_NAME_LOWER}}(
    State(app_state): State<{{STATE_TYPE}}>,
    Extension(claims): Extension<{{AUTH_CLAIMS_TYPE}}>,
    Path(id): Path<String>,
    Json(req): Json<Update{{ENTITY_NAME}}Req>,
) -> Result<Json<{{ENTITY_NAME}}>, {{ERROR_TYPE}}> {
    let _user_id = claims.{{AUTH_USER_ID_FIELD}}.clone();

    let result = helpers::update_{{ENTITY_NAME_LOWER}}(
        &app_state.{{DB_POOL_FIELD}},
        &id,
        &req,
    ).await?;

    Ok(Json(result))
}
```

## 4.8 Delete Handler

```rust
pub async fn delete_{{ENTITY_NAME_LOWER}}(
    State(app_state): State<{{STATE_TYPE}}>,
    Extension(claims): Extension<{{AUTH_CLAIMS_TYPE}}>,
    Path(id): Path<String>,
) -> Result<Json<DeleteResponse>, {{ERROR_TYPE}}> {
    let _user_id = claims.{{AUTH_USER_ID_FIELD}}.clone();

    helpers::delete_{{ENTITY_NAME_LOWER}}(
        &app_state.{{DB_POOL_FIELD}},
        &id,
    ).await?;

    Ok(Json(DeleteResponse {
        success: true,
        message: "Deleted successfully".into(),
    }))
}
```

## Checklist

- [ ] Extract user_id from `Extension<{{AUTH_CLAIMS_TYPE}}>` for authenticated routes
- [ ] Use `State<{{STATE_TYPE}}>` for database pool access
- [ ] Return `Result<Json<T>, {{ERROR_TYPE}}>`
- [ ] Keep handlers thin - delegate to helpers
- [ ] Use appropriate extractors (Json, Path, Query, Multipart)
- [ ] Validate input early and return meaningful errors
- [ ] Use `tracing` for logging instead of `println!`
