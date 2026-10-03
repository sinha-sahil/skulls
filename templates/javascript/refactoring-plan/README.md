# Refactoring Plan Template

This template guides the planning and execution of structured refactoring in a JavaScript project. It covers syntax modernisation, dependency removal, error handling improvements, and safe migration strategies.

## Project Configuration

Before using these templates, configure your project-specific values:

### Core Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project name | `my-app`, `api-server` |
| `{{SRC_ROOT}}` | Source root directory | `src/`, `lib/` |
| `{{TARGET_FILES}}` | Files/directories to refactor | `src/services/`, `src/utils/` |

### Refactoring Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{REFACTOR_SCOPE}}` | Scope of the refactoring | `auth module`, `all services` |
| `{{CURRENT_PATTERN}}` | Pattern being replaced | `callbacks`, `var declarations` |
| `{{TARGET_PATTERN}}` | Pattern being adopted | `async/await`, `const/let` |
| `{{DEPENDENCY_TO_REMOVE}}` | Dependency being eliminated | `lodash`, `moment` |

---

## When to Use This Template

- Modernising legacy JavaScript (var → const/let, callbacks → async/await)
- Removing or replacing a dependency across the codebase
- Improving error handling patterns
- Migrating from classes to functional patterns
- Reducing code complexity and improving readability
- Paying down accumulated technical debt

## Template Files

| File | Description |
|------|-------------|
| [01-assessment.md](./01-assessment.md) | Audit current code and identify refactoring targets |
| [02-goals.md](./02-goals.md) | Define measurable refactoring objectives |
| [03-impact-analysis.md](./03-impact-analysis.md) | Analyse blast radius and risk |
| [04-strategy.md](./04-strategy.md) | Choose refactoring approach and patterns |
| [05-execution-plan.md](./05-execution-plan.md) | Step-by-step implementation plan |
| [06-testing-strategy.md](./06-testing-strategy.md) | Test coverage and verification approach |
| [07-rollback-plan.md](./07-rollback-plan.md) | Safety net and recovery procedures |

## Implementation Order

### Phase 1 (Analysis - start immediately)

- Step 1: Assessment (audit current state)
- Step 2: Goals (define success criteria)

### Phase 2 (Planning - after analysis)

- Step 3: Impact Analysis (determine blast radius)
- Step 4: Strategy (choose approach)

### Phase 3 (Preparation - after planning)

- Step 5: Execution Plan (detailed steps)
- Step 6: Testing Strategy (verification plan)
- Step 7: Rollback Plan (safety net)

### Phase 4 (Execution - after all planning is done)

- Execute the plan from Step 5
- Verify with Step 6
- Use Step 7 if issues arise

## Notes for LLM Implementation

1. **Never refactor without tests**: Ensure test coverage before changing code
2. **Small commits**: One logical change per commit for easy bisecting
3. **Behaviour preservation**: Refactoring must not change external behaviour
4. **Incremental approach**: Refactor one pattern at a time, verify between steps
5. **Automated where possible**: Use codemods for repetitive syntax changes
6. **Measure improvement**: Compare metrics before and after
