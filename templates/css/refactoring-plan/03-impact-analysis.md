# Phase 3: Impact Analysis

**Dependencies:** Phase 1 (Assessment), Phase 2 (Goals)

**Can be implemented in parallel with:** None (requires assessment and goals to be complete)

## Overview

Map every file, selector, and template reference affected by the planned refactoring of `{{PROJECT_NAME}}`. This analysis ensures no change is made blindly and every affected area is accounted for before execution begins.

---

## 3.1 Affected Files Inventory

For each refactoring goal, list every CSS file that will be modified:

```text
| Goal | Affected CSS Files | Line Count | Selectors Changed |
|------|--------------------|------------|-------------------|
| Remove ID selectors | {{STYLES_DIR}}/{{COMPONENT_NAME}}.css | XX | #header → .site-header |
| | {{STYLES_DIR}}/layout.css | XX | #sidebar → .sidebar |
| Adopt @layer | ALL files | XX total | Wrap in @layer {} |
| Migrate to tokens | {{STYLES_DIR}}/{{COMPONENT_NAME}}.css | XX | #333 → var(--color-text) |
| | ... | ... | ... |
```

## 3.2 HTML/Template Impact

Selector renames require updating HTML templates. Map every class and ID change:

```bash
# Find all references to ID selectors being replaced
rg "id=\"header\"" --type html --type svelte --type vue
rg "id=\"sidebar\"" --type html --type svelte --type vue

# Find all references to classes being renamed
rg "class=\".*{{OLD_PATTERN}}.*\"" --type html --type svelte --type vue

# Find dynamically applied classes in JavaScript
rg "\"{{OLD_PATTERN}}\"|'{{OLD_PATTERN}}'" --type js --type ts
rg "classList\.(add|remove|toggle).*{{OLD_PATTERN}}" --type js --type ts
```

### Selector Rename Map

```text
| Old Selector | New Selector | CSS Files | HTML/Template Files | JS Files |
|-------------|-------------|-----------|--------------------|---------| 
| #header | .site-header | _header.css | layout.html, header.svelte | nav.js |
| .header .nav .item a | .nav-link | _nav.css | nav.html | — |
| {{OLD_PATTERN}} | {{NEW_PATTERN}} | {{AFFECTED_FILES}} | ... | ... |
```

## 3.3 Specificity Impact Graph

Document how specificity changes will ripple through the cascade:

```css
/* Current cascade (specificity-dependent ordering) */
.nav a { color: var(--color-text); }          /* 0-1-1 */
.nav .link { color: var(--color-primary); }   /* 0-2-0 — overrides above */
.nav a:hover { color: blue; }                 /* 0-1-2 — overrides first */
.nav .link.active { color: red !important; }  /* 0-3-0 + !important */

/* Refactored cascade (@layer-dependent ordering) */
@layer base {
  a { color: var(--color-text); }                      /* 0-0-1 in base */
}
@layer components {
  .nav-link { color: var(--color-primary); }           /* 0-1-0 in components */
  .nav-link:hover { color: var(--color-primary-hover); } /* 0-1-1 in components */
  .nav-link[aria-current="page"] { color: var(--color-accent); } /* 0-2-0 in components */
}
```

**Risk areas:** Document selectors where lowering specificity might cause cascade order changes:

```text
| Selector Being Changed | Current Specificity | New Specificity | Risk |
|-----------------------|--------------------|-----------------| ---- |
| #header .nav | 1-1-0 | 0-1-0 (.site-nav) | May be overridden by other 0-1-0 |
| .card .title | 0-2-0 | 0-1-0 (.card__title) | Check for competing .title rules |
| {{OLD_PATTERN}} | X-X-X | X-X-X | ... |
```

## 3.4 Third-Party Style Conflicts

```bash
# Identify third-party CSS that may conflict
rg "@import.*node_modules" {{STYLES_DIR}} --type css
rg "url.*node_modules" {{STYLES_DIR}} --type css

# Check for styles targeting third-party component classes
rg "\.(swiper|slick|tippy|flatpickr)" {{STYLES_DIR}} --type css
```

Document third-party integration points:

```text
| Library | CSS Source | Our Overrides In | Strategy |
|---------|-----------|-----------------|----------|
| swiper | node_modules/swiper | _carousel.css | Move overrides to @layer vendor |
| ... | ... | ... | ... |
```

## 3.5 Critical Path Analysis

Identify which pages/components are highest risk for visual regressions:

```text
| Page/Component | Complexity | Traffic/Visibility | Risk Level | Test Priority |
|---------------|------------|-------------------|------------|---------------|
| Homepage hero | High (many overrides) | Highest | Critical | Screenshot test |
| Navigation | Medium | Highest | High | Screenshot test |
| {{COMPONENT_NAME}} | ... | ... | ... | ... |
```

## 3.6 Dependency Chain

Map the order in which changes must be made:

```text
1. Create token files (no dependencies)
2. Add @layer declaration to entry file (no dependencies)
3. Replace ID selectors (update HTML simultaneously)
4. Wrap existing rules in @layer (depends on #2)
5. Replace hard-coded values with tokens (depends on #1)
6. Remove !important (depends on #4 — @layer must be in place first)
7. Flatten selectors (depends on #3 — IDs removed first)
8. Clean up vendor prefixes (no dependencies, can run in parallel)
```

```text
Token files ──→ Hard-coded values ──→ Duplicate consolidation
                                         ↑
@layer setup ──→ Wrap rules ──→ Remove !important
                                         ↑
ID removal ──→ Flatten selectors ────────┘

Vendor prefixes ──→ (independent, any time)
```

---

## Checklist

- [ ] All affected CSS files listed per goal
- [ ] All affected HTML/template files identified
- [ ] All affected JavaScript files identified
- [ ] Selector rename map is complete
- [ ] Specificity impact has been analysed for cascade risks
- [ ] Third-party style conflicts documented
- [ ] Critical path (highest risk) pages/components identified
- [ ] Dependency chain between refactoring steps documented
- [ ] No file is missed (cross-reference with Phase 1 inventory)

## Verification

```bash
stylelint .
pnpm build
```

Impact analysis should be complete before proceeding to Phase 4 (Strategy).
