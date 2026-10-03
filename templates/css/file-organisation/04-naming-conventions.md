# Phase 4: Naming Conventions

**Dependencies:** Phase 1 (Assessment), Phase 3 (Module Boundaries)

**Can be implemented in parallel with:** Phase 2, Phase 5

## Overview

Establish consistent naming standards for selectors, custom properties, @layer names, files, and breakpoints in `{{PROJECT_NAME}}`. Naming conventions are the most visible aspect of CSS architecture and the most impactful for maintainability.

---

## 4.1 Selector Naming

### BEM Convention (Block__Element--Modifier)

```css
/* Block: standalone component */
.card { }

/* Element: part of a block (double underscore) */
.card__header { }
.card__body { }
.card__footer { }

/* Modifier: variation of a block or element (double hyphen) */
.card--featured { }
.card--compact { }
.card__header--sticky { }
```

### Naming Rules

```text
| Rule | Correct | Incorrect | Reason |
|------|---------|-----------|--------|
| Lowercase kebab-case | .nav-bar | .navBar, .NavBar | Consistency |
| BEM double delimiters | .card__header | .card-header | Distinguishes element from multi-word block |
| No element chaining | .card__title | .card__header__title | Flat structure |
| Meaningful names | .is-active | .blue, .large | Describe purpose, not appearance |
| State prefix | .is-*, .has-* | .active, .hidden | Clear intent |
| JS hook prefix | [data-action] | .js-toggle | Separates style from behaviour |
```

### State Classes

```css
/* Use is-* and has-* for state classes */
.nav-link.is-active { }
.card.has-image { }
.dialog.is-open { }
.input.is-invalid { }

/* Prefer ARIA attributes for accessible states */
.nav-link[aria-current="page"] { }
.dialog[open] { }
.input[aria-invalid="true"] { }
```

### Utility Class Naming

```css
/* Utility classes: single-purpose, prefixed with u- or standalone */
.visually-hidden { }
.flow > * + * { }
.wrapper { }
.text-center { }
```

## 4.2 Custom Property Naming

### Global Token Convention

Custom properties use a category prefix to indicate their purpose:

```css
:root {
  /* Colour tokens: --color-{semantic-name} */
  --color-primary: oklch(65% 0.24 265);
  --color-primary-hover: oklch(55% 0.24 265);
  --color-surface: oklch(98% 0 0);
  --color-text: oklch(15% 0 0);
  --color-text-muted: oklch(40% 0 0);
  --color-border: oklch(85% 0 0);
  --color-error: oklch(55% 0.22 25);
  --color-success: oklch(55% 0.18 150);

  /* Spacing tokens: --space-{t-shirt-size} */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  /* Typography tokens */
  --font-body: system-ui, -apple-system, sans-serif;
  --font-heading: var(--font-body);
  --font-mono: ui-monospace, 'Cascadia Code', monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5rem;
  --text-2xl: 2rem;

  /* Border radius tokens: --radius-{size} */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-pill: 100vw;

  /* Shadow tokens: --shadow-{size} */
  --shadow-sm: 0 1px 2px oklch(0% 0 0 / 0.05);
  --shadow-md: 0 4px 6px oklch(0% 0 0 / 0.1);
  --shadow-lg: 0 10px 15px oklch(0% 0 0 / 0.15);

  /* Z-index tokens: --z-{context} */
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-overlay: 30;
  --z-modal: 40;
  --z-toast: 50;

  /* Transition tokens */
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 400ms;
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Component-Private Properties

Components prefix private properties with an underscore:

```css
.{{COMPONENT_NAME}} {
  /* Private: only used within this component */
  --_bg: var(--color-surface);
  --_padding: var(--space-md);
  --_border-color: var(--color-border);
  --_radius: var(--radius-md);

  background: var(--_bg);
  padding: var(--_padding);
  border: 1px solid var(--_border-color);
  border-radius: var(--_radius);
}

/* Modifier overrides private properties */
.{{COMPONENT_NAME}}--dark {
  --_bg: var(--color-primary);
  --_border-color: transparent;
}
```

### Naming Rules Table

```text
| Category | Pattern | Examples |
|----------|---------|----------|
| Colour | --color-{name} | --color-primary, --color-surface |
| Spacing | --space-{size} | --space-sm, --space-md |
| Font | --font-{role} | --font-body, --font-mono |
| Text size | --text-{size} | --text-sm, --text-lg |
| Radius | --radius-{size} | --radius-md, --radius-pill |
| Shadow | --shadow-{size} | --shadow-sm, --shadow-lg |
| Z-index | --z-{context} | --z-modal, --z-dropdown |
| Duration | --duration-{speed} | --duration-fast, --duration-slow |
| Easing | --ease-{type} | --ease-out, --ease-spring |
| Private | --_{name} | --_bg, --_padding |
```

## 4.3 @layer Naming

```css
/* Standard layer names for the project */
@layer reset,    /* Browser normalisation */
       base,     /* Element defaults */
       tokens,   /* Custom property definitions */
       layouts,  /* Layout primitives */
       components, /* Component styles */
       utilities;  /* Override utilities */
```

**Rule:** Layer names are singular nouns except `utilities` and `components` (collections).

## 4.4 File Naming

```text
| Category | Pattern | Example |
|----------|---------|---------|
| Entry file | No prefix | main.css, index.css |
| Partial | Underscore prefix | _button.css, _card.css |
| Token file | Underscore prefix | _colors.css, _spacing.css |
| Theme file | Underscore prefix | _dark.css, _high-contrast.css |
| Directory | Lowercase | components/, layouts/ |

All file names: lowercase, kebab-case, no spaces.
```

## 4.5 Breakpoint Naming

```css
/* Consistent breakpoint naming (used in comments and documentation) */
/* {{BREAKPOINT_NAME}}: sm = 30em, md = 48em, lg = 64em, xl = 80em */

/* Use in media queries */
@media (width >= 30em) { /* sm */ }
@media (width >= 48em) { /* md */ }
@media (width >= 64em) { /* lg */ }
@media (width >= 80em) { /* xl */ }
```

---

## Checklist

- [ ] Selector naming convention chosen and documented (BEM or alternative)
- [ ] State class convention defined (is-*, has-*, or ARIA attributes)
- [ ] Custom property naming categories established
- [ ] Private custom property convention documented (--_ prefix)
- [ ] @layer names defined and documented
- [ ] File naming rules documented
- [ ] Breakpoint naming scheme established
- [ ] Stylelint rules configured to enforce naming patterns
- [ ] Examples provided for each naming category
- [ ] Team has reviewed and agreed on conventions

## Verification

```bash
stylelint .
pnpm build
```

Verify stylelint enforces the naming conventions defined above.
