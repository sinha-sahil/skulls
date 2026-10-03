# File Organisation Planning Template

This template guides the planning and execution of stylesheet architecture and organisation for a CSS project. It covers directory layouts, @layer cascade management, @import ordering, component-scoped styles, design token structure, and migration strategies for restructuring existing stylesheets.

## Project Configuration

Before using these templates, configure your project-specific values:

### Core Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project name | `my-app`, `design-system` |
| `{{STYLES_DIR}}` | Root stylesheet directory | `src/styles/`, `css/` |
| `{{ENTRY_FILE}}` | Main entry stylesheet | `main.css`, `index.css` |

### Structure Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{TOKENS_DIR}}` | Design tokens directory | `tokens/`, `abstracts/` |
| `{{COMPONENTS_DIR}}` | Component styles directory | `components/`, `blocks/` |
| `{{LAYOUTS_DIR}}` | Layout styles directory | `layouts/`, `objects/` |
| `{{UTILITIES_DIR}}` | Utility styles directory | `utilities/`, `helpers/` |
| `{{VENDOR_DIR}}` | Third-party styles directory | `vendor/`, `external/` |

### Module Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{COMPONENT_NAME}}` | Component being styled | `card`, `navigation` |
| `{{LAYER_NAME}}` | CSS @layer name | `base`, `components`, `utilities` |
| `{{THEME_NAME}}` | Theme name | `dark`, `high-contrast` |
| `{{BREAKPOINT_NAME}}` | Breakpoint identifier | `sm`, `md`, `lg`, `xl` |

---

## When to Use This Template

- Starting a new CSS project and need to decide on stylesheet architecture
- Restructuring an existing stylesheet codebase that has grown organically
- Adopting @layer for cascade management
- Establishing consistent file patterns across a team
- Migrating from a monolithic stylesheet to a modular structure
- Setting up a design token system with custom properties

## Template Files

| File | Description |
|------|-------------|
| [01-assessment.md](./01-assessment.md) | Audit current stylesheet structure and identify pain points |
| [02-directory-structure.md](./02-directory-structure.md) | Define target directory layout and @layer organisation |
| [03-module-boundaries.md](./03-module-boundaries.md) | Define component style boundaries and scoping strategies |
| [04-naming-conventions.md](./04-naming-conventions.md) | Establish selector and custom property naming standards |
| [05-dependency-flow.md](./05-dependency-flow.md) | Plan stylesheet dependency graph and @import ordering |
| [06-migration-plan.md](./06-migration-plan.md) | Step-by-step plan to reorganise existing stylesheets |

## Implementation Order

### Phase 1 (Assessment - start immediately)

- Step 1: Assessment (audit current state)

### Phase 2 (Design - after assessment)

- Step 2: Directory Structure (define target layout)
- Step 3: Module Boundaries (define component scoping)
- Step 4: Naming Conventions (establish standards)
- Step 5: Dependency Flow (plan import graph)

### Phase 3 (Execution - after design is complete)

- Step 6: Migration Plan (execute restructuring)

## Key CSS Concepts

### @layer Cascade Management

Layers define explicit cascade ordering independent of source order or specificity:

```css
@layer reset, base, tokens, layouts, components, utilities;
```

Styles in later layers always override earlier layers, regardless of specificity.

### Custom Properties as Design Tokens

```css
:root {
  --color-primary: oklch(65% 0.24 265);
  --space-md: clamp(1rem, 2vw, 1.5rem);
  --font-body: system-ui, sans-serif;
}
```

### Modern CSS Features

- **Nesting**: Native CSS nesting (`& .child {}`)
- **Container Queries**: Component-responsive design (`@container`)
- **:has()**: Parent selector (`.card:has(img) {}`)
- **@scope**: Scoped styles (`@scope (.card) to (.card__footer) {}`)

## Notes for LLM Implementation

1. **Assess before restructuring**: Always audit current state before proposing changes
2. **Incremental migration**: Move one stylesheet at a time, verify build between steps
3. **Preserve git history**: Use `git mv` when moving files
4. **@layer ordering**: Define layer order once at the entry point
5. **Avoid specificity wars**: Use @layer to manage cascade, not selector specificity
6. **Custom property scoping**: Scope tokens to appropriate levels (:root, component, theme)
