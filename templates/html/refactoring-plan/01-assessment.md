# Phase 1 · Assessment

## Objective

Audit the current HTML markup in **{{PROJECT_NAME}}** to identify refactoring opportunities — semantic issues, accessibility gaps, div soup, outdated patterns, and structural problems.

---

## Markup Quality Audit

### Semantic Element Usage

Scan all HTML files for semantic vs non-semantic element usage:

```html
<!-- Non-semantic (div soup) — common in legacy markup -->
<div class="header">
  <div class="nav">
    <div class="nav-item"><a href="/">Home</a></div>
    <div class="nav-item"><a href="/about">About</a></div>
  </div>
</div>
<div class="main">
  <div class="article">
    <div class="article-title">Blog Post Title</div>
    <div class="article-content">...</div>
  </div>
</div>
<div class="footer">...</div>

<!-- Semantic equivalent — the refactoring target -->
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h1>Blog Post Title</h1>
    <div class="article-body">...</div>
  </article>
</main>
<footer>...</footer>
```

| Element | Current Usage | Semantic Replacement | Files Affected |
|---|---|---|---|
| `<div class="header">` | | `<header>` | |
| `<div class="nav">` | | `<nav>` | |
| `<div class="main">` | | `<main>` | |
| `<div class="article">` | | `<article>` | |
| `<div class="section">` | | `<section>` | |
| `<div class="sidebar">` | | `<aside>` | |
| `<div class="footer">` | | `<footer>` | |
| `<b>` for non-bold emphasis | | `<strong>` | |
| `<i>` for non-italic emphasis | | `<em>` | |

---

## Accessibility Audit

### WCAG 2.1 AA Compliance Scan

Run automated tools and document findings:

```bash
# Run axe-core via CLI
npx @axe-core/cli {{BASE_URL}}

# Run Lighthouse accessibility audit
npx lighthouse {{BASE_URL}} --only-categories=accessibility --output=json
```

| Issue | Severity | WCAG Criterion | Files Affected | Count |
|---|---|---|---|---|
| Missing alt text on images | Critical | 1.1.1 | | |
| Missing form labels | Critical | 1.3.1 | | |
| Insufficient colour contrast | Serious | 1.4.3 | | |
| Missing skip link | Serious | 2.4.1 | | |
| Missing landmark regions | Moderate | 1.3.1 | | |
| Missing heading hierarchy | Moderate | 1.3.1 | | |
| Missing lang attribute | Serious | 3.1.1 | | |
| No focus indicators | Serious | 2.4.7 | | |
| Missing ARIA labels on icons | Moderate | 1.1.1 | | |

### Form Accessibility Issues

```html
<!-- Common issues found in forms -->

<!-- Missing explicit label association -->
<label>Email</label>                     <!-- ✗ No 'for' attribute -->
<input type="email" name="email">

<!-- Fixed -->
<label for="contact-email">Email</label> <!-- ✓ Explicit association -->
<input type="email" id="contact-email" name="email">

<!-- Missing error announcement -->
<span class="error">Invalid email</span> <!-- ✗ Not announced to screen readers -->

<!-- Fixed -->
<span class="error" role="alert" aria-live="assertive">Invalid email</span>
```

---

## HTML Validation Results

Run W3C validation on all pages:

```bash
# Using html-validate or vnu-jar
npx html-validate src/pages/**/*.html
```

| Validation Error | Count | Files | Severity |
|---|---|---|---|
| Duplicate IDs | | | Error |
| Unclosed elements | | | Error |
| Deprecated attributes | | | Warning |
| Missing required attributes | | | Error |
| Invalid nesting | | | Error |
| Obsolete elements (`<center>`, `<font>`) | | | Warning |

---

## Structural Data Audit

### Missing Structured Data

| Page Type | Expected Schema | Currently Present? | Priority |
|---|---|---|---|
| Home | Organization | | High |
| Blog posts | BlogPosting | | High |
| Product pages | Product | | High |
| Contact | ContactPoint | | Medium |
| Breadcrumbs | BreadcrumbList | | Medium |
| FAQ | FAQPage | | Low |

---

## Performance Baseline

Capture current metrics before refactoring:

| Metric | Value | Target |
|---|---|---|
| Largest Contentful Paint (LCP) | | < 2.5s |
| Cumulative Layout Shift (CLS) | | < 0.1 |
| Total HTML size (gzipped) | | |
| DOM node count (average) | | < 1500 |
| DOM depth (maximum) | | < 32 |
| Number of HTML files | | |

---

## Technical Debt Inventory

| Debt Item | Category | Effort | Impact | Priority |
|---|---|---|---|---|
| Div soup replacing semantic elements | Semantics | Medium | High | P1 |
| Missing ARIA attributes | Accessibility | Medium | High | P1 |
| Missing structured data | SEO | Low | Medium | P2 |
| Inconsistent heading hierarchy | Structure | Low | Medium | P2 |
| Inline styles in markup | Maintainability | Medium | Low | P3 |
| Deprecated HTML elements | Standards | Low | Low | P3 |

---

## Assessment Checklist

- [ ] Semantic element usage audited across all files
- [ ] Accessibility audit completed (axe-core + Lighthouse)
- [ ] WCAG 2.1 AA issues catalogued with severity
- [ ] Form accessibility reviewed
- [ ] HTML validation run on all pages
- [ ] Structured data gaps identified
- [ ] Performance baseline captured
- [ ] Technical debt inventory created and prioritised
- [ ] Assessment shared with team for review
