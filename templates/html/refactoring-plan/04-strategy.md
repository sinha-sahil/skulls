# Phase 4 · Strategy

## Objective

Define the refactoring strategy for **{{PROJECT_NAME}}** — the order of operations, the techniques to apply, and the principles guiding each transformation.

---

## Refactoring Principles

1. **One concern at a time** — Each refactoring pass addresses exactly one type of change (semantics, accessibility, forms, etc.)
2. **Preserve behaviour** — Visual output and functionality must remain identical after each pass
3. **Test after every change** — Run validation and visual regression after each file
4. **Smallest diff possible** — Minimise changes per commit for easy review and rollback
5. **Outside-in** — Start with document-level structure, then refine inner elements

---

## Strategy Overview

### Pass 1: Document-Level Semantics

Replace top-level `<div>` wrappers with semantic landmark elements across all pages.

```html
<!-- Transformation pattern -->

<!-- Step 1: Replace header wrapper -->
<div class="header">...</div>
    ↓
<header class="header">...</header>

<!-- Step 2: Replace navigation -->
<div class="nav">
  <div class="nav-list">...</div>
</div>
    ↓
<nav aria-label="Main navigation">
  <ul>...</ul>
</nav>

<!-- Step 3: Replace main content area -->
<div class="content" id="main">...</div>
    ↓
<main id="main-content" tabindex="-1">...</main>

<!-- Step 4: Replace footer wrapper -->
<div class="footer">...</div>
    ↓
<footer role="contentinfo">...</footer>
```

**Apply to:** All pages, starting with the layout template (changes propagate).

### Pass 2: Content-Level Semantics

Replace inner `<div>` elements with appropriate semantic elements.

```html
<!-- Article wrappers -->
<div class="blog-post">
  <div class="post-title">...</div>
  <div class="post-body">...</div>
</div>
    ↓
<article>
  <h2>...</h2>
  <div class="post-body">...</div>  <!-- div is fine here — no semantic equivalent -->
</article>

<!-- Section wrappers (only when labelled) -->
<div class="features-section">
  <div class="section-title">Features</div>
  ...
</div>
    ↓
<section aria-labelledby="features-heading">
  <h2 id="features-heading">Features</h2>
  ...
</section>

<!-- Sidebar content -->
<div class="sidebar">...</div>
    ↓
<aside aria-label="Related content">...</aside>

<!-- Time elements -->
<span class="date">January 15, 2024</span>
    ↓
<time datetime="2024-01-15">January 15, 2024</time>

<!-- Address elements -->
<div class="contact-info">
  <span>123 Main St</span>
  <span>email@example.com</span>
</div>
    ↓
<address>
  123 Main St<br>
  <a href="mailto:email@example.com">email@example.com</a>
</address>
```

### Pass 3: Heading Hierarchy

Fix heading levels to maintain a logical, unbroken hierarchy.

```html
<!-- Before: skipped heading levels -->
<h1>{{SITE_NAME}}</h1>
<h3>Featured Products</h3>  <!-- Skipped h2 -->
<h5>Product Name</h5>       <!-- Skipped h4 -->

<!-- After: correct hierarchy -->
<h1>{{SITE_NAME}}</h1>
<h2>Featured Products</h2>
<h3>Product Name</h3>
```

**Rules:**
- Exactly one `<h1>` per page
- No skipped levels (h1 → h2 → h3, never h1 → h3)
- Headings reflect document outline, not visual size

### Pass 4: Accessibility Attributes

Add ARIA attributes, skip links, and focus management patterns.

```html
<!-- Skip link (add to every page via layout) -->
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  ...
  <main id="main-content" tabindex="-1">
    ...
  </main>
</body>

<!-- Images: add meaningful alt text -->
<img src="hero.jpg">                     <!-- ✗ Missing alt -->
<img src="hero.jpg" alt="">              <!-- ✓ Decorative -->
<img src="hero.jpg" alt="Team meeting">  <!-- ✓ Informative -->

<!-- Interactive elements: add aria-expanded, aria-controls -->
<button
  aria-expanded="false"
  aria-controls="dropdown-menu"
>
  Menu
</button>
<ul id="dropdown-menu" hidden>...</ul>

<!-- Live regions for dynamic content -->
<div aria-live="polite" aria-atomic="true">
  <!-- Updated content announced to screen readers -->
</div>
```

### Pass 5: Form Modernisation

Upgrade form markup with proper labels, validation, and autocomplete.

```html
<!-- Full modern form field pattern -->
<div class="form-field">
  <label for="{{field_id}}">
    {{field_label}}
    {% if required %}
      <span aria-hidden="true">*</span>
      <span class="sr-only">(required)</span>
    {% endif %}
  </label>
  <input
    type="{{field_type}}"
    id="{{field_id}}"
    name="{{field_name}}"
    {% if required %}required{% endif %}
    autocomplete="{{autocomplete_value}}"
    aria-describedby="{{field_id}}-help {{field_id}}-error"
    aria-invalid="false"
  >
  <span id="{{field_id}}-help" class="form-help">{{help_text}}</span>
  <span id="{{field_id}}-error" class="form-error" role="alert" hidden>
    {{error_message}}
  </span>
</div>
```

### Pass 6: Structured Data

Add Schema.org markup to key page types.

```html
<!-- Organization (home page) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "{{SITE_NAME}}",
  "url": "{{BASE_URL}}",
  "logo": "{{BASE_URL}}/assets/images/logo.png"
}
</script>

<!-- BreadcrumbList (all interior pages) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "{{BASE_URL}}/" },
    { "@type": "ListItem", "position": 2, "name": "{{page.title}}", "item": "{{BASE_URL}}/{{page.slug}}/" }
  ]
}
</script>
```

---

## Execution Order

| Order | Pass | Scope | Risk | Dependencies |
|---|---|---|---|---|
| 1 | Document-level semantics | Layout + all pages | Medium | CSS selector audit |
| 2 | Content-level semantics | All pages | Medium | Pass 1 complete |
| 3 | Heading hierarchy | All pages | Low | None |
| 4 | Accessibility attributes | All pages | Low | Passes 1-2 complete |
| 5 | Form modernisation | Form pages | Medium | Pass 4 complete |
| 6 | Structured data | Key page types | Low | Passes 1-2 complete |

---

## Branching Strategy

```
main
 └── refactor/html-semantics          (Pass 1-2)
      └── PR → main
 └── refactor/html-accessibility      (Pass 3-4)
      └── PR → main
 └── refactor/html-forms              (Pass 5)
      └── PR → main
 └── refactor/html-structured-data    (Pass 6)
      └── PR → main
```

Each branch contains one logical group of changes. PRs are reviewed and merged sequentially.

---

## Strategy Checklist

- [ ] Refactoring principles agreed with team
- [ ] All six passes defined with transformation patterns
- [ ] Execution order determined based on dependencies
- [ ] CSS selector audit completed before Pass 1
- [ ] JavaScript query audit completed before Pass 1
- [ ] Branching strategy agreed upon
- [ ] Each pass scoped to a single concern
- [ ] Before/after examples documented for each pass
- [ ] Strategy reviewed with team
