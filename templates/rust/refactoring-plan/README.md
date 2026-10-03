# Refactoring Plan Template

This template guides the planning and execution of structured code refactoring efforts in Rust projects. It provides a systematic approach to improving code quality, reducing technical debt, and modernising patterns while maintaining correctness at every step.

## Project Configuration

Before using these templates, configure your project-specific values:

### Core Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project or crate name | `my_api`, `data_pipeline` |
| `{{MODULE_NAME}}` | Module being refactored | `auth`, `orders` |
| `{{TARGET_MODULE}}` | Target module after refactor | `authentication`, `order_service` |
| `{{REFACTOR_SCOPE}}` | Scope of the refactoring | `error handling`, `async migration` |

### Code Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{ERROR_TYPE}}` | Error enum type | `AppError` |
| `{{ERROR_MODULE}}` | Path to error module | `crate::error` |
| `{{STATE_TYPE}}` | Application state type | `AppState` |
| `{{TRAIT_NAME}}` | Trait being introduced | `Repository`, `Service` |

### Refactoring Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{OLD_PATTERN}}` | Current pattern to replace | `unwrap()`, `String` params |
| `{{NEW_PATTERN}}` | Target pattern | `?` operator, newtype wrapper |
| `{{AFFECTED_FILES}}` | Files impacted by refactor | `handler.rs, helpers.rs` |
| `{{BRANCH_NAME}}` | Git branch for refactoring | `refactor/error-handling` |

---

## When to Use This Template

- Clippy is producing significant warnings that need systematic resolution
- Error handling is inconsistent (mixed `unwrap()`, `expect()`, custom errors)
- Module boundaries are unclear and coupling is high
- Large functions need decomposition
- Migrating from blocking to async code
- Consolidating duplicate code across modules
- Introducing traits for testability

## Template Files

| File | Description |
|------|-------------|
| [01-assessment.md](./01-assessment.md) | Audit code quality and catalog technical debt |
| [02-goals.md](./02-goals.md) | Define measurable refactoring objectives |
| [03-impact-analysis.md](./03-impact-analysis.md) | Map affected files and dependencies |
| [04-strategy.md](./04-strategy.md) | Choose refactoring approach and patterns |
| [05-execution-plan.md](./05-execution-plan.md) | Ordered implementation steps |
| [06-testing-strategy.md](./06-testing-strategy.md) | Test coverage and validation plan |
| [07-rollback-plan.md](./07-rollback-plan.md) | Git-based rollback and gradual rollout |

## Implementation Order

### Phase 1 (Assessment - start immediately)

- Step 1: Assessment (audit current code quality)
- Step 2: Goals (define measurable objectives)

### Phase 2 (Planning - after assessment)

- Step 3: Impact Analysis (map affected files)
- Step 4: Strategy (choose refactoring approach)

### Phase 3 (Preparation - after planning)

- Step 6: Testing Strategy (ensure test coverage before changes)

### Phase 4 (Execution - after preparation)

- Step 5: Execution Plan (implement changes incrementally)

### Phase 5 (Safety - throughout execution)

- Step 7: Rollback Plan (maintain ability to revert)

## Notes for LLM Implementation

1. **Compile after every change**: Run `cargo check` between each refactoring step
2. **Small commits**: Each logical change should be a separate commit
3. **Tests first**: Add tests for existing behaviour before changing it
4. **No behaviour change**: Refactoring should not change observable behaviour
5. **Incremental progress**: Each step should leave the code in a compilable state
6. **Branch strategy**: Work on a dedicated branch, merge only when all tests pass
