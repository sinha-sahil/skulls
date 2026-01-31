# {{SERVICE_NAME}} {{FEATURE_NAME}} - Type Definitions

## Overview

Create type definitions for the {{ENDPOINT_PATH}} endpoint (request/response types).

## Status

🔴 Not Started

## Dependencies

None - This task can be done independently

## When to Use This Template

Every endpoint needs type definitions for:

- Request body structure
- Response body structure
- Domain-specific types
- Enum types

---

## Files to Create

### `{{SERVICES_DIR}}{{SERVICE_NAME}}/types.rs` (NEW FILE or MODIFY EXISTING)

Create or update this file with the following content:

```rust
use serde::{Deserialize, Serialize};

// ============================================================================
// Request Type
// ============================================================================

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct {{REQUEST_TYPE}} {
    // Add request fields here
    // Example: pub shop_url: String,
    // Example: pub config: ConfigData,
}

// ============================================================================
// Response Type
// ============================================================================

#[derive(Deserialize, Serialize, Debug)]
pub struct {{RESPONSE_TYPE}} {
    pub success: bool,
    pub message: String,
    // Add additional response fields
    // Example: pub s3_path: String,
}

// ============================================================================
// Domain Types (if needed)
// ============================================================================

// Add domain-specific structs here
// Example:
// #[derive(Deserialize, Serialize, Debug, Clone)]
// pub struct ConfigData {
//     pub field1: String,
//     pub field2: i32,
// }

// ============================================================================
// Enums (if needed)
// ============================================================================

// Add enum types here
// Example:
// #[derive(Deserialize, Serialize, Debug, Clone)]
// #[serde(rename_all = "snake_case")]
// pub enum Status {
//     Active,
//     Inactive,
//     Pending,
// }
```

---

## Type Definition Patterns

### 1. Simple Request/Response

```rust
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct GetStatsReq {
    pub shop_url: String,
    pub start_date: String,
    pub end_date: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct GetStatsResp {
    pub success: bool,
    pub total_orders: i64,
    pub total_revenue: f64,
}
```

### 2. Nested Structures

```rust
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct UpdateConfigReq {
    pub shop_url: String,
    pub config: ConfigData,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ConfigData {
    pub enabled: bool,
    pub settings: Settings,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Settings {
    pub theme: String,
    pub max_items: i32,
}
```

### 3. Optional Fields

```rust
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct CreateItemReq {
    pub name: String,
    pub description: Option<String>,  // Optional field
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<String>,     // Omit from JSON if None
}
```

### 4. Default Values

```rust
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ConfigReq {
    pub name: String,
    #[serde(default = "default_enabled")]
    pub enabled: bool,  // Will use true if not provided
}

fn default_enabled() -> bool {
    true
}
```

### 5. Field Renaming

```rust
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Item {
    pub id: String,
    #[serde(rename = "type")]
    pub item_type: String,  // JSON field is "type", Rust field is "item_type"
}
```

### 6. Enums

```rust
#[derive(Deserialize, Serialize, Debug, Clone)]
#[serde(rename_all = "snake_case")]  // JSON: "pending", "active", "inactive"
pub enum Status {
    Pending,
    Active,
    Inactive,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]  // JSON: "DRAFT", "PUBLISHED"
pub enum PublishStatus {
    Draft,
    Published,
}
```

### 7. Arrays/Vectors

```rust
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct BulkUpdateReq {
    pub shop_url: String,
    pub items: Vec<Item>,  // Array of items
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Item {
    pub id: String,
    pub name: String,
}
```

### 8. Database Types (with sqlx)

```rust
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct DBRecord {
    pub id: String,
    pub shop_url: String,
    pub created_at: chrono::NaiveDateTime,
}
```

---

## Common Derives

### Always Include

```rust
#[derive(Debug, Clone)]  // For debugging and cloning
```

### For API Types (JSON)

```rust
#[derive(Deserialize, Serialize, Debug, Clone)]
```

### For Database Types

```rust
#[derive(FromRow, Debug, Clone, Serialize)]
```

### For Response-Only Types (can skip Clone)

```rust
#[derive(Serialize, Debug)]
```

---

## Serde Attributes Reference

### Common Attributes

```rust
#[serde(rename = "newName")]              // Rename single field
#[serde(rename_all = "snake_case")]       // Rename all fields in struct/enum
#[serde(skip)]                            // Skip field during serialization/deserialization
#[serde(skip_serializing_if = "Option::is_none")]  // Skip if None
#[serde(default)]                         // Use Default::default() if missing
#[serde(default = "function_name")]       // Use custom default function
#[serde(flatten)]                         // Flatten nested struct
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
- [ ] File created at `{{SERVICES_DIR}}{{SERVICE_NAME}}/types.rs`
- [ ] All structs have proper derives
- [ ] Request type defined
- [ ] Response type defined
- [ ] Enums use proper serde attributes
- [ ] Optional fields use `Option<T>`

---

## Notes

- DO NOT run `cargo build` - only use `cargo check`
- DO NOT add redundant comments explaining obvious fields
- Use descriptive field names that don't need comments
- Keep types focused and single-purpose
- Consider separating database types from API types if they differ significantly

---

## Example: Complete Types File

```rust
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct CreateProductReq {
    pub name: String,
    pub price: f64,
    pub category: Category,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct CreateProductResp {
    pub success: bool,
    pub message: String,
    pub product_id: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ProductDetails {
    pub sku: String,
    pub inventory_count: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
#[serde(rename_all = "snake_case")]
pub enum Category {
    Electronics,
    Clothing,
    HomeGoods,
}
```
