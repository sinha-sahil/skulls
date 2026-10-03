# Phase 5 · Performance

## Objective

Define HTML-level performance optimisations for **{{PROJECT_NAME}}** covering resource hints, lazy loading, script loading strategies, critical rendering path, and Core Web Vitals.

---

## Core Web Vitals Targets

| Metric | Target | Measurement |
|---|---|---|
| Largest Contentful Paint (LCP) | < 2.5s | Time to render largest visible element |
| Cumulative Layout Shift (CLS) | < 0.1 | Visual stability during load |
| Interaction to Next Paint (INP) | < 200ms | Responsiveness to user input |
| First Contentful Paint (FCP) | < 1.8s | Time to first visible content |
| Time to First Byte (TTFB) | < 800ms | Server response time |

```bash
# Measure with Lighthouse
npx lighthouse {{BASE_URL}} --only-categories=performance --output=json

# Measure with Web Vitals library (add to pages)
```

```html
<!-- Web Vitals measurement script -->
<script type="module">
  import { onCLS, onINP, onLCP } from 'https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.js?module';

  function sendToAnalytics(metric) {
    console.log(metric.name, metric.value, metric.rating);
  }

  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
</script>
```

---

## Resource Hints

### Preconnect

Establish early connections to critical third-party origins:

```html
<head>
  <!-- DNS + TCP + TLS handshake for critical origins -->
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- DNS-only prefetch for less critical origins -->
  <link rel="dns-prefetch" href="https://www.googletagmanager.com">
  <link rel="dns-prefetch" href="https://cdn.example.com">
</head>
```

**Rules:**
- Use `preconnect` for origins that will be used within the first few seconds
- Limit to 2-4 preconnect hints (too many can hurt performance)
- Use `dns-prefetch` for origins used later or less critical
- Always include `crossorigin` attribute for CORS-enabled origins (fonts, APIs)

### Preload

Fetch critical resources early, before the browser discovers them naturally:

```html
<head>
  <!-- Preload critical font (used above the fold) -->
  <link
    rel="preload"
    href="{{BASE_URL}}/assets/fonts/main.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  >

  <!-- Preload LCP image (hero image) -->
  <link
    rel="preload"
    href="{{BASE_URL}}/assets/images/hero.jpg"
    as="image"
    fetchpriority="high"
  >

  <!-- Preload critical CSS (if loaded dynamically) -->
  <link
    rel="preload"
    href="{{BASE_URL}}/assets/css/critical.css"
    as="style"
  >
</head>
```

**Rules:**
- Preload only resources needed in the first render
- Always include `as` attribute for correct priority and CSP
- Include `type` for fonts to avoid downloading unsupported formats
- Limit preloads to 3-5 resources (excessive preloading is counterproductive)

### Prefetch

Fetch resources likely needed for the next navigation:

```html
<!-- Prefetch next likely page -->
<link rel="prefetch" href="{{BASE_URL}}/about/">

<!-- Prefetch resource needed on the next page -->
<link rel="prefetch" href="{{BASE_URL}}/assets/js/contact-form.js">
```

---

## Lazy Loading

### Image Lazy Loading

```html
<!-- Above the fold: eager loading, high priority -->
<img
  src="{{BASE_URL}}/assets/images/hero.jpg"
  alt="Hero banner for {{SITE_NAME}}"
  width="1200"
  height="630"
  loading="eager"
  fetchpriority="high"
  decoding="async"
>

<!-- Below the fold: lazy loading, auto priority -->
<img
  src="{{BASE_URL}}/assets/images/product.jpg"
  alt="Product description"
  width="400"
  height="300"
  loading="lazy"
  decoding="async"
>
```

**Rules:**
- First image in viewport (LCP candidate): `loading="eager"` + `fetchpriority="high"`
- All other images: `loading="lazy"`
- Always include `width` and `height` to prevent layout shift (CLS)
- Use `decoding="async"` for non-critical images

### Iframe Lazy Loading

```html
<!-- Lazy-load embedded content -->
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="Descriptive video title"
  width="560"
  height="315"
  loading="lazy"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>

<!-- Lazy-load maps -->
<iframe
  src="https://maps.googleapis.com/maps/embed?..."
  title="Map showing {{SITE_NAME}} office location"
  width="600"
  height="450"
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
></iframe>
```

---

## Script Loading Strategies

### Loading Attributes

| Attribute | Behaviour | Use Case |
|---|---|---|
| `<script>` (no attribute) | Blocks parsing, executes immediately | Critical inline scripts only |
| `<script defer>` | Downloads in parallel, executes after DOM parse, maintains order | Most scripts |
| `<script async>` | Downloads in parallel, executes as soon as ready (no order guarantee) | Analytics, ads, independent scripts |
| `<script type="module">` | Deferred by default, strict mode, supports import/export | Modern application code |
| `nomodule` | Only executed by browsers that do not support `type="module"` | Legacy polyfills |

```html
<!-- Recommended script loading pattern -->
<head>
  <!-- Critical inline script (e.g. theme detection) — minimal -->
  <script>
    document.documentElement.classList.replace('no-js', 'js');
  </script>
</head>
<body>
  <!-- Page content -->

  <!-- Main application — module, deferred by default -->
  <script src="{{BASE_URL}}/assets/js/main.js" type="module"></script>

  <!-- Legacy fallback — only loads in old browsers -->
  <script src="{{BASE_URL}}/assets/js/legacy.js" nomodule defer></script>

  <!-- Analytics — async, non-blocking, order-independent -->
  <script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX" async></script>

  <!-- Page-specific scripts — deferred -->
  <script src="{{BASE_URL}}/assets/js/contact-form.js" defer></script>
</body>
```

---

## Critical Rendering Path

### Inline Critical CSS

```html
<head>
  <!-- Critical CSS inlined — renders above-the-fold content immediately -->
  <style>
    /* Only include styles needed for first paint */
    /* Typically: layout, header, hero, typography basics */
    body { margin: 0; font-family: system-ui, sans-serif; }
    .skip-link { /* skip link styles */ }
    header { /* header styles */ }
    .hero { /* hero section styles */ }
  </style>

  <!-- Full stylesheet loaded asynchronously -->
  <link
    rel="preload"
    href="{{BASE_URL}}/assets/css/main.css"
    as="style"
    onload="this.onload=null;this.rel='stylesheet'"
  >
  <noscript>
    <link rel="stylesheet" href="{{BASE_URL}}/assets/css/main.css">
  </noscript>
</head>
```

### Preventing Layout Shift (CLS)

```html
<!-- Always specify dimensions on replaced elements -->
<img src="photo.jpg" alt="..." width="800" height="600">
<video width="640" height="360">...</video>
<iframe width="560" height="315">...</iframe>

<!-- Use aspect-ratio for responsive containers -->
<!-- CSS: .video-container { aspect-ratio: 16 / 9; } -->
<div class="video-container">
  <iframe src="..." title="..." loading="lazy"></iframe>
</div>

<!-- Reserve space for dynamic content -->
<div class="ad-slot" style="min-height: 250px;">
  <!-- Ad loads asynchronously -->
</div>

<!-- Specify font-display for custom fonts -->
<!-- CSS: @font-face { font-display: swap; } -->
```

---

## Performance Budget

| Resource Type | Budget | Current |
|---|---|---|
| HTML document size (gzipped) | < 50 KB | |
| Total page weight | < 1.5 MB | |
| Number of HTTP requests | < 30 | |
| DOM node count | < 1500 | |
| DOM depth | < 32 levels | |
| LCP element size | < 150 KB | |
| Third-party scripts | < 3 | |

---

## Performance Checklist

- [ ] Core Web Vitals targets defined (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- [ ] Preconnect hints for critical third-party origins (max 2-4)
- [ ] Preload hints for LCP image and critical font
- [ ] Below-the-fold images use `loading="lazy"`
- [ ] LCP image uses `loading="eager"` + `fetchpriority="high"`
- [ ] All images have `width` and `height` attributes
- [ ] Scripts use `type="module"`, `defer`, or `async` appropriately
- [ ] Critical CSS inlined in `<head>`
- [ ] Non-critical CSS loaded asynchronously
- [ ] No render-blocking scripts in `<head>`
- [ ] Performance budget established and monitored
- [ ] Lighthouse performance score ≥ 90
- [ ] Web Vitals measurement script in production
