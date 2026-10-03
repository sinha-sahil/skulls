# Phase 6 · Testing Strategy

## Objective

Define the testing approach for validating all refactoring changes in **{{PROJECT_NAME}}** — covering HTML validation, accessibility compliance, visual regression, cross-browser compatibility, and screen reader testing.

---

## Testing Layers

### Layer 1: HTML Validation

Validate that all markup is well-formed and spec-compliant.

```bash
# HTMLHint — fast linting for common issues
htmlhint "src/**/*.html" --config .htmlhintrc

# html-validate — comprehensive HTML5 validation
npx html-validate "src/**/*.html"

# W3C Nu HTML Checker (most thorough)
npx vnu-jar dist/**/*.html
```

**HTMLHint configuration (`.htmlhintrc`):**

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
  "style-disabled": false,
  "inline-style-disabled": true,
  "empty-tag-not-self-closed": true
}
```

**Acceptance criteria:**
- [ ] Zero errors from HTMLHint
- [ ] Zero errors from html-validate
- [ ] Zero errors from W3C Nu Checker

---

### Layer 2: Accessibility Testing

#### Automated Testing

```bash
# axe-core CLI — WCAG 2.1 AA compliance
npx @axe-core/cli {{BASE_URL}} --tags wcag2a,wcag2aa,best-practice

# Lighthouse accessibility audit
npx lighthouse {{BASE_URL}} --only-categories=accessibility --output=json --output-path=./reports/lighthouse.json

# pa11y — accessibility testing with configurable standards
npx pa11y {{BASE_URL}} --standard WCAG2AA --reporter json > reports/pa11y.json
```

**Automated test matrix:**

| Page | axe-core | Lighthouse | pa11y |
|---|---|---|---|
| Home (`/`) | | | |
| About (`/about/`) | | | |
| Blog listing (`/blog/`) | | | |
| Blog post (`/blog/example/`) | | | |
| Products (`/products/`) | | | |
| Product detail (`/products/example/`) | | | |
| Contact (`/contact/`) | | | |
| 404 page | | | |

**Acceptance criteria:**
- [ ] Zero critical axe-core violations
- [ ] Zero serious axe-core violations
- [ ] Lighthouse accessibility score ≥ 95
- [ ] Zero pa11y WCAG2AA errors

#### Manual Accessibility Testing

| Test | Method | Pages | Status |
|---|---|---|---|
| Keyboard navigation | Tab through entire page | All | |
| Skip link works | Tab once from top, press Enter | All | |
| Focus visible on all interactive elements | Tab through, observe | All | |
| Heading hierarchy logical | DevTools heading outline | All | |
| Colour contrast (text) | DevTools contrast checker | All | |
| Colour contrast (UI components) | Manual inspection | All | |
| Zoom to 200% — layout intact | Browser zoom | All | |
| No horizontal scroll at 320px width | Responsive view | All | |

---

### Layer 3: Screen Reader Testing

Test with at least two screen reader + browser combinations:

| Screen Reader | Browser | Platform | Tester |
|---|---|---|---|
| VoiceOver | Safari | macOS | |
| NVDA | Firefox | Windows | |
| TalkBack | Chrome | Android | |

**Screen reader test script:**

```
For each page:

1. Navigate to page
2. Verify page title is announced
3. Verify skip link is announced and functions
4. Navigate by landmarks (rotor/region navigation)
   - header announced
   - navigation announced with label
   - main content announced
   - footer announced
5. Navigate by headings
   - h1 is page title
   - heading hierarchy is logical
6. Navigate forms (if present)
   - Each field label announced
   - Required state announced
   - Error messages announced
7. Navigate images
   - Alt text read for informative images
   - Decorative images skipped
8. Navigate interactive elements
   - Buttons announce their label
   - Expanded/collapsed state announced
   - Links announce their destination
```

---

### Layer 4: Visual Regression Testing

Ensure refactoring does not change the visual appearance.

```bash
# BackstopJS configuration
npx backstopjs init
```

```json
{
  "id": "{{PROJECT_NAME}}_refactoring",
  "viewports": [
    { "label": "phone", "width": 375, "height": 812 },
    { "label": "tablet", "width": 768, "height": 1024 },
    { "label": "desktop", "width": 1440, "height": 900 }
  ],
  "scenarios": [
    {
      "label": "Home",
      "url": "{{BASE_URL}}/",
      "referenceUrl": "{{BASE_URL}}/"
    },
    {
      "label": "About",
      "url": "{{BASE_URL}}/about/",
      "referenceUrl": "{{BASE_URL}}/about/"
    }
  ]
}
```

**Workflow:**
1. Capture reference screenshots **before** refactoring
2. Run refactoring changes
3. Capture test screenshots **after** refactoring
4. Compare — zero visual differences expected

---

### Layer 5: Cross-Browser Testing

| Browser | Version | Platform | Status |
|---|---|---|---|
| Chrome | Latest | macOS / Windows | |
| Firefox | Latest | macOS / Windows | |
| Safari | Latest | macOS / iOS | |
| Edge | Latest | Windows | |
| Samsung Internet | Latest | Android | |

**Test checklist per browser:**
- [ ] All pages load without errors
- [ ] Semantic elements render correctly
- [ ] Forms submit and validate correctly
- [ ] Interactive components function (accordion, modal, tabs)
- [ ] No console errors related to HTML structure

---

### Layer 6: Structured Data Validation

```bash
# Google Rich Results Test (manual)
# https://search.google.com/test/rich-results

# Schema.org validator (manual)
# https://validator.schema.org/
```

| Page | Schema Type | Google Rich Results | Schema Validator |
|---|---|---|---|
| Home | Organization | | |
| Blog post | BlogPosting | | |
| Product | Product | | |
| Breadcrumbs | BreadcrumbList | | |

---

## CI/CD Integration

```yaml
# Example GitHub Actions workflow
name: HTML Quality
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g htmlhint
      - run: htmlhint "src/**/*.html"

  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install && pnpm build
      - run: npx @axe-core/cli dist/index.html --tags wcag2a,wcag2aa

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm build
```

---

## Testing Strategy Checklist

- [ ] HTML validation configured and passing
- [ ] HTMLHint config (`.htmlhintrc`) created
- [ ] Automated accessibility testing set up (axe-core, Lighthouse, pa11y)
- [ ] Manual accessibility test script documented
- [ ] Screen reader testing plan with assigned testers
- [ ] Visual regression baseline captured
- [ ] Cross-browser test matrix defined
- [ ] Structured data validation passing
- [ ] CI/CD pipeline includes HTML validation and accessibility
- [ ] All test results documented and reviewed
