# Refactoring Plan - Quick Reference

## Common HTML Refactoring Patterns

### Semantic Replacements

| Before | After | Why |
|--------|-------|-----|
| `<div class="header">` | `<header>` | Semantic landmark |
| `<div class="nav">` | `<nav>` | Navigation landmark |
| `<div class="main">` | `<main>` | Main content landmark |
| `<div class="footer">` | `<footer>` | Footer landmark |
| `<div class="article">` | `<article>` | Self-contained content |
| `<div class="sidebar">` | `<aside>` | Tangential content |
| `<div class="section">` | `<section>` | Thematic grouping |
| `<b>` | `<strong>` | Strong importance |
| `<i>` | `<em>` | Emphasis |
| `<div onclick="...">` | `<button>` | Interactive element |

### Accessibility Quick Fixes

| Issue | Fix |
|-------|-----|
| Image without alt | Add `alt="description"` or `alt=""` for decorative |
| Link without text | Add `aria-label="description"` |
| Form input without label | Add `<label for="id">` |
| Missing lang | Add `lang="en"` to `<html>` |
| Missing page title | Add `<title>` in `<head>` |
| No skip link | Add skip-to-content link before nav |
| Color-only indicator | Add text or icon alongside color |

---

## Assessment Commands

```bash
# Count divs vs semantic elements
rg -c '<div' {{SRC_DIR}} --type html
rg -c '<(header|nav|main|footer|article|section|aside)[\s>]' {{SRC_DIR}} --type html

# Find images without alt
rg '<img(?![^>]*alt=)' {{SRC_DIR}} --type html

# Find links without accessible text
rg '<a[^>]*>\s*</a>' {{SRC_DIR}} --type html

# Validate HTML
npx htmlhint {{SRC_DIR}}/**/*.html
```

---

## WCAG Checklist (Priority Fixes)

- [ ] All images have `alt` attributes
- [ ] All form inputs have associated `<label>` elements
- [ ] Heading hierarchy is correct (h1 → h2 → h3, no skips)
- [ ] Sufficient colour contrast (4.5:1 for text)
- [ ] All interactive elements are keyboard accessible
- [ ] Page has a `<title>` and `lang` attribute
- [ ] Landmark regions are used (header, nav, main, footer)

---

## Testing Tools

| Tool | Purpose | Command |
|------|---------|---------|
| HTMLHint | HTML validation | `npx htmlhint .` |
| axe-core | Accessibility | Browser extension or `npx @axe-core/cli` |
| Lighthouse | Performance + A11y | Chrome DevTools |
| pa11y | Accessibility CI | `npx pa11y {{BASE_URL}}` |
| Nu Validator | HTML5 spec validation | `npx vnu-jar *.html` |
