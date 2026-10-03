# Phase 4: Refactoring Strategy

**Dependencies:** Phase 2 (Goals), Phase 3 (Impact Analysis)

**Can be implemented in parallel with:** None (strategy must be decided before execution)

## Overview

Choose the refactoring approach and specific patterns for `{{PROJECT_NAME}}`. This phase defines the concrete techniques, code transformations, and architectural decisions that will be applied during execution.

---

## 4.1 Overall Approach

### Incremental vs Big-Bang

```text
✓ RECOMMENDED: Incremental refactoring
  - One component/file at a time
  - Build and visual verify after each change
  - Can stop at any point with code in a working state
  - Lower risk, easier to review

✗ AVOID: Big-bang rewrite
  - All changes at once
  - Long-lived branch diverging from main
  - High risk of merge conflicts
  - Difficult to review and debug
```

### Feature Branch Strategy

```bash
# Create main refactoring branch
git checkout -b {{BRANCH_NAME}}

# For larger efforts, use sub-branches per component
git checkout -b {{BRANCH_NAME}}/{{COMPONENT_NAME}}

# Merge each sub-branch back to the main refactoring branch
git checkout {{BRANCH_NAME}}
git merge {{BRANCH_NAME}}/{{COMPONENT_NAME}}
```

## 4.2 Specificity Reduction Strategy

### Replace ID Selectors

```css
/* BEFORE */
#header { background: white; }
#header .logo { height: 2rem; }
#main-nav a { color: #333; }

/* AFTER */
@layer components {
  .site-header { background: var(--color-surface); }
  .site-header__logo { height: 2rem; }
  .main-nav__link { color: var(--color-text); }
}
```

### Flatten Nested Selectors

```css
/* BEFORE: deeply nested (high specificity) */
.page .content .sidebar .widget .title { 
  font-size: 14px; 
}
/* Specificity: 0-5-0 */

/* AFTER: flat BEM selector (low specificity) */
@layer components {
  .widget__title { 
    font-size: var(--text-sm); 
  }
}
/* Specificity: 0-1-0 within @layer components */
```

### !important Removal via @layer Promotion

```css
/* BEFORE: !important to fight specificity */
.tooltip {
  z-index: 9999 !important;
  position: absolute !important;
}

/* AFTER: use a higher @layer instead */
@layer components {
  .tooltip {
    z-index: var(--z-tooltip);
    position: absolute;
  }
}
/* If needed, promote to utilities layer which overrides components */
@layer utilities {
  .tooltip.is-pinned {
    position: fixed;
  }
}
```

## 4.3 Custom Property Migration Strategy

### Step-by-step Approach

```text
1. Create the token file with custom property definitions
2. Find all instances of a hard-coded value (e.g., #333333)
3. Replace with the corresponding custom property
4. Verify visually — the rendered output must not change
5. Move to the next value
```

### Colour Migration Example

```css
/* Step 1: Define token */
:root {
  --color-text: oklch(20% 0 0);  /* equivalent to #333333 */
}

/* Step 2-3: Replace all instances */
/* BEFORE */ .card { color: #333333; }
/* AFTER  */ .card { color: var(--color-text); }

/* BEFORE */ .nav a { color: #333; }
/* AFTER  */ .nav-link { color: var(--color-text); }
```

### Spacing Migration Example

```css
/* Map existing pixel values to token scale */
:root {
  --space-xs: 0.25rem;  /*  4px */
  --space-sm: 0.5rem;   /*  8px */
  --space-md: 1rem;     /* 16px */
  --space-lg: 1.5rem;   /* 24px */
  --space-xl: 2rem;     /* 32px */
}

/* BEFORE */ .card { padding: 16px; margin-bottom: 24px; }
/* AFTER  */ .card { padding: var(--space-md); margin-block-end: var(--space-lg); }
```

## 4.4 @layer Adoption Strategy

### Phase-In Approach

```css
/* Step 1: Add layer order declaration to entry file */
@layer reset, base, tokens, layouts, components, utilities;

/* Step 2: Wrap existing rules in appropriate layers (one file at a time) */
/* BEFORE: _button.css */
.button { padding: 8px 16px; }
.button:hover { background: blue; }

/* AFTER: _button.css */
@layer components {
  .button { padding: var(--space-xs) var(--space-md); }
  .button:hover { background: var(--color-primary-hover); }
}

/* Step 3: Use @import with layer() for new imports */
@import "./components/_button.css" layer(components);
```

### Handling Third-Party Styles

```css
/* Wrap third-party overrides in a dedicated layer */
@layer reset, base, tokens, layouts, vendor, components, utilities;

@layer vendor {
  /* Override third-party styles here */
  .swiper-slide {
    border-radius: var(--radius-md);
  }
}
```

## 4.5 Responsive Design Strategy

### Migrate to Mobile-First

```css
/* BEFORE: desktop-first (max-width) */
.card { display: grid; grid-template-columns: 1fr 1fr; }
@media (max-width: 768px) { .card { grid-template-columns: 1fr; } }

/* AFTER: mobile-first (min-width) */
@layer components {
  .card {
    display: grid;
    grid-template-columns: 1fr;

    @media (width >= 48em) {
      grid-template-columns: 1fr 1fr;
    }
  }
}
```

### Adopt Container Queries Where Appropriate

```css
/* BEFORE: media query tied to viewport */
.card { padding: 1rem; }
@media (min-width: 768px) { .card { padding: 2rem; } }

/* AFTER: container query tied to component's container */
@layer components {
  .card-wrapper { container-type: inline-size; }
  .card {
    padding: var(--space-md);

    @container (inline-size > 30rem) {
      padding: var(--space-xl);
    }
  }
}
```

## 4.6 Vendor Prefix Cleanup Strategy

```bash
# Check if autoprefixer is configured
cat postcss.config.* 2>/dev/null

# If autoprefixer is active, manually added prefixes can be removed
# Check caniuse for each prefixed property against {{BROWSER_TARGETS}}
```

```css
/* BEFORE: manual prefixes */
.card {
  -webkit-border-radius: 8px;
  -moz-border-radius: 8px;
  border-radius: 8px;
  -webkit-box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* AFTER: autoprefixer handles needed prefixes */
.card {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
```

---

## Checklist

- [ ] Chosen incremental approach over big-bang rewrite
- [ ] Branch strategy defined
- [ ] ID selector replacement strategy documented with examples
- [ ] Selector flattening approach defined (BEM or alternative)
- [ ] !important removal strategy uses @layer promotion
- [ ] Custom property migration approach is step-by-step
- [ ] @layer adoption is phased (declaration → wrapping → import)
- [ ] Responsive design migration direction chosen (mobile-first or container queries)
- [ ] Third-party style handling strategy defined
- [ ] Vendor prefix cleanup approach documented
- [ ] Each strategy includes before/after code examples
- [ ] Strategies address all goals from Phase 2

## Verification

```bash
stylelint .
pnpm build
```

Strategy decisions should be finalized before proceeding to Phase 5 (Execution Plan).
