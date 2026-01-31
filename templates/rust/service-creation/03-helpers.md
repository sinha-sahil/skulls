# Step 3: Helpers Layer (`helpers.rs`)

**Dependencies:** Step 1 (types.rs), Step 2 (storage.rs)

**Can be implemented in parallel with:** Step 6, Step 7, Step 8

## 3.1 CRUD Helper Functions

```rust
use super::{
    storage,
    types::{DB{{ENTITY_NAME}}, {{ENTITY_NAME}}, Create{{ENTITY_NAME}}Req, Update{{ENTITY_NAME}}Req},
};
use {{ERROR_MODULE}}::{{ERROR_TYPE}};
use sqlx::PgPool;

pub async fn create_{{ENTITY_NAME_LOWER}}(
    pool: &PgPool,
    payload: &Create{{ENTITY_NAME}}Req,
) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
    let db_{{ENTITY_NAME_LOWER}} = storage::insert_{{ENTITY_NAME_LOWER}}(pool, payload).await?;
    Ok({{ENTITY_NAME}}::from_db_{{ENTITY_NAME_LOWER}}(db_{{ENTITY_NAME_LOWER}}))
}

pub async fn get_{{ENTITY_NAME_LOWER}}_by_id(
    pool: &PgPool,
    id: &str,
) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
    let db_{{ENTITY_NAME_LOWER}} = storage::get_{{ENTITY_NAME_LOWER}}_by_id(pool, id).await?;
    Ok({{ENTITY_NAME}}::from_db_{{ENTITY_NAME_LOWER}}(db_{{ENTITY_NAME_LOWER}}))
}

pub async fn update_{{ENTITY_NAME_LOWER}}(
    pool: &PgPool,
    id: &str,
    payload: &Update{{ENTITY_NAME}}Req,
) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
    let db_{{ENTITY_NAME_LOWER}} = storage::update_{{ENTITY_NAME_LOWER}}(pool, id, payload).await?;
    Ok({{ENTITY_NAME}}::from_db_{{ENTITY_NAME_LOWER}}(db_{{ENTITY_NAME_LOWER}}))
}

pub async fn delete_{{ENTITY_NAME_LOWER}}(
    pool: &PgPool,
    id: &str,
) -> Result<(), {{ERROR_TYPE}}> {
    storage::delete_{{ENTITY_NAME_LOWER}}(pool, id).await
}
```

## 3.2 Business Logic Functions

```rust
pub async fn process_{{ENTITY_NAME_LOWER}}(
    pool: &PgPool,
    user_id: &str,
    // other params
) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}> {
    // 1. Validate input
    if user_id.is_empty() {
        return Err({{ERROR_TYPE}}::UnprocessableEntity {
            error_values: None,
            message: Some("User ID is required".into()),
            description: Some("User ID cannot be empty".into()),
        });
    }

    // 2. Fetch required data
    let entity = get_{{ENTITY_NAME_LOWER}}_by_id(pool, id).await?;

    // 3. Apply business logic
    let processed_data = transform_data(&entity);

    // 4. Update database if needed
    let updated = storage::update_{{ENTITY_NAME_LOWER}}(pool, id, &processed_data).await?;

    // 5. Return result
    Ok({{ENTITY_NAME}}::from_db_{{ENTITY_NAME_LOWER}}(updated))
}
```

## 3.3 Data Transformation Functions

```rust
pub fn transform_{{ENTITY_NAME_LOWER}}_list(
    db_entities: Vec<DB{{ENTITY_NAME}}>,
) -> Vec<{{ENTITY_NAME}}> {
    db_entities
        .into_iter()
        .map(|db_entity| {{ENTITY_NAME}}::from_db_{{ENTITY_NAME_LOWER}}(db_entity))
        .collect()
}

pub fn filter_by_status(
    entities: Vec<{{ENTITY_NAME}}>,
    status: {{ENTITY_NAME}}Status,
) -> Vec<{{ENTITY_NAME}}> {
    entities
        .into_iter()
        .filter(|e| e.status == status)
        .collect()
}
```

## 3.4 Cross-Service Operations

```rust
use crate::services::{other_service, another_service::storage as another_storage};

pub async fn process_with_related_data(
    pool: &PgPool,
    entity_id: &str,
) -> Result<ComplexResponse, {{ERROR_TYPE}}> {
    // Fetch from current service
    let entity = storage::get_{{ENTITY_NAME_LOWER}}_by_id(pool, entity_id).await?;

    // Fetch from other service
    let related_data = other_service::get_related_data(pool, &entity.related_id).await?;

    // Combine results
    Ok(ComplexResponse {
        entity: {{ENTITY_NAME}}::from_db_{{ENTITY_NAME_LOWER}}(entity),
        related: related_data,
    })
}
```

## 3.5 List with Pagination

```rust
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct Paginated{{ENTITY_NAME}}Response {
    pub items: Vec<{{ENTITY_NAME}}>,
    pub total: i64,
    pub page: u32,
    pub limit: u32,
}

pub async fn list_{{ENTITY_NAME_LOWER}}s(
    pool: &PgPool,
    user_id: &str,
    page: u32,
    limit: u32,
) -> Result<Paginated{{ENTITY_NAME}}Response, {{ERROR_TYPE}}> {
    let (db_entities, total) = storage::get_{{ENTITY_NAME_LOWER}}s_paginated(pool, page, limit).await?;

    let items = transform_{{ENTITY_NAME_LOWER}}_list(db_entities);

    Ok(Paginated{{ENTITY_NAME}}Response {
        items,
        total,
        page,
        limit,
    })
}
```

## Checklist

- [ ] Convert DB types to API types in helpers
- [ ] Keep handlers thin, move logic to helpers
- [ ] Handle data transformation and business rules
- [ ] Validate business constraints
- [ ] Use `?` operator for error propagation
- [ ] Import other services at module level, use scoped calls
