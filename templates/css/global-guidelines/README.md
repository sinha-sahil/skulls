# Global Guidelines Template

This template guides the creation of comprehensive CSS coding standards, conventions, and best practices for a project. It establishes consistent patterns that all contributors follow, covering code style, design tokens, progressive enhancement, testing, performance, security, and documentation.

## Project Configuration

Before using these templates, configure your project-specific values:

### Core Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project name | `my-app`, `design-system` |
| `{{STYLES_DIR}}` | Root stylesheet directory | `src/styles/`, `css/` |
| `{{ENTRY_FILE}}` | Main entry stylesheet | `main.css`, `index.css` |
| `{{THEME_NAME}}` | Theme name | `dark`, `high-contrast` |

### Tooling Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{BUNDLER}}` | Build tool used | `vite`, `webpack`, `esbuild` |
| `{{LINTER}}` | CSS linter used | `stylelint` |
| `{{BROWSER_TARGETS}}` | Supported browsers | `last 2 versions`, `>= 0.5%` |
| `{{TEST_RUNNER}}` | Visual regression tool | `playwright`, `backstopjs` |

### Convention Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{NAMING_CONVENTION}}` | Selector naming pattern | `BEM`, `utility-first` |
| `{{MAX_NESTING_DEPTH}}` | Maximum nesting depth | `3`, `2` |
| `{{MAX_SPECIFICITY}}` | Maximum allowed specificity | `0-3-0`, `0-2-1` |
| `{{BREAKPOINT_UNIT}}` | Unit for breakpoints | `em`, `px` |

---

## When to Use This Template

- Starting a new CSS project and want to establish standards from day one
- Onboarding new team members who need to understand project conventions
- Standardising practices across multiple feature areas
- Documenting implicit conventions that should be made explicit
- Establishing a design system with consistent token patterns
- Improving code quality through consistent patterns

## Template Files

| File | Description |
|------|-------------|
| [01-code-style.md](./01-code-style.md) | Naming conventions, specificity rules, nesting, formatting |
| [02-design-tokens.md](./02-design-tokens.md) | Custom properties as tokens, naming, themes, categories |
| [03-fallbacks-and-progressive-enhancement.md](./03-fallbacks-and-progressive-enhancement.md) | @supports, fallback patterns, browser support policy |
| [04-testing.md](./04-testing.md) | Visual regression, cross-browser, responsive, a11y testing |
| [05-performance.md](./05-performance.md) | Critical CSS, repaints, containment, font loading |
| [06-security.md](./06-security.md) | CSP compliance, url() safety, user input sanitisation |
| [07-documentation.md](./07-documentation.md) | Style documentation, design system docs, token docs |

## Implementation Order

Guidelines can be established in any order, but this sequence builds naturally:

### Phase 1 (Foundation)

- Step 1: Code Style (formatting and naming must come first)
- Step 2: Design Tokens (token patterns inform everything else)

### Phase 2 (Core Practices)

- Step 3: Fallbacks & Progressive Enhancement (affects all styling decisions)
- Step 4: Testing (validates everything)

### Phase 3 (Quality)

- Step 5: Performance (optimisation guidelines)
- Step 6: Security (safety requirements)

### Phase 4 (Communication)

- Step 7: Documentation (document all the above)

## Notes for LLM Implementation

1. **Project-specific**: Adapt all guidelines to the project's actual needs
2. **Enforceable**: Prefer guidelines that can be checked by stylelint
3. **Pragmatic**: Guidelines should help, not hinder productivity
4. **Living document**: Guidelines evolve as the project matures
5. **Examples over rules**: Concrete CSS examples are more useful than abstract rules
6. **Consistency**: The most important guideline is internal consistency
