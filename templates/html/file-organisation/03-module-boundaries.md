# Phase 3 · Module Boundaries

## Objective

Define clear boundaries between layouts, partials, components, and pages in **{{PROJECT_NAME}}** so that each unit of HTML has a single responsibility and a well-defined interface.

---

## Boundary Definitions

### Page

A page is a complete HTML document that assembles layouts, partials, and components into a routable endpoint.

**Rules:**
- Must extend exactly one layout
- Contains page-specific content only — no duplicated boilerplate
- Responsible for passing data/context to included partials
- One page per route

```html
<!-- src/pages/blog/index.html -->
{% extends "layouts/base.html" %}

{% block head %}
  <title>Blog — {{SITE_NAME}}</title>
  <meta name="description" content="Latest posts from {{SITE_NAME}}">
  {% include "partials/head/open-graph.html" with
    title="Blog",
    description="Latest posts from {{SITE_NAME}}",
    url="{{BASE_URL}}/blog/"
  %}
{% endblock %}

{% block content %}
  <h1>Blog</h1>
  <section aria-label="Blog posts">
    {% for post in posts %}
      {% include "components/card.html" with
        id=post.slug,
        title=post.title,
        description=post.excerpt,
        image=post.thumbnail,
        image_alt=post.thumbnail_alt,
        url="/blog/" + post.slug + "/"
      %}
    {% endfor %}
  </section>
{% endblock %}
```

### Layout

A layout defines the outer document shell — doctype, `<html>`, `<head>`, skip links, landmarks, and script loading. Layouts define blocks that pages fill.

**Rules:**
- Must contain `<!DOCTYPE html>`, `<html lang>`, `<head>`, `<body>`
- Must include skip link and landmark regions (`<main>`, `<header>`, `<footer>`)
- Must define named blocks for page content injection
- Should not contain page-specific content

```html
<!-- src/layouts/blog-post.html -->
{% extends "layouts/base.html" %}

{% block content %}
  <article aria-labelledby="post-title" itemscope itemtype="https://schema.org/BlogPosting">
    <header>
      <h1 id="post-title" itemprop="headline">{% block post_title %}{% endblock %}</h1>
      <time itemprop="datePublished" datetime="{% block post_date %}{% endblock %}">
        {% block post_date_display %}{% endblock %}
      </time>
    </header>
    <div itemprop="articleBody">
      {% block post_content %}{% endblock %}
    </div>
  </article>
{% endblock %}
```

### Partial

A partial is a reusable HTML fragment that cannot stand alone as a document. It is always included by a page or layout.

**Rules:**
- Must NOT contain `<!DOCTYPE>`, `<html>`, `<head>`, or `<body>`
- Should represent a single section or concern
- May accept parameters for dynamic content
- Should be idempotent — including it multiple times is safe

```html
<!-- src/partials/navigation/breadcrumb.html -->
<nav aria-label="Breadcrumb">
  <ol itemscope itemtype="https://schema.org/BreadcrumbList">
    {% for crumb in breadcrumbs %}
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      {% if not loop.last %}
        <a itemprop="item" href="{{ crumb.url }}">
          <span itemprop="name">{{ crumb.label }}</span>
        </a>
      {% else %}
        <span itemprop="name" aria-current="page">{{ crumb.label }}</span>
      {% endif %}
      <meta itemprop="position" content="{{ loop.index }}">
    </li>
    {% endfor %}
  </ol>
</nav>
```

### Component

A component is a self-contained UI element with its own markup structure. Unlike partials, components encapsulate a complete visual unit.

**Rules:**
- Represents a single, reusable visual element
- Must accept parameters — never hardcodes content
- Should use ARIA attributes appropriate to its role
- Must be context-independent — works in any container

```html
<!-- src/components/accordion.html -->
<div class="accordion" data-accordion>
  {% for item in items %}
  <div class="accordion__item">
    <h3 class="accordion__heading">
      <button
        class="accordion__trigger"
        aria-expanded="false"
        aria-controls="accordion-panel-{{ item.id }}"
        id="accordion-header-{{ item.id }}"
      >
        {{ item.title }}
        <span class="accordion__icon" aria-hidden="true"></span>
      </button>
    </h3>
    <div
      class="accordion__panel"
      id="accordion-panel-{{ item.id }}"
      role="region"
      aria-labelledby="accordion-header-{{ item.id }}"
      hidden
    >
      {{ item.content }}
    </div>
  </div>
  {% endfor %}
</div>
```

---

## Boundary Decision Matrix

Use this matrix to determine where new markup belongs:

| Question | Page | Layout | Partial | Component |
|---|---|---|---|---|
| Is it a complete routable document? | Yes | No | No | No |
| Does it define the document shell? | No | Yes | No | No |
| Is it a reusable fragment of a page section? | No | No | Yes | No |
| Is it a self-contained, parameterised UI element? | No | No | No | Yes |
| Does it contain `<!DOCTYPE>`? | Inherits | Yes | Never | Never |
| Can it be included in multiple pages? | No | Yes | Yes | Yes |
| Does it accept parameters? | N/A | Via blocks | Optional | Required |

---

## Inter-Module Communication

### Data Flow Direction

```
Page  ──(extends)──▸  Layout
  │                      │
  ├──(includes with)──▸  Partial  (receives params from page)
  │                      │
  └──(includes with)──▸  Component (receives params from page)
                         │
                         └──(may include)──▸  Sub-partial
```

**Rules:**
- Pages pass data DOWN to partials and components
- Partials and components never reach UP for page-level data
- Layouts define blocks; pages fill them
- Components may nest other components, but not layouts or pages
- Partials may include other partials to max depth of 2

---

## Shared Fragment Registry

Track all shared markup to prevent duplication:

| Fragment | Type | Location | Used By |
|---|---|---|---|
| Site header | Partial | `partials/navigation/main-nav.html` | All pages via layout |
| Footer | Partial | `partials/navigation/footer-nav.html` | All pages via layout |
| Meta tags | Partial | `partials/head/meta-tags.html` | All pages via layout |
| Card | Component | `components/card.html` | Blog listing, products |
| Modal | Component | `components/modal.html` | Contact, products |

---

## Module Boundaries Checklist

- [ ] Page boundaries defined — one page per route
- [ ] Layout boundaries defined — document shell only
- [ ] Partial boundaries defined — reusable fragments
- [ ] Component boundaries defined — self-contained UI elements
- [ ] Decision matrix documented for new markup
- [ ] Data flow direction established
- [ ] Inter-module nesting rules agreed upon
- [ ] Shared fragment registry created
- [ ] No circular dependencies between modules
- [ ] Boundaries reviewed with team
