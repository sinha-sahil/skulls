# Phase 6 · Migration Plan

## Objective

Define a safe, incremental migration path from the current file structure to the target organisation for **{{PROJECT_NAME}}**, ensuring zero downtime and no broken links.

---

## Migration Strategy

### Approach: Incremental Migration

Migrate in small, verifiable steps rather than a single large restructure. Each step must leave the project in a working state.

```
Phase A: Set up target structure (empty directories)
Phase B: Extract layouts from duplicated boilerplate
Phase C: Extract partials from repeated fragments
Phase D: Move pages to new directory structure
Phase E: Update all internal links and references
Phase F: Clean up old files and verify
```

---

## Phase A · Scaffold Target Structure

Create the target directories without moving any files:

```bash
# Create target directory structure
mkdir -p src/{pages,layouts,partials/{head,navigation,sections,forms},components,data}
mkdir -p public
mkdir -p assets/{css,js,images,fonts}
mkdir -p tests/{accessibility,validation}
```

**Verification:**
- [ ] All target directories created
- [ ] Existing files untouched
- [ ] Build still passes: `pnpm build`

---

## Phase B · Extract Layouts

Identify the common document shell and extract it into layout templates.

### Step B1: Create Base Layout

```html
<!-- src/layouts/base.html — extracted from common boilerplate -->
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

### Step B2: Create Specialised Layouts

```html
<!-- src/layouts/blog-post.html -->
{% extends "layouts/base.html" %}

{% block content %}
  <article itemscope itemtype="https://schema.org/BlogPosting">
    {% block post_content %}{% endblock %}
  </article>
{% endblock %}
```

**Verification:**
- [ ] Base layout contains all common boilerplate
- [ ] Specialised layouts extend base correctly
- [ ] No page-specific content in layouts
- [ ] htmlhint passes: `htmlhint src/layouts/`

---

## Phase C · Extract Partials

Pull repeated fragments out of pages into the `src/partials/` directory.

### Extraction Priority

| Priority | Fragment | Source | Target |
|---|---|---|---|
| 1 | Navigation | Duplicated in all pages | `partials/navigation/main-nav.html` |
| 2 | Footer | Duplicated in all pages | `partials/navigation/footer-nav.html` |
| 3 | Meta tags | Duplicated in all pages | `partials/head/meta-tags.html` |
| 4 | Open Graph | Duplicated in most pages | `partials/head/open-graph.html` |
| 5 | Forms | Duplicated across pages | `partials/forms/*.html` |

### Extraction Process

For each fragment:

1. **Copy** the fragment to its target partial file
2. **Parameterise** any page-specific values
3. **Replace** the original inline markup with an include statement
4. **Test** that the page renders identically
5. **Repeat** for all pages using that fragment

```html
<!-- Before: inline navigation in every page -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about/">About</a></li>
    <li><a href="/contact/">Contact</a></li>
  </ul>
</nav>

<!-- After: include statement -->
{% include "partials/navigation/main-nav.html" %}
```

**Verification:**
- [ ] All high-priority fragments extracted
- [ ] Each partial parameterised for reuse
- [ ] Include statements replace inline markup
- [ ] Visual regression check: pages render identically
- [ ] htmlhint passes: `htmlhint src/partials/`

---

## Phase D · Migrate Pages

Move pages to the new `src/pages/` directory structure.

### Migration Order

Migrate least-dependent pages first:

| Order | Page | From | To | Dependencies |
|---|---|---|---|---|
| 1 | Error pages | `404.html` | `src/pages/404.html` | Layout only |
| 2 | Static pages | `about.html` | `src/pages/about/index.html` | Layout + partials |
| 3 | Contact | `contact.html` | `src/pages/contact/index.html` | Layout + form partial |
| 4 | Blog listing | `blog.html` | `src/pages/blog/index.html` | Layout + card component |
| 5 | Blog posts | `blog/*.html` | `src/pages/blog/[slug].html` | Blog post layout |
| 6 | Products | `products/*.html` | `src/pages/products/` | Product layout + components |
| 7 | Home | `index.html` | `src/pages/index.html` | All partials/components |

### Per-Page Migration Steps

```bash
# 1. Copy the page to new location
cp about.html src/pages/about/index.html

# 2. Refactor to use layout extension and includes
#    (edit src/pages/about/index.html)

# 3. Update build config to use new source path

# 4. Verify output is identical
pnpm build
htmlhint dist/about/index.html

# 5. Remove old file only after verification
# rm about.html  ← do this in Phase F
```

**Verification:**
- [ ] Each page migrated and tested individually
- [ ] Build output matches previous output
- [ ] All internal links still resolve
- [ ] htmlhint passes on all migrated pages

---

## Phase E · Update References

### Internal Link Audit

```html
<!-- Verify all internal links use consistent path format -->
<!-- Use root-relative paths -->
<a href="/about/">About</a>           <!-- ✓ Root-relative -->
<a href="{{BASE_URL}}/about/">About</a> <!-- ✓ With base URL variable -->

<!-- Avoid -->
<a href="about.html">About</a>        <!-- ✗ Relative to current file -->
<a href="../about.html">About</a>     <!-- ✗ Parent-relative -->
```

### Reference Update Checklist

| Reference Type | Files to Update | Status |
|---|---|---|
| Internal page links (`<a href>`) | All pages and partials | |
| Form actions (`<form action>`) | All form partials | |
| Image sources (`<img src>`) | All pages and partials | |
| Script sources (`<script src>`) | Layout and page templates | |
| Stylesheet links (`<link href>`) | Layout head section | |
| Canonical URLs (`<link rel="canonical">`) | Meta tags partial | |
| Sitemap entries | `public/sitemap.xml` | |
| Open Graph URLs | OG meta partial | |

---

## Phase F · Cleanup and Verification

### Remove Old Files

Only remove old files after all migrations are verified:

```bash
# List old files to remove (review before executing)
# rm about.html
# rm contact.html
# rm blog.html
# rm -rf old-templates/
```

### Final Verification

| Check | Command | Status |
|---|---|---|
| HTMLHint clean | `htmlhint .` | |
| Build succeeds | `pnpm build` | |
| All pages render | Manual check or visual regression | |
| No broken links | Link checker tool | |
| No orphaned files | `find src/ -name "*.html" | sort` | |
| Sitemap accurate | Validate `sitemap.xml` against pages | |

---

## Rollback Plan

If migration fails at any phase:

1. **Phase A-C:** Delete new directories — old files untouched
2. **Phase D:** Revert build config to point at old file paths
3. **Phase E:** Git revert link changes
4. **Phase F:** Old files still exist until this phase — restore from git

```bash
# Emergency rollback: restore to pre-migration state
git checkout main -- .
pnpm build
```

---

## Migration Plan Checklist

- [ ] Target directory structure scaffolded (Phase A)
- [ ] Layouts extracted from duplicated boilerplate (Phase B)
- [ ] Partials extracted from repeated fragments (Phase C)
- [ ] Pages migrated to new structure (Phase D)
- [ ] All internal references updated (Phase E)
- [ ] Old files cleaned up (Phase F)
- [ ] Final verification passed (HTMLHint + build)
- [ ] Rollback plan documented and tested
- [ ] Team informed of new file locations
- [ ] Documentation updated to reflect new structure
