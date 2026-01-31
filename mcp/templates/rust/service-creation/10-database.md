# Step 10: Database Schema (if new tables needed)

**Dependencies:** None

**Can be implemented in parallel with:** All other steps

## Important Rules

1. **Append to migrations file** - Add changes to `{{MIGRATIONS_FILE}}`
2. **Comment your changes** - Explain what and why
3. **Use appropriate types** - VARCHAR(21) for nanoid IDs, TIMESTAMP WITH TIME ZONE for dates

## 10.1 Create New Table

Append to `{{MIGRATIONS_FILE}}`:

```sql
-- {{SERVICE_NAME_PASCAL}} table for {description}
-- Added: {date}
CREATE TABLE IF NOT EXISTS {{TABLE_NAME}} (
    id VARCHAR(21) PRIMARY KEY,
    user_id VARCHAR(21) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    amount VARCHAR(50),
    -- Add other columns as needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_{{TABLE_NAME}}_user
        FOREIGN KEY (user_id)
        REFERENCES "user"(id)
        ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_{{TABLE_NAME}}_user_id ON {{TABLE_NAME}}(user_id);
CREATE INDEX IF NOT EXISTS idx_{{TABLE_NAME}}_status ON {{TABLE_NAME}}(status);
CREATE INDEX IF NOT EXISTS idx_{{TABLE_NAME}}_created_at ON {{TABLE_NAME}}(created_at);
```

## 10.2 Add Column to Existing Table

```sql
-- Add {column_name} to {{TABLE_NAME}} for {reason}
-- Added: {date}
ALTER TABLE {{TABLE_NAME}}
ADD COLUMN IF NOT EXISTS {column_name} VARCHAR(255);
```

## 10.3 Rename Column

```sql
-- Rename {old_name} to {new_name} in {{TABLE_NAME}}
-- Reason: {explain why}
ALTER TABLE {{TABLE_NAME}}
RENAME COLUMN {old_name} TO {new_name};
```

## 10.4 Add Index

```sql
-- Add index on {{TABLE_NAME}}.{column} for query optimization
CREATE INDEX IF NOT EXISTS idx_{{TABLE_NAME}}_{column}
ON {{TABLE_NAME}}({column});

-- Composite index for multi-column queries
CREATE INDEX IF NOT EXISTS idx_{{TABLE_NAME}}_{col1}_{col2}
ON {{TABLE_NAME}}({col1}, {col2});
```

## 10.5 Add Constraint

```sql
-- Add unique constraint on {{TABLE_NAME}}
ALTER TABLE {{TABLE_NAME}}
ADD CONSTRAINT unique_{{TABLE_NAME}}_{column}
UNIQUE ({column});

-- Add check constraint
ALTER TABLE {{TABLE_NAME}}
ADD CONSTRAINT check_{{TABLE_NAME}}_{column}
CHECK ({column} IN ('value1', 'value2', 'value3'));
```

## 10.6 Common Column Types

| Use Case | PostgreSQL Type | Rust Type |
|----------|----------------|-----------|
| IDs (nanoid) | VARCHAR(21) | String |
| Short text | VARCHAR(255) | String |
| Long text | TEXT | String |
| Money amounts | VARCHAR(50) | String (parse to i32) |
| Timestamps | TIMESTAMP WITH TIME ZONE | sqlx::types::time::OffsetDateTime |
| Boolean | BOOLEAN | bool |
| Integer | INTEGER | i32 |
| Big Integer | BIGINT | i64 |
| JSON data | JSONB | serde_json::Value |
| Enum values | VARCHAR(50) | Custom enum with Type impl |

## 10.7 Example: Complete Table Definition

```sql
-- {{ENTITY_NAME}} tracking for {{SERVICE_NAME}}
-- Added: YYYY-MM-DD
CREATE TABLE IF NOT EXISTS {{TABLE_NAME}} (
    id VARCHAR(21) PRIMARY KEY,
    user_id VARCHAR(21) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    amount VARCHAR(50),
    metadata JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_{{TABLE_NAME}}_user
        FOREIGN KEY (user_id)
        REFERENCES "user"(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_{{TABLE_NAME}}_name_user
        UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_{{TABLE_NAME}}_user_id
ON {{TABLE_NAME}}(user_id);

CREATE INDEX IF NOT EXISTS idx_{{TABLE_NAME}}_status
ON {{TABLE_NAME}}(status);

CREATE INDEX IF NOT EXISTS idx_{{TABLE_NAME}}_created_at
ON {{TABLE_NAME}}(created_at);
```

## Checklist

- [ ] Append schema changes to `{{MIGRATIONS_FILE}}`
- [ ] Add comments explaining the change
- [ ] Include appropriate indexes
- [ ] Use `IF NOT EXISTS` for idempotent DDL
- [ ] Add foreign key constraints where applicable
- [ ] Test locally before committing
- [ ] Update application code to match schema changes
