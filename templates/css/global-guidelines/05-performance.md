# Phase 5: Performance

**Dependencies:** Phase 1 (Code Style), Phase 2 (Design Tokens)

**Can be implemented in parallel with:** Phase 4 (Testing), Phase 6 (Security)

## Overview

Establish CSS performance guidelines for `{{PROJECT_NAME}}`, covering critical CSS extraction, reducing repaints and reflows, CSS containment, `will-change` usage, font loading strategy, and image optimisation via CSS.

---

## 5.1 Critical CSS

### What is Critical CSS?

Critical CSS is the minimum CSS required to render above-the-fold content. It should be inlined in the HTML `<head>` to avoid render-blocking.

### Extraction Strategy

```html
<!-- Inline critical CSS in <head> -->
<head>
  <style>
    /* Critical: above-the-fold layout, typography, and colours */
    :root { --color-text: oklch(15% 0 0); --color-surface: oklch(98% 0 0); }
    body { font-family: var(--font-body); color: var(--color-text); margin: 0; }
    .site-header { display: flex; align-items: center; padding: var(--space-md); }
    .hero { padding: var(--space-2xl); }
  </style>

  <!-- Non-critical CSS loaded asynchronously -->
  <link rel="preload" href="/styles/{{ENTRY_FILE}}" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/styles/{{ENTRY_FILE}}"></noscript>
</head>
```

### Automated Critical CSS

```javascript
// Using critters (Vite plugin)
// vite.config.js
import critters from 'critters';

export default {
  plugins: [
    critters({
      preload: 'swap',
      inlineFonts: false,
    }),
  ],
};
```

### Critical CSS Budget

```text
Target: Critical CSS should be under 14KB (fits in first TCP round-trip)
Current: ___ KB
```

- [ ] Critical CSS identified and extracted
- [ ] Non-critical CSS loaded asynchronously
- [ ] Critical CSS size under 14KB budget

## 5.2 Reducing Repaints and Reflows

### Expensive Properties to Minimise

```text
| Property | Triggers | Cost | Alternative |
|----------|----------|------|-------------|
| width, height | Layout (reflow) | High | Use transform: scale() |
| top, left | Layout (reflow) | High | Use transform: translate() |
| margin, padding | Layout (reflow) | High | Avoid animating |
| box-shadow | Paint (repaint) | Medium | Use filter: drop-shadow() |
| border-radius | Paint (repaint) | Medium | Avoid animating |
| opacity | Composite only | Low | ✓ Safe to animate |
| transform | Composite only | Low | ✓ Safe to animate |
| filter | Composite only | Low | ✓ Safe to animate |
```

### Animation Best Practices

```css
/* ✓ GOOD: animate only composite properties */
.card {
  transition: transform var(--duration-normal) var(--ease-out),
              opacity var(--duration-normal) var(--ease-out);

  &:hover {
    transform: translateY(-2px);
    opacity: 0.95;
  }
}

/* ✗ BAD: animating layout properties */
.card {
  transition: margin-top 200ms, box-shadow 200ms;

  &:hover {
    margin-top: -2px;       /* Triggers reflow! */
    box-shadow: 0 8px 16px; /* Triggers repaint! */
  }
}
```

### Forced Reflow Avoidance

```css
/* Avoid properties that force layout recalculation */

/* ✗ BAD: changing dimensions triggers reflow */
.expanding-card {
  height: 100px;
  transition: height 300ms;
}
.expanding-card.is-open { height: auto; }  /* 'auto' forces reflow */

/* ✓ GOOD: use grid or max-height for expand/collapse */
.expanding-card {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--duration-slow) var(--ease-out);
}
.expanding-card.is-open {
  grid-template-rows: 1fr;
}
.expanding-card__content {
  overflow: hidden;
}
```

## 5.3 CSS Containment

### contain Property

Containment tells the browser that an element's internals are independent of the rest of the page, enabling optimisations:

```css
/* Layout containment: element's internal layout doesn't affect outside */
.card {
  contain: layout;
}

/* Size containment: element's size is known without checking children */
.sidebar {
  contain: size layout;
  block-size: 100dvh;
}

/* Content containment: common shorthand for layout + style + paint */
.widget {
  contain: content;
}

/* Strict containment: everything (requires explicit dimensions) */
.ad-slot {
  contain: strict;
  inline-size: 300px;
  block-size: 250px;
}
```

### content-visibility

For long pages with off-screen content:

```css
/* Skip rendering of off-screen sections */
.page-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;  /* Estimated height */
}

/* Never hide above-the-fold content */
.hero {
  content-visibility: visible;  /* Always render */
}
```

## 5.4 will-change Usage

### Rules for will-change

```text
| Rule | Reason |
|------|--------|
| Never use will-change: * on many elements | Excessive memory usage |
| Apply will-change just before animation starts | Pre-promote to compositor |
| Remove will-change after animation ends | Free GPU memory |
| Never use will-change as a permanant style | Wastes resources when idle |
| Prefer transform/opacity animations instead | Often eliminates the need |
```

```css
/* ✓ CORRECT: apply on interaction, not permanently */
.card {
  transition: transform var(--duration-normal) var(--ease-out);

  &:hover {
    will-change: transform;
    transform: translateY(-2px);
  }
}

/* ✗ WRONG: permanent will-change on all cards */
.card {
  will-change: transform, opacity;  /* Wastes GPU memory */
}
```

### JavaScript-Controlled will-change

```javascript
// Apply before animation, remove after
element.addEventListener('pointerenter', () => {
  element.style.willChange = 'transform';
});
element.addEventListener('animationend', () => {
  element.style.willChange = 'auto';
});
```

## 5.5 Font Loading Strategy

### font-display

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;  /* Show fallback immediately, swap when loaded */
}
```

### Font Loading Options

```text
| Value | Behaviour | Use When |
|-------|-----------|----------|
| swap | Show fallback immediately, swap | Body text |
| optional | Show fallback, may never swap | Non-critical decorative |
| fallback | Brief invisible, then fallback, swap if fast | Headings |
| auto | Browser decides | Rarely appropriate |
```

### Preload Critical Fonts

```html
<head>
  <link rel="preload" href="/fonts/custom-regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/custom-bold.woff2" as="font" type="font/woff2" crossorigin>
</head>
```

### Reduce Font File Size

```text
- [ ] Use WOFF2 format only (best compression)
- [ ] Subset fonts to include only needed characters
- [ ] Limit font weights to what's actually used
- [ ] Use system font stack for body text when possible
```

## 5.6 Image Optimisation via CSS

### Responsive Images

```css
.hero-image {
  inline-size: 100%;
  block-size: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
```

### Background Image Optimisation

```css
/* Use image-set for responsive backgrounds */
.hero {
  background-image: image-set(
    url('/images/hero.avif') type('image/avif'),
    url('/images/hero.webp') type('image/webp'),
    url('/images/hero.jpg') type('image/jpeg')
  );
  background-size: cover;
  background-position: center;
}
```

### Lazy Rendering of Off-Screen Images

```css
/* Combine with content-visibility for off-screen sections */
.image-gallery {
  content-visibility: auto;
  contain-intrinsic-size: auto 600px;
}
```

## 5.7 Performance Budget

```text
| Metric | Budget | Current |
|--------|--------|---------|
| Total CSS (uncompressed) | < 50KB | ___ KB |
| Total CSS (gzipped) | < 15KB | ___ KB |
| Critical CSS (inlined) | < 14KB | ___ KB |
| Unused CSS | < 10% | ___% |
| Web fonts (total) | < 100KB | ___ KB |
| Largest Contentful Paint (CSS impact) | < 2.5s | ___ s |
```

---

## Checklist

- [ ] Critical CSS identified and inlined (< 14KB)
- [ ] Non-critical CSS loaded asynchronously
- [ ] Animations use only composite properties (transform, opacity, filter)
- [ ] No layout properties are animated
- [ ] CSS containment applied to independent sections
- [ ] content-visibility used for off-screen content
- [ ] will-change used sparingly and removed after animations
- [ ] Font loading strategy defined (font-display: swap)
- [ ] Critical fonts preloaded
- [ ] Fonts subset and served as WOFF2
- [ ] Responsive images use aspect-ratio and object-fit
- [ ] Performance budget defined and measured
- [ ] `stylelint .` passes
- [ ] `pnpm build` succeeds

## Verification

```bash
stylelint .
pnpm build

# Measure CSS bundle size
ls -la dist/**/*.css 2>/dev/null

# Run Lighthouse performance audit
npx lighthouse http://localhost:3000 --only-categories=performance
```

Performance guidelines should be followed from the start of the project to avoid costly retrofitting.
