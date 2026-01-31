# Service Creation Planning Template

This template guides the implementation of a new service.
Each file covers an independent, implementable step.

## Project Configuration

Before using these templates, configure your project-specific values:

### Core Types

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{STATE_TYPE}}` | Application state type | `AppState` |
| `{{ERROR_TYPE}}` | Error enum type | `AppError` |
| `{{ERROR_MODULE}}` | Path to error module | `crate::error` |
| `{{SERVICES_DIR}}` | Services directory path | `src/services/` |
| `{{DB_POOL_TYPE}}` | Database pool type | `PgPool` |

### Authentication

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{AUTH_CLAIMS_TYPE}}` | Authenticated user claims type | `UserClaims`, `TokenClaims` |
| `{{AUTH_VERIFY_FN}}` | Token verification function path | `auth::verify_token` |
| `{{AUTH_USER_ID_FIELD}}` | Field to extract user ID | `user_id`, `sub` |

### Database

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{MIGRATIONS_FILE}}` | Database migrations file | `migrations/init.sql` |
| `{{DB_POOL_FIELD}}` | Pool field in app state | `pg_pool`, `db_pool` |

### Service-Specific

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{SERVICE_NAME}}` | Service name (snake_case) | `orders`, `payments` |
| `{{SERVICE_NAME_PASCAL}}` | Service name (PascalCase) | `Orders`, `Payments` |
| `{{ENTITY_NAME}}` | Primary entity name | `Order`, `Payment` |
| `{{ENTITY_NAME_LOWER}}` | Entity name (snake_case) | `order`, `payment` |
| `{{TABLE_NAME}}` | Database table name | `orders`, `payments` |

---

## Service Overview

### Service Name

`{{SERVICE_NAME}}`

### Service Description

{Brief description of what the service does and its purpose}

### Required Files

Mark which files are needed for this service:

- [ ] `mod.rs` - Router and module exports (always required)
- [ ] `handler.rs` - HTTP request handlers (always required)
- [ ] `helpers.rs` - Business logic functions (always required)
- [ ] `storage.rs` - Database operations (if DB interaction needed)
- [ ] `types.rs` - Service-specific types (if custom types needed)
- [ ] `middleware.rs` - Service middleware (if custom auth/middleware needed)
- [ ] `remote.rs` - External API calls (if third-party APIs needed)
- [ ] `scheduler.rs` - Scheduled task handlers (if cron/scheduled tasks needed)

## Template Files

| File | Description |
|------|-------------|
| [01-types.md](./01-types.md) | Types definition (`types.rs`) |
| [02-storage.md](./02-storage.md) | Storage layer (`storage.rs`) |
| [03-helpers.md](./03-helpers.md) | Helpers layer (`helpers.rs`) |
| [04-handlers.md](./04-handlers.md) | Handler layer (`handler.rs`) |
| [05-router.md](./05-router.md) | Module router (`mod.rs`) |
| [06-middleware.md](./06-middleware.md) | Middleware - Optional (`middleware.rs`) |
| [07-remote.md](./07-remote.md) | Remote API - Optional (`remote.rs`) |
| [08-scheduler.md](./08-scheduler.md) | Scheduler - Optional (`scheduler.rs`) |
| [09-integration.md](./09-integration.md) | Integration steps |
| [10-database.md](./10-database.md) | Database schema changes |

## Implementation Order

For **parallel implementation**, group tasks by dependencies:

### Phase 1 (No dependencies - can start immediately)

- Step 1: Types (`types.rs`)
- Step 6: Middleware (`middleware.rs`)
- Step 7: Remote API (`remote.rs`)
- Step 8: Scheduler (`scheduler.rs`)
- Database schema changes

### Phase 2 (Depends on Phase 1)

- Step 2: Storage (`storage.rs`) - needs types
- Step 3: Helpers (`helpers.rs`) - needs types and storage

### Phase 3 (Depends on Phase 2)

- Step 4: Handlers (`handler.rs`) - needs helpers

### Phase 4 (Final - depends on all above)

- Step 5: Module Router (`mod.rs`)
- Step 9: Integration

## Notes for LLM Implementation

1. **Independence**: Each file can be implemented and tested in isolation
2. **Type Safety**: Always define types before using them in other modules
3. **Error Handling**: Use `{{ERROR_TYPE}}` enum consistently
4. **Naming Conventions**: Follow existing patterns (snake_case, prefixes)
5. **Database Optimization**: Avoid unnecessary ORDER BY; sort in application
6. **Import Style**: Import modules at top, use scoped calls in functions
