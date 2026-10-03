# Global Guidelines - Quick Reference

## HTML Document Boilerplate

```html
<!DOCTYPE html>
<html lang="{{DEFAULT_LANG}}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{SITE_NAME}} — Page Title</title>
  <meta name="description" content="Page description for SEO">
  <link rel="stylesheet" href="/css/main.css">
</head>
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <header><!-- site header --></header>
  <nav aria-label="Main"><!-- navigation --></nav>
  <main id="main"><!-- page content --></main>
  <footer><!-- site footer --></footer>
  <script src="/js/main.js" defer></script>
</body>
</html>
```

---

## Semantic Element Cheat Sheet

| Element | Use For |
|---------|---------|
| `<header>` | Introductory content or navigational aids |
| `<nav>` | Navigation links |
| `<main>` | Main content (one per page) |
| `<article>` | Self-contained, independently distributable content |
| `<section>` | Thematic grouping with a heading |
| `<aside>` | Tangentially related content |
| `<footer>` | Footer for nearest sectioning content |
| `<figure>` | Self-contained illustration, diagram, photo |
| `<figcaption>` | Caption for a `<figure>` |
| `<details>` | Disclosure widget |
| `<time>` | Machine-readable date/time |

---

## Attribute Ordering Convention

1. `id`
2. `class`
3. `data-*`
4. `src`, `href`, `for`, `type`, `name`, `value`
5. `alt`, `title`, `role`, `aria-*`
6. Boolean attributes (`disabled`, `required`, `hidden`)

---

## Accessibility Must-Haves

- [ ] Every `<img>` has an `alt` attribute
- [ ] Every `<input>` has a `<label>`
- [ ] Heading levels never skip (h1 → h2 → h3)
- [ ] One `<main>` per page
- [ ] Skip-to-content link present
- [ ] `lang` attribute on `<html>`
- [ ] Colour contrast ratio ≥ 4.5:1 (text) / ≥ 3:1 (large text)
- [ ] All interactive elements keyboard-accessible

---

## Performance Quick Rules

| Technique | How |
|-----------|-----|
| Defer scripts | `<script src="..." defer>` |
| Lazy load images | `loading="lazy"` on off-screen images |
| Preconnect | `<link rel="preconnect" href="...">` |
| Responsive images | `<picture>` with `srcset` |
| Font display | `font-display: swap` in CSS |

---

## Security Quick Rules

| Rule | Implementation |
|------|---------------|
| External links | `rel="noopener noreferrer"` on `target="_blank"` |
| Iframes | `sandbox` attribute with minimal permissions |
| Forms | `action` pointing to HTTPS, `autocomplete` attributes |
| CSP | `<meta http-equiv="Content-Security-Policy" content="...">` |
