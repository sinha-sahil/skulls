# Phase 6 · Security

## Objective

Define HTML-level security practices for **{{PROJECT_NAME}}** covering Content Security Policy meta tags, safe link attributes, form security, input validation, iframe sandboxing, and referrer policy.

---

## Content Security Policy (CSP)

### Meta Tag CSP

For projects without server-level header configuration, use the CSP meta tag:

```html
<head>
  <meta
    http-equiv="Content-Security-Policy"
    content="
      default-src 'self';
      script-src 'self' https://www.googletagmanager.com;
      style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https://cdn.example.com;
      connect-src 'self' https://api.example.com;
      frame-src https://www.youtube.com https://www.google.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'self';
    "
  >
</head>
```

### CSP Directive Reference

| Directive | Purpose | Recommended Value |
|---|---|---|
| `default-src` | Fallback for unspecified directives | `'self'` |
| `script-src` | JavaScript sources | `'self'` + trusted CDNs |
| `style-src` | Stylesheet sources | `'self'` + `'unsafe-inline'` (if needed for critical CSS) |
| `img-src` | Image sources | `'self' data:` + trusted CDNs |
| `font-src` | Font sources | `'self'` + font CDNs |
| `connect-src` | Fetch/XHR/WebSocket destinations | `'self'` + API domains |
| `frame-src` | Iframe sources | Specific trusted domains only |
| `object-src` | Plugin content (Flash, etc.) | `'none'` |
| `base-uri` | Restricts `<base>` tag | `'self'` |
| `form-action` | Restricts form submission targets | `'self'` |
| `frame-ancestors` | Controls who can embed this page | `'self'` or `'none'` |

### CSP Violation Reporting

```html
<!-- Report-only mode for testing (does not block) -->
<meta
  http-equiv="Content-Security-Policy-Report-Only"
  content="default-src 'self'; report-uri /api/csp-report;"
>
```

> **Note:** CSP meta tags do not support `report-uri` or `report-to`. Use HTTP headers for violation reporting in production.

---

## Safe Link Attributes

### `rel="noopener"` and `rel="noreferrer"`

```html
<!-- External links: prevent the opened page from accessing window.opener -->
<a href="https://external-site.com" target="_blank" rel="noopener noreferrer">
  External Site
  <span class="sr-only">(opens in new tab)</span>
</a>

<!-- Internal links: no rel needed when same origin, no target="_blank" -->
<a href="/about/">About</a>

<!-- User-generated links: always add rel="noopener noreferrer ugc" -->
<a href="https://user-submitted-link.com" target="_blank" rel="noopener noreferrer ugc">
  User-submitted link
</a>
```

**Rules:**
- Every `target="_blank"` link must have `rel="noopener"` (prevents reverse tabnabbing)
- Add `rel="noreferrer"` for external links to prevent referrer leaking
- Add `rel="ugc"` (user-generated content) for links from user submissions
- Add `rel="sponsored"` for paid/affiliate links
- Always indicate to users when a link opens in a new tab (screen reader text)

### Link Security Checklist

```html
<!-- Safe external link pattern -->
<a
  href="https://external-site.com"
  target="_blank"
  rel="noopener noreferrer"
>
  Visit External Site
  <span class="sr-only">(opens in new tab)</span>
</a>

<!-- Download link with type hint -->
<a
  href="{{BASE_URL}}/files/report.pdf"
  download="report.pdf"
  type="application/pdf"
>
  Download Report (PDF, 2.4 MB)
</a>
```

---

## Form Security

### Action Attribute Security

```html
<!-- Form actions must use HTTPS -->
<form action="https://{{BASE_URL}}/api/contact" method="POST">
  <!-- Never submit to HTTP endpoints -->
  <!-- ✗ <form action="http://example.com/api"> -->

  <!-- Use POST for data submission, GET only for searches -->
  <!-- ✗ <form action="/api/register" method="GET"> -->
</form>

<!-- CSRF protection (server-rendered token) -->
<form action="/api/contact" method="POST">
  <input type="hidden" name="_csrf" value="{{CSRF_TOKEN}}">
  <!-- Form fields -->
  <button type="submit">Submit</button>
</form>
```

### Input Validation Attributes

HTML5 provides client-side validation as a first line of defence (server-side validation is still required):

```html
<!-- Email validation -->
<input
  type="email"
  name="email"
  required
  autocomplete="email"
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
>

<!-- Password with constraints -->
<input
  type="password"
  name="password"
  required
  minlength="8"
  maxlength="128"
  autocomplete="new-password"
  aria-describedby="password-requirements"
>
<p id="password-requirements">
  Password must be at least 8 characters.
</p>

<!-- URL validation -->
<input
  type="url"
  name="website"
  pattern="https?://.*"
  placeholder="https://example.com"
>

<!-- Numeric input with range -->
<input
  type="number"
  name="quantity"
  min="1"
  max="100"
  step="1"
  value="1"
>

<!-- Telephone (pattern for format) -->
<input
  type="tel"
  name="phone"
  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
  placeholder="123-456-7890"
  autocomplete="tel"
>

<!-- Textarea with length limits -->
<textarea
  name="message"
  required
  minlength="10"
  maxlength="5000"
  rows="5"
></textarea>
```

### Autocomplete Security

```html
<!-- Use appropriate autocomplete values -->
<input type="text" name="name" autocomplete="name">
<input type="email" name="email" autocomplete="email">
<input type="tel" name="phone" autocomplete="tel">

<!-- Disable autocomplete for sensitive one-time fields -->
<input type="text" name="otp" autocomplete="one-time-code">

<!-- Credit card fields — use specific autocomplete tokens -->
<input type="text" name="cc-number" autocomplete="cc-number">
<input type="text" name="cc-exp" autocomplete="cc-exp">
<input type="text" name="cc-csc" autocomplete="cc-csc">
```

---

## Iframe Sandboxing

```html
<!-- Restrictive sandbox — start with empty, add only what's needed -->
<iframe
  src="https://trusted-embed.com/widget"
  title="Descriptive title for the embed"
  sandbox="allow-scripts allow-same-origin"
  loading="lazy"
  width="600"
  height="400"
></iframe>

<!-- YouTube embed — needs scripts and same-origin -->
<iframe
  src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
  title="Video: Descriptive title"
  sandbox="allow-scripts allow-same-origin allow-presentation"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
  loading="lazy"
  width="560"
  height="315"
></iframe>
```

### Sandbox Attribute Values

| Value | Allows | Use When |
|---|---|---|
| (empty string) | Nothing — maximum restriction | Displaying static HTML content |
| `allow-scripts` | JavaScript execution | Embed requires interactivity |
| `allow-same-origin` | Same-origin access | Embed needs cookies/storage |
| `allow-forms` | Form submission | Embed contains forms |
| `allow-popups` | `window.open()` / `target="_blank"` | Embed opens new windows |
| `allow-presentation` | Presentation API (fullscreen) | Video embeds |
| `allow-downloads` | File downloads | Embed triggers downloads |

**Rules:**
- Always use `sandbox` on third-party iframes
- Start with empty `sandbox=""` and add only required permissions
- Use `youtube-nocookie.com` instead of `youtube.com` for privacy
- Never use `allow-top-navigation` unless absolutely necessary (risk of redirect attacks)

---

## Referrer Policy

```html
<!-- Site-wide referrer policy -->
<meta name="referrer" content="strict-origin-when-cross-origin">

<!-- Per-link referrer policy -->
<a
  href="https://external-site.com"
  referrerpolicy="no-referrer"
  rel="noopener noreferrer"
>
  External link
</a>

<!-- Per-image referrer policy -->
<img
  src="https://cdn.example.com/image.jpg"
  alt="Description"
  referrerpolicy="no-referrer"
>
```

| Policy | Behaviour |
|---|---|
| `no-referrer` | Never send referrer header |
| `strict-origin-when-cross-origin` | Full URL to same origin, origin only to cross-origin (HTTPS→HTTPS), nothing to downgrade (HTTPS→HTTP) |
| `same-origin` | Full URL to same origin, nothing to cross-origin |
| `origin` | Send origin only, never full URL |

**Recommended default:** `strict-origin-when-cross-origin`

---

## Additional Security Headers (via Meta Tags)

```html
<head>
  <!-- Prevent MIME type sniffing -->
  <!-- Note: best set as HTTP header, but meta tag works for static sites -->
  <meta http-equiv="X-Content-Type-Options" content="nosniff">

  <!-- Control iframe embedding of this page -->
  <!-- Use CSP frame-ancestors instead when possible -->
  <meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
</head>
```

---

## Security Checklist

- [ ] Content Security Policy meta tag configured
- [ ] CSP tested in report-only mode before enforcement
- [ ] All `target="_blank"` links have `rel="noopener noreferrer"`
- [ ] User-generated links include `rel="ugc"`
- [ ] Form actions use HTTPS only
- [ ] CSRF tokens included in all state-changing forms
- [ ] HTML5 validation attributes on all form inputs
- [ ] Autocomplete attributes set correctly
- [ ] All third-party iframes use `sandbox` attribute
- [ ] YouTube embeds use `youtube-nocookie.com`
- [ ] Referrer policy set (`strict-origin-when-cross-origin`)
- [ ] No inline JavaScript in HTML (use external scripts)
- [ ] No `javascript:` URLs in `href` attributes
- [ ] Security headers configured (server or meta tags)
