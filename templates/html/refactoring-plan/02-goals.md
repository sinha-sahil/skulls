# Phase 2 · Goals

## Objective

Define clear, measurable refactoring goals for **{{PROJECT_NAME}}** based on the assessment findings, prioritised by impact and effort.

---

## Primary Goals

### Goal 1: Replace Div Soup with Semantic HTML5

**Metric:** Percentage of landmark regions using semantic elements.
**Target:** 100% of page-level landmarks use `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`.

```html
<!-- Before refactoring -->
<div class="wrapper">
  <div class="header">
    <div class="logo">{{SITE_NAME}}</div>
    <div class="navigation">
      <div class="nav-list">
        <div class="nav-item"><a href="/">Home</a></div>
      </div>
    </div>
  </div>
  <div class="content">
    <div class="article">
      <div class="title">Page Title</div>
      <div class="body">Content here</div>
    </div>
  </div>
  <div class="footer">
    <div class="copyright">&copy; {{SITE_NAME}}</div>
  </div>
</div>

<!-- After refactoring -->
<header>
  <a href="/" aria-label="{{SITE_NAME}} home">{{SITE_NAME}}</a>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>
<main id="main-content">
  <article>
    <h1>Page Title</h1>
    <p>Content here</p>
  </article>
</main>
<footer role="contentinfo">
  <p>&copy; {{SITE_NAME}}</p>
</footer>
```

### Goal 2: Achieve WCAG 2.1 AA Compliance

**Metric:** Zero critical/serious axe-core violations.
**Target:** All pages pass axe-core with zero critical and zero serious issues.

| Sub-Goal | Measurable Target |
|---|---|
| All images have alt text | 0 images with missing/empty alt |
| All forms have labels | 0 inputs without associated labels |
| Correct heading hierarchy | 0 skipped heading levels per page |
| Skip link present | Skip link on every page |
| Landmark regions complete | `<header>`, `<main>`, `<footer>` on every page |
| Focus management | Visible focus indicator on all interactive elements |
| Colour contrast | All text passes 4.5:1 (body) or 3:1 (large text) |

### Goal 3: Valid HTML5 Across All Pages

**Metric:** Zero W3C validation errors.
**Target:** All HTML files pass validation with zero errors.

```bash
# Validation command
npx html-validate "src/**/*.html" --config .htmlvalidate.json
```

### Goal 4: Add Structured Data to Key Pages

**Metric:** Structured data present and valid on all specified page types.
**Target:** Schema.org markup on home, blog posts, product pages, and breadcrumbs.

```html
<!-- Target: BlogPosting structured data -->
<article itemscope itemtype="https://schema.org/BlogPosting">
  <header>
    <h1 itemprop="headline">{{post.title}}</h1>
    <time itemprop="datePublished" datetime="{{post.date_iso}}">{{post.date_display}}</time>
    <span itemprop="author" itemscope itemtype="https://schema.org/Person">
      <span itemprop="name">{{post.author}}</span>
    </span>
  </header>
  <div itemprop="articleBody">
    {{post.content}}
  </div>
</article>
```

---

## Secondary Goals

### Goal 5: Reduce DOM Complexity

**Metric:** Average DOM node count per page.
**Target:** Reduce average DOM node count by 20% from baseline.

| Page | Current Nodes | Target Nodes |
|---|---|---|
| Home | | |
| Blog listing | | |
| Product detail | | |

### Goal 6: Modernise Form Markup

**Metric:** All forms use modern HTML5 input types, validation attributes, and accessible patterns.

```html
<!-- Before: basic input with no validation or accessibility -->
<div class="form-group">
  <span>Email</span>
  <input type="text" name="email">
  <span class="error" style="display:none">Invalid</span>
</div>

<!-- After: modern, accessible form field -->
<div class="form-group">
  <label for="contact-email">
    Email <span aria-hidden="true">*</span>
    <span class="sr-only">(required)</span>
  </label>
  <input
    type="email"
    id="contact-email"
    name="email"
    required
    autocomplete="email"
    aria-describedby="contact-email-error"
    aria-invalid="false"
  >
  <span id="contact-email-error" class="error" role="alert" hidden>
    Please enter a valid email address.
  </span>
</div>
```

### Goal 7: Remove Deprecated Patterns

**Metric:** Zero deprecated elements or attributes in codebase.

| Deprecated Pattern | Replacement |
|---|---|
| `<center>` | CSS `text-align: center` |
| `<font>` | CSS font properties |
| `<b>` (presentational) | `<strong>` or CSS `font-weight` |
| `<i>` (presentational) | `<em>` or CSS `font-style` |
| `align` attribute | CSS alignment |
| `bgcolor` attribute | CSS `background-color` |
| `border` on `<table>` | CSS `border` |
| `cellpadding`/`cellspacing` | CSS `padding`/`border-spacing` |
| `<marquee>` | CSS animation |
| `<frame>`/`<frameset>` | Remove entirely |

---

## Goal Prioritisation Matrix

| Goal | Impact | Effort | Risk | Priority |
|---|---|---|---|---|
| 1. Semantic HTML5 | High | Medium | Low | P1 |
| 2. WCAG 2.1 AA | High | High | Low | P1 |
| 3. Valid HTML5 | Medium | Low | Low | P1 |
| 4. Structured data | Medium | Low | Low | P2 |
| 5. DOM complexity | Low | Medium | Low | P3 |
| 6. Modern forms | High | Medium | Medium | P2 |
| 7. Remove deprecated | Low | Low | Low | P3 |

---

## Success Criteria

| Criterion | Measurement | Threshold |
|---|---|---|
| axe-core violations | Automated scan | 0 critical, 0 serious |
| HTML validation | W3C validator | 0 errors |
| Semantic landmarks | Manual audit | 100% pages |
| Structured data | Google Rich Results Test | Valid on all targeted pages |
| DOM node reduction | DevTools audit | ≥ 20% reduction |
| Lighthouse accessibility | Lighthouse CI | ≥ 95 score |

---

## Goals Checklist

- [ ] Primary goals defined with measurable metrics
- [ ] Secondary goals defined with measurable metrics
- [ ] Before/after code examples documented for each goal
- [ ] Goal prioritisation agreed with team
- [ ] Success criteria established and measurable
- [ ] Timeline estimated for each goal
- [ ] Goals aligned with project roadmap
- [ ] Stakeholders informed of refactoring scope
