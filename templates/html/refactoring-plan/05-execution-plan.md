# Phase 5 · Execution Plan

## Objective

Break the refactoring strategy for **{{PROJECT_NAME}}** into concrete, time-boxed tasks with owners, dependencies, and verification criteria for each step.

---

## Task Breakdown

### Sprint 1: Document-Level Semantics (Passes 1-2)

#### Task 1.1: Refactor Layout Template

**Scope:** `src/layouts/base.html`
**Estimated effort:** 1-2 hours

```html
<!-- File: src/layouts/base.html -->
<!-- Changes to make: -->

<!-- 1. Add skip link immediately after <body> -->
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- 2. Replace header div with <header> -->
  <header>
    {% include "partials/navigation/main-nav.html" %}
  </header>

  <!-- 3. Replace content div with <main> -->
  <main id="main-content" tabindex="-1">
    {% block content %}{% endblock %}
  </main>

  <!-- 4. Replace footer div with <footer> -->
  <footer role="contentinfo">
    {% include "partials/navigation/footer-nav.html" %}
  </footer>
</body>
```

**Verification:**
- [ ] `htmlhint src/layouts/base.html` — zero errors
- [ ] `pnpm build` — succeeds
- [ ] Visual regression — header, main, footer render identically
- [ ] CSS audit — no broken selectors

#### Task 1.2: Refactor Navigation Partials

**Scope:** `src/partials/navigation/*.html`
**Estimated effort:** 1-2 hours

```html
<!-- File: src/partials/navigation/main-nav.html -->
<!-- Before -->
<div class="nav">
  <div class="nav-list">
    <div class="nav-item"><a href="/">Home</a></div>
    <div class="nav-item"><a href="/about/">About</a></div>
  </div>
</div>

<!-- After -->
<nav aria-label="Main navigation">
  <ul class="nav-list" role="list">
    <li><a href="/" {% if current_page == 'home' %}aria-current="page"{% endif %}>Home</a></li>
    <li><a href="/about/" {% if current_page == 'about' %}aria-current="page"{% endif %}>About</a></li>
  </ul>
</nav>
```

**Verification:**
- [ ] `htmlhint src/partials/navigation/` — zero errors
- [ ] Navigation still functions correctly
- [ ] Screen reader announces "Main navigation, navigation landmark"

#### Task 1.3: Refactor Content Sections (Per Page)

**Scope:** Each page in `src/pages/`
**Estimated effort:** 30 min per page

| Page | Key Changes | Owner | Status |
|---|---|---|---|
| `pages/index.html` | Hero `<section>`, features `<section>`, CTA `<section>` | | |
| `pages/about/index.html` | Team `<section>`, history `<section>` | | |
| `pages/blog/index.html` | Post list as `<article>` elements | | |
| `pages/blog/[slug].html` | Single `<article>` with proper semantics | | |
| `pages/products/index.html` | Product cards as `<article>` elements | | |
| `pages/products/[slug].html` | Product `<article>` with details | | |
| `pages/contact/index.html` | Form section | | |

---

### Sprint 2: Headings & Accessibility (Passes 3-4)

#### Task 2.1: Fix Heading Hierarchy

**Scope:** All pages
**Estimated effort:** 2-3 hours total

```html
<!-- Audit each page for heading structure -->
<!-- Use this outline validation pattern: -->

<!-- Page: About -->
<!-- h1: About {{SITE_NAME}}          ✓ Single h1 -->
<!--   h2: Our Team                   ✓ Sequential -->
<!--     h3: Team Member Name         ✓ Sequential -->
<!--   h2: Our History                ✓ Sequential -->
<!--     h3: 2020 - Founded           ✓ Sequential -->
```

| Page | Current Issues | Fix Required |
|---|---|---|
| `pages/index.html` | | |
| `pages/about/index.html` | | |
| `pages/blog/index.html` | | |
| `pages/blog/[slug].html` | | |
| `pages/products/index.html` | | |
| `pages/contact/index.html` | | |

#### Task 2.2: Add ARIA Attributes

**Scope:** All interactive elements across all pages
**Estimated effort:** 3-4 hours total

```html
<!-- Pattern: labelling sections -->
<section aria-labelledby="features-heading">
  <h2 id="features-heading">Features</h2>
</section>

<!-- Pattern: labelling navigation regions -->
<nav aria-label="Breadcrumb">...</nav>
<nav aria-label="Pagination">...</nav>

<!-- Pattern: images -->
<img src="photo.jpg" alt="Team members collaborating at a whiteboard" width="800" height="600" loading="lazy">
<img src="decoration.svg" alt="" aria-hidden="true">  <!-- Decorative -->

<!-- Pattern: icon buttons -->
<button aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>
```

#### Task 2.3: Add Skip Link and Focus Management

**Scope:** Layout template
**Estimated effort:** 30 min

```html
<!-- Already in layout from Task 1.1, verify it works: -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- CSS for skip link (add to stylesheet) -->
<!--
.skip-link {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.skip-link:focus {
  position: fixed;
  top: 0;
  left: 0;
  width: auto;
  height: auto;
  padding: 1rem;
  background: #000;
  color: #fff;
  z-index: 9999;
}
-->
```

---

### Sprint 3: Forms & Structured Data (Passes 5-6)

#### Task 3.1: Modernise All Forms

**Scope:** All form partials in `src/partials/forms/`
**Estimated effort:** 2-3 hours per form

| Form | Location | Fields | Status |
|---|---|---|---|
| Contact form | `partials/forms/contact-form.html` | name, email, message | |
| Search form | `partials/forms/search-form.html` | query | |
| Newsletter | `partials/forms/newsletter-signup.html` | email | |

#### Task 3.2: Add Structured Data

**Scope:** Key page templates
**Estimated effort:** 1-2 hours total

| Page Type | Schema Type | Template Location | Status |
|---|---|---|---|
| Home | Organization | `pages/index.html` | |
| Blog posts | BlogPosting | `pages/blog/[slug].html` | |
| Products | Product | `pages/products/[slug].html` | |
| All pages | BreadcrumbList | `partials/head/structured-data.html` | |

---

## Timeline

| Week | Sprint | Tasks | Deliverable |
|---|---|---|---|
| Week 1 | Sprint 1 | Tasks 1.1-1.3 | Semantic landmark structure |
| Week 2 | Sprint 2 | Tasks 2.1-2.3 | Headings + accessibility |
| Week 3 | Sprint 3 | Tasks 3.1-3.2 | Forms + structured data |
| Week 4 | Stabilisation | Bug fixes, testing, sign-off | Refactoring complete |

---

## Per-Task Verification Protocol

After completing each task:

```bash
# 1. HTML validation
htmlhint src/

# 2. Accessibility audit
npx @axe-core/cli {{BASE_URL}}

# 3. Build check
pnpm build

# 4. Visual regression (if tooling available)
# npx backstopjs test

# 5. Commit with descriptive message
git add -A
git commit -m "refactor(html): [task description]"
```

---

## Execution Plan Checklist

- [ ] All tasks broken down with clear scope
- [ ] Time estimates assigned to each task
- [ ] Task owners assigned
- [ ] Dependencies between tasks identified
- [ ] Sprint groupings logical and achievable
- [ ] Verification protocol defined per task
- [ ] Timeline agreed with team
- [ ] Sprint 1 tasks ready to begin
