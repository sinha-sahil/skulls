# Step 1: Types Definition (`types.rs`)

**Dependencies:** None

**Can be implemented in parallel with:** Steps 6, 7, 8, 10

## 1.1 Database Types (DB prefixed)

Database row types that map directly to SQL table structure.

```rust
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow)]
#[allow(dead_code)]
pub struct DB{{ENTITY_NAME}} {
    pub id: String,
    // Add fields matching database columns
    pub created_at: sqlx::types::time::OffsetDateTime,
    pub updated_at: sqlx::types::time::OffsetDateTime,
}
```

**Checklist:**

- [ ] Define `DB{{ENTITY_NAME}}` structs for each database table
- [ ] Use `#[derive(Debug, Clone, FromRow)]`
- [ ] Include `#[allow(dead_code)]` if not all fields are used
- [ ] Map column types correctly (String for text, numeric types match DB)

## 1.2 API Response Types

Types returned to clients via HTTP responses.

```rust
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct {{ENTITY_NAME}} {
    pub id: String,
    // Add fields for API response
}

impl {{ENTITY_NAME}} {
    pub fn from_db_{{ENTITY_NAME_LOWER}}(db_{{ENTITY_NAME_LOWER}}: DB{{ENTITY_NAME}}) -> Self {
        Self {
            id: db_{{ENTITY_NAME_LOWER}}.id,
            // Map other fields
        }
    }
}
```

**Checklist:**

- [ ] Define response structs with `#[derive(Deserialize, Serialize, Debug)]`
- [ ] Implement `from_db_*` conversion methods
- [ ] Convert numeric string DB fields to proper types (e.g., `parse::<i32>()`)

## 1.3 Request Types

Types for incoming HTTP request bodies.

```rust
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct Create{{ENTITY_NAME}}Req {
    pub field_name: String,
    #[serde(rename = "externalFieldName")]  // If external API uses different naming
    pub internal_field_name: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Update{{ENTITY_NAME}}Req {
    pub field_name: Option<String>,
}
```

**Checklist:**

- [ ] Define request structs with `#[derive(Deserialize, Serialize, Debug)]`
- [ ] Use `snake_case` for field names internally
- [ ] Add `#[serde(rename = "...")]` for external API field name mappings
- [ ] Mark optional fields with `Option<T>`

## 1.4 Enum Types (if needed)

Custom enums with PostgreSQL type implementations.

```rust
use serde::{Deserialize, Serialize};
use sqlx::{postgres::PgTypeInfo, Decode, Postgres, Type};

#[derive(Deserialize, Serialize, Clone, Debug, PartialEq, Eq)]
pub enum {{ENTITY_NAME}}Status {
    Pending,
    Active,
    Completed,
}

impl Type<Postgres> for {{ENTITY_NAME}}Status {
    fn type_info() -> PgTypeInfo {
        PgTypeInfo::with_name("text")
    }
    fn compatible(ty: &PgTypeInfo) -> bool {
        <String as Type<Postgres>>::compatible(ty)
    }
}

impl<'r> Decode<'r, Postgres> for {{ENTITY_NAME}}Status {
    fn decode(value: sqlx::postgres::PgValueRef<'r>) -> Result<Self, sqlx::error::BoxDynError> {
        let s = <String as Decode<'r, Postgres>>::decode(value)?;
        match s.as_str().to_lowercase().as_str() {
            "pending" => Ok(Self::Pending),
            "active" => Ok(Self::Active),
            "completed" => Ok(Self::Completed),
            _ => Err("Unknown {{ENTITY_NAME}}Status".into()),
        }
    }
}

impl std::fmt::Display for {{ENTITY_NAME}}Status {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Pending => write!(f, "pending"),
            Self::Active => write!(f, "active"),
            Self::Completed => write!(f, "completed"),
        }
    }
}
```

**Checklist:**

- [ ] Define enum with proper derives
- [ ] Implement `Type<Postgres>` trait
- [ ] Implement `Decode<'r, Postgres>` trait
- [ ] Implement `Display` trait for string conversion
