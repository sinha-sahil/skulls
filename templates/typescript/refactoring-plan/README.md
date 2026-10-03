# Refactoring Plan Template

This template guides the planning and execution of structured code refactoring efforts in TypeScript projects. It provides a systematic approach to improving type safety, removing `any` types, introducing discriminated unions, extracting utility types, and migrating from JavaScript.

## Project Configuration

Before using these templates, configure your project-specific values:

### Core Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project or package name | `my-api`, `data-pipeline` |
| `{{MODULE_NAME}}` | Module being refactored | `auth`, `payments` |
| `{{SRC_DIR}}` | Source directory path | `src/`, `packages/core/src/` |
| `{{REFACTOR_SCOPE}}` | Scope of the refactoring | `remove any types`, `add discriminated unions` |

### Code Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{TARGET_TYPE}}` | Type being introduced or improved | `ApiResponse<T>`, `UserEvent` |
| `{{OLD_PATTERN}}` | Current pattern to replace | `any`, `string` enum, `as` cast |
| `{{NEW_PATTERN}}` | Target pattern | `unknown`, discriminated union, type guard |
| `{{AFFECTED_FILES}}` | Files impacted by refactor | `service.ts, handler.ts` |
| `{{BRANCH_NAME}}` | Git branch for refactoring | `refactor/remove-any-types` |

### TypeScript-Specific Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{STRICT_FLAGS}}` | Strict mode flags to enable | `noImplicitAny`, `strictNullChecks` |
| `{{UTILITY_TYPE}}` | Utility type being introduced | `DeepPartial<T>`, `Branded<T, B>` |
| `{{GENERIC_CONSTRAINT}}` | Generic constraint pattern | `extends Record<string, unknown>` |

---

## When to Use This Template

- Codebase has widespread `any` types that need systematic removal
- Error handling is inconsistent (mixed `try/catch`, unchecked errors)
- String literals are used where discriminated unions would be safer
- Type assertions (`as`) are overused instead of type guards
- Generic types need better constraints
- Migrating a JavaScript project to TypeScript
- `strict: true` is being enabled incrementally
- Utility types should be extracted to reduce duplication

## Template Files

| File | Description |
|------|-------------|
| [01-assessment.md](./01-assessment.md) | Audit type safety and catalog technical debt |
| [02-goals.md](./02-goals.md) | Define measurable refactoring objectives |
| [03-impact-analysis.md](./03-impact-analysis.md) | Map affected files and type dependencies |
| [04-strategy.md](./04-strategy.md) | Choose refactoring patterns and approach |
| [05-execution-plan.md](./05-execution-plan.md) | Ordered implementation steps |
| [06-testing-strategy.md](./06-testing-strategy.md) | Test coverage and type-level validation |
| [07-rollback-plan.md](./07-rollback-plan.md) | Git-based rollback and gradual rollout |

## Implementation Order

### Phase 1 (Assessment - start immediately)

- Step 1: Assessment (audit current type safety)
- Step 2: Goals (define measurable objectives)

### Phase 2 (Planning - after assessment)

- Step 3: Impact Analysis (map affected files and types)
- Step 4: Strategy (choose refactoring patterns)

### Phase 3 (Preparation - after planning)

- Step 6: Testing Strategy (ensure coverage before changes)

### Phase 4 (Execution - after preparation)

- Step 5: Execution Plan (implement changes incrementally)

### Phase 5 (Safety - throughout execution)

- Step 7: Rollback Plan (maintain ability to revert)

## Notes for LLM Implementation

1. **Compile after every change**: Run `tsc --noEmit` between each refactoring step
2. **Small commits**: Each type improvement should be a separate commit
3. **Tests first**: Add tests for existing behaviour before changing types
4. **No behaviour change**: Refactoring should not change runtime behaviour
5. **Incremental progress**: Each step should leave the code in a compilable state
6. **Type narrowing over assertions**: Prefer type guards over `as` casts
