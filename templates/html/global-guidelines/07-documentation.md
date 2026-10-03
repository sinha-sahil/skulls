# Phase 7 · Documentation

## Objective

Establish HTML documentation standards for **{{PROJECT_NAME}}** covering commenting conventions, component documentation, page structure documentation, and accessibility documentation.

---

## HTML Commenting Standards

### When to Comment

Comments in HTML should explain **why**, not **what**. The markup itself should be self-documenting through semantic elements and clear class names.

```html
<!-- Good: explains WHY -->
<!-- Skip link target — receives focus when skip link is activated -->
<main id="main-content" tabindex="-1">

<!-- Good: marks section boundaries in long documents -->
<!-- ====== Hero Section ====== -->
<section class="hero" aria-labelledby="hero-heading">
  ...
</section>
<!-- ====== /Hero Section ====== -->

<!-- Good: documents a workaround -->
<!-- WORKAROUND: Safari VoiceOver does not announce role="contentinfo"
     on footer inside a sectioning element. Adding explicit role. -->
<footer role="contentinfo">

<!-- Bad: restates what the markup already says -->
<!-- This is the navigation -->       <!-- ✗ Obvious from <nav> -->
<!-- End of header -->                 <!-- ✗ Use indentation instead -->
<!-- This is a link to the about page --> <!-- ✗ Obvious from href -->
```

### Comment Patterns

| Pattern | Purpose | Example |
|---|---|---|
| Section markers | Delimit major page sections | `<!-- ====== Section Name ====== -->` |
| TODO | Mark unfinished work | `<!-- TODO: Add structured data -->` |
| FIXME | Mark known issues | `<!-- FIXME: Heading level skipped -->` |
| HACK/WORKAROUND | Document browser workarounds | `<!-- WORKAROUND: Safari bug #12345 -->` |
| Template variables | Document expected variables | `<!-- Expects: title, description, image -->` |

### Conditional Comments (Legacy)

```html
<!-- Conditional comments are obsolete (IE only). Do NOT use: -->
<!-- ✗ <!--[if IE]><link rel="stylesheet" href="ie.css"><![endif]--> -->
<!-- Use feature detection instead (Modernizr or @supports) -->
```

---

## Component Documentation

### Component Header Comment

Every reusable component file should begin with a documentation comment:

```html
<!--
  Component: Card
  Description: Displays a content preview with image, title, and description.
  
  Parameters:
    - id       (required) : Unique identifier for accessibility IDs
    - title    (required) : Card title text
    - description (required) : Card description text
    - image    (required) : Image URL
    - image_alt (required) : Image alt text
    - url      (required) : Link destination URL
  
  Usage:
    {% include "components/card.html" with
      id="post-1",
      title="Post Title",
      description="Post excerpt...",
      image="/images/photo.jpg",
      image_alt="Description of photo",
      url="/blog/post-1/"
    %}
  
  Accessibility:
    - Card is an <article> with aria-labelledby pointing to the title
    - Image has required alt text
    - Link includes sr-only text for context
    
  Dependencies:
    - CSS: assets/css/components/card.css
    - JS: None
-->
<article class="card" aria-labelledby="card-title-{{ id }}">
  <img
    class="card__image"
    src="{{ image }}"
    alt="{{ image_alt }}"
    width="400"
    height="300"
    loading="lazy"
  >
  <div class="card__body">
    <h3 class="card__title" id="card-title-{{ id }}">{{ title }}</h3>
    <p class="card__description">{{ description }}</p>
    <a class="card__link" href="{{ url }}">
      Read more<span class="sr-only"> about {{ title }}</span>
    </a>
  </div>
</article>
```

### Partial Documentation

```html
<!--
  Partial: Main Navigation
  Location: src/partials/navigation/main-nav.html
  
  Included by: src/layouts/base.html
  
  Parameters:
    - current_page (optional) : Slug of the current page for aria-current
  
  Accessibility:
    - <nav> with aria-label="Main navigation"
    - Active page marked with aria-current="page"
    - Navigation uses <ul> with proper list structure
  
  Notes:
    - Update navigation items here; changes propagate to all pages
    - Maximum 7 top-level navigation items (cognitive load)
-->
<nav aria-label="Main navigation">
  <ul class="nav-list" role="list">
    <li>
      <a href="/" {% if current_page == 'home' %}aria-current="page"{% endif %}>
        Home
      </a>
    </li>
    <!-- Additional items -->
  </ul>
</nav>
```

---

## Page Structure Documentation

### Page Template Documentation

Every page template should document its structure:

```html
<!--
  Page: About
  Route: /about/
  Layout: layouts/base.html
  
  Includes:
    - partials/head/meta-tags.html
    - partials/head/open-graph.html
    - partials/navigation/breadcrumb.html
  
  Heading Structure:
    h1: About {{SITE_NAME}}
      h2: Our Mission
      h2: Our Team
        h3: [Team member names]
      h2: Our History
        h3: [Year milestones]
  
  Structured Data:
    - Organization (JSON-LD)
    - BreadcrumbList (JSON-LD)
  
  Variables:
    - {{PAGE_TITLE}} = "About"
    - {{PAGE_DESCRIPTION}} = "Learn about {{SITE_NAME}}..."
-->
{% extends "layouts/base.html" %}

{% block head %}
  <title>About — {{SITE_NAME}}</title>
  {% include "partials/head/meta-tags.html" %}
{% endblock %}

{% block content %}
  <!-- Page content -->
{% endblock %}
```

### Site-Level Documentation

Maintain a site structure document (this can live in your project README or a dedicated doc):

```
{{PROJECT_NAME}} — HTML Structure
=================================

Pages:
  /                     → src/pages/index.html          (extends: base.html)
  /about/               → src/pages/about/index.html    (extends: base.html)
  /blog/                → src/pages/blog/index.html     (extends: base.html)
  /blog/:slug/          → src/pages/blog/[slug].html    (extends: blog-post.html)
  /products/            → src/pages/products/index.html (extends: base.html)
  /products/:slug/      → src/pages/products/[slug].html (extends: product-detail.html)
  /contact/             → src/pages/contact/index.html  (extends: base.html)

Layouts:
  base.html             → Root layout (doctype, head, header, main, footer)
  blog-post.html        → Blog post layout (extends base)
  product-detail.html   → Product detail layout (extends base)

Partials:
  head/meta-tags.html         → Standard meta tags
  head/open-graph.html        → Open Graph meta tags
  head/structured-data.html   → JSON-LD structured data
  navigation/main-nav.html    → Primary navigation
  navigation/breadcrumb.html  → Breadcrumb trail
  navigation/footer-nav.html  → Footer navigation
  forms/contact-form.html     → Contact form
  forms/search-form.html      → Site search form
  forms/newsletter-signup.html → Newsletter signup
  sections/hero.html          → Hero banner
  sections/cta.html           → Call to action

Components:
  card.html             → Content preview card
  modal.html            → Dialog/modal
  accordion.html        → Expandable sections
  tabs.html             → Tabbed interface
```

---

## Accessibility Documentation

### ARIA Pattern Documentation

Document the ARIA patterns used in the project:

```html
<!--
  ARIA Pattern: Disclosure (Accordion)
  Reference: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
  
  Keyboard Interaction:
    - Enter/Space: Toggle section open/closed
    - Tab: Move focus to next interactive element
  
  ARIA Attributes:
    - button: aria-expanded="true|false"
    - button: aria-controls="[panel-id]"
    - panel: role="region"
    - panel: aria-labelledby="[button-id]"
  
  States:
    - Collapsed: aria-expanded="false", panel has [hidden]
    - Expanded: aria-expanded="true", panel visible
-->
```

### Accessibility Statement Template

```html
<!--
  Maintain an accessibility statement page for {{SITE_NAME}}.
  File: src/pages/accessibility/index.html
-->

<!-- Example content for accessibility statement page -->
<main id="main-content">
  <h1>Accessibility Statement for {{SITE_NAME}}</h1>

  <h2>Conformance Status</h2>
  <p>
    {{SITE_NAME}} aims to conform to
    <a href="https://www.w3.org/TR/WCAG21/">WCAG 2.1</a>
    Level AA. We are continually improving the user experience
    for everyone.
  </p>

  <h2>Measures Taken</h2>
  <ul>
    <li>Semantic HTML5 elements for document structure</li>
    <li>ARIA attributes for interactive components</li>
    <li>Keyboard-navigable interface</li>
    <li>Skip navigation links</li>
    <li>Descriptive alt text for images</li>
    <li>Sufficient colour contrast ratios</li>
    <li>Automated accessibility testing in CI/CD</li>
  </ul>

  <h2>Feedback</h2>
  <p>
    If you encounter any accessibility barriers, please contact us:
  </p>
  <address>
    Email: <a href="mailto:accessibility@{{PROJECT_NAME}}.com">accessibility@{{PROJECT_NAME}}.com</a>
  </address>

  <h2>Assessment Date</h2>
  <p>
    This statement was last updated on
    <time datetime="2024-01-15">January 15, 2024</time>.
  </p>
</main>
```

---

## Structured Data Documentation

Document all structured data used across the site:

| Page Type | Schema Type | Implementation | Validation |
|---|---|---|---|
| Home | Organization | JSON-LD in `<head>` | Google Rich Results Test |
| Blog post | BlogPosting | JSON-LD + microdata attributes | Google Rich Results Test |
| Product | Product | JSON-LD in `<head>` | Google Rich Results Test |
| All interior pages | BreadcrumbList | JSON-LD via partial | Google Rich Results Test |
| Contact | ContactPoint | JSON-LD in `<head>` | Schema.org Validator |
| FAQ | FAQPage | JSON-LD in `<head>` | Google Rich Results Test |

```html
<!--
  Structured Data: BlogPosting
  Applied to: src/pages/blog/[slug].html
  
  Required properties:
    - headline: Post title
    - datePublished: ISO 8601 date
    - author: Author name with Person type
  
  Optional properties:
    - dateModified: Last modified date
    - image: Featured image URL
    - description: Post excerpt
    
  Validation:
    https://search.google.com/test/rich-results
    https://validator.schema.org/
-->
```

---

## Documentation Maintenance

### Review Schedule

| Document | Review Frequency | Owner |
|---|---|---|
| Component documentation | Every component change | Developer making the change |
| Page structure documentation | Every new page or restructure | Lead developer |
| Accessibility statement | Quarterly | Accessibility lead |
| ARIA pattern documentation | Every new interactive component | Developer + QA |
| Site structure map | Monthly | Lead developer |

---

## Documentation Checklist

- [ ] HTML commenting standards defined (when, how, patterns)
- [ ] Every component has a documentation header comment
- [ ] Every partial has a documentation header comment
- [ ] Every page template documents its structure and includes
- [ ] Site structure map maintained and up to date
- [ ] ARIA patterns documented with keyboard interaction
- [ ] Accessibility statement page created
- [ ] Structured data documented per page type
- [ ] Documentation review schedule established
- [ ] Team trained on documentation standards
- [ ] No stale/outdated comments in codebase
