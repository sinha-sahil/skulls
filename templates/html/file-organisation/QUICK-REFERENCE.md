# File Organisation - Quick Reference

## Placeholder Reference

| Variable | Example | Description |
|----------|---------|-------------|
| `{{PROJECT_NAME}}` | `my-site` | Project name |
| `{{SITE_NAME}}` | `My Website` | Site display name |
| `{{BASE_URL}}` | `https://example.com` | Base URL |
| `{{SRC_DIR}}` | `src/` | Source directory |
| `{{DIST_DIR}}` | `dist/` | Build output directory |
| `{{ASSETS_DIR}}` | `assets/` | Static assets directory |

---

## Common HTML Project Structure

```text
{{PROJECT_NAME}}/
├── {{SRC_DIR}}
│   ├── pages/              # Full page templates
│   │   ├── index.html
│   │   ├── about.html
│   │   └── contact.html
│   ├── layouts/            # Shared page layouts
│   │   ├── base.html
│   │   └── sidebar.html
│   └── partials/           # Reusable HTML fragments
│       ├── header.html
│       ├── footer.html
│       └── nav.html
├── {{ASSETS_DIR}}
│   ├── css/
│   ├── js/
│   ├── images/
│   └── fonts/
├── {{DIST_DIR}}            # Build output
└── package.json
```

---

## Decision Tree

```text
New HTML file needed?
├─ Full page → pages/
├─ Shared wrapper → layouts/
├─ Reusable fragment → partials/
├─ Stylesheet → assets/css/
├─ Script → assets/js/
├─ Image → assets/images/
└─ Font → assets/fonts/
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Pages | kebab-case | `about-us.html` |
| Layouts | descriptive kebab-case | `base-layout.html` |
| Partials | kebab-case, prefixed by area | `nav-main.html` |
| Images | kebab-case, descriptive | `hero-banner.webp` |
| IDs | camelCase | `id="mainContent"` |
| Classes | kebab-case or BEM | `class="card--featured"` |

---

## Checklist

- [ ] Audited current file structure
- [ ] Defined target directory layout
- [ ] Documented page, layout, and partial boundaries
- [ ] Established naming conventions
- [ ] Mapped asset loading and template dependencies
- [ ] Created incremental migration plan
- [ ] Validated HTML after each migration step
