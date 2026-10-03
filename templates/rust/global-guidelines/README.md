# Global Guidelines Template

This template guides the creation of comprehensive Rust coding standards, conventions, and best practices for a project. It establishes consistent patterns that all contributors follow, covering code style, type system usage, error handling, testing, performance, security, and documentation.

## Project Configuration

Before using these templates, configure your project-specific values:

### Core Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project or crate name | `my_api`, `data_pipeline` |
| `{{ERROR_TYPE}}` | Project error enum type | `AppError` |
| `{{ERROR_MODULE}}` | Path to error module | `crate::error` |
| `{{STATE_TYPE}}` | Application state type | `AppState` |

### Tooling Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{LOG_CRATE}}` | Logging crate used | `tracing`, `log` |
| `{{DB_CRATE}}` | Database crate used | `sqlx`, `diesel` |
| `{{HTTP_CRATE}}` | HTTP framework crate | `axum`, `actix-web` |
| `{{ASYNC_RUNTIME}}` | Async runtime | `tokio`, `async-std` |

### Convention Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{MAX_LINE_LENGTH}}` | Maximum line length | `100`, `120` |
| `{{MIN_TEST_COVERAGE}}` | Minimum test coverage | `80%`, `90%` |
| `{{MSRV}}` | Minimum supported Rust version | `1.75.0`, `1.80.0` |

---

## When to Use This Template

- Starting a new Rust project and want to establish standards from day one
- Onboarding new team members who need to understand project conventions
- Standardising practices across multiple crates in a workspace
- Documenting implicit conventions that should be made explicit
- Improving code quality through consistent patterns

## Template Files

| File | Description |
|------|-------------|
| [01-code-style.md](./01-code-style.md) | Formatting, naming, imports, and module structure |
| [02-type-system.md](./02-type-system.md) | Type design patterns and trait usage |
| [03-error-handling.md](./03-error-handling.md) | Error types, propagation, and context |
| [04-testing.md](./04-testing.md) | Test organisation, patterns, and coverage |
| [05-performance.md](./05-performance.md) | Allocation awareness, async patterns, optimisation |
| [06-security.md](./06-security.md) | Input validation, secrets, dependency auditing |
| [07-documentation.md](./07-documentation.md) | Doc comments, module docs, and project docs |

## Implementation Order

Guidelines can be established in any order, but this sequence builds naturally:

### Phase 1 (Foundation)

- Step 1: Code Style (formatting and naming must come first)
- Step 2: Type System (type patterns inform everything else)

### Phase 2 (Core Practices)

- Step 3: Error Handling (affects all code)
- Step 4: Testing (validates everything)

### Phase 3 (Quality)

- Step 5: Performance (optimisation guidelines)
- Step 6: Security (safety requirements)

### Phase 4 (Communication)

- Step 7: Documentation (document all the above)

## Notes for LLM Implementation

1. **Project-specific**: Adapt all guidelines to the project's actual needs
2. **Enforceable**: Prefer guidelines that can be checked by tooling (clippy, fmt)
3. **Pragmatic**: Guidelines should help, not hinder productivity
4. **Living document**: Guidelines evolve as the project matures
5. **Examples over rules**: Concrete code examples are more useful than abstract rules
6. **Consistency**: The most important guideline is internal consistency
