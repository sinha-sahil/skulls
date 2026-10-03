# Phase 1 · Assessment

## Objective

Audit the current HTML file structure of **{{PROJECT_NAME}}** to understand existing organisation, identify pain points, and establish a baseline for restructuring decisions.

---

## Current File Inventory

### Document Types

List every HTML document type present in the project:

| Document Type | Count | Location Pattern | Notes |
|---|---|---|---|
| Full pages | | | |
| Partial templates | | | |
| Email templates | | | |
| Error pages | | | |
| Static fragments | | | |

### Current Directory Layout

```
{{PROJECT_NAME}}/
├── index.html
├── about.html
├── pages/
│   ├── contact.html
│   └── ...
├── templates/
│   ├── partials/
│   │   ├── header.html
│   │   ├── footer.html
│   │   └── ...
│   └── layouts/
│       └── base.html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── ...
```

> Replace the above with the actual directory tree from the project.

---

## Pain Point Analysis

### Structural Issues

Identify problems with the current file organisation:

- [ ] Files in root that should be in subdirectories
- [ ] Inconsistent nesting depth across sections
- [ ] Templates mixed with static pages
- [ ] Partials not separated from full documents
- [ ] Assets co-located with markup inconsistently
- [ ] No clear separation between layout and content templates

### Template Duplication

Identify repeated markup patterns across files:

```html
<!-- Example: duplicated header across multiple pages -->
<!-- page-a.html -->
<header class="site-header">
  <nav aria-label="Main navigation">
    <a href="{{BASE_URL}}/">{{SITE_NAME}}</a>
    <!-- Repeated in every file -->
  </nav>
</header>

<!-- page-b.html — identical header duplicated -->
<header class="site-header">
  <nav aria-label="Main navigation">
    <a href="{{BASE_URL}}/">{{SITE_NAME}}</a>
  </nav>
</header>
```

| Duplicated Pattern | Files Affected | Lines Repeated |
|---|---|---|
| Site header | | |
| Footer | | |
| Meta tags block | | |
| Navigation | | |
| Script includes | | |

---

## Page Hierarchy Mapping

### Site Map

Document the logical page hierarchy:

```
{{SITE_NAME}}
├── Home (index.html)
├── About
│   ├── Team
│   └── History
├── Products
│   ├── Category listing
│   └── Product detail
├── Blog
│   ├── Post listing
│   └── Post detail
└── Contact
```

### Depth Analysis

| Depth Level | Page Count | Example |
|---|---|---|
| Level 0 (root) | | index.html |
| Level 1 | | about/index.html |
| Level 2 | | about/team/index.html |
| Level 3+ | | |

---

## Include / Partial Patterns

### Current Include Strategy

Document how partials and reusable fragments are currently handled:

```html
<!-- Server-side include example -->
<!--#include virtual="/partials/header.html" -->

<!-- Build-tool include example -->
<!-- @@include('./partials/header.html') -->

<!-- Template engine example -->
{% include "partials/header.html" %}
```

- [ ] Server-side includes (SSI)
- [ ] Build tool includes (e.g. gulp-file-include, posthtml-include)
- [ ] Template engine (Nunjucks, Handlebars, EJS, etc.)
- [ ] Web components / custom elements
- [ ] No include mechanism (fully duplicated)

### Partial Inventory

| Partial Name | Used In | Include Method | Parameterised? |
|---|---|---|---|
| header.html | | | Yes / No |
| footer.html | | | Yes / No |
| nav.html | | | Yes / No |
| meta-tags.html | | | Yes / No |
| scripts.html | | | Yes / No |

---

## Asset Dependency Map

Track which pages depend on which assets:

| Page / Template | CSS Files | JS Files | Image Directories |
|---|---|---|---|
| index.html | | | |
| about.html | | | |
| Layout base | | | |

---

## Assessment Checklist

- [ ] Complete file inventory documented
- [ ] Current directory layout mapped
- [ ] Structural pain points identified
- [ ] Template duplication catalogued
- [ ] Page hierarchy mapped
- [ ] Include / partial patterns documented
- [ ] Asset dependencies tracked
- [ ] Assessment reviewed with team
