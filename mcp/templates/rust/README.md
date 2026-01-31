# Rust Templates

Templates and standards for Rust backend development with Axum framework.

## Available Templates

| Template | Description |
|----------|-------------|
| [endpoint-planning](./endpoint-planning/) | Plan and document new API endpoints |
| [service-creation](./service-creation/) | Create new service modules |

## Framework

These templates are designed for:

- **Axum** - Web framework
- **SQLx** - Database operations (PostgreSQL)
- **Tokio** - Async runtime
- **Serde** - Serialization/deserialization

## Quick Start

1. Choose the appropriate template for your task
2. Copy the template structure
3. Replace placeholders with your project values
4. Follow the implementation phases

## Project Configuration

Each template uses placeholders that should be configured for your project.
See individual template README files for complete placeholder references.

### Common Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{STATE_TYPE}}` | Application state type | `AppState` |
| `{{ERROR_TYPE}}` | Error enum type | `AppError` |
| `{{ERROR_MODULE}}` | Path to error module | `crate::error` |
| `{{DB_POOL_TYPE}}` | Database pool type | `PgPool` |
