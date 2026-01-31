# Step 9: Integration

**Dependencies:** All previous steps

> **Note:** Must be implemented last.

## 9.1 Register Service Module

Add the service module declaration in `{{SERVICES_DIR}}mod.rs`:

```rust
pub mod auth;
pub mod users;
pub mod {{SERVICE_NAME}};  // Add new service here
```

## 9.2 Add Router to Main Application

In `src/main.rs`, add the service router in the router setup:

```rust
async fn get_router() -> Router {
    let app_state = get_app_state().await;
    Router::new()
        .route("/", get(health_check))
        .merge(services::auth::auth_router())
        .merge(services::users::users_router())
        .merge(services::{{SERVICE_NAME}}::{{SERVICE_NAME}}_router())  // Add new router
        .layer((
            SetSensitiveHeadersLayer::new([AUTHORIZATION]),
            CompressionLayer::new(),
            TraceLayer::new_for_http().on_failure(()),
            TimeoutLayer::new(Duration::from_secs(30)),
            CatchPanicLayer::new(),
            CorsLayer::new().allow_origin(Any).allow_headers(Any),
        ))
        .layer(Extension(app_state.clone()))
        .with_state(app_state)
}
```

## 9.3 Register Scheduler Handler (if applicable)

In the scheduler setup function:

```rust
pub async fn setup_scheduler(
    redis_pool: RedisPool,
    redis_pubsub: Arc<Mutex<Option<RedisPubSub>>>,
    pg_pool: PgPool,
) -> Scheduler {
    let mut scheduler = Scheduler::new(redis_pool, redis_pubsub, pg_pool);

    // Register existing handlers
    scheduler.register_handler(services::auth::create_auth_scheduler_handler());

    // Register new service handler
    scheduler.register_handler(services::{{SERVICE_NAME}}::create_{{SERVICE_NAME}}_scheduler_handler());

    scheduler
}
```

## 9.4 Verify Integration

After integration, verify:

1. **Compilation**: Run `cargo check` to ensure no compilation errors
2. **Routes**: Start the server and verify endpoints are accessible
3. **Authentication**: Test authenticated endpoints with valid tokens
4. **Database**: Verify database operations work correctly
5. **Scheduler**: If applicable, verify scheduled tasks are triggered

## 9.5 Testing Endpoints

```bash
# Health check
curl http://localhost:3000/

# Test authenticated endpoint
curl -X POST http://localhost:3000/{{SERVICE_NAME}} \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'

# Test public endpoint
curl http://localhost:3000/{{SERVICE_NAME}}/public

# Test GET by ID
curl http://localhost:3000/{{SERVICE_NAME}}/some-id \
  -H "Authorization: Bearer <token>"

# Test list endpoint
curl "http://localhost:3000/{{SERVICE_NAME}}/list?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

## Checklist

- [ ] Add module declaration in `{{SERVICES_DIR}}mod.rs`
- [ ] Merge router in `src/main.rs` router setup
- [ ] Register scheduler handler if needed
- [ ] Run `cargo check` to verify compilation
- [ ] Run `cargo fmt --all` for formatting
- [ ] Run `cargo clippy` for linting
- [ ] Test endpoints manually or with automated tests
- [ ] Verify database migrations applied (if any)
