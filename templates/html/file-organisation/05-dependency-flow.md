# Phase 5 · Dependency Flow

## Objective

Map and control the dependency relationships between HTML files, templates, assets, and external resources in **{{PROJECT_NAME}}** to maintain a clean, predictable build pipeline.

---

## Template Dependency Graph

### Layout Inheritance Chain

```
base.html
├── blog-post.html          (extends base)
│   └── pages/blog/[slug].html   (extends blog-post)
├── product-detail.html     (extends base)
│   └── pages/products/[slug].html (extends product-detail)
└── (direct page extensions)
    ├── pages/index.html         (extends base)
    ├── pages/about/index.html   (extends base)
    └── pages/contact/index.html (extends base)
```

**Rules:**
- Maximum inheritance depth: 3 (base → specialised layout → page)
- Every page must trace back to `base.html`
- No circular inheritance — layouts never extend pages

### Include Dependency Map

Document which templates include which partials and components:

```
base.html
├── includes: partials/navigation/main-nav.html
├── includes: partials/navigation/footer-nav.html
└── defines blocks: head, content, scripts

pages/index.html
├── extends: layouts/base.html
├── includes: partials/head/meta-tags.html
├── includes: partials/head/open-graph.html
├── includes: partials/sections/hero.html
├── includes: components/card.html (×N)
└── includes: partials/sections/cta.html

pages/contact/index.html
├── extends: layouts/base.html
├── includes: partials/head/meta-tags.html
├── includes: partials/forms/contact-form.html
└── includes: components/modal.html
```

---

## Asset Loading Order

### CSS Dependencies

```html
<!-- src/layouts/base.html — <head> section -->
<head>
  <!-- Critical CSS inlined for above-the-fold content -->
  <style>
    /* Inlined critical styles */
  </style>

  <!-- Main stylesheet — render-blocking by design -->
  <link rel="stylesheet" href="{{BASE_URL}}/assets/css/main.css">

  <!-- Page-specific CSS — loaded by pages via block -->
  {% block styles %}{% endblock %}
</head>
```

**Loading order:**
1. Inlined critical CSS (in `<head>`)
2. Main stylesheet (`main.css`)
3. Page-specific stylesheets (via `{% block styles %}`)
4. Component-specific styles (if code-split)

### JavaScript Dependencies

```html
<!-- src/layouts/base.html — end of <body> -->

  <!-- Polyfills — load first if needed -->
  <script src="{{BASE_URL}}/assets/js/polyfills.js" nomodule></script>

  <!-- Main bundle — deferred -->
  <script src="{{BASE_URL}}/assets/js/main.js" type="module"></script>

  <!-- Page-specific scripts — loaded by pages via block -->
  {% block scripts %}{% endblock %}
</body>
```

**Loading strategy:**

| Script Type | Attribute | Reason |
|---|---|---|
| Polyfills | `nomodule` | Only loaded by legacy browsers |
| Main bundle | `type="module"` | Deferred by default, modern browsers only |
| Analytics | `async` | Non-blocking, order-independent |
| Page-specific | `defer` | Executes after DOM parse, in order |
| Inline critical | None (inline) | Immediate execution for critical UI |

```html
<!-- Example: page-specific script loading -->
{% block scripts %}
  <script src="{{BASE_URL}}/assets/js/contact-form.js" defer></script>
{% endblock %}
```

---

## External Resource Dependencies

### Resource Hints

```html
<!-- src/partials/head/meta-tags.html -->
<!-- DNS prefetch for third-party origins -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- Preconnect for critical third-party origins -->
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Preload critical assets -->
<link rel="preload" href="{{BASE_URL}}/assets/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{{BASE_URL}}/assets/css/main.css" as="style">
```

### External Dependency Registry

| Resource | Origin | Used By | Loading Strategy |
|---|---|---|---|
| Google Fonts | fonts.googleapis.com | All pages (layout) | preconnect + stylesheet |
| Analytics | www.googletagmanager.com | All pages (layout) | async script |
| Maps embed | maps.googleapis.com | Contact page only | lazy iframe |
| CDN assets | cdn.example.com | All pages | preconnect |

---

## Build Pipeline Dependencies

### Build Order

```
1. Clean dist/
2. Process templates
   a. Resolve layout inheritance (base → specialised → page)
   b. Resolve includes (partials, components)
   c. Inject data/variables
3. Process assets
   a. Compile CSS (Sass/PostCSS)
   b. Bundle JavaScript
   c. Optimise images
4. Copy static files (public/ → dist/)
5. Generate sitemap
6. Run HTMLHint validation
```

### Template Resolution Order

```html
<!--
  Build tool resolves in this order:
  1. Page template (pages/about/index.html)
  2. Layout extension (layouts/base.html)
  3. Partial includes (resolved recursively)
  4. Component includes (resolved recursively)
  5. Variable interpolation ({{SITE_NAME}}, etc.)
-->
```

---

## Dependency Constraints

| Constraint | Rule |
|---|---|
| No circular includes | Partial A cannot include Partial B if B includes A |
| Max include depth | 3 levels (page → partial → sub-partial) |
| No upward dependencies | Partials/components never import pages or layouts |
| Asset isolation | CSS/JS never reference template file paths |
| Layout single root | Each page extends exactly one layout chain |

### Forbidden Dependency Patterns

```
✗ Partial → Page          (partial must not depend on page)
✗ Component → Layout      (component must not depend on layout)
✗ Partial A → Partial B → Partial A  (circular dependency)
✗ Layout → Page-specific partial     (layout must be generic)
```

---

## Dependency Audit Template

Run periodically to check for violations:

| Check | Status | Notes |
|---|---|---|
| All pages extend a layout | | |
| No circular includes detected | | |
| Include depth ≤ 3 everywhere | | |
| All external resources have resource hints | | |
| No unused partials/components | | |
| Script loading strategy consistent | | |
| CSS loading order correct | | |

---

## Dependency Flow Checklist

- [ ] Template inheritance chain documented
- [ ] Include dependency map created for all pages
- [ ] CSS loading order defined and implemented
- [ ] JavaScript loading strategy documented
- [ ] External resource hints configured
- [ ] External dependency registry maintained
- [ ] Build pipeline order documented
- [ ] Dependency constraints established
- [ ] Forbidden patterns communicated to team
- [ ] Dependency audit run and clean
