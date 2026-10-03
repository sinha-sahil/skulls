# Phase 4: Testing

**Dependencies:** Phase 1 (Code Style), Phase 3 (Fallbacks & Progressive Enhancement)

**Can be implemented in parallel with:** Phase 3

## Overview

Define the CSS testing strategy for `{{PROJECT_NAME}}`, covering visual regression testing, cross-browser testing, responsive testing, and accessibility testing for styles. Testing ensures that style changes do not introduce visual regressions or accessibility issues.

---

## 4.1 Visual Regression Testing

### Tool: {{TEST_RUNNER}}

Visual regression testing captures screenshots and compares them against baselines to detect unintended visual changes.

### Setup

```javascript
// playwright.config.js (or equivalent)
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  snapshotDir: './tests/visual/__snapshots__',
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 720 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'mobile', use: { viewport: { width: 375, height: 812 } } },
  ],
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,  // 1% tolerance
    },
  },
});
```

### Writing Visual Tests

```javascript
// tests/visual/components.spec.js
import { test, expect } from '@playwright/test';

test.describe('Component visual tests', () => {
  test('card renders correctly', async ({ page }) => {
    await page.goto('/components/card');
    const card = page.locator('.card').first();
    await expect(card).toHaveScreenshot('card-default.png');
  });

  test('card hover state', async ({ page }) => {
    await page.goto('/components/card');
    const card = page.locator('.card').first();
    await card.hover();
    await expect(card).toHaveScreenshot('card-hover.png');
  });

  test('button variants', async ({ page }) => {
    await page.goto('/components/button');
    await expect(page.locator('.button--primary')).toHaveScreenshot('button-primary.png');
    await expect(page.locator('.button--secondary')).toHaveScreenshot('button-secondary.png');
  });

  test('{{COMPONENT_NAME}} renders correctly', async ({ page }) => {
    await page.goto('/components/{{COMPONENT_NAME}}');
    const component = page.locator('.{{COMPONENT_NAME}}').first();
    await expect(component).toHaveScreenshot('{{COMPONENT_NAME}}-default.png');
  });
});
```

### Running Tests

```bash
# Run visual regression tests
npx playwright test

# Update baselines after intentional changes
npx playwright test --update-snapshots

# Run for a specific project (viewport)
npx playwright test --project=mobile
```

## 4.2 Cross-Browser Testing

### Automated Cross-Browser

```javascript
// playwright.config.js — multi-browser
export default defineConfig({
  projects: [
    { name: 'chromium-desktop', use: { browserName: 'chromium', viewport: { width: 1280, height: 720 } } },
    { name: 'firefox-desktop', use: { browserName: 'firefox', viewport: { width: 1280, height: 720 } } },
    { name: 'webkit-desktop', use: { browserName: 'webkit', viewport: { width: 1280, height: 720 } } },
    { name: 'webkit-mobile', use: { browserName: 'webkit', viewport: { width: 375, height: 812 } } },
  ],
});
```

### Manual Cross-Browser Checklist

For each release or significant CSS change:

- [ ] Chrome (latest): Layout correct, animations smooth, hover states work
- [ ] Firefox (latest): Layout correct, font rendering acceptable
- [ ] Safari (latest): @layer working, :has() working, container queries working
- [ ] Mobile Safari: Touch states work, viewport units correct, no iOS zoom issues
- [ ] Chrome Android: Touch states, viewport behaviour correct

### Feature-Specific Tests

```javascript
test('container queries work', async ({ page }) => {
  await page.goto('/components/card');

  // Narrow container
  await page.setViewportSize({ width: 400, height: 600 });
  await expect(page.locator('.card')).toHaveCSS('flex-direction', 'column');

  // Wide container
  await page.setViewportSize({ width: 900, height: 600 });
  await expect(page.locator('.card')).toHaveCSS('flex-direction', 'row');
});

test(':has() selector applies styles', async ({ page }) => {
  await page.goto('/components/card');
  const cardWithImage = page.locator('.card:has(img)').first();
  await expect(cardWithImage).toHaveCSS('padding-top', '0px');
});
```

## 4.3 Responsive Testing

### Breakpoint Testing

```javascript
const breakpoints = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'wide', width: 1920, height: 1080 },
];

for (const bp of breakpoints) {
  test(`layout at ${bp.name} (${bp.width}px)`, async ({ page }) => {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto('/');
    await expect(page).toHaveScreenshot(`layout-${bp.name}.png`);
  });
}
```

### Resize Transition Testing

```javascript
test('layout transitions smoothly on resize', async ({ page }) => {
  await page.goto('/');

  // Start narrow
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.locator('.nav')).toBeVisible();

  // Resize to wide
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator('.nav')).toBeVisible();

  // No layout overflow or broken elements
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
});
```

## 4.4 Accessibility Testing for Styles

### Focus Visibility

```javascript
test('focus styles are visible on interactive elements', async ({ page }) => {
  await page.goto('/');

  // Tab to the first interactive element
  await page.keyboard.press('Tab');
  const focusedElement = page.locator(':focus-visible');
  await expect(focusedElement).toBeVisible();

  // Verify outline is visible (not transparent/none)
  const outline = await focusedElement.evaluate(el => {
    const style = window.getComputedStyle(el);
    return style.outlineStyle;
  });
  expect(outline).not.toBe('none');
});
```

### Colour Contrast

```bash
# Automated accessibility audit
npx pa11y http://localhost:3000 --standard WCAG2AA
npx pa11y http://localhost:3000 --standard WCAG2AA --runner axe

# Check all pages
npx pa11y-ci --config .pa11yci.json
```

```json
// .pa11yci.json
{
  "defaults": {
    "standard": "WCAG2AA",
    "runners": ["axe"]
  },
  "urls": [
    "http://localhost:3000/",
    "http://localhost:3000/components/card",
    "http://localhost:3000/components/button"
  ]
}
```

### Reduced Motion Testing

```javascript
test('respects prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  // Verify animations are disabled
  const animationDuration = await page.locator('.animated-element').evaluate(el => {
    return window.getComputedStyle(el).animationDuration;
  });
  expect(animationDuration).toBe('0.01ms');
});
```

### Dark Mode Testing

```javascript
test('dark theme renders correctly', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await expect(page).toHaveScreenshot('homepage-dark.png');
});

test('respects prefers-color-scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage-system-dark.png');
});
```

## 4.5 Testing Workflow

```text
For every CSS change:

1. Run: stylelint .
2. Run: pnpm build
3. Run: npx playwright test (visual regression)
4. If new component/page:
   a. Write visual tests for all states
   b. Capture baseline screenshots
   c. Add to cross-browser test matrix
5. Before release:
   a. Full cross-browser visual regression suite
   b. Accessibility audit (pa11y)
   c. Responsive breakpoint verification
```

---

## Checklist

- [ ] Visual regression testing tool configured ({{TEST_RUNNER}})
- [ ] Baseline screenshots captured for all critical pages
- [ ] Visual tests written for key components and states
- [ ] Cross-browser test configuration set up
- [ ] Responsive breakpoint tests written
- [ ] Focus visibility tests in place
- [ ] Colour contrast audit configured (pa11y or equivalent)
- [ ] Reduced motion test exists
- [ ] Dark mode / theme tests exist
- [ ] Testing workflow documented and integrated into CI
- [ ] All team members know how to run the test suite

## Verification

```bash
stylelint .
pnpm build
npx playwright test
npx pa11y-ci
```

Testing infrastructure should be operational before making significant style changes.
