# Phase 3 · Graceful Degradation

## Objective

Establish progressive enhancement and graceful degradation patterns for **{{PROJECT_NAME}}** so that core content and functionality remain accessible when JavaScript is disabled, images fail to load, or browser features are unavailable.

---

## Progressive Enhancement Principles

1. **Content first** — HTML delivers all essential content without CSS or JavaScript
2. **Enhance progressively** — CSS adds layout and visual design; JavaScript adds interactivity
3. **Degrade gracefully** — when a feature is unavailable, the user still completes the task
4. **No blank pages** — a user with JavaScript disabled must still see and navigate content

---

## `<noscript>` Fallbacks

### When to Use `<noscript>`

Provide `<noscript>` content when JavaScript is required for critical functionality:

```html
<!-- Global noscript message (in <head> or top of <body>) -->
<noscript>
  <div class="noscript-banner" role="alert">
    <p>
      {{SITE_NAME}} works best with JavaScript enabled.
      Some interactive features may not be available.
      <a href="https://enable-javascript.com/">Learn how to enable JavaScript</a>.
    </p>
  </div>
</noscript>

<!-- Alternative styling when JS is unavailable -->
<noscript>
  <style>
    /* Show elements hidden by JS-dependent interactions */
    .js-hidden { display: block !important; }
    .accordion__panel { display: block !important; }
    .tabs__panel { display: block !important; }
    [hidden] { display: block !important; }
  </style>
</noscript>
```

### Interactive Component Fallbacks

```html
<!-- Accordion: content visible without JS -->
<div class="accordion" data-accordion>
  <div class="accordion__item">
    <h3 class="accordion__heading">
      <!-- Without JS: plain heading, content visible below -->
      <!-- With JS: button with expand/collapse behaviour -->
      <button
        class="accordion__trigger"
        aria-expanded="false"
        aria-controls="panel-1"
      >
        Section Title
      </button>
    </h3>
    <!-- Without JS: visible. With JS: toggled by button -->
    <div id="panel-1" class="accordion__panel">
      <p>Panel content is visible by default without JavaScript.</p>
    </div>
  </div>
</div>

<noscript>
  <style>
    .accordion__panel { display: block !important; }
    .accordion__trigger { cursor: default; }
  </style>
</noscript>

<!-- Tabs: all panels visible without JS -->
<div class="tabs" data-tabs>
  <div role="tablist" aria-label="Content tabs">
    <button role="tab" aria-selected="true" aria-controls="tab-panel-1">Tab 1</button>
    <button role="tab" aria-selected="false" aria-controls="tab-panel-2">Tab 2</button>
  </div>
  <div id="tab-panel-1" role="tabpanel">
    <h2>Tab 1 Content</h2>
    <p>This content is visible with or without JavaScript.</p>
  </div>
  <div id="tab-panel-2" role="tabpanel">
    <h2>Tab 2 Content</h2>
    <p>This content is visible by default; JS hides inactive panels.</p>
  </div>
</div>
```

---

## Image Fallbacks

### Responsive Images with `<picture>` and `srcset`

```html
<!-- Art direction: different crops for different viewports -->
<picture>
  <source
    media="(min-width: 1024px)"
    srcset="{{BASE_URL}}/assets/images/hero-desktop.webp"
    type="image/webp"
  >
  <source
    media="(min-width: 1024px)"
    srcset="{{BASE_URL}}/assets/images/hero-desktop.jpg"
    type="image/jpeg"
  >
  <source
    media="(min-width: 640px)"
    srcset="{{BASE_URL}}/assets/images/hero-tablet.webp"
    type="image/webp"
  >
  <source
    media="(min-width: 640px)"
    srcset="{{BASE_URL}}/assets/images/hero-tablet.jpg"
    type="image/jpeg"
  >
  <!-- Fallback: always loads if no <source> matches -->
  <img
    src="{{BASE_URL}}/assets/images/hero-mobile.jpg"
    alt="Team collaborating at {{SITE_NAME}} headquarters"
    width="800"
    height="450"
    loading="eager"
    fetchpriority="high"
  >
</picture>

<!-- Resolution switching: same image, different sizes -->
<img
  src="{{BASE_URL}}/assets/images/product.jpg"
  srcset="
    {{BASE_URL}}/assets/images/product-400w.jpg 400w,
    {{BASE_URL}}/assets/images/product-800w.jpg 800w,
    {{BASE_URL}}/assets/images/product-1200w.jpg 1200w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Stainless steel widget product photo"
  width="800"
  height="600"
  loading="lazy"
>
```

### Broken Image Fallback

```html
<!-- Alt text serves as fallback when images fail to load -->
<img
  src="{{BASE_URL}}/assets/images/team-photo.jpg"
  alt="The {{SITE_NAME}} team of 12 people standing in the office lobby"
  width="1200"
  height="800"
  loading="lazy"
  onerror="this.style.display='none'; this.nextElementSibling.hidden=false;"
>
<p hidden class="image-fallback">
  [Image: The {{SITE_NAME}} team of 12 people standing in the office lobby]
</p>
```

---

## Lazy Loading

### Native Lazy Loading

```html
<!-- Below-the-fold images: use loading="lazy" -->
<img
  src="product.jpg"
  alt="Product description"
  width="400"
  height="300"
  loading="lazy"
  decoding="async"
>

<!-- Above-the-fold images: load eagerly -->
<img
  src="hero.jpg"
  alt="Hero description"
  width="1200"
  height="630"
  loading="eager"
  fetchpriority="high"
>

<!-- Iframes: lazy load off-screen embeds -->
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="Video title"
  width="560"
  height="315"
  loading="lazy"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
```

### Lazy Loading Support Detection

```html
<!-- For browsers that do not support loading="lazy" -->
<!-- The image loads normally — no broken experience -->
<!-- Progressive enhancement: modern browsers defer loading -->

<!-- Optional: intersection observer polyfill for lazy loading JS -->
<script>
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported — do nothing
  } else {
    // Fallback: load a lazy loading library
    const script = document.createElement('script');
    script.src = '{{BASE_URL}}/assets/js/lazy-load-polyfill.js';
    document.body.appendChild(script);
  }
</script>
```

---

## Form Fallbacks

### JavaScript Validation Fallback

```html
<!-- HTML5 validation works without JavaScript -->
<form action="/api/contact" method="POST">
  <label for="email">Email (required)</label>
  <input
    type="email"
    id="email"
    name="email"
    required
    autocomplete="email"
    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
  >
  <!-- HTML5 constraint validation provides fallback messaging -->

  <label for="message">Message (required)</label>
  <textarea
    id="message"
    name="message"
    required
    minlength="10"
    maxlength="1000"
  ></textarea>

  <!-- Submit button works without JavaScript -->
  <button type="submit">Send Message</button>
</form>

<!-- Fetch/XHR enhancement layer (JS adds this) -->
<!-- Without JS: form submits normally with page reload -->
<!-- With JS: form submits via fetch with inline feedback -->
```

### AJAX-Dependent Content Fallback

```html
<!-- Server-rendered content as base, JS enhances with live updates -->
<section aria-label="Latest posts" id="latest-posts">
  <!-- Server-rendered list — works without JS -->
  <article>
    <h3><a href="/blog/post-1/">First Post</a></h3>
    <p>Post excerpt...</p>
  </article>
  <article>
    <h3><a href="/blog/post-2/">Second Post</a></h3>
    <p>Post excerpt...</p>
  </article>

  <!-- JS may replace/update this list dynamically -->
</section>
```

---

## CSS Feature Fallbacks

```html
<!-- Use @supports in CSS, but HTML structure should not depend on CSS features -->

<!-- Example: grid with flexbox fallback (CSS concern, but HTML remains the same) -->
<div class="product-grid">
  <article class="product-card">...</article>
  <article class="product-card">...</article>
  <article class="product-card">...</article>
</div>

<!-- The HTML is identical regardless of CSS support -->
<!-- CSS handles the fallback: -->
<!--
.product-grid {
  display: flex;
  flex-wrap: wrap;
}
@supports (display: grid) {
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}
-->
```

---

## Graceful Degradation Checklist

- [ ] All pages render meaningful content without JavaScript
- [ ] `<noscript>` message present for JS-dependent features
- [ ] Interactive components (accordion, tabs, modal) show content without JS
- [ ] Images use `<picture>` or `srcset` for responsive delivery
- [ ] All images have meaningful `alt` text as fallback
- [ ] Below-the-fold images use `loading="lazy"`
- [ ] Above-the-fold images use `loading="eager"` and `fetchpriority="high"`
- [ ] Forms submit via standard HTTP POST without JavaScript
- [ ] HTML5 form validation provides baseline validation
- [ ] Server-rendered content available before JS hydration
- [ ] No blank pages when CSS or JavaScript fails to load
- [ ] Fallback patterns documented for all interactive components
