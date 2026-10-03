# Phase 1: Stylesheet Quality Assessment

**Dependencies:** None

**Can be implemented in parallel with:** Phase 2 (Goals)

## Overview

Audit the current state of `{{PROJECT_NAME}}` stylesheets to catalog technical debt, identify patterns that need improvement, and establish a baseline for measuring refactoring progress. Every finding should be quantified where possible.

---

## 1.1 Automated Stylesheet Audit

Run these commands to collect baseline metrics:

```bash
# Count !important declarations across the project
rg "!important" {{STYLES_DIR}} --type css -c

# Count ID selectors used for styling
rg "#[a-zA-Z][\w-]*\s*[,{]" {{STYLES_DIR}} --type css -c

# Find deeply nested selectors (4+ levels in source)
rg "^\s{12,}" {{STYLES_DIR}} --type css -c

# Count hard-coded colour values
rg "(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\()" {{STYLES_DIR}} --type css -c

# Count hard-coded pixel values (likely should be tokens)
rg ":\s*\d+px" {{STYLES_DIR}} --type css | grep -v "0px\|1px" | wc -l

# Find duplicate property-value pairs across files
rg "background-color:" {{STYLES_DIR}} --type css
rg "font-size:" {{STYLES_DIR}} --type css

# Count total CSS lines
find {{STYLES_DIR}} -name "*.css" -exec cat {} + | wc -l

# Count stylelint warnings
npx stylelint "{{STYLES_DIR}}/**/*.css" 2>&1 | grep "✖" | tail -1

# List all stylelint warning categories
npx stylelint "{{STYLES_DIR}}/**/*.css" 2>&1 | grep "⚠\|✖" | sort | uniq -c | sort -rn

# Find the largest files
find {{STYLES_DIR}} -name "*.css" -exec wc -l {} + | sort -rn | head -20

# Check for @layer usage
rg "@layer" {{STYLES_DIR}} --type css

# Count custom properties defined vs hard-coded values
rg "^--" {{STYLES_DIR}} --type css -c
rg "var\(--" {{STYLES_DIR}} --type css -c

# Find vendor prefixes (potentially outdated)
rg "-(webkit|moz|ms|o)-" {{STYLES_DIR}} --type css -c
```

**Checklist:**

- [ ] Record baseline `!important` count: ___
- [ ] Record baseline ID selector count: ___
- [ ] Record baseline hard-coded colour count: ___
- [ ] Record baseline hard-coded px count: ___
- [ ] Record baseline stylelint warning count: ___
- [ ] Record baseline vendor prefix count: ___
- [ ] Record whether @layer is used: ___
- [ ] List all files exceeding 300 lines

---

## 1.2 Technical Debt Inventory

Document each finding in this table format:

| # | Category | Location | Description | Severity | Effort |
|---|----------|----------|-------------|----------|--------|
| 1 | Specificity | `{{STYLES_DIR}}/{{COMPONENT_NAME}}.css:42` | Uses `#header` ID selector for styling | High | Low |
| 2 | !important | `{{STYLES_DIR}}/{{COMPONENT_NAME}}.css:87` | `!important` to override third-party styles | High | Medium |
| 3 | Hard-coded | `{{STYLES_DIR}}/{{COMPONENT_NAME}}.css:15` | Uses `#3366cc` instead of custom property | Medium | Low |
| 4 | File size | `{{STYLES_DIR}}/{{COMPONENT_NAME}}.css` | 500+ lines, mixes layout and components | Medium | Medium |
| 5 | Duplication | `{{STYLES_DIR}}/` (multiple files) | Same border-radius value in 12 files | Medium | Low |
| 6 | Vendor prefix | `{{STYLES_DIR}}/{{COMPONENT_NAME}}.css:30` | `-webkit-` prefix no longer needed | Low | Low |

**Severity Guide:**

- **Critical**: Causes visual bugs or blocks other work (e.g., !important cascade conflicts)
- **High**: Creates maintenance burden (e.g., ID selectors, specificity wars)
- **Medium**: Reduces code quality but functional (e.g., hard-coded values, large files)
- **Low**: Cosmetic or minor (e.g., vendor prefixes, dead code)

---

## 1.3 Specificity Audit

```bash
# Map the specificity landscape
# Find the highest-specificity selectors in the project
rg "^[^/].*\{" {{STYLES_DIR}} --type css | head -50
```

Categorise selectors by specificity level:

| Specificity Range | Count | Example Selectors | Action Needed |
|-------------------|-------|-------------------|---------------|
| 1-0-0+ (IDs) | ___ | `#header`, `#main-nav` | Replace with classes |
| 0-4-0+ (4+ classes) | ___ | `.page .section .list .item` | Flatten with BEM |
| 0-3-0 (3 classes) | ___ | `.nav .item .link` | Acceptable or flatten |
| 0-2-0 (2 classes) | ___ | `.card .title` | Acceptable |
| 0-1-0 (1 class) | ___ | `.button` | Ideal |

---

## 1.4 Custom Property Coverage

```bash
# Find values that should be custom properties but aren't
# Colours used more than once that aren't custom properties
rg "#[0-9a-fA-F]{3,8}" {{STYLES_DIR}} --type css -o | sort | uniq -c | sort -rn | head -20

# Font sizes used directly
rg "font-size:\s*[0-9]" {{STYLES_DIR}} --type css | head -20

# Spacing values used directly
rg "(padding|margin|gap):\s*[0-9]" {{STYLES_DIR}} --type css | head -20
```

Document the current token coverage:

| Category | Tokenised | Hard-coded | Coverage |
|----------|-----------|------------|----------|
| Colours | ___ | ___ | ___% |
| Spacing | ___ | ___ | ___% |
| Typography | ___ | ___ | ___% |
| Borders/Radius | ___ | ___ | ___% |
| Shadows | ___ | ___ | ___% |

---

## 1.5 Responsive Design Audit

```bash
# Count media queries
rg "@media" {{STYLES_DIR}} --type css -c

# Find inconsistent breakpoint values
rg "@media.*width" {{STYLES_DIR}} --type css -o | sort | uniq -c | sort -rn

# Check for container query usage
rg "@container" {{STYLES_DIR}} --type css -c

# Check for mobile-first vs desktop-first patterns
rg "max-width" {{STYLES_DIR}} --type css -c  # desktop-first
rg "min-width" {{STYLES_DIR}} --type css -c  # mobile-first
```

---

## Checklist

- [ ] All automated audit commands have been run
- [ ] Technical debt inventory table is populated
- [ ] Specificity landscape is documented
- [ ] Custom property coverage is measured
- [ ] Responsive design patterns are documented
- [ ] !important declarations are cataloged with locations
- [ ] Hard-coded values are identified and counted
- [ ] Baseline metrics are recorded for future comparison
- [ ] Findings are prioritised by severity

## Verification

```bash
# Ensure the project builds in its current state before starting
stylelint .
pnpm build
```

All findings should be documented before proceeding to Phase 2 (Goals).
