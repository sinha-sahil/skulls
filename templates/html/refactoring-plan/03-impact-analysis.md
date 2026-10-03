# Phase 3 · Impact Analysis

## Objective

Analyse the potential impact of each proposed refactoring change in **{{PROJECT_NAME}}** on styling, JavaScript behaviour, SEO, accessibility tooling, and downstream systems.

---

## CSS Impact Assessment

### Semantic Element Replacement

Replacing `<div>` with semantic elements changes CSS selectors. Audit every affected rule:

```html
<!-- Before: CSS targets div classes -->
<div class="header">...</div>
<!-- CSS: .header { ... } — still works after refactoring -->

<!-- After: semantic element -->
<header class="header">...</header>
<!-- CSS: .header { ... } — still works (class preserved) -->

<!-- BUT if CSS used element selectors: -->
<!-- CSS: div.header { ... } — BREAKS after refactoring -->
```

| CSS Selector | Current Target | New Target | Breaks? | Fix Required |
|---|---|---|---|---|
| `.header` | `<div class="header">` | `<header class="header">` | No | None — class preserved |
| `div.header` | `<div class="header">` | `<header>` | Yes | Change to `header.header` or `.header` |
| `div > div` | Generic nesting | Semantic nesting | Possibly | Audit specificity |
| `.nav-list > div` | `<div>` items | `<li>` items | Yes | Change to `.nav-list > li` |

### Selector Audit Workflow

```bash
# Search for element-specific selectors that may break
# Look for div.classname, span.classname patterns in CSS
grep -rn "div\." assets/css/
grep -rn "span\." assets/css/

# Look for direct child selectors targeting divs
grep -rn "> div" assets/css/
grep -rn "> span" assets/css/
```

---

## JavaScript Impact Assessment

### DOM Query Changes

JavaScript that queries by element type will break when elements change:

```javascript
// Before: queries targeting divs
document.querySelector('div.header');           // BREAKS
document.querySelectorAll('.nav > div');         // BREAKS

// After: updated queries
document.querySelector('header');               // Works
document.querySelectorAll('nav > li');          // Works

// Safe patterns (class-based) — no change needed
document.querySelector('.header');              // Still works
document.querySelectorAll('[data-nav-item]');   // Still works
```

| JS Query Pattern | Files | Impact | Fix |
|---|---|---|---|
| `querySelector('div.classname')` | | High | Change to `.classname` |
| `querySelectorAll('div > div')` | | High | Update selectors |
| `getElementsByTagName('div')` | | High | Use class or data attribute |
| `closest('div')` | | Medium | Update to semantic element |
| `querySelector('.classname')` | | None | Already class-based |
| `querySelector('[data-attr]')` | | None | Already attribute-based |

### Event Listener Impact

```javascript
// If event delegation targets element types:
document.addEventListener('click', (e) => {
  // BREAKS if divs become buttons or links
  if (e.target.tagName === 'DIV') { ... }

  // SAFE — targets class or data attribute
  if (e.target.matches('[data-action]')) { ... }
});
```

---

## SEO Impact Assessment

### URL Changes

If file reorganisation changes URLs, assess SEO impact:

| Old URL | New URL | Redirect Required | Indexed? |
|---|---|---|---|
| `/about.html` | `/about/` | 301 redirect | Check Search Console |
| `/blog.html` | `/blog/` | 301 redirect | Check Search Console |
| `/products/item.html` | `/products/item/` | 301 redirect | Check Search Console |

### Structured Data Impact

Adding structured data is SEO-positive, but changes must be valid:

```html
<!-- Verify with Google Rich Results Test -->
<!-- https://search.google.com/test/rich-results -->

<!-- Before: no structured data -->
<article>
  <h1>Blog Post Title</h1>
  <span>January 15, 2024</span>
</article>

<!-- After: with Schema.org markup -->
<article itemscope itemtype="https://schema.org/BlogPosting">
  <h1 itemprop="headline">Blog Post Title</h1>
  <time itemprop="datePublished" datetime="2024-01-15">January 15, 2024</time>
</article>
```

### Meta Tag Changes

| Meta Tag | Current | Proposed Change | SEO Impact |
|---|---|---|---|
| `<title>` | Per-page inline | Centralised in partial | Neutral (content unchanged) |
| `<meta description>` | Missing on some pages | Add to all pages | Positive |
| `<link rel="canonical">` | Missing | Add to all pages | Positive |
| Open Graph tags | Inconsistent | Standardise via partial | Positive |

---

## Third-Party Integration Impact

### Analytics & Tracking

```html
<!-- Check if analytics targets specific elements -->
<!-- Google Tag Manager data-layer pushes -->
<div data-gtm-click="header-cta">...</div>
<!-- This data attribute survives refactoring — no impact -->

<!-- But if GTM targets element types: -->
<!-- GTM trigger: Element matches CSS selector "div.cta" -->
<!-- This BREAKS if div becomes <section> or <a> -->
```

| Integration | Targets Elements? | Impact | Fix |
|---|---|---|---|
| Google Analytics / GTM | | | |
| A/B testing tools | | | |
| Heatmap tools | | | |
| Chat widgets | | | |
| Form processors | | | |

### Embedded Content

| Embed Type | Current Markup | Impact | Notes |
|---|---|---|---|
| YouTube iframes | | None | Iframe content unchanged |
| Google Maps | | None | Iframe content unchanged |
| Social media embeds | | Low | Check embed scripts for parent selectors |
| Third-party widgets | | Medium | May query parent DOM |

---

## Accessibility Tooling Impact

### Screen Reader Announcements

Semantic elements change how screen readers announce content:

```html
<!-- Before: screen reader sees generic div -->
<div class="nav">...</div>
<!-- Announced as: (nothing — generic container) -->

<!-- After: screen reader recognises navigation landmark -->
<nav aria-label="Main navigation">...</nav>
<!-- Announced as: "Main navigation, navigation landmark" -->
```

This is a **positive** impact but may change user testing expectations.

### Browser Extensions & Assistive Technology

| Tool | Impact of Semantic Changes | Notes |
|---|---|---|
| Screen readers (NVDA, VoiceOver) | Positive — better navigation | |
| Browser reader mode | Positive — better content extraction | |
| Accessibility audit tools | Positive — fewer violations | |
| Browser dev tools (Accessibility tree) | Positive — clearer structure | |

---

## Risk Matrix

| Change | CSS Risk | JS Risk | SEO Risk | A11y Risk | Overall |
|---|---|---|---|---|---|
| div → semantic elements | Medium | Medium | Low | Positive | Medium |
| Add ARIA attributes | None | Low | None | Positive | Low |
| Add structured data | None | None | Positive | None | Low |
| Fix heading hierarchy | Low | None | Positive | Positive | Low |
| Modernise forms | Medium | High | None | Positive | High |
| Remove deprecated elements | Low | Low | None | Positive | Low |
| URL changes | None | None | High | None | High |

---

## Impact Analysis Checklist

- [ ] CSS selectors audited for element-type dependencies
- [ ] JavaScript DOM queries audited for element-type targeting
- [ ] Event delegation patterns checked
- [ ] SEO impact assessed (URLs, meta tags, structured data)
- [ ] Third-party integration impact reviewed
- [ ] Analytics tracking selectors verified
- [ ] Screen reader announcement changes documented
- [ ] Risk matrix completed for all planned changes
- [ ] High-risk items flagged for extra testing
- [ ] Impact analysis reviewed with team
