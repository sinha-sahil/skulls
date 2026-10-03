# Phase 1: Code Style

**Dependencies:** None

**Can be implemented in parallel with:** Phase 2 (Design Tokens)

## Overview

Establish CSS code style guidelines for `{{PROJECT_NAME}}`, covering naming conventions, selector specificity rules, nesting depth limits, property ordering, and formatting. These rules should be enforceable by stylelint wherever possible.

---

## 1.1 Naming Conventions

### Selector Naming: {{NAMING_CONVENTION}}

Choose a naming convention and apply it consistently across the project:

### BEM (Block__Element--Modifier)

```css
/* Block: standalone component */
.card { }
.dialog { }
.nav-bar { }

/* Element: part of a block (double underscore separator) */
.card__header { }
.card__body { }
.card__footer { }

/* Modifier: variation of a block or element (double hyphen separator) */
.card--featured { }
.card--compact { }
.card__header--sticky { }

/* Multi-word blocks use single hyphens */
.nav-bar { }
.nav-bar__link { }
.nav-bar__link--active { }
```

### Utility-First

```css
/* Single-purpose utility classes */
.flex { display: flex; }
.grid { display: grid; }
.items-center { align-items: center; }
.gap-md { gap: var(--space-md); }
.text-sm { font-size: var(--text-sm); }
.text-center { text-align: center; }
.visually-hidden { /* screen reader only */ }
```

### Rules Table

```text
| Rule | Correct | Incorrect | Stylelint Rule |
|------|---------|-----------|---------------|
| Lowercase kebab-case | .nav-bar | .navBar, .NavBar | selector-class-pattern |
| No bare element selectors in components | .card__title | .card h3 | — |
| No ID selectors for styling | .site-header | #header | selector-max-id: 0 |
| Meaningful names (purpose, not appearance) | .is-active | .blue, .big | — |
| State prefix | .is-open, .has-error | .open, .error | — |
```

## 1.2 Specificity Rules

### Maximum Specificity: {{MAX_SPECIFICITY}}

```text
Target: No selector should exceed {{MAX_SPECIFICITY}} specificity.

| Specificity | Allowed? | Example |
|-------------|----------|---------|
| 0-1-0 | ✓ Ideal | .button { } |
| 0-2-0 | ✓ Acceptable | .card__title { } .button:hover { } |
| 0-3-0 | ⚠ Review | .nav .link.is-active { } |
| 0-4-0+ | ✗ Forbidden | .page .content .sidebar .title { } |
| 1-0-0+ | ✗ Forbidden | #header { } |
```

### Specificity Management with @layer

```css
/* @layer provides cascade control without specificity escalation */
@layer reset, base, tokens, layouts, components, utilities;

/* A utility with 0-1-0 in @layer utilities overrides
   a component with 0-3-0 in @layer components */
@layer components {
  .card .title .icon { color: var(--color-text); }  /* 0-3-0 */
}
@layer utilities {
  .text-primary { color: var(--color-primary); }     /* 0-1-0, but wins */
}
```

### Forbidden Patterns

```css
/* ✗ NEVER: ID selectors */
#header { }

/* ✗ NEVER: !important (use @layer instead) */
.button { color: red !important; }

/* ✗ NEVER: inline styles for theming (use custom properties) */
/* <div style="color: red"> */

/* ✗ NEVER: deep nesting beyond {{MAX_NESTING_DEPTH}} levels */
.page .content .sidebar .widget .title { }
```

## 1.3 Nesting Rules

### Maximum Nesting Depth: {{MAX_NESTING_DEPTH}}

```css
/* ✓ Correct: 2 levels of nesting */
.card {
  padding: var(--space-md);

  &__header {
    border-block-end: 1px solid var(--color-border);
  }

  &:hover {
    box-shadow: var(--shadow-md);
  }
}

/* ✗ Incorrect: exceeds nesting limit */
.card {
  .header {
    .title {
      .icon {  /* Too deep! */
        fill: currentColor;
      }
    }
  }
}
```

### Nesting Guidelines

```text
Use nesting for:
  ✓ Pseudo-classes and pseudo-elements (& :hover, &::before)
  ✓ BEM elements (&__header, &__body)
  ✓ Media/container queries (@media, @container)
  ✓ Modifiers (&--compact, &.is-active)

Avoid nesting for:
  ✗ Descendant selectors (& .child — use BEM instead)
  ✗ Element selectors inside components (& h3 — use BEM class)
  ✗ More than {{MAX_NESTING_DEPTH}} levels deep
```

## 1.4 Property Ordering

### Recommended: Grouped by Category

```css
.component {
  /* 1. Layout & positioning */
  display: flex;
  position: relative;
  inset: 0;
  z-index: var(--z-dropdown);

  /* 2. Box model */
  margin: 0;
  padding: var(--space-md);
  inline-size: 100%;
  block-size: auto;
  overflow: hidden;

  /* 3. Typography */
  font-family: var(--font-body);
  font-size: var(--text-md);
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-text);
  text-align: start;

  /* 4. Visual / decorative */
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  opacity: 1;

  /* 5. Interaction & animation */
  cursor: pointer;
  transition: background var(--duration-normal) var(--ease-out);
  animation: none;

  /* 6. Custom properties (private) */
  --_bg: var(--color-surface);
  --_padding: var(--space-md);
}
```

## 1.5 Formatting Rules

### General Formatting

```css
/* One declaration per line */
.card {
  display: flex;
  padding: var(--space-md);
}

/* Blank line between rule blocks */
.card { }

.button { }

/* No blank lines inside rule blocks */
.card {
  display: flex;
  padding: var(--space-md);
}

/* Consistent spacing */
.card {
  color: var(--color-text);       /* space after colon */
  background: var(--color-surface); /* no space before colon */
}
```

### Logical Properties

Prefer logical properties over physical properties for internationalisation:

```css
/* ✓ Preferred: logical properties */
.card {
  margin-block: var(--space-md);
  padding-inline: var(--space-lg);
  border-inline-start: 2px solid var(--color-primary);
  inline-size: 100%;
  block-size: auto;
}

/* ✗ Avoid: physical properties (when logical equivalents exist) */
.card {
  margin-top: var(--space-md);
  margin-bottom: var(--space-md);
  padding-left: var(--space-lg);
  padding-right: var(--space-lg);
  border-left: 2px solid var(--color-primary);
}
```

## 1.6 Stylelint Configuration

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "selector-max-specificity": "{{MAX_SPECIFICITY}}",
    "max-nesting-depth": {{MAX_NESTING_DEPTH}},
    "declaration-no-important": true,
    "selector-max-id": 0,
    "selector-no-qualifying-type": true,
    "custom-property-pattern": "^([a-z][a-z0-9]*)(-[a-z0-9]+)*$",
    "selector-class-pattern": "^[a-z][a-z0-9]*(__[a-z0-9-]+)?(--[a-z0-9-]+)?$",
    "declaration-block-no-redundant-longhand-properties": true,
    "shorthand-property-no-redundant-values": true
  }
}
```

---

## Checklist

- [ ] Naming convention chosen (BEM or utility-first or hybrid)
- [ ] Maximum specificity defined: {{MAX_SPECIFICITY}}
- [ ] Maximum nesting depth defined: {{MAX_NESTING_DEPTH}}
- [ ] Property ordering convention documented
- [ ] Logical properties preferred over physical
- [ ] Forbidden patterns documented (ID selectors, !important, deep nesting)
- [ ] Formatting rules established
- [ ] Stylelint configuration created and enforces all rules
- [ ] Team has reviewed and agreed on all code style rules
- [ ] Examples provided for correct and incorrect patterns

## Verification

```bash
stylelint .
pnpm build
```

Code style rules should be enforced by stylelint before proceeding to other guidelines.
