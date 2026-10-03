# Global Guidelines Template

This template establishes and documents JavaScript coding standards, conventions, and best practices for a project. It covers code style, type safety through JSDoc, error handling, testing, performance, security, and documentation.

## Project Configuration

Before using these templates, configure your project-specific values:

### Core Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project name | `my-app`, `api-server` |
| `{{SRC_ROOT}}` | Source root directory | `src/`, `lib/` |
| `{{NODE_VERSION}}` | Minimum Node.js version | `20`, `22` |

### Standards Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{COVERAGE_TARGET}}` | Test coverage target percentage | `80`, `90` |
| `{{MAX_FUNCTION_LENGTH}}` | Maximum function length in lines | `40`, `50` |
| `{{MAX_FILE_LENGTH}}` | Maximum file length in lines | `300`, `400` |
| `{{MAX_COMPLEXITY}}` | Maximum cyclomatic complexity | `10`, `15` |

---

## When to Use This Template

- Starting a new JavaScript project and establishing conventions
- Onboarding new team members to existing code standards
- Standardising practices across multiple projects
- Improving code quality in an existing codebase
- Documenting decisions for code review guidelines
- Setting up linting and formatting rules

## Template Files

| File | Description |
|------|-------------|
| [01-code-style.md](./01-code-style.md) | Modern JS syntax, formatting, and structural conventions |
| [02-type-system.md](./02-type-system.md) | JSDoc type annotations and runtime validation |
| [03-error-handling.md](./03-error-handling.md) | Error patterns, custom errors, and async error handling |
| [04-testing.md](./04-testing.md) | Vitest setup, test patterns, mocking, and coverage |
| [05-performance.md](./05-performance.md) | Event loop, memory, lazy loading, and optimisation |
| [06-security.md](./06-security.md) | Input sanitisation, XSS, prototype pollution, and auditing |
| [07-documentation.md](./07-documentation.md) | JSDoc standards, README conventions, and API docs |

## Implementation Order

### Phase 1 (Foundation - start immediately)

- Step 1: Code Style (establish syntax and formatting rules)
- Step 2: Type System (establish type annotation conventions)

### Phase 2 (Reliability - after foundation)

- Step 3: Error Handling (consistent error patterns)
- Step 4: Testing (test infrastructure and standards)

### Phase 3 (Quality - after reliability)

- Step 5: Performance (optimisation guidelines)
- Step 6: Security (hardening practices)
- Step 7: Documentation (documentation standards)

## Notes for LLM Implementation

1. **Enforce with tooling**: Every guideline should be backed by an eslint rule or automated check where possible
2. **Provide examples**: Every rule should have a GOOD and BAD code example
3. **Explain the why**: Each guideline should explain the reason, not just the rule
4. **Be pragmatic**: Guidelines should improve code quality, not create busywork
5. **Keep current**: Use ES2022+ syntax, modern Node.js APIs, and current tooling
6. **Adapt to context**: These are defaults — projects can override with justification
