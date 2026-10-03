# Phase 4 · Naming Conventions

## Objective

Establish consistent naming conventions for all HTML files, directories, IDs, classes, and data attributes in **{{PROJECT_NAME}}** so the codebase remains navigable and predictable.

---

## File Naming Rules

### Pages

| Rule | Convention | Example |
|---|---|---|
| Case | kebab-case | `about-us.html` |
| Index files | Always `index.html` for directory roots | `products/index.html` |
| Detail pages | Descriptive noun, singular | `product-detail.html` |
| Listing pages | Descriptive noun, plural or `index.html` | `products/index.html` |
| Dynamic templates | Bracket notation for slugs | `[slug].html`, `[id].html` |
| Error pages | HTTP status code prefix | `404.html`, `500.html` |

```
src/pages/
├── index.html              ✓  Root index
├── about/
│   └── index.html          ✓  Section index
├── products/
│   ├── index.html          ✓  Listing page
│   └── [slug].html         ✓  Dynamic detail template
├── blog/
│   ├── index.html          ✓  Blog listing
│   └── [slug].html         ✓  Blog post template
├── 404.html                ✓  Error page
└── 500.html                ✓  Error page
```

### Layouts

| Rule | Convention | Example |
|---|---|---|
| Case | kebab-case | `blog-post.html` |
| Prefix | None — directory name provides context | `layouts/base.html` |
| Base layout | Always named `base.html` | `layouts/base.html` |
| Specialised | Describes the content type | `layouts/product-detail.html` |

### Partials

| Rule | Convention | Example |
|---|---|---|
| Case | kebab-case | `main-nav.html` |
| Grouping | Subdirectory by function | `partials/navigation/main-nav.html` |
| Prefix | None — directory provides context | `partials/forms/search-form.html` |
| Fragments | Descriptive of content | `partials/head/open-graph.html` |

### Components

| Rule | Convention | Example |
|---|---|---|
| Case | kebab-case | `accordion.html` |
| Naming | Noun describing the UI element | `card.html`, `modal.html` |
| Variants | Suffix with variant name | `card-horizontal.html` |
| No prefix | Directory provides context | `components/card.html` |

---

## HTML Attribute Naming

### IDs

```html
<!-- Use kebab-case for IDs -->
<main id="main-content">
<section id="featured-products">
<form id="contact-form">

<!-- Contextual IDs for repeated elements -->
<article id="post-{{post.slug}}">
<div id="accordion-panel-{{item.id}}">
```

**Rules:**
- kebab-case always
- Descriptive, not abbreviated (`main-content`, not `mc`)
- Unique per page — no duplicate IDs
- Prefixed by context when dynamically generated

### Classes

Follow BEM (Block Element Modifier) or a consistent methodology:

```html
<!-- BEM convention -->
<article class="card">
  <img class="card__image" src="..." alt="...">
  <div class="card__body">
    <h3 class="card__title">...</h3>
    <p class="card__description">...</p>
  </div>
</article>

<!-- Modifier -->
<article class="card card--featured">
  ...
</article>

<!-- Utility classes — separate concern -->
<div class="card sr-only">...</div>
```

| Convention | Pattern | Example |
|---|---|---|
| Block | `.block-name` | `.card`, `.main-nav` |
| Element | `.block-name__element` | `.card__title`, `.card__image` |
| Modifier | `.block-name--modifier` | `.card--featured`, `.card--compact` |
| Utility | `.utility-name` | `.sr-only`, `.visually-hidden` |
| State | `.is-state` or `.has-state` | `.is-active`, `.has-error` |
| JavaScript hook | `[data-*]` attribute, not class | `data-accordion`, `data-modal` |

### Data Attributes

```html
<!-- Behavioural hooks — use data attributes, not classes -->
<button data-modal-trigger="contact">Open contact form</button>
<div data-modal="contact" hidden>...</div>

<!-- Configuration -->
<div data-accordion data-accordion-allow-multiple="true">...</div>

<!-- State tracking -->
<form data-form-state="idle">...</form>
```

**Rules:**
- kebab-case after `data-`
- Use for JavaScript hooks instead of classes
- Use for configuration values
- Prefix with component name: `data-accordion-*`, `data-modal-*`

---

## ARIA Attribute Conventions

```html
<!-- Labels reference IDs — follow ID naming convention -->
<button aria-controls="accordion-panel-1" aria-expanded="false">
  Section 1
</button>
<div id="accordion-panel-1" role="region" aria-labelledby="accordion-header-1">
  ...
</div>

<!-- Descriptive aria-label when no visible label exists -->
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Breadcrumb">...</nav>
<nav aria-label="Footer navigation">...</nav>

<!-- aria-labelledby references an existing element -->
<section aria-labelledby="section-title-features">
  <h2 id="section-title-features">Features</h2>
  ...
</section>
```

---

## Structured Data Naming

```html
<!-- Schema.org types and properties — camelCase per spec -->
<article itemscope itemtype="https://schema.org/BlogPosting">
  <h1 itemprop="headline">{{post.title}}</h1>
  <time itemprop="datePublished" datetime="2024-01-15">January 15, 2024</time>
  <div itemprop="articleBody">...</div>
</article>
```

---

## Anti-Patterns

| Anti-Pattern | Problem | Correct |
|---|---|---|
| `page1.html`, `page2.html` | Non-descriptive | `about.html`, `contact.html` |
| `Header.html` | PascalCase for HTML files | `header.html` |
| `main_nav.html` | snake_case | `main-nav.html` |
| `id="btn1"` | Abbreviated, non-descriptive | `id="submit-contact"` |
| `class="js-toggle"` | JS hook as class | `data-toggle` attribute |
| `id="Header"` | PascalCase ID | `id="site-header"` |
| `class="Card"` | PascalCase class | `class="card"` |

---

## Naming Conventions Checklist

- [ ] File naming rules documented (pages, layouts, partials, components)
- [ ] kebab-case enforced for all filenames
- [ ] ID naming convention established (kebab-case, descriptive)
- [ ] Class naming methodology chosen (BEM or alternative)
- [ ] Data attribute conventions defined
- [ ] ARIA attribute naming follows ID conventions
- [ ] Structured data follows Schema.org camelCase spec
- [ ] Anti-patterns documented and communicated
- [ ] Naming rules added to linter configuration
- [ ] Team reviewed and agreed on all conventions
