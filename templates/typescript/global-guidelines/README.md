# Global Guidelines Template

This template helps establish and document TypeScript coding standards, conventions, and best practices for a project. It covers code style, type system usage, error handling, testing, performance, security, and documentation.

## Project Configuration

Before using these templates, configure your project-specific values:

### Core Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project or package name | `my-api`, `@acme/core` |
| `{{SRC_DIR}}` | Source directory path | `src/`, `packages/core/src/` |
| `{{TEST_DIR}}` | Test files location | `tests/`, `__tests__/` |
| `{{OUT_DIR}}` | Build output directory | `dist/`, `build/` |

### Team Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{TEAM_NAME}}` | Team or organisation name | `Platform Team` |
| `{{NODE_VERSION}}` | Target Node.js version | `20`, `22` |
| `{{TS_VERSION}}` | TypeScript version | `5.4`, `5.5` |
| `{{PACKAGE_MANAGER}}` | Package manager | `npm`, `pnpm`, `yarn` |

### Style Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{INDENT_STYLE}}` | Indentation style | `spaces`, `tabs` |
| `{{INDENT_SIZE}}` | Indentation size | `2`, `4` |
| `{{QUOTE_STYLE}}` | String quote style | `single`, `double` |
| `{{LINE_LENGTH}}` | Maximum line length | `80`, `100`, `120` |

---

## When to Use This Template

- Starting a new TypeScript project and need coding standards
- Onboarding new team members who need a style reference
- Standardising conventions across a growing codebase
- Migrating to stricter TypeScript settings
- Establishing type system best practices for the team
- Creating a shared understanding of error handling patterns
- Defining testing standards and coverage requirements

## Template Files

| File | Description |
|------|-------------|
| [01-code-style.md](./01-code-style.md) | Code style, naming, formatting, imports |
| [02-type-system.md](./02-type-system.md) | Type system patterns and conventions |
| [03-error-handling.md](./03-error-handling.md) | Error handling strategies and patterns |
| [04-testing.md](./04-testing.md) | Testing standards and type testing |
| [05-performance.md](./05-performance.md) | Type-level and runtime performance |
| [06-security.md](./06-security.md) | Type-safe security patterns |
| [07-documentation.md](./07-documentation.md) | TSDoc standards and documentation |

## Implementation Order

### Phase 1 (Foundations - start immediately)

- Step 1: Code Style (formatting, naming, imports)
- Step 2: Type System (type patterns and conventions)

### Phase 2 (Patterns - after foundations)

- Step 3: Error Handling (Result pattern, custom errors)
- Step 4: Testing (Vitest, type testing, coverage)

### Phase 3 (Quality - after patterns)

- Step 5: Performance (type-level optimisation, tree-shaking)
- Step 6: Security (validation, branded types, immutability)

### Phase 4 (Documentation - throughout)

- Step 7: Documentation (TSDoc, declaration files)

## Notes for LLM Implementation

1. **Apply guidelines to new code**: Use these guidelines when writing any new TypeScript code
2. **Reference specific sections**: Point to the relevant guideline when reviewing code
3. **Incremental adoption**: Apply guidelines to new code first, then refactor existing code
4. **Enforce with tooling**: Configure ESLint and tsconfig to enforce guidelines automatically
5. **Keep guidelines living**: Update guidelines as the team learns and TypeScript evolves
6. **No runtime cost**: Type-level guidelines should never affect runtime performance
