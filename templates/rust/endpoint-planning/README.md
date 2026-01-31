# Endpoint Planning Template - Overview

This directory contains templates for planning new API endpoint implementations in Rust/Axum projects.

## Project Configuration

**Before using these templates, configure the following for your project:**

### Required Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{CONFIG_FILE}}` | Path to your config/helpers file | `src/config.rs`, `src/helpers.rs` |
| `{{CONFIG_STRUCT}}` | Non-secret configuration struct | `AppConfig`, `StaticStrings` |
| `{{SECRETS_STRUCT}}` | Secrets/credentials struct | `AppSecrets`, `Credentials` |
| `{{STATE_TYPE}}` | Application state type | `AppState`, `App` |
| `{{ERROR_TYPE}}` | Your error enum type | `AppError`, `ApiError` |
| `{{SERVICES_DIR}}` | Services directory path | `src/services/`, `src/api/` |

### Authentication Placeholders (if using JWT)

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{TOKEN_CLAIMS_TYPE}}` | JWT claims struct | `UserClaims`, `TokenPayload` |
| `{{JWT_VERIFY_FN}}` | JWT verification function path | `crate::auth::verify_token` |
| `{{JWT_SECRET_FIELD}}` | JWT secret field in secrets struct | `jwt_secret`, `access_token_secret` |

---

## Template Structure

```text
templates/endpoint-planning/
├── README.md                           # This file
├── QUICK-REFERENCE.md                  # Fast lookup guide
├── 01-environment-setup.md             # Environment variables template
├── 02-type-definitions.md              # Request/response types template
├── 03-storage-layer.md                 # Storage functions template (if needed)
├── 04-handler.md                       # Handler function template
├── 05-router.md                        # Router & middleware template
└── 06-api-documentation.md             # API documentation template
```

## Directory Organization

> **Note:** Each feature should have its own subdirectory in your plans folder.

```text
plans/
├── README.md
└── {service}-{feature}/
    ├── 01-environment-setup.md     (if needed)
    ├── 02-type-definitions.md
    ├── 03-storage-layer.md         (if needed)
    ├── 04-handler.md
    ├── 05-router.md
    └── 06-api-documentation.md     (copy to docs/)
```

**API Documentation Location:**

```text
docs/api-documentation/
├── README.md                           # Index of all API endpoints
└── {service}-{feature}.md              # Individual endpoint docs
```

**Example:**

```text
plans/products-create/
├── 01-environment-setup.md
├── 02-type-definitions.md
├── 03-storage-layer.md
├── 04-handler.md
├── 05-router.md
└── 06-api-documentation.md

docs/api-documentation/
├── README.md
└── products-create.md
```

## When to Use These Templates

### Use Case 1: Simple Endpoint (No Storage)

**Example:** GET /users/profile

Use templates:

- 02-type-definitions.md
- 04-handler.md
- 05-router.md
- 06-api-documentation.md

Skip:

- 01-environment-setup.md (no env vars needed)
- 03-storage-layer.md (no storage)

### Use Case 2: Endpoint with Database Only

**Example:** POST /products

Use templates:

- 02-type-definitions.md
- 04-handler.md (adapt for database operations)
- 05-router.md
- 06-api-documentation.md

### Use Case 3: Endpoint with S3/External Storage

**Example:** PUT /products/images

Use templates:

- 01-environment-setup.md
- 02-type-definitions.md
- 03-storage-layer.md
- 04-handler.md
- 05-router.md
- 06-api-documentation.md

### Use Case 4: Public Webhook Endpoint

**Example:** POST /webhooks/payment

Use templates:

- 02-type-definitions.md
- 04-handler.md (adapt for webhook verification)
- 05-router.md (adapt for public routes)
- 06-api-documentation.md

## How to Use Templates

### Step 1: Copy Templates to Plans Directory

```bash
# Example for products list endpoint
mkdir -p plans/products-list
cp templates/endpoint-planning/02-type-definitions.md plans/products-list/02-types.md
cp templates/endpoint-planning/04-handler.md plans/products-list/04-handler.md
cp templates/endpoint-planning/05-router.md plans/products-list/05-router.md
cp templates/endpoint-planning/06-api-documentation.md plans/products-list/06-api-docs.md
```

### Step 2: Fill in Template Variables

Each template has placeholders marked with `{{VARIABLE}}`. Replace them:

**Common Variables:**

- `{{SERVICE_NAME}}` - e.g., "products", "users", "orders"
- `{{ENDPOINT_PATH}}` - e.g., "/products", "/users/profile"
- `{{HTTP_METHOD}}` - e.g., "GET", "POST", "PUT", "DELETE"
- `{{HANDLER_NAME}}` - e.g., "list_products", "create_user", "update_order"
- `{{REQUEST_TYPE}}` - e.g., "ListProductsReq", "CreateUserReq"
- `{{RESPONSE_TYPE}}` - e.g., "ListProductsResp", "CreateUserResp"
- `{{AUTH_TYPE}}` - e.g., "JWT", "API_KEY", "PUBLIC", "HMAC"

### Step 3: Customize for Your Use Case

- Remove sections that don't apply
- Add service-specific logic
- Update code examples

### Step 4: Review Complete Plan

- Ensure all prerequisites are documented
- Verify task dependencies
- Check verification steps are included

### Step 5: Create API Documentation

After completing implementation (steps 01-05), create the API documentation:

```bash
# Copy the 06 template content to the final API docs location
cp plans/{service}-{feature}/06-api-docs.md docs/api-documentation/{service}-{feature}.md
```

### Step 6: Implement

Follow the plan files in order (01-05), then finalize API docs (06)

## Template Features

### ✅ Includes

- Code snippets with proper patterns
- Verification steps (cargo check, fmt, clippy)
- Testing examples
- Proper error handling patterns
- Authentication patterns (JWT, API key, HMAC)

### ✅ Modular Design

Pick and choose only the templates you need for your specific endpoint

## Authentication Patterns Included

### JWT Access Token

- Header: `x-access-token` (configurable)
- Claims: `{{TOKEN_CLAIMS_TYPE}}`
- Use for: User-authenticated endpoints

### Admin API Key

- Header: `x-api-key`
- Use for: Internal admin endpoints

### HMAC Verification

- Header: `x-signature` or similar
- Verified in handler (not middleware)
- Use for: Webhook endpoints

### Public (No Auth)

- No middleware
- Use for: Public endpoints

## Storage Patterns Included

### AWS S3

- Upload/download functions
- Path conventions
- Content-Type handling
- Error handling

### PostgreSQL

- Query patterns with sqlx
- Transaction handling
- Type mapping with FromRow

### Redis (Optional)

- Caching patterns
- Key conventions

## Example: Planning a New Endpoint

**Scenario:** Add `GET /products/analytics` endpoint

**Step 1:** Identify what you need

- ✅ Type definitions (request/response)
- ✅ Handler (query database for analytics)
- ✅ Router (JWT auth required)
- ❌ Storage layer (using database, not S3)
- ❌ Environment setup (no new env vars)

**Step 2:** Copy relevant templates

```bash
mkdir -p plans/products-analytics
cp templates/endpoint-planning/02-type-definitions.md plans/products-analytics/02-types.md
cp templates/endpoint-planning/04-handler.md plans/products-analytics/04-handler.md
cp templates/endpoint-planning/05-router.md plans/products-analytics/05-router.md
cp templates/endpoint-planning/06-api-documentation.md plans/products-analytics/06-api-docs.md
```

**Step 3:** Fill in variables

- SERVICE_NAME: "products"
- ENDPOINT_PATH: "/products/analytics"
- HTTP_METHOD: "GET"
- HANDLER_NAME: "get_analytics"
- AUTH_TYPE: "JWT"

**Step 4:** Customize handler template

- Replace S3 storage with database queries
- Add analytics aggregation logic

**Step 5:** Complete implementation (steps 02-05)

**Step 6:** Create final API documentation

```bash
# After implementation is complete and tested
cp plans/products-analytics/06-api-docs.md docs/api-documentation/products-analytics.md
# Fill in real examples and test curl commands
```

**Step 7:** Review and verify

## Tips

### Naming Conventions

- Plan files: Keep template numbers (02, 04, 05, 06) for clarity
- API docs: `{service}-{feature}.md` in `docs/api-documentation/`
- Keep plan files focused and modular

### Task Dependencies

- Always list prerequisites at top
- Number tasks in dependency order
- Mark completion status

### Verification

- Include `cargo check && cargo fmt --all && cargo clippy` after each task
- Add testing examples with curl
- Document expected responses

### Documentation

- Plans are for AI/developer implementation
- API docs are for external integrators
- Keep them separate and focused
- Always create API docs (step 06) after implementation is complete and tested

## Maintenance

### Updating Templates

When patterns change or improve:

1. Update relevant template
2. Document change in template notes
3. Update this README if structure changes

### Adding New Templates

For new patterns (e.g., GraphQL endpoints):

1. Create new template file
2. Follow existing template structure
3. Add to README with use case
