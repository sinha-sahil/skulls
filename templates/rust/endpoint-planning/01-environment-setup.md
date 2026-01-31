# {{SERVICE_NAME}} {{FEATURE_NAME}} - Environment Setup

## Overview

Add environment variables and configuration for {{DESCRIPTION}}.

## Status

🔴 Not Started

## Dependencies

None - This task can be done independently

## When to Use This Template

Use this template when your endpoint requires:

- New environment variables (API keys, bucket names, URLs, etc.)
- New static configuration strings
- External service credentials

**Skip this template if:** Your endpoint only uses existing configuration.

---

## Files to Modify

### 1. `.env.example`

Add the following environment variables:

```bash
# {{SERVICE_NAME}} - {{FEATURE_NAME}}
{{ENV_VAR_NAME}}=your-value-here
# Example: PRODUCTS_S3_BUCKET=your-products-bucket-name
```

**Common Variable Types:**

- S3 buckets: `{SERVICE}_S3_BUCKET`
- API keys: `{SERVICE}_API_KEY`
- Base URLs: `{SERVICE}_BASE_URL`
- CDN URLs: `{SERVICE}_CDN_BASE`
- Secrets: `{SERVICE}_SECRET`

---

### 2. `{{CONFIG_FILE}}`

#### Option A: Add to `{{CONFIG_STRUCT}}` struct (for non-secret config)

**Step 1:** Update the `{{CONFIG_STRUCT}}` struct

```rust
#[derive(Debug, Clone)]
pub struct {{CONFIG_STRUCT}} {
    // ... existing fields ...
    pub {{field_name}}: String,
}
```

**Step 2:** Update the getter function

```rust
pub fn get_config() -> {{CONFIG_STRUCT}} {
    {{CONFIG_STRUCT}} {
        // ... existing fields ...
        {{field_name}}: std::env::var("{{ENV_VAR_NAME}}").unwrap(),
    }
}
```

**Example:**

```rust
pub products_s3_bucket: String,
// ...
products_s3_bucket: std::env::var("PRODUCTS_S3_BUCKET").unwrap(),
```

#### Option B: Add to `{{SECRETS_STRUCT}}` struct (for sensitive config)

**Step 1:** Update the `{{SECRETS_STRUCT}}` struct

```rust
#[derive(Debug, Clone)]
pub struct {{SECRETS_STRUCT}} {
    // ... existing fields ...
    pub {{field_name}}: String,
}
```

**Step 2:** Update the getter function

```rust
pub fn get_secrets() -> {{SECRETS_STRUCT}} {
    {{SECRETS_STRUCT}} {
        // ... existing fields ...
        {{field_name}}: std::env::var("{{ENV_VAR_NAME}}").unwrap(),
    }
}
```

**Example:**

```rust
pub products_api_key: String,
// ...
products_api_key: std::env::var("PRODUCTS_API_KEY").unwrap(),
```

---

## Decision Guide: Config vs Secrets

### Use `{{CONFIG_STRUCT}}` for

- ✅ S3 bucket names
- ✅ CDN/CloudFront URLs
- ✅ Public base URLs
- ✅ Non-sensitive configuration

### Use `{{SECRETS_STRUCT}}` for

- ✅ API keys
- ✅ Client secrets
- ✅ JWT secrets
- ✅ Database credentials
- ✅ Any sensitive data

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
- [ ] `.env.example` contains new environment variable(s)
- [ ] `{{CONFIG_STRUCT}}` or `{{SECRETS_STRUCT}}` struct updated
- [ ] Getter function updated
- [ ] Variable accessible via `app_state.config.{{field_name}}` or `app_state.secrets.{{field_name}}`

---

## Usage After Completion

Access the configuration in your code:

**For Config:**

```rust
pub async fn my_handler(
    State(app_state): State<{{STATE_TYPE}}>,
) -> Result<Json<Response>, {{ERROR_TYPE}}> {
    let config_value = &app_state.config.{{field_name}};
    // Use config_value...
}
```

**For Secrets:**

```rust
pub async fn my_handler(
    State(app_state): State<{{STATE_TYPE}}>,
) -> Result<Json<Response>, {{ERROR_TYPE}}> {
    let secret_value = &app_state.secrets.{{field_name}};
    // Use secret_value...
}
```

---

## Notes

- DO NOT run `cargo build` - only use `cargo check`
- DO NOT commit actual values to `.env.example` - only placeholders
- Ensure your local `.env` file has actual values for testing
- All environment variables are required (using `.unwrap()`)
- For optional env vars, use `.ok()` and `Option<String>` instead

---

## Common Patterns

### S3 Bucket

```rust
// .env.example
PRODUCTS_S3_BUCKET=your-bucket-name

// {{CONFIG_FILE}} - {{CONFIG_STRUCT}}
pub products_s3_bucket: String,
products_s3_bucket: std::env::var("PRODUCTS_S3_BUCKET").unwrap(),
```

### API Key

```rust
// .env.example
PRODUCTS_API_KEY=your-api-key

// {{CONFIG_FILE}} - {{SECRETS_STRUCT}}
pub products_api_key: String,
products_api_key: std::env::var("PRODUCTS_API_KEY").unwrap(),
```

### Multiple Related Variables

```rust
// .env.example
PRODUCTS_S3_BUCKET=your-bucket-name
PRODUCTS_CDN_BASE=https://cdn.example.com

// {{CONFIG_FILE}} - {{CONFIG_STRUCT}}
pub products_s3_bucket: String,
pub products_cdn_base: String,
products_s3_bucket: std::env::var("PRODUCTS_S3_BUCKET").unwrap(),
products_cdn_base: std::env::var("PRODUCTS_CDN_BASE").unwrap(),
```
