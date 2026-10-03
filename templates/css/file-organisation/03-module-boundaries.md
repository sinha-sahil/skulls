# Phase 3: Module Boundaries

**Dependencies:** Phase 1 (Assessment), Phase 2 (Directory Structure)

**Can be implemented in parallel with:** Phase 4, Phase 5

## Overview

Define the boundaries and scoping strategies for component stylesheets in `{{PROJECT_NAME}}`. Establish rules for what belongs in each stylesheet, how components interact with each other's styles, and how to prevent leakage between modules.

---

## 3.1 Component Scoping Strategy

Choose a scoping approach and apply it consistently:

### Option A: BEM Naming (No Build Tool Required)

Each component owns a namespace via its block name:

```css
/* {{COMPONENTS_DIR}}/_card.css */
@layer components {
  .card { }
  .card__header { }
  .card__body { }
  .card__footer { }
  .card--featured { }
  .card--compact { }
}
```

**Rule:** A component file must only contain selectors prefixed with its block name.

```css
/* ✓ Correct: _card.css only contains .card* selectors */
.card { display: flex; flex-direction: column; }
.card__header { padding: var(--space-sm) var(--space-md); }

/* ✗ Wrong: _card.css styling another component */
.button { padding: var(--space-sm); }
```

### Option B: @scope (Modern Browsers)

Use native CSS scoping to limit where styles apply:

```css
/* {{COMPONENTS_DIR}}/_card.css */
@layer components {
  @scope (.card) to (.card__footer) {
    /* Styles apply within .card but not inside .card__footer */
    :scope {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }

    img {
      /* Safe: only targets <img> inside .card, not inside .card__footer */
      inline-size: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
    }
  }
}
```

### Option C: Data Attribute Scoping

Use data attributes for component identity:

```css
/* {{COMPONENTS_DIR}}/_card.css */
@layer components {
  [data-component="card"] {
    display: flex;
    flex-direction: column;

    & [data-part="header"] {
      padding: var(--space-sm) var(--space-md);
    }

    & [data-part="body"] {
      padding: var(--space-md);
      flex: 1;
    }
  }
}
```

## 3.2 Component Responsibility Rules

Each component stylesheet must follow these boundary rules:

```text
| Rule | Allowed | Forbidden |
|------|---------|-----------|
| Own selectors | .card, .card__* | .button, .nav__* |
| Custom properties | --_card-* (private) | --color-* (global tokens) |
| Layout of children | Flex/grid on own container | Margin on other components |
| Responsive behaviour | Container queries (@container) | Global media queries* |
| Colours/spacing | var(--token-*) references | Hard-coded values |

* Exception: media queries are acceptable when container queries are not supported.
```

### Private Custom Properties

Components should use private (underscore-prefixed) custom properties for internal values:

```css
/* {{COMPONENTS_DIR}}/_{{COMPONENT_NAME}}.css */
@layer components {
  .{{COMPONENT_NAME}} {
    /* Private custom properties - internal to this component */
    --_padding: var(--space-md);
    --_gap: var(--space-sm);
    --_radius: var(--radius-md);

    display: flex;
    flex-direction: column;
    gap: var(--_gap);
    padding: var(--_padding);
    border-radius: var(--_radius);
  }

  /* Variant overrides the private properties */
  .{{COMPONENT_NAME}}--compact {
    --_padding: var(--space-sm);
    --_gap: var(--space-xs);
  }
}
```

## 3.3 Component Composition Patterns

### Composition via Layout Parent

When components need to interact, the parent layout controls spacing:

```css
/* ✓ Correct: layout controls spacing between components */
@layer layouts {
  .sidebar-layout {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: var(--space-lg);
  }
}

/* ✗ Wrong: card reaching out to affect its siblings */
@layer components {
  .card {
    margin-bottom: var(--space-lg); /* Don't control external spacing */
  }
}
```

### Composition via Container Queries

Components should respond to their container, not the viewport:

```css
/* {{COMPONENTS_DIR}}/_{{COMPONENT_NAME}}.css */
@layer components {
  .{{COMPONENT_NAME}} {
    container-type: inline-size;
    display: grid;
    grid-template-columns: 1fr;

    @container (inline-size > 30rem) {
      grid-template-columns: auto 1fr;
    }
  }
}
```

### Composition via :has() for Conditional Styling

```css
/* Card adapts based on its content */
@layer components {
  .card {
    padding: var(--space-md);

    &:has(img) {
      padding-block-start: 0;
    }

    &:has(.card__actions) {
      padding-block-end: var(--space-sm);
    }
  }
}
```

## 3.4 Cross-Component Interaction Rules

```text
ALLOWED:
  - Component reads global tokens: var(--color-primary)
  - Component defines private properties: --_card-padding
  - Parent layout controls child component spacing
  - Component uses :has() to adapt to own content

FORBIDDEN:
  - Component styles another component's internals
  - Component sets margin on itself for layout purposes
  - Component overrides global tokens conditionally
  - Component uses descendant selectors targeting other component classes
```

### Example of Forbidden Pattern

```css
/* ✗ WRONG: card.css styling button internals */
.card .button {
  font-size: var(--text-sm);  /* Don't reach into .button from .card */
}

/* ✓ CORRECT: card.css uses a variant or composition */
.card {
  /* Pass context via custom property */
  --_button-size: var(--text-sm);
}
```

## 3.5 Module Boundary Map

Document each component's boundary:

```text
| Component | Owns Selectors | Private Props | Reads Tokens | Container Queries |
|-----------|---------------|---------------|--------------|-------------------|
| card | .card, .card__* | --_card-* | --color-*, --space-* | Yes (30rem) |
| button | .button, .button--* | --_btn-* | --color-*, --radius-* | No |
| {{COMPONENT_NAME}} | .{{COMPONENT_NAME}}* | --_{{COMPONENT_NAME}}-* | ... | ... |
```

---

## Checklist

- [ ] Chosen component scoping strategy (BEM, @scope, data attributes)
- [ ] Defined component responsibility rules
- [ ] Established private custom property convention (--_ prefix)
- [ ] Documented composition patterns (layout parent, container queries, :has)
- [ ] Documented cross-component interaction rules
- [ ] Created module boundary map for all existing components
- [ ] Verified no component reaches into another component's selectors
- [ ] Verified all hard-coded values replaced with token references

## Verification

```bash
stylelint .
pnpm build
```

Verify that component styles are properly scoped and do not leak into other components.
