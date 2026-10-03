# Phase 4 · Testing

## Objective

Define the HTML testing strategy for **{{PROJECT_NAME}}** covering accessibility testing, HTML validation, cross-browser testing, and screen reader verification.

---

## Accessibility Testing

### Automated Testing Tools

#### axe-core

The primary automated accessibility testing engine:

```bash
# CLI usage
npx @axe-core/cli {{BASE_URL}} --tags wcag2a,wcag2aa,best-practice

# Test multiple pages
npx @axe-core/cli {{BASE_URL}} {{BASE_URL}}/about/ {{BASE_URL}}/contact/ --tags wcag2a,wcag2aa

# Output as JSON for CI integration
npx @axe-core/cli {{BASE_URL}} --tags wcag2a,wcag2aa --reporter json > reports/axe-results.json
```

**Integration with test frameworks:**

```javascript
// Example: Playwright + axe-core
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('home page has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('contact form has no accessibility violations', async ({ page }) => {
    await page.goto('/contact/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
```

#### Lighthouse

```bash
# Accessibility-only audit
npx lighthouse {{BASE_URL}} \
  --only-categories=accessibility \
  --output=json \
  --output-path=reports/lighthouse.json

# CI-friendly with budget assertions
npx lighthouse {{BASE_URL}} \
  --only-categories=accessibility \
  --budget-path=lighthouse-budget.json
```

**Lighthouse budget configuration:**

```json
[
  {
    "path": "/",
    "options": {
      "firstParty": "{{BASE_URL}}"
    },
    "assertions": {
      "categories:accessibility": ["error", { "minScore": 0.95 }]
    }
  }
]
```

#### pa11y

```bash
# Single page test
npx pa11y {{BASE_URL}} --standard WCAG2AA

# Multiple pages from a sitemap
npx pa11y-ci --sitemap {{BASE_URL}}/sitemap.xml

# Configuration file (.pa11yci)
```

```json
{
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 10000,
    "wait": 1000,
    "chromeLaunchConfig": {
      "args": ["--no-sandbox"]
    }
  },
  "urls": [
    "{{BASE_URL}}/",
    "{{BASE_URL}}/about/",
    "{{BASE_URL}}/contact/",
    "{{BASE_URL}}/blog/",
    "{{BASE_URL}}/products/"
  ]
}
```

### Acceptance Thresholds

| Tool | Metric | Threshold | Blocking? |
|---|---|---|---|
| axe-core | Critical violations | 0 | Yes |
| axe-core | Serious violations | 0 | Yes |
| axe-core | Moderate violations | 0 | No (warning) |
| Lighthouse | Accessibility score | ≥ 95 | Yes |
| pa11y | WCAG2AA errors | 0 | Yes |

---

## HTML Validation

### HTMLHint Configuration

```json
{
  "doctype-first": true,
  "tag-pair": true,
  "attr-no-duplication": true,
  "id-unique": true,
  "title-require": true,
  "alt-require": true,
  "attr-lowercase": true,
  "tag-self-close": false,
  "spec-char-escape": true,
  "id-class-value": "dash",
  "head-script-disabled": true,
  "inline-style-disabled": true,
  "empty-tag-not-self-closed": true
}
```

```bash
# Run HTMLHint
htmlhint "src/**/*.html" --config .htmlhintrc

# Run on build output
htmlhint "dist/**/*.html" --config .htmlhintrc
```

### W3C Nu HTML Checker

```bash
# Install and run locally
npx vnu-jar dist/**/*.html

# Or use the online validator for spot-checks
# https://validator.w3.org/nu/
```

### Validation Test Matrix

| File | HTMLHint | W3C | Status |
|---|---|---|---|
| `dist/index.html` | | | |
| `dist/about/index.html` | | | |
| `dist/blog/index.html` | | | |
| `dist/contact/index.html` | | | |
| `dist/products/index.html` | | | |
| `dist/404.html` | | | |

---

## Cross-Browser Testing

### Browser Matrix

| Browser | Version | Platform | Priority |
|---|---|---|---|
| Chrome | Latest | macOS, Windows, Android | P1 |
| Safari | Latest | macOS, iOS | P1 |
| Firefox | Latest | macOS, Windows | P1 |
| Edge | Latest | Windows | P2 |
| Samsung Internet | Latest | Android | P2 |

### Cross-Browser Test Checklist

For each browser in the matrix:

- [ ] All pages load without console errors
- [ ] Semantic elements render with correct default styles
- [ ] Forms submit correctly
- [ ] Form validation messages appear
- [ ] Interactive components work (accordion, tabs, modal)
- [ ] Images load (including `<picture>` and `srcset`)
- [ ] Lazy loading works for below-the-fold images
- [ ] `loading="lazy"` attribute respected or gracefully ignored
- [ ] Print styles render correctly (if applicable)
- [ ] Responsive layout works at 375px, 768px, 1024px, 1440px

### Viewport Testing

```html
<!-- Test at these breakpoints -->
<!-- 375px   — mobile phone (portrait) -->
<!-- 768px   — tablet (portrait) -->
<!-- 1024px  — tablet (landscape) / small desktop -->
<!-- 1440px  — desktop -->
<!-- 1920px  — large desktop -->
```

| Page | 375px | 768px | 1024px | 1440px |
|---|---|---|---|---|
| Home | | | | |
| About | | | | |
| Blog listing | | | | |
| Blog post | | | | |
| Contact | | | | |
| Products | | | | |

---

## Screen Reader Testing

### Test Matrix

| Screen Reader | Browser | Platform |
|---|---|---|
| VoiceOver | Safari | macOS |
| VoiceOver | Safari | iOS |
| NVDA | Firefox | Windows |
| TalkBack | Chrome | Android |

### Screen Reader Test Script

Execute this script on every major page:

```
1. PAGE LOAD
   - [ ] Page title announced correctly
   - [ ] Language announced (if reader does this)

2. SKIP LINK
   - [ ] "Skip to main content" announced on first Tab
   - [ ] Activating skip link moves focus to main content

3. LANDMARKS
   - [ ] Navigate by landmarks (VoiceOver: rotor → landmarks)
   - [ ] Banner (header) detected
   - [ ] Navigation detected with label
   - [ ] Main content detected
   - [ ] Contentinfo (footer) detected

4. HEADINGS
   - [ ] Navigate by headings (VoiceOver: rotor → headings)
   - [ ] h1 is the page title
   - [ ] Heading levels are sequential (no skips)

5. LINKS
   - [ ] Navigate by links
   - [ ] Link text is descriptive (no "click here")
   - [ ] External links indicated (if applicable)

6. IMAGES
   - [ ] Informative images have alt text read
   - [ ] Decorative images are skipped

7. FORMS (if present)
   - [ ] Each input label announced
   - [ ] Required fields announced as required
   - [ ] Error messages announced via aria-live

8. INTERACTIVE COMPONENTS
   - [ ] Accordion: expanded/collapsed state announced
   - [ ] Tabs: selected tab announced
   - [ ] Modal: focus trapped, close announced
```

---

## CI/CD Integration

```yaml
# .github/workflows/html-quality.yml
name: HTML Quality

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
      - run: npx htmlhint "dist/**/*.html" --config .htmlhintrc

  accessibility:
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install && pnpm build
      - run: npx serve dist -l 3000 &
      - run: sleep 3
      - run: npx @axe-core/cli http://localhost:3000 --tags wcag2a,wcag2aa
      - run: npx pa11y http://localhost:3000 --standard WCAG2AA
```

---

## Testing Checklist

- [ ] axe-core configured and integrated into test suite
- [ ] Lighthouse accessibility budget set (≥ 95)
- [ ] pa11y configured with all page URLs
- [ ] HTMLHint configuration (`.htmlhintrc`) committed
- [ ] W3C validation passing on all pages
- [ ] Cross-browser matrix defined and tested
- [ ] Viewport testing complete at all breakpoints
- [ ] Screen reader test script executed on all major pages
- [ ] CI/CD pipeline includes validation and accessibility
- [ ] Test results documented and reviewed with team
- [ ] Automated tests run on every pull request
