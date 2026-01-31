# Endpoint Planning Templates - Quick Reference

## Template Variables Reference

Replace these placeholders when using templates:

### Service & Feature

| Variable | Example | Description |
|----------|---------|-------------|
| `{{SERVICE_NAME}}` | `products`, `users`, `orders` | Service name (lowercase) |
| `{{FEATURE_NAME}}` | `Create`, `Analytics`, `Config` | Feature being implemented |
| `{{DESCRIPTION}}` | `S3 image storage` | Brief description |

### Endpoint Details

| Variable | Example | Description |
|----------|---------|-------------|
| `{{ENDPOINT_PATH}}` | `/products`, `/users/profile` | Full endpoint path |
| `{{HTTP_METHOD}}` | `GET`, `POST`, `PUT`, `DELETE` | HTTP method (uppercase) |
| `{{HTTP_METHOD_LOWER}}` | `get`, `post`, `put`, `delete` | HTTP method (lowercase for Axum) |

### Code Elements

| Variable | Example | Description |
|----------|---------|-------------|
| `{{HANDLER_NAME}}` | `create_product`, `get_user` | Handler function name (snake_case) |
| `{{REQUEST_TYPE}}` | `CreateProductReq`, `GetUserReq` | Request type name (PascalCase) |
| `{{RESPONSE_TYPE}}` | `CreateProductResp`, `GetUserResp` | Response type name (PascalCase) |

### Project Configuration

| Variable | Example | Description |
|----------|---------|-------------|
| `{{CONFIG_FILE}}` | `src/config.rs` | Path to config file |
| `{{CONFIG_STRUCT}}` | `AppConfig` | Config struct name |
| `{{SECRETS_STRUCT}}` | `AppSecrets` | Secrets struct name |
| `{{STATE_TYPE}}` | `AppState` | Application state type |
| `{{ERROR_TYPE}}` | `AppError` | Error enum type |
| `{{SERVICES_DIR}}` | `src/services/` | Services directory path |

### Authentication

| Variable | Example | Description |
|----------|---------|-------------|
| `{{TOKEN_CLAIMS_TYPE}}` | `UserClaims` | JWT claims struct |
| `{{JWT_VERIFY_FN}}` | `verify_token` | JWT verification function |
| `{{JWT_SECRET_FIELD}}` | `jwt_secret` | JWT secret field in secrets |
| `{{AUTH_TYPE}}` | `JWT`, `API_KEY`, `HMAC`, `PUBLIC` | Authentication type |

### Environment

| Variable | Example | Description |
|----------|---------|-------------|
| `{{ENV_VAR_NAME}}` | `PRODUCTS_S3_BUCKET` | Environment variable name |
| `{{field_name}}` | `products_s3_bucket` | Struct field name (snake_case) |

---

## Quick Decision Tree

```text
New Endpoint Needed?
├─ Does it need NEW environment variables?
│  └─ YES → Use Template 01 (environment-setup.md)
│  └─ NO  → Skip Template 01
│
├─ Does it need request/response types?
│  └─ YES → Use Template 02 (type-definitions.md)
│
├─ Does it use S3 or external storage?
│  └─ YES → Use Template 03 (storage-layer.md)
│  └─ NO (database only) → Skip Template 03
│
├─ Create handler logic
│  └─ ALWAYS → Use Template 04 (handler.md)
│
├─ Does it need authentication?
│  ├─ JWT Token → Use Template 05 with Pattern A
│  ├─ API Key → Use Template 05 with Pattern B
│  ├─ Webhook HMAC → Use Template 05 with Pattern C
│  └─ Public → Use Template 05 with Pattern D
│
└─ Create API documentation for integrators
   └─ ALWAYS → Use Template 06 (api-documentation.md)
```

---

## Common Patterns Quick Reference

### Pattern 1: Simple GET endpoint (no auth)

**Templates:** 02, 04, 05, 06

```text
Example: GET /products
- Types for response
- Handler with database query
- Public router
- API documentation
```

### Pattern 2: POST/PUT with JWT auth

**Templates:** 02, 04, 05, 06

```text
Example: POST /products
- Types for request/response
- Handler with validation
- JWT middleware router
- API documentation
```

### Pattern 3: PUT with S3 storage

**Templates:** 01, 02, 03, 04, 05, 06

```text
Example: PUT /products/images
- Environment: S3_BUCKET
- Types for image metadata
- Storage: S3 upload/download
- Handler with S3 calls
- JWT middleware router
- API documentation
```

### Pattern 4: Webhook endpoint

**Templates:** 02, 04, 05, 06

```text
Example: POST /webhooks/payment
- Types for webhook payload
- Handler with HMAC verification
- Public router (no middleware)
- API documentation
```

---

## Template File Naming Convention

When copying templates to your plans directory:

```text
plans/{service}-{feature}/
├── 01-environment.md        (if needed)
├── 02-types.md
├── 03-storage.md            (if needed)
├── 04-handler.md
├── 05-router.md
└── 06-api-docs.md

Then after implementation:
docs/api-documentation/{service}-{feature}.md
```

Examples:

```text
plans/products-list/
├── 02-types.md
├── 04-handler.md
├── 05-router.md
└── 06-api-docs.md

docs/api-documentation/products-list.md

plans/users-profile/
├── 02-types.md
├── 04-handler.md
├── 05-router.md
└── 06-api-docs.md

docs/api-documentation/users-profile.md

plans/orders-export/
├── 01-environment.md
├── 02-types.md
├── 03-storage.md
├── 04-handler.md
├── 05-router.md
└── 06-api-docs.md

docs/api-documentation/orders-export.md
```

---

## Checklist After Using Templates

For each template used:

- [ ] All `{{VARIABLES}}` replaced with actual values
- [ ] Removed sections marked "if needed" that don't apply
- [ ] Added service-specific logic
- [ ] Verified examples match your use case
- [ ] Updated verification steps
- [ ] Ran `cargo check` after implementation
- [ ] Ran `cargo fmt --all`
- [ ] Ran `cargo clippy` with no warnings
- [ ] Created API documentation in `docs/api-documentation/`
- [ ] Added entry to `docs/api-documentation/README.md` index
- [ ] Tested all curl examples in API docs

---

## Authentication Quick Guide

| Auth Type | Header | When to Use |
|-----------|--------|-------------|
| JWT | `x-access-token` | User-authenticated endpoints |
| API Key | `x-api-key` | Internal admin only |
| HMAC | `x-signature` | Webhook endpoints |
| Public | None | Public endpoints |

---

## Common Imports Quick Reference

### Handler File

```rust
use axum::extract::State;
use axum::Json;
use crate::error::{{ERROR_TYPE}};
use crate::{{STATE_TYPE}};
use super::types::{RequestType, ResponseType};
```

### Router File (with auth)

```rust
use axum::{middleware::from_fn, routing::put, Router};
use crate::{{STATE_TYPE}};
```

### Middleware File (JWT)

```rust
use crate::auth::{{TOKEN_CLAIMS_TYPE}};
use crate::auth::{{JWT_VERIFY_FN}};
use crate::error::{{ERROR_TYPE}};
use crate::{{STATE_TYPE}};
use axum::{extract::Request, http::HeaderMap, middleware, response::Response, Extension};
```

---

## Template Maintenance

When updating templates:

1. Update template file in `templates/endpoint-planning/`
2. Update this quick reference if structure changes
3. Update README.md if new patterns added
4. Test templates with a real endpoint implementation

---

## Complete Workflow

1. **Plan** - Copy templates 01-06 to `plans/{service}-{feature}/`
2. **Fill Variables** - Replace all `{{PLACEHOLDERS}}`
3. **Implement** - Follow templates 01-05 in order
4. **Test** - Verify endpoint works with curl
5. **Document** - Finalize template 06 and copy to `docs/api-documentation/`
6. **Index** - Add entry to `docs/api-documentation/README.md`

---

## Getting Help

- See `templates/endpoint-planning/README.md` for detailed guide with project configuration
- Check the Project Configuration section in README.md to set up your project-specific placeholders
