# Phase 2 · Directory Structure

## Objective

Design the target directory structure for **{{PROJECT_NAME}}**, establishing clear conventions for where each type of HTML file, template, partial, and asset lives.

---

## Proposed Directory Layout

### Root Structure

```
{{PROJECT_NAME}}/
├── src/
│   ├── pages/                  # Full HTML pages
│   │   ├── index.html
│   │   ├── about/
│   │   │   └── index.html
│   │   ├── products/
│   │   │   ├── index.html
│   │   │   └── [slug].html     # Dynamic template
│   │   ├── blog/
│   │   │   ├── index.html
│   │   │   └── [slug].html
│   │   └── contact/
│   │       └── index.html
│   ├── layouts/                # Base layout templates
│   │   ├── base.html
│   │   ├── blog-post.html
│   │   └── product-detail.html
│   ├── partials/               # Reusable HTML fragments
│   │   ├── head/
│   │   │   ├── meta-tags.html
│   │   │   ├── open-graph.html
│   │   │   └── structured-data.html
│   │   ├── navigation/
│   │   │   ├── main-nav.html
│   │   │   ├── breadcrumb.html
│   │   │   └── footer-nav.html
│   │   ├── sections/
│   │   │   ├── hero.html
│   │   │   ├── cta.html
│   │   │   └── testimonials.html
│   │   └── forms/
│   │       ├── contact-form.html
│   │       ├── search-form.html
│   │       └── newsletter-signup.html
│   ├── components/             # Self-contained UI components
│   │   ├── card.html
│   │   ├── modal.html
│   │   ├── accordion.html
│   │   └── tabs.html
│   └── data/                   # Structured data / JSON-LD templates
│       ├── organization.json
│       └── breadcrumb.json
├── public/                     # Static assets (copied as-is)
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
├── assets/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── fonts/
├── dist/                       # Build output
└── tests/
    ├── accessibility/
    └── validation/
```

---

## Directory Purpose Definitions

### `src/pages/`

Contains complete HTML pages that map to routes. Each page assembles layouts, partials, and components into a full document.

```html
<!-- src/pages/about/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  {% include "partials/head/meta-tags.html" %}
  <title>About — {{SITE_NAME}}</title>
</head>
<body>
  {% include "partials/navigation/main-nav.html" %}

  <main id="main-content">
    <h1>About {{SITE_NAME}}</h1>
    <!-- Page-specific content -->
  </main>

  {% include "partials/navigation/footer-nav.html" %}
</body>
</html>
```

### `src/layouts/`

Layout templates define the outer document shell. Pages extend a layout and inject content into defined blocks.

```html
<!-- src/layouts/base.html -->
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  {% block head %}{% endblock %}
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  {% include "partials/navigation/main-nav.html" %}

  <main id="main-content" tabindex="-1">
    {% block content %}{% endblock %}
  </main>

  <footer role="contentinfo">
    {% include "partials/navigation/footer-nav.html" %}
  </footer>

  {% block scripts %}{% endblock %}
</body>
</html>
```

### `src/partials/`

Reusable HTML fragments grouped by function. Partials should never be valid standalone documents — they are always included by pages or layouts.

### `src/components/`

Self-contained UI components that include their own markup structure. Components may accept parameters when the templating system supports them.

```html
<!-- src/components/card.html -->
<article class="card" aria-labelledby="card-title-{{ id }}">
  <img src="{{ image }}" alt="{{ image_alt }}" loading="lazy" width="400" height="300">
  <div class="card__body">
    <h3 id="card-title-{{ id }}">{{ title }}</h3>
    <p>{{ description }}</p>
    <a href="{{ url }}" class="card__link">
      Read more<span class="sr-only"> about {{ title }}</span>
    </a>
  </div>
</article>
```

---

## Nesting Rules

| Rule | Convention |
|---|---|
| Maximum nesting depth | 3 levels within `src/pages/` |
| Section grouping | Group by feature/section, not by file type |
| Index files | Every directory gets an `index.html` |
| Flat partials | Partials nested max 1 level by category |
| Asset co-location | Assets in `assets/`, never in `src/` |

---

## File-to-Route Mapping

| File Path | Route | Notes |
|---|---|---|
| `src/pages/index.html` | `/` | Home page |
| `src/pages/about/index.html` | `/about/` | About page |
| `src/pages/products/index.html` | `/products/` | Product listing |
| `src/pages/products/[slug].html` | `/products/:slug/` | Product detail |
| `src/pages/blog/index.html` | `/blog/` | Blog listing |
| `src/pages/blog/[slug].html` | `/blog/:slug/` | Blog post |
| `src/pages/contact/index.html` | `/contact/` | Contact page |

---

## Directory Structure Checklist

- [ ] Root structure defined and documented
- [ ] `src/pages/` hierarchy matches site map
- [ ] `src/layouts/` contains all base templates
- [ ] `src/partials/` organised by function category
- [ ] `src/components/` contains self-contained UI elements
- [ ] Nesting rules established and agreed upon
- [ ] File-to-route mapping documented
- [ ] Asset directory structure defined
- [ ] Build output directory (`dist/`) excluded from source
- [ ] Structure reviewed with team
