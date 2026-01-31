# Service Creation Templates - Quick Reference

## Template Variables Reference

Replace these placeholders when using templates:

### Core Types

| Variable | Example | Description |
|----------|---------|-------------|
| `{{STATE_TYPE}}` | `AppState` | Application state type |
| `{{ERROR_TYPE}}` | `AppError` | Error enum type |
| `{{ERROR_MODULE}}` | `crate::error` | Path to error module |
| `{{SERVICES_DIR}}` | `src/services/` | Services directory path |
| `{{DB_POOL_TYPE}}` | `PgPool` | Database pool type |
| `{{DB_POOL_FIELD}}` | `pg_pool` | Pool field in app state |

### Authentication

| Variable | Example | Description |
|----------|---------|-------------|
| `{{AUTH_CLAIMS_TYPE}}` | `UserClaims` | Authenticated user claims type |
| `{{AUTH_VERIFY_FN}}` | `auth::verify_token` | Token verification function |
| `{{AUTH_USER_ID_FIELD}}` | `user_id` | Field to extract user ID |
| `{{AUTH_HEADER_NAME}}` | `x-access-token` | Auth header name |
| `{{JWT_VERIFY_FN}}` | `verify_token` | JWT verification function |
| `{{JWT_SECRET_FIELD}}` | `jwt_secret` | JWT secret field in secrets |

### Service-Specific

| Variable | Example | Description |
|----------|---------|-------------|
| `{{SERVICE_NAME}}` | `orders` | Service name (snake_case) |
| `{{SERVICE_NAME_PASCAL}}` | `Orders` | Service name (PascalCase) |
| `{{ENTITY_NAME}}` | `Order` | Primary entity (PascalCase) |
| `{{ENTITY_NAME_LOWER}}` | `order` | Entity name (snake_case) |
| `{{TABLE_NAME}}` | `orders` | Database table name |
| `{{MIGRATIONS_FILE}}` | `migrations/init.sql` | Database migrations file |

---

## Quick Decision Tree

```text
New Service Needed?
├─ Define types first
│  └─ ALWAYS → Use Template 01 (types.rs)
│
├─ Does it need database operations?
│  └─ YES → Use Template 02 (storage.rs)
│  └─ NO  → Skip Template 02
│
├─ Does it have business logic?
│  └─ YES → Use Template 03 (helpers.rs)
│
├─ Create HTTP handlers
│  └─ ALWAYS → Use Template 04 (handler.rs)
│
├─ Set up router
│  └─ ALWAYS → Use Template 05 (mod.rs)
│
├─ Does it need custom authentication?
│  └─ YES → Use Template 06 (middleware.rs)
│  └─ NO  → Reuse existing middleware
│
├─ Does it call external APIs?
│  └─ YES → Use Template 07 (remote.rs)
│  └─ NO  → Skip Template 07
│
├─ Does it need scheduled tasks?
│  └─ YES → Use Template 08 (scheduler.rs)
│  └─ NO  → Skip Template 08
│
├─ Integration
│  └─ ALWAYS → Use Template 09 (integration)
│
└─ Does it need new database tables?
   └─ YES → Use Template 10 (database.md)
   └─ NO  → Skip Template 10
```

---

## Implementation Phases

### Phase 1 (No dependencies - start immediately)

| Step | File | Description |
|------|------|-------------|
| 01 | `types.rs` | Define DB types, request/response types |
| 06 | `middleware.rs` | Custom auth middleware (if needed) |
| 07 | `remote.rs` | External API calls (if needed) |
| 08 | `scheduler.rs` | Scheduled tasks (if needed) |
| 10 | Database | Schema changes |

### Phase 2 (After Phase 1)

| Step | File | Description |
|------|------|-------------|
| 02 | `storage.rs` | Database operations (needs types) |
| 03 | `helpers.rs` | Business logic (needs types, storage) |

### Phase 3 (After Phase 2)

| Step | File | Description |
|------|------|-------------|
| 04 | `handler.rs` | HTTP handlers (needs helpers) |

### Phase 4 (Final)

| Step | File | Description |
|------|------|-------------|
| 05 | `mod.rs` | Router setup (needs handlers) |
| 09 | Integration | Register service (needs router) |

---

## Common Patterns Quick Reference

### Pattern 1: Simple CRUD Service

**Templates:** 01, 02, 03, 04, 05, 09, 10

```text
Example: Users service
- Types for User entity
- Storage for DB operations
- Helpers for business logic
- Handlers for HTTP endpoints
- Router with auth middleware
- Integration in main.rs
- Database table creation
```

### Pattern 2: Service with External API

**Templates:** 01, 02, 03, 04, 05, 07, 09

```text
Example: Payment service
- Types for payment data
- Storage for transaction records
- Remote API calls to payment provider
- Helpers combining DB + API
- Handlers for client requests
- Router setup
```

### Pattern 3: Background Processing Service

**Templates:** 01, 02, 03, 08, 09, 10

```text
Example: Notification service
- Types for notifications
- Storage for notification queue
- Scheduler for periodic processing
- Helpers for sending logic
- Integration with scheduler
```

### Pattern 4: Webhook Receiver

**Templates:** 01, 02, 03, 04, 05, 09

```text
Example: Payment webhook handler
- Types for webhook payload
- Storage for event logging
- Handlers with signature verification
- Public route (no auth middleware)
```

---

## File Structure

```text
{{SERVICES_DIR}}{{SERVICE_NAME}}/
├── mod.rs          # Router + module exports
├── handler.rs      # HTTP request handlers
├── helpers.rs      # Business logic functions
├── storage.rs      # Database operations (optional)
├── types.rs        # Types definitions (optional)
├── middleware.rs   # Custom middleware (optional)
├── remote.rs       # External API calls (optional)
└── scheduler.rs    # Scheduled tasks (optional)
```

---

## Common Imports Quick Reference

### Handler File

```rust
use axum::{extract::State, Extension, Json};
use {{ERROR_MODULE}}::{{ERROR_TYPE}};
use crate::{{STATE_TYPE}};
use super::{helpers, types::{Create{{ENTITY_NAME}}Req, {{ENTITY_NAME}}}};
```

### Storage File

```rust
use sqlx::PgPool;
use {{ERROR_MODULE}}::{{ERROR_TYPE}};
use super::types::{DB{{ENTITY_NAME}}, {{ENTITY_NAME}}};
```

### Router File

```rust
use axum::{middleware::from_fn, routing::{get, post, patch, delete}, Router};
use crate::{{STATE_TYPE}};
use middleware::auth_middleware;
```

### Middleware File

```rust
use axum::{extract::Request, http::HeaderMap, middleware, response::Response, Extension};
use {{ERROR_MODULE}}::{{ERROR_TYPE}};
use crate::{{STATE_TYPE}};
```

---

## Checklist After Using Templates

For each template used:

- [ ] All `{{VARIABLES}}` replaced with actual values
- [ ] Removed sections marked "optional" that don't apply
- [ ] Added service-specific logic
- [ ] Verified examples match your use case
- [ ] Updated verification steps
- [ ] Ran `cargo check` after implementation
- [ ] Ran `cargo fmt --all`
- [ ] Ran `cargo clippy` with no warnings
- [ ] Registered service in `{{SERVICES_DIR}}mod.rs`
- [ ] Added router to main application
- [ ] Tested endpoints with curl

---

## Error Handling Quick Reference

```rust
// Database error
{{ERROR_TYPE}}::DBError {
    error_values: None,
    message: Some("Operation failed".into()),
    description: Some(e.to_string()),
}

// Validation error
{{ERROR_TYPE}}::UnprocessableEntity {
    error_values: None,
    message: Some("Invalid input".into()),
    description: Some("Field X is required".into()),
}

// Not found
{{ERROR_TYPE}}::NotFound {
    message: Some("Resource not found".into()),
}

// Unauthorized
{{ERROR_TYPE}}::Unauthorized

// External service unavailable
{{ERROR_TYPE}}::Unavailable
```

---

## HTTP Method Reference

| Method | Axum Import | Use Case |
|--------|-------------|----------|
| GET | `get` | Retrieve resource(s) |
| POST | `post` | Create new resource |
| PUT | `put` | Replace entire resource |
| PATCH | `patch` | Partial update |
| DELETE | `delete` | Remove resource |

---

## Template Maintenance

When updating templates:

1. Update template file in `templates/service_creation/`
2. Update this quick reference if structure changes
3. Update README.md if new patterns added
4. Test templates with a real service implementation

---

## Getting Help

- See `templates/service_creation/README.md` for detailed guide
- Check the Project Configuration section in README.md for placeholder values
