# Step 8: Scheduler (`scheduler.rs`) - Optional

**Dependencies:** None (but needs scheduler service structure)

**Can be implemented in parallel with:** All other steps

## 8.1 Basic Scheduler Handler

```rust
use crate::services::scheduler::{CallbackResult, ServiceCallbackHandler};

pub fn create_{{SERVICE_NAME}}_scheduler_handler() -> ServiceCallbackHandler {
    Box::new(
        |service: &str, callback_event: &str, _pool: &sqlx::PgPool| {
            if service != "{{SERVICE_NAME}}" {
                return CallbackResult::Ignored;
            }

            tracing::info!("{{SERVICE_NAME_PASCAL}} scheduler handler processing: {}", callback_event);

            CallbackResult::Ignored
        },
    )
}
```

## 8.2 With Event Handling

```rust
use crate::services::scheduler::{CallbackResult, ServiceCallbackHandler};
use sqlx::PgPool;

pub fn create_{{SERVICE_NAME}}_scheduler_handler() -> ServiceCallbackHandler {
    Box::new(
        |service: &str, callback_event: &str, pool: &PgPool| {
            if service != "{{SERVICE_NAME}}" {
                return CallbackResult::Ignored;
            }

            tracing::info!("{{SERVICE_NAME_PASCAL}} scheduler processing: {}", callback_event);

            match callback_event {
                "cleanup_expired" => {
                    handle_cleanup_expired(pool);
                    CallbackResult::Processed
                }
                "send_reminders" => {
                    handle_send_reminders(pool);
                    CallbackResult::Processed
                }
                "sync_external" => {
                    handle_sync_external(pool);
                    CallbackResult::Processed
                }
                _ => {
                    tracing::warn!("Unknown event: {}", callback_event);
                    CallbackResult::Ignored
                }
            }
        },
    )
}

fn handle_cleanup_expired(pool: &PgPool) {
    // Spawn async task for cleanup
    let pool = pool.clone();
    tokio::spawn(async move {
        if let Err(e) = cleanup_expired_records(&pool).await {
            tracing::error!("Error in cleanup: {:?}", e);
        }
    });
}

fn handle_send_reminders(pool: &PgPool) {
    let pool = pool.clone();
    tokio::spawn(async move {
        if let Err(e) = send_pending_reminders(&pool).await {
            tracing::error!("Error sending reminders: {:?}", e);
        }
    });
}

fn handle_sync_external(pool: &PgPool) {
    let pool = pool.clone();
    tokio::spawn(async move {
        if let Err(e) = sync_with_external_service(&pool).await {
            tracing::error!("Error syncing: {:?}", e);
        }
    });
}
```

## 8.3 Async Task Implementations

```rust
use {{ERROR_MODULE}}::{{ERROR_TYPE}};
use sqlx::PgPool;

async fn cleanup_expired_records(pool: &PgPool) -> Result<(), {{ERROR_TYPE}}> {
    let deleted_count = sqlx::query_scalar::<_, i64>(
        r#"
        DELETE FROM {{TABLE_NAME}}
        WHERE expires_at < NOW()
        RETURNING COUNT(*)
        "#,
    )
    .fetch_one(pool)
    .await
    .map_err(|e| {{ERROR_TYPE}}::DBError {
        error_values: None,
        message: Some("Failed to cleanup expired records".into()),
        description: Some(e.to_string()),
    })?;

    tracing::info!("Cleaned up {} expired records", deleted_count);
    Ok(())
}

async fn send_pending_reminders(pool: &PgPool) -> Result<(), {{ERROR_TYPE}}> {
    // Fetch records that need reminders
    // Send notifications
    // Update reminder_sent flag
    Ok(())
}

async fn sync_with_external_service(pool: &PgPool) -> Result<(), {{ERROR_TYPE}}> {
    // Fetch records that need syncing
    // Call external API
    // Update local records
    Ok(())
}
```

## 8.4 With Error Reporting

```rust
pub fn create_{{SERVICE_NAME}}_scheduler_handler() -> ServiceCallbackHandler {
    Box::new(
        |service: &str, callback_event: &str, pool: &PgPool| {
            if service != "{{SERVICE_NAME}}" {
                return CallbackResult::Ignored;
            }

            let pool = pool.clone();
            let event = callback_event.to_string();

            tokio::spawn(async move {
                let result = match event.as_str() {
                    "process_pending" => process_pending(&pool).await,
                    _ => Ok(()),
                };

                if let Err(e) = result {
                    // Log error or send to monitoring service
                    tracing::error!("Scheduler error for {}: {:?}", event, e);
                    // Could also store in a scheduler_errors table
                }
            });

            CallbackResult::Processed
        },
    )
}
```

## Checklist

- [ ] Return early if service doesn't match
- [ ] Handle specific event types
- [ ] Return appropriate `CallbackResult`
- [ ] Use `tokio::spawn` for async operations
- [ ] Clone `pool` before moving into spawned tasks
- [ ] Use `tracing` for logging instead of `println!`
- [ ] Consider error reporting/monitoring integration
