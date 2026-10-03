# Phase 2 · Semantic Structure

## Objective

Define rules for using semantic HTML5 elements in **{{PROJECT_NAME}}** to create meaningful document structure, proper landmark regions, correct heading hierarchy, and appropriate content sectioning.

---

## Landmark Regions

Every page must include these landmark regions:

```html
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header>
    <!-- Site-wide header: logo, primary navigation -->
    <nav aria-label="Main navigation">...</nav>
  </header>

  <main id="main-content" tabindex="-1">
    <!-- Primary page content — exactly ONE per page -->
  </main>

  <footer role="contentinfo">
    <!-- Site-wide footer: secondary nav, copyright, legal links -->
  </footer>
</body>
```

### Landmark Rules

| Element | Count Per Page | ARIA Role | Notes |
|---|---|---|---|
| `<header>` | 1 (top-level) | `banner` (implicit) | Can appear inside `<article>` or `<section>` for local headers |
| `<nav>` | Multiple allowed | `navigation` | Each must have a unique `aria-label` |
| `<main>` | Exactly 1 | `main` (implicit) | Primary content area, not inside `<article>` or `<section>` |
| `<aside>` | Multiple allowed | `complementary` | Content tangentially related to main content |
| `<footer>` | 1 (top-level) | `contentinfo` (implicit) | Can appear inside `<article>` for local footers |

```html
<!-- Multiple nav elements — each labelled uniquely -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/products/">Products</a></li>
    <li><a href="/about/">About</a></li>
  </ul>
</nav>

<!-- Breadcrumb is a separate nav -->
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products/">Products</a></li>
    <li><span aria-current="page">Widget</span></li>
  </ol>
</nav>

<!-- Footer nav is a separate nav -->
<footer role="contentinfo">
  <nav aria-label="Footer navigation">
    <ul>
      <li><a href="/privacy/">Privacy Policy</a></li>
      <li><a href="/terms/">Terms of Service</a></li>
    </ul>
  </nav>
  <p>&copy; 2024 {{SITE_NAME}}</p>
</footer>
```

---

## Content Sectioning Elements

### `<article>`

Use for self-contained, independently distributable content:

```html
<!-- Blog post — self-contained -->
<article aria-labelledby="post-title">
  <header>
    <h2 id="post-title">How to Write Semantic HTML</h2>
    <time datetime="2024-01-15">January 15, 2024</time>
  </header>
  <p>Article body content...</p>
  <footer>
    <p>Written by <span>Author Name</span></p>
  </footer>
</article>

<!-- Product card — self-contained -->
<article aria-labelledby="product-title-widget">
  <h3 id="product-title-widget">Widget Pro</h3>
  <p>A premium widget for professionals.</p>
</article>

<!-- Comment — self-contained -->
<article aria-labelledby="comment-42">
  <header>
    <h4 id="comment-42">Comment by Jane</h4>
    <time datetime="2024-01-16">January 16, 2024</time>
  </header>
  <p>Great article!</p>
</article>
```

### `<section>`

Use for thematic groupings of content **with a heading**:

```html
<!-- Correct: section with heading -->
<section aria-labelledby="features-heading">
  <h2 id="features-heading">Features</h2>
  <p>Our product includes the following features...</p>
</section>

<!-- Correct: multiple themed sections -->
<main id="main-content">
  <h1>About {{SITE_NAME}}</h1>

  <section aria-labelledby="mission-heading">
    <h2 id="mission-heading">Our Mission</h2>
    <p>...</p>
  </section>

  <section aria-labelledby="team-heading">
    <h2 id="team-heading">Our Team</h2>
    <p>...</p>
  </section>
</main>

<!-- Incorrect: section without heading — use <div> instead -->
<section>            <!-- ✗ No heading — not a semantic section -->
  <p>Some content</p>
</section>
```

### `<aside>`

Use for content tangentially related to the surrounding content:

```html
<!-- Sidebar with related links -->
<aside aria-label="Related articles">
  <h2>Related Articles</h2>
  <ul>
    <li><a href="/post-1/">First Related Post</a></li>
    <li><a href="/post-2/">Second Related Post</a></li>
  </ul>
</aside>

<!-- Pull quote within an article -->
<article>
  <p>Main content paragraph...</p>
  <aside aria-label="Key statistic">
    <p><strong>85%</strong> of users prefer semantic markup.</p>
  </aside>
  <p>Continuing main content...</p>
</article>
```

---

## Heading Hierarchy

### Rules

1. Exactly **one `<h1>`** per page — represents the page title
2. **No skipped levels** — h1 → h2 → h3, never h1 → h3
3. Headings reflect **document outline**, not visual size
4. Use CSS for visual sizing, not heading levels

```html
<!-- Correct heading hierarchy -->
<main>
  <h1>Products</h1>                         <!-- Level 1: page title -->

  <section aria-labelledby="electronics-heading">
    <h2 id="electronics-heading">Electronics</h2>   <!-- Level 2: section -->

    <article>
      <h3>Wireless Headphones</h3>           <!-- Level 3: item -->
      <p>Premium noise-cancelling headphones.</p>
    </article>

    <article>
      <h3>Smart Watch</h3>                   <!-- Level 3: item -->
      <p>Track your fitness and notifications.</p>
    </article>
  </section>

  <section aria-labelledby="furniture-heading">
    <h2 id="furniture-heading">Furniture</h2>        <!-- Level 2: section -->

    <article>
      <h3>Standing Desk</h3>                 <!-- Level 3: item -->
      <p>Adjustable height desk.</p>
    </article>
  </section>
</main>

<!-- Incorrect: skipped levels -->
<h1>Products</h1>
<h3>Electronics</h3>    <!-- ✗ Skipped h2 -->
<h5>Headphones</h5>     <!-- ✗ Skipped h4 -->
```

---

## Inline Semantic Elements

| Element | Use For | Example |
|---|---|---|
| `<strong>` | Important text (strong importance) | `<strong>Warning:</strong> This action cannot be undone.` |
| `<em>` | Stressed emphasis | `You <em>must</em> agree to the terms.` |
| `<time>` | Dates and times | `<time datetime="2024-01-15">January 15, 2024</time>` |
| `<abbr>` | Abbreviations | `<abbr title="HyperText Markup Language">HTML</abbr>` |
| `<cite>` | Title of a work | `<cite>The Design of Everyday Things</cite>` |
| `<code>` | Inline code | `Use the <code>aria-label</code> attribute.` |
| `<mark>` | Highlighted/relevant text | `Results for <mark>search term</mark>` |
| `<address>` | Contact information | `<address>123 Main St, City</address>` |
| `<blockquote>` | Block quotation | `<blockquote cite="https://..."><p>Quote</p></blockquote>` |
| `<figure>` / `<figcaption>` | Self-contained illustration | See example below |

```html
<!-- Figure with caption -->
<figure>
  <img src="chart.png" alt="Bar chart showing quarterly revenue growth from Q1 to Q4 2024" width="600" height="400">
  <figcaption>Quarterly revenue growth in 2024 for {{SITE_NAME}}.</figcaption>
</figure>
```

---

## When NOT to Use Semantic Elements

| Situation | Use Instead | Reason |
|---|---|---|
| Generic wrapper for styling | `<div>` | No semantic meaning needed |
| Generic inline wrapper | `<span>` | No semantic meaning needed |
| Section without a heading | `<div>` | `<section>` requires a heading |
| Decorative container | `<div>` | Not a content section |
| Layout grid/flex container | `<div>` | Structural, not semantic |

```html
<!-- div is correct here — it's a layout container -->
<div class="grid grid-cols-3">
  <article>...</article>
  <article>...</article>
  <article>...</article>
</div>
```

---

## Semantic Structure Checklist

- [ ] Every page has `<header>`, `<main>`, `<footer>` landmarks
- [ ] Exactly one `<main>` per page
- [ ] All `<nav>` elements have unique `aria-label`
- [ ] Exactly one `<h1>` per page
- [ ] Heading hierarchy has no skipped levels
- [ ] `<article>` used for self-contained, distributable content
- [ ] `<section>` always paired with a heading
- [ ] `<aside>` used only for tangentially related content
- [ ] Inline semantic elements used correctly (`<strong>`, `<em>`, `<time>`, etc.)
- [ ] `<div>` used only for non-semantic grouping
- [ ] Structured data present on key page types
- [ ] Document outline validated with heading audit tool
