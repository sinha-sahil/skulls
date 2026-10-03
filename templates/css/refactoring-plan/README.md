# Refactoring Plan Template

This template guides the planning and execution of structured CSS refactoring efforts. It provides a systematic approach to reducing specificity conflicts, migrating to custom properties, adopting @layer, consolidating duplicates, improving responsive design, and eliminating !important declarations while maintaining visual correctness at every step.

## Project Configuration

Before using these templates, configure your project-specific values:

### Core Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project name | `my-app`, `marketing-site` |
| `{{STYLES_DIR}}` | Root stylesheet directory | `src/styles/`, `css/` |
| `{{ENTRY_FILE}}` | Main entry stylesheet | `main.css`, `index.css` |
| `{{REFACTOR_SCOPE}}` | Scope of the refactoring | `specificity`, `custom properties` |

### Code Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{COMPONENT_NAME}}` | Component being refactored | `navigation`, `card` |
| `{{OLD_PATTERN}}` | Current pattern to replace | `#id selectors`, `!important` |
| `{{NEW_PATTERN}}` | Target pattern | `@layer`, `custom properties` |
| `{{LAYER_NAME}}` | CSS @layer name | `base`, `components` |

### Refactoring Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{AFFECTED_FILES}}` | Files impacted by refactor | `_header.css, _card.css` |
| `{{BRANCH_NAME}}` | Git branch for refactoring | `refactor/custom-properties` |
| `{{THEME_NAME}}` | Theme name | `dark`, `high-contrast` |
| `{{BREAKPOINT_NAME}}` | Breakpoint identifier | `sm`, `md`, `lg` |

---

## When to Use This Template

- Specificity conflicts are causing maintenance headaches
- Stylesheets rely heavily on !important to override styles
- Hard-coded values are scattered instead of using design tokens
- No @layer usage and cascade ordering is fragile
- Responsive design is inconsistent (mixed breakpoints, approaches)
- Duplicate style declarations exist across multiple files
- Legacy vendor prefixes and outdated patterns need removal
- Migrating from preprocessor (Sass/Less) to modern native CSS

## Template Files

| File | Description |
|------|-------------|
| [01-assessment.md](./01-assessment.md) | Audit stylesheet quality and catalog technical debt |
| [02-goals.md](./02-goals.md) | Define measurable refactoring objectives |
| [03-impact-analysis.md](./03-impact-analysis.md) | Map affected files and selector dependencies |
| [04-strategy.md](./04-strategy.md) | Choose refactoring approach and patterns |
| [05-execution-plan.md](./05-execution-plan.md) | Ordered implementation steps |
| [06-testing-strategy.md](./06-testing-strategy.md) | Visual regression and cross-browser validation plan |
| [07-rollback-plan.md](./07-rollback-plan.md) | Git-based rollback and gradual rollout |

## Implementation Order

### Phase 1 (Assessment - start immediately)

- Step 1: Assessment (audit current stylesheet quality)
- Step 2: Goals (define measurable objectives)

### Phase 2 (Planning - after assessment)

- Step 3: Impact Analysis (map affected files and selectors)
- Step 4: Strategy (choose refactoring approach)

### Phase 3 (Preparation - after planning)

- Step 6: Testing Strategy (ensure visual regression baseline before changes)

### Phase 4 (Execution - after preparation)

- Step 5: Execution Plan (implement changes incrementally)

### Phase 5 (Safety - throughout execution)

- Step 7: Rollback Plan (maintain ability to revert)

## Notes for LLM Implementation

1. **Visual check after every change**: Verify no visual regressions between each step
2. **Small commits**: Each logical change should be a separate commit
3. **Baseline first**: Capture visual regression screenshots before starting
4. **No visual change**: Refactoring should not change rendered appearance
5. **Incremental progress**: Each step should leave styles in a valid state
6. **Branch strategy**: Work on a dedicated branch, merge only when all tests pass
