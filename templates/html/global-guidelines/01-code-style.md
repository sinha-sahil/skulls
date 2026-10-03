# Phase 1 · Code Style

## Objective

Establish consistent HTML code style rules for **{{PROJECT_NAME}}** covering formatting, attribute conventions, and document boilerplate.

---

## Document Boilerplate

Every HTML page must begin with the following structure:

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{{PAGE_DESCRIPTION}}">
  <title>{{PAGE_TITLE}} — {{SITE_NAME}}</title>

  <!-- Preconnect to critical origins -->
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>

  <!-- Stylesheets -->
  <link rel="stylesheet" href="{{BASE_URL}}/assets/css/main.css">
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Page content -->

  <script src="{{BASE_URL}}/assets/js/main.js" type="module"></script>
</body>
</html>
```

### Required Document Elements

| Element | Required | Rule |
|---|---|---|
| `<!DOCTYPE html>` | Yes | Always HTML5 doctype, lowercase |
| `<html lang="...">` | Yes | Always include `lang` attribute with correct BCP 47 code |
| `<html dir="...">` | Conditional | Include `dir="rtl"` for RTL languages, `dir="ltr"` otherwise |
| `<meta charset="UTF-8">` | Yes | Must be first element inside `<head>` |
| `<meta name="viewport">` | Yes | `width=device-width, initial-scale=1.0` |
| `<title>` | Yes | Every page must have a unique, descriptive title |
| `<meta name="description">` | Yes | Every page must have a meta description |

---

## Indentation

- Use **2 spaces** for indentation (not tabs)
- Indent child elements one level from their parent
- Do not indent `<html>`, `<head>`, or `<body>` from the document root

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{PAGE_TITLE}} — {{SITE_NAME}}</title>
</head>
<body>
  <header>
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about/">About</a></li>
      </ul>
    </nav>
  </header>

  <main id="main-content">
    <h1>{{PAGE_TITLE}}</h1>
    <p>Content paragraph.</p>
  </main>
</body>
</html>
```

---

## Attribute Ordering

Attributes should appear in a consistent order for readability:

```html
<element
  id="..."
  class="..."
  data-*="..."
  src="..." / href="..."
  type="..."
  name="..."
  value="..."
  required / disabled / hidden
  aria-*="..."
  role="..."
  style="..."  <!-- Avoid inline styles -->
>
```

**Attribute order priority:**

1. **Identification:** `id`, `class`
2. **Data attributes:** `data-*`
3. **Source/link:** `src`, `href`, `action`, `for`
4. **Type/metadata:** `type`, `name`, `value`, `method`
5. **Content:** `alt`, `title`, `placeholder`, `content`
6. **Dimensions:** `width`, `height`
7. **Loading:** `loading`, `decoding`, `fetchpriority`
8. **Boolean attributes:** `required`, `disabled`, `hidden`, `readonly`, `checked`, `open`
9. **Accessibility:** `aria-*`, `role`, `tabindex`
10. **Style:** `style` (avoid — use classes instead)

```html
<!-- Example: well-ordered attributes -->
<input
  id="search-input"
  class="form-input"
  data-autofocus="true"
  type="search"
  name="q"
  placeholder="Search {{SITE_NAME}}..."
  required
  aria-label="Search"
  aria-describedby="search-help"
>

<img
  id="hero-image"
  class="hero__image"
  src="{{BASE_URL}}/assets/images/hero.jpg"
  alt="Team collaborating on a project"
  width="1200"
  height="630"
  loading="eager"
  fetchpriority="high"
>
```

---

## Void Elements

Void elements must NOT have a closing tag or self-closing slash:

```html
<!-- Correct — no closing slash -->
<br>
<hr>
<img src="photo.jpg" alt="Description">
<input type="text" name="field">
<meta charset="UTF-8">
<link rel="stylesheet" href="main.css">

<!-- Incorrect — do not use self-closing slash -->
<br />         <!-- ✗ -->
<img ... />    <!-- ✗ -->
<input ... />  <!-- ✗ -->
```

**Complete list of void elements:**
`<area>`, `<base>`, `<br>`, `<col>`, `<embed>`, `<hr>`, `<img>`, `<input>`, `<link>`, `<meta>`, `<param>`, `<source>`, `<track>`, `<wbr>`

---

## Quoting and Casing

| Convention | Rule | Example |
|---|---|---|
| Attribute quotes | Always double quotes | `class="card"` not `class='card'` |
| Tag names | Always lowercase | `<section>` not `<Section>` |
| Attribute names | Always lowercase | `tabindex="0"` not `tabIndex="0"` |
| Boolean attributes | No value needed | `required` not `required="required"` |
| Custom data attributes | kebab-case | `data-item-count="5"` |

```html
<!-- Correct -->
<button class="btn" data-action="submit" disabled>Submit</button>

<!-- Incorrect -->
<Button Class='btn' data-action='submit' disabled="disabled">Submit</Button>
```

---

## Whitespace and Line Length

| Rule | Convention |
|---|---|
| Maximum line length | 120 characters (soft limit) |
| Trailing whitespace | Remove all trailing whitespace |
| Final newline | Files must end with a single newline |
| Blank lines | One blank line between major sections |
| Attribute wrapping | Wrap to next line if element exceeds line length |

```html
<!-- Single line — within limit -->
<a href="/about/" class="nav-link">About</a>

<!-- Multi-line — exceeds limit, wrap attributes -->
<img
  id="product-image"
  class="product__image"
  src="{{BASE_URL}}/assets/images/products/widget-large.jpg"
  alt="Stainless steel widget with ergonomic handle"
  width="800"
  height="600"
  loading="lazy"
>
```

---

## Comments

```html
<!-- Single-line comment: describe what follows -->
<header>
  <!-- Main navigation -->
  <nav aria-label="Main navigation">...</nav>
</header>

<!-- Section boundary markers for long documents -->
<!-- ====== Hero Section ====== -->
<section class="hero">...</section>
<!-- ====== /Hero Section ====== -->

<!-- TODO comments for unfinished work -->
<!-- TODO: Add structured data for blog posts -->

<!-- Do NOT use comments for: -->
<!-- Closing tag identification (use indentation instead) -->
<!-- </div> ← end of header → ✗ Unnecessary -->
```

---

## Code Style Checklist

- [ ] HTML5 doctype on every page (`<!DOCTYPE html>`)
- [ ] `lang` attribute on `<html>` element
- [ ] `<meta charset="UTF-8">` as first element in `<head>`
- [ ] Viewport meta tag present
- [ ] 2-space indentation consistently applied
- [ ] Attribute ordering follows defined priority
- [ ] Void elements have no closing slash
- [ ] Double quotes on all attributes
- [ ] Lowercase tags and attributes
- [ ] Boolean attributes without values
- [ ] Line length under 120 characters
- [ ] Files end with a single newline
- [ ] Comment style consistent across codebase
- [ ] HTMLHint configured to enforce these rules
