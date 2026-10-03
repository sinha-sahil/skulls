# Phase 2: Design Tokens

**Dependencies:** Phase 1 (Code Style — naming conventions inform token naming)

**Can be implemented in parallel with:** Phase 1

## Overview

Establish design token conventions for `{{PROJECT_NAME}}` using CSS custom properties. Define token naming patterns, categories, theme switching mechanisms, and the relationship between primitive and semantic tokens.

---

## 2.1 Token Architecture

### Two-Layer Token System

```text
Primitive Tokens → Raw values (colours, sizes, specific values)
Semantic Tokens → Named by purpose, reference primitives
Component Tokens → Private, scoped to a single component

:root {
  /* Primitive (do not use directly in components) */
  --blue-500: oklch(55% 0.22 265);

  /* Semantic (use in components) */
  --color-primary: var(--blue-500);

  /* Component (private, scoped) */
  .button { --_bg: var(--color-primary); }
}
```

### Token Flow

```text
Primitive tokens ──→ Semantic tokens ──→ Component tokens
  (raw values)       (purposeful names)   (private, scoped)
  --blue-500         --color-primary       --_bg
  --gray-100         --color-surface       --_padding
  16px               --space-md            --_radius
```

## 2.2 Token Categories

### Colour Tokens

```css
@layer tokens {
  :root {
    /* ── Primitive Palette ── */
    --blue-50: oklch(95% 0.04 265);
    --blue-100: oklch(90% 0.08 265);
    --blue-500: oklch(55% 0.22 265);
    --blue-600: oklch(48% 0.22 265);
    --blue-900: oklch(25% 0.12 265);

    --gray-50: oklch(98% 0 0);
    --gray-100: oklch(95% 0 0);
    --gray-200: oklch(88% 0 0);
    --gray-500: oklch(55% 0 0);
    --gray-800: oklch(25% 0 0);
    --gray-900: oklch(15% 0 0);

    --red-500: oklch(55% 0.22 25);
    --green-500: oklch(55% 0.18 150);
    --amber-500: oklch(75% 0.16 70);

    /* ── Semantic Colours ── */
    --color-primary: var(--blue-500);
    --color-primary-hover: var(--blue-600);
    --color-primary-subtle: var(--blue-50);

    --color-surface: var(--gray-50);
    --color-surface-raised: white;
    --color-surface-sunken: var(--gray-100);

    --color-text: var(--gray-900);
    --color-text-muted: var(--gray-500);
    --color-text-on-primary: white;

    --color-border: var(--gray-200);
    --color-border-strong: var(--gray-500);

    --color-error: var(--red-500);
    --color-success: var(--green-500);
    --color-warning: var(--amber-500);
  }
}
```

### Spacing Tokens

```css
@layer tokens {
  :root {
    /* T-shirt sizing scale — consistent ratio */
    --space-3xs: 0.125rem;  /*  2px */
    --space-2xs: 0.25rem;   /*  4px */
    --space-xs: 0.5rem;     /*  8px */
    --space-sm: 0.75rem;    /* 12px */
    --space-md: 1rem;       /* 16px */
    --space-lg: 1.5rem;     /* 24px */
    --space-xl: 2rem;       /* 32px */
    --space-2xl: 3rem;      /* 48px */
    --space-3xl: 4rem;      /* 64px */
  }
}
```

### Typography Tokens

```css
@layer tokens {
  :root {
    /* Font families */
    --font-body: system-ui, -apple-system, 'Segoe UI', sans-serif;
    --font-heading: var(--font-body);
    --font-mono: ui-monospace, 'Cascadia Code', 'JetBrains Mono', monospace;

    /* Font sizes — modular scale */
    --text-xs: 0.75rem;    /* 12px */
    --text-sm: 0.875rem;   /* 14px */
    --text-md: 1rem;       /* 16px */
    --text-lg: 1.125rem;   /* 18px */
    --text-xl: 1.25rem;    /* 20px */
    --text-2xl: 1.5rem;    /* 24px */
    --text-3xl: 2rem;      /* 32px */
    --text-4xl: 2.5rem;    /* 40px */

    /* Line heights */
    --leading-tight: 1.25;
    --leading-normal: 1.5;
    --leading-relaxed: 1.75;

    /* Font weights */
    --weight-normal: 400;
    --weight-medium: 500;
    --weight-semibold: 600;
    --weight-bold: 700;
  }
}
```

### Shape and Effect Tokens

```css
@layer tokens {
  :root {
    /* Border radius */
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 1rem;
    --radius-xl: 1.5rem;
    --radius-pill: 100vw;
    --radius-circle: 50%;

    /* Box shadows */
    --shadow-xs: 0 1px 2px oklch(0% 0 0 / 0.04);
    --shadow-sm: 0 1px 3px oklch(0% 0 0 / 0.08);
    --shadow-md: 0 4px 6px oklch(0% 0 0 / 0.1);
    --shadow-lg: 0 10px 15px oklch(0% 0 0 / 0.12);
    --shadow-xl: 0 20px 25px oklch(0% 0 0 / 0.15);

    /* Z-index scale */
    --z-base: 0;
    --z-dropdown: 10;
    --z-sticky: 20;
    --z-overlay: 30;
    --z-modal: 40;
    --z-toast: 50;
  }
}
```

### Motion Tokens

```css
@layer tokens {
  :root {
    /* Durations */
    --duration-instant: 50ms;
    --duration-fast: 100ms;
    --duration-normal: 200ms;
    --duration-slow: 400ms;
    --duration-slower: 600ms;

    /* Easings */
    --ease-linear: linear;
    --ease-in: cubic-bezier(0.55, 0, 1, 0.45);
    --ease-out: cubic-bezier(0, 0.55, 0.45, 1);
    --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}
```

## 2.3 Theme Switching

### Data Attribute Approach

```css
/* Default (light) theme — defined in :root */
:root {
  --color-primary: var(--blue-500);
  --color-surface: var(--gray-50);
  --color-text: var(--gray-900);
}

/* {{THEME_NAME}} theme — overrides semantic tokens */
@layer tokens {
  [data-theme="{{THEME_NAME}}"] {
    --color-primary: oklch(70% 0.18 265);
    --color-surface: oklch(12% 0 0);
    --color-text: oklch(90% 0 0);
    --color-text-muted: oklch(60% 0 0);
    --color-border: oklch(25% 0 0);
    --color-surface-raised: oklch(18% 0 0);
    --color-surface-sunken: oklch(8% 0 0);
  }
}

/* System preference detection */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --color-primary: oklch(70% 0.18 265);
    --color-surface: oklch(12% 0 0);
    --color-text: oklch(90% 0 0);
    /* ... same as dark theme above ... */
  }
}
```

### Usage

```html
<!-- Light (default) -->
<html>

<!-- Dark theme -->
<html data-theme="dark">

<!-- High contrast -->
<html data-theme="high-contrast">
```

## 2.4 Token Naming Rules

```text
| Rule | Correct | Incorrect | Reason |
|------|---------|-----------|--------|
| Category prefix | --color-primary | --primary | Avoid naming collisions |
| Lowercase kebab-case | --space-md | --spaceMd | Consistency |
| Semantic names | --color-error | --color-red | Theme-independent |
| T-shirt sizing | --space-sm, --space-md | --space-1, --space-2 | Readable scale |
| Private underscore | --_card-bg | --card-bg | Clear scope |
| No magic numbers | var(--space-md) | 16px | Maintainability |
```

---

## Checklist

- [ ] Two-layer token system established (primitive → semantic)
- [ ] Colour tokens defined (primitives and semantic)
- [ ] Spacing token scale defined
- [ ] Typography tokens defined (families, sizes, weights, line-heights)
- [ ] Shape tokens defined (radius, shadows)
- [ ] Z-index scale defined
- [ ] Motion tokens defined (durations, easings)
- [ ] Theme switching mechanism documented
- [ ] Dark theme tokens defined
- [ ] System preference detection implemented
- [ ] Token naming rules documented
- [ ] All token files created in {{TOKENS_DIR}}

## Verification

```bash
stylelint .
pnpm build
```

Design tokens should be defined before components are styled to ensure consistent usage from the start.
