# Phase 6: Testing Strategy

**Dependencies:** Phase 2 (Goals), Phase 3 (Impact Analysis)

**Can be implemented in parallel with:** Phase 4 (Strategy) — set up testing before execution

## Overview

Define the testing approach for validating that `{{PROJECT_NAME}}` CSS refactoring introduces no visual regressions, maintains cross-browser compatibility, and preserves responsive behaviour. Testing infrastructure should be set up before execution begins.

---

## 6.1 Visual Regression Testing

### Baseline Capture

Before any refactoring changes, capture screenshots of all critical pages and components:

```bash
# Using Playwright for visual regression
npx playwright test --update-snapshots

# Or using BackstopJS
npx backstop reference
```

### Key Pages/Components to Capture

```text
| Page/Component | Viewport Sizes | States to Capture | Priority |
|---------------|---------------|-------------------|----------|
| Homepage | 375px, 768px, 1280px | Default, scrolled | Critical |
| Navigation | 375px, 768px, 1280px | Default, open (mobile), hover | Critical |
| {{COMPONENT_NAME}} | 375px, 768px, 1280px | Default, hover, active | High |
| Form elements | 375px, 1280px | Empty, filled, error, disabled | High |
| ... | ... | ... | ... |
```

### Playwright Visual Test Example

```javascript
// tests/visual-regression.spec.js
import { test, expect } from '@playwright/test';

const viewports = [
  { width: 375, height: 812, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1280, height: 720, name: 'desktop' },
];

for (const viewport of viewports) {
  test(`homepage renders correctly at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`, {
      maxDiffPixelRatio: 0.01,
    });
  });

  test(`{{COMPONENT_NAME}} renders correctly at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/components/{{COMPONENT_NAME}}');
    await expect(page.locator('.{{COMPONENT_NAME}}')).toHaveScreenshot(
      `{{COMPONENT_NAME}}-${viewport.name}.png`,
      { maxDiffPixelRatio: 0.01 }
    );
  });
}
```

### Running After Each Change

```bash
# Compare current state to baseline
npx playwright test

# If intentional visual changes, update baseline
npx playwright test --update-snapshots
```

## 6.2 Cross-Browser Testing

### Target Browsers

```text
Based on {{BROWSER_TARGETS}}:
| Browser | Version | Features to Verify |
|---------|---------|-------------------|
| Chrome | latest 2 | @layer, :has(), nesting, container queries |
| Firefox | latest 2 | @layer, nesting, container queries |
| Safari | latest 2 | @layer, :has() (limited), container queries |
| Edge | latest 2 | Same as Chrome (Chromium-based) |
| Mobile Safari | latest 2 | Touch states, viewport units |
| Chrome Android | latest 2 | Touch states, viewport units |
```

### Feature Support Checks

```css
/* Verify these modern CSS features work in target browsers */

/* @layer — supported since: Chrome 99, Firefox 97, Safari 15.4 */
@layer test { .test { color: red; } }

/* :has() — supported since: Chrome 105, Firefox 121, Safari 15.4 */
.card:has(img) { padding: 0; }

/* Native nesting — supported since: Chrome 120, Firefox 117, Safari 17.2 */
.card { & .title { font-weight: bold; } }

/* Container queries — supported since: Chrome 105, Firefox 110, Safari 16 */
.wrapper { container-type: inline-size; }
@container (inline-size > 400px) { .card { display: grid; } }
```

### Automated Cross-Browser Test

```javascript
// playwright.config.js
export default {
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
};
```

## 6.3 Responsive Testing

### Breakpoint Verification

For each standardised breakpoint, verify layout transitions:

```text
| Breakpoint | Width | Expected Layout | Component |
|-----------|-------|----------------|-----------|
| Default | < 30em | Single column, stacked | All |
| sm | 30em | Minor adjustments | Navigation |
| md | 48em | Two-column layouts | Cards, content |
| lg | 64em | Full desktop layout | Page layout |
| xl | 80em | Max-width containers | Wrapper |
```

### Container Query Testing

```javascript
// Test container query breakpoints by resizing the container
test('card switches layout at container width', async ({ page }) => {
  await page.goto('/components/card');

  // Narrow container
  await page.setViewportSize({ width: 400, height: 600 });
  const card = page.locator('.card');
  await expect(card).toHaveCSS('grid-template-columns', 'none');

  // Wide container
  await page.setViewportSize({ width: 800, height: 600 });
  await expect(card).toHaveCSS('grid-template-columns', /1fr/);
});
```

## 6.4 Accessibility Testing for Styles

### Focus Visibility

```bash
# Ensure focus styles are not removed during refactoring
rg "outline:\s*none|outline:\s*0" {{STYLES_DIR}} --type css
```

```css
/* Every interactive element MUST have visible focus styles */
@layer base {
  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}
```

### Colour Contrast

```bash
# Use a contrast checker tool
npx pa11y http://localhost:3000 --standard WCAG2AA
```

### Motion Preferences

```css
/* Ensure reduced motion is respected */
@layer base {
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}
```

## 6.5 Performance Validation

```bash
# Compare CSS file sizes before and after
find {{STYLES_DIR}} -name "*.css" -exec wc -c {} + | sort -rn

# Check built CSS bundle size
ls -la dist/**/*.css 2>/dev/null

# Run Lighthouse CSS audit
npx lighthouse http://localhost:3000 --only-categories=performance --output=json \
  | jq '.audits["unused-css-rules"]'
```

## 6.6 Testing Workflow Per Step

```text
For EVERY refactoring step:

1. Make the CSS change
2. Update HTML/templates if selectors changed
3. Run: stylelint .
4. Run: pnpm build
5. Run: npx playwright test (visual regression)
6. Manual spot-check in browser
7. If all pass → commit
8. If anything fails → revert and investigate
```

---

## Checklist

- [ ] Visual regression baseline captured before any changes
- [ ] Playwright (or equivalent) visual tests written for critical pages
- [ ] Cross-browser test configuration set up
- [ ] Responsive breakpoint verification tests created
- [ ] Container query tests added for refactored components
- [ ] Accessibility tests cover focus visibility and contrast
- [ ] Reduced motion preferences verified
- [ ] Performance baseline recorded (CSS file sizes)
- [ ] Testing workflow documented and agreed upon
- [ ] All team members know how to run the test suite

## Verification

```bash
# Run the full test suite
stylelint .
pnpm build
npx playwright test
```

Testing infrastructure should be fully operational before execution (Phase 5) begins.
