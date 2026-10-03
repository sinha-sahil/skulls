# Phase 3: Fallbacks & Progressive Enhancement

**Dependencies:** Phase 1 (Code Style), Phase 2 (Design Tokens)

**Can be implemented in parallel with:** Phase 4 (Testing)

## Overview

Define the browser support policy, @supports usage patterns, and progressive enhancement strategy for `{{PROJECT_NAME}}`. Ensure that styles degrade gracefully in older browsers while leveraging modern CSS features where supported.

---

## 3.1 Browser Support Policy

### Target Browsers: {{BROWSER_TARGETS}}

```text
| Browser | Minimum Version | Support Level |
|---------|----------------|---------------|
| Chrome | last 2 versions | Full |
| Firefox | last 2 versions | Full |
| Safari | last 2 versions | Full |
| Edge | last 2 versions | Full |
| Mobile Safari | last 2 versions | Full |
| Chrome Android | last 2 versions | Full |
| Samsung Internet | last 2 versions | Best effort |
```

### Feature Support Tiers

```text
Tier 1 — Use freely (supported by all target browsers):
  ✓ CSS Grid, Flexbox
  ✓ Custom properties (var())
  ✓ @layer
  ✓ calc(), min(), max(), clamp()
  ✓ :is(), :where()
  ✓ aspect-ratio
  ✓ gap (flex and grid)
  ✓ Container queries (@container)
  ✓ :has() selector

Tier 2 — Use with fallback:
  ⚠ Native CSS nesting (check Safari version)
  ⚠ @scope (limited browser support)
  ⚠ color-mix() (check browser support)
  ⚠ oklch() / oklab() colour functions

Tier 3 — Do not use yet:
  ✗ @view-transition
  ✗ Anchor positioning
  ✗ @starting-style
```

## 3.2 @supports Usage Patterns

### Pattern 1: Feature Enhancement

```css
/* Base: works everywhere */
.card {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}

/* Enhancement: use container queries where supported */
@supports (container-type: inline-size) {
  .card-wrapper {
    container-type: inline-size;
  }
  .card {
    @container (inline-size > 30rem) {
      flex-direction: row;
    }
  }
}
```

### Pattern 2: Colour Function Fallback

```css
.button {
  /* Fallback: hex colour (works everywhere) */
  background: #3366cc;

  /* Enhancement: oklch for better colour space */
  @supports (color: oklch(0% 0 0)) {
    background: oklch(55% 0.22 265);
  }
}
```

### Pattern 3: Nesting Fallback

```css
/* Fallback: flat selectors */
.card { border: 1px solid var(--color-border); }
.card:hover { box-shadow: var(--shadow-md); }

/* Enhancement: native nesting */
@supports selector(&) {
  .card {
    border: 1px solid var(--color-border);

    &:hover {
      box-shadow: var(--shadow-md);
    }
  }
}
```

### Pattern 4: :has() Progressive Enhancement

```css
/* Base: always applied */
.card {
  padding: var(--space-md);
}

/* Enhancement: adapt when :has() is supported */
@supports selector(:has(*)) {
  .card:has(img) {
    padding-block-start: 0;
  }

  .card:has(.card__actions) {
    padding-block-end: var(--space-sm);
  }
}
```

### Pattern 5: @scope Progressive Enhancement

```css
/* Base: BEM scoping */
.card__title { font-size: var(--text-lg); }

/* Enhancement: native @scope */
@supports at-rule(@scope) {
  @scope (.card) to (.card__footer) {
    .title { font-size: var(--text-lg); }
  }
}
```

## 3.3 Fallback Strategy Rules

### General Rules

```text
| Rule | Description |
|------|-------------|
| Mobile-first | Base styles target smallest viewport, enhance upward |
| Feature-first | Base styles use widely supported features, enhance with modern CSS |
| No JS fallbacks | CSS must work without JavaScript for core layout and theming |
| Graceful degradation | If a feature isn't supported, the page remains usable |
| No user-agent sniffing | Use @supports for feature detection, never browser detection |
```

### Decision Flow

```text
Want to use a modern CSS feature?
│
├─ Is it Tier 1? → Use freely, no fallback needed
│
├─ Is it Tier 2? → Use with @supports fallback
│  ├─ Write base styles that work without the feature
│  ├─ Wrap enhancement in @supports
│  └─ Test in browsers without the feature
│
└─ Is it Tier 3? → Do not use yet
   └─ Wait for broader browser support
```

## 3.4 Custom Properties Fallback

Custom properties are Tier 1 but require fallback values when the property itself might not be defined:

```css
/* Defensive usage: provide fallback in var() */
.card {
  /* Second argument is the fallback if the property is undefined */
  color: var(--color-text, #333);
  padding: var(--space-md, 1rem);
  background: var(--color-surface, #fff);
}

/* For theme properties that may not be set */
.card {
  /* Falls back through the chain */
  background: var(--color-surface-raised, var(--color-surface, white));
}
```

## 3.5 Progressive Enhancement Patterns

### Fluid Typography

```css
/* Base: fixed size */
h1 {
  font-size: var(--text-3xl);
}

/* Enhancement: fluid scaling */
@supports (font-size: clamp(1rem, 1vw, 2rem)) {
  h1 {
    font-size: clamp(var(--text-2xl), 4vw, var(--text-4xl));
  }
}
```

### Subgrid Enhancement

```css
/* Base: explicit column definitions */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-md);
}
.card { display: grid; grid-template-rows: auto 1fr auto; }

/* Enhancement: subgrid for aligned rows */
@supports (grid-template-rows: subgrid) {
  .card-grid {
    grid-template-rows: masonry; /* or explicit row spans */
  }
  .card {
    grid-row: span 3;
    grid-template-rows: subgrid;
  }
}
```

### Scroll-Driven Animations

```css
/* Base: no animation (content is still visible) */
.hero-image { opacity: 1; }

/* Enhancement: fade on scroll */
@supports (animation-timeline: scroll()) {
  .hero-image {
    animation: fade-out linear;
    animation-timeline: scroll();
    animation-range: 0% 50%;
  }

  @keyframes fade-out {
    to { opacity: 0; }
  }
}
```

## 3.6 Browserslist Configuration

```text
# .browserslistrc
{{BROWSER_TARGETS}}
not dead
not op_mini all
```

```javascript
// postcss.config.js — autoprefixer uses browserslist
export default {
  plugins: {
    autoprefixer: {},
  },
};
```

---

## Checklist

- [ ] Browser support policy defined with specific versions
- [ ] Feature support tiers established (use freely / fallback / avoid)
- [ ] @supports patterns documented for each Tier 2 feature
- [ ] Fallback strategy rules documented
- [ ] Custom property fallback convention established
- [ ] Progressive enhancement patterns documented with examples
- [ ] Browserslist configured in the project
- [ ] Autoprefixer configured for target browsers
- [ ] All Tier 2 features tested in browsers without support
- [ ] Team understands the decision flow for using modern features

## Verification

```bash
stylelint .
pnpm build
```

Test the project in the oldest supported browser version to verify fallbacks work correctly.
