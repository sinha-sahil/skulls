# Phase 1: Assessment

**Dependencies:** None

**Can be implemented in parallel with:** None (this must come first)

## Overview

Audit the current stylesheet structure of `{{PROJECT_NAME}}`. Identify pain points such as specificity conflicts, inconsistent naming, scattered design tokens, missing @layer usage, deeply nested selectors, and monolithic files. This assessment informs all subsequent phases.

---

## 1.1 Inventory Current Structure

Run these commands to get a snapshot of the current stylesheet layout:

```bash
# List all CSS files
find {{STYLES_DIR}} -name "*.css" | head -50

# Count files per directory
find {{STYLES_DIR}} -name "*.css" | xargs -I {} dirname {} | sort | uniq -c | sort -rn

# Find the largest files (likely candidates for splitting)
find {{STYLES_DIR}} -name "*.css" -exec wc -l {} + | sort -rn | head -20

# Count total CSS lines
find {{STYLES_DIR}} -name "*.css" -exec cat {} + | wc -l

# Show all @import statements to understand current load order
rg "@import" {{STYLES_DIR}} --type css
```

Record the output in a structured inventory:

```text
{{STYLES_DIR}}/
├── main.css              (XX lines)
├── reset.css             (XX lines)
├── variables.css         (XX lines)
├── {{COMPONENT_NAME}}.css (XX lines)
└── ...
```

## 1.2 Identify Pain Points

Evaluate each category and document specific findings:

### Specificity Issues

```bash
# Find ID selectors (high specificity, hard to override)
rg "#[a-zA-Z][\w-]*\s*\{" {{STYLES_DIR}} --type css

# Count !important usage
rg "!important" {{STYLES_DIR}} --type css -c

# Find deeply nested selectors (more than 3 levels)
rg "^\s+&" {{STYLES_DIR}} --type css -c
```

**Document findings:**

- [ ] List all ID selectors used for styling (not anchors)
- [ ] Count and location of every `!important` declaration
- [ ] Identify selectors exceeding 3 levels of nesting

### Scattered Design Tokens

```bash
# Find hard-coded colour values (hex, rgb, hsl, oklch)
rg "(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\()" {{STYLES_DIR}} --type css -c

# Find hard-coded spacing values (px values outside of 0 or 1px borders)
rg ":\s*\d{2,}px" {{STYLES_DIR}} --type css -c

# Check if custom properties are defined centrally
rg "^--" {{STYLES_DIR}} --type css
```

**Threshold:** More than 10 hard-coded colour values indicates a missing token system.

### @layer Usage

```bash
# Check for existing @layer declarations
rg "@layer" {{STYLES_DIR}} --type css

# Check @import order for implicit cascade dependencies
rg "@import" {{STYLES_DIR}}/{{ENTRY_FILE}}
```

### Large Files

**Threshold:** Stylesheets exceeding 300 lines likely need splitting.

```bash
find {{STYLES_DIR}} -name "*.css" -exec wc -l {} + | awk '$1 > 300' | sort -rn
```

### Duplicate Declarations

```bash
# Find duplicate property declarations across files
rg "background-color:" {{STYLES_DIR}} --type css -c | sort -t: -k2 -rn
rg "font-size:" {{STYLES_DIR}} --type css -c | sort -t: -k2 -rn
```

## 1.3 Stylesheet Responsibility Map

Document what each stylesheet is responsible for:

```text
| File | Responsibility | Dependencies | Line Count | Issues |
|------|---------------|--------------|------------|--------|
| reset.css | Browser reset | None | XX | None |
| variables.css | Custom properties | None | XX | Incomplete tokens |
| {{COMPONENT_NAME}}.css | {{COMPONENT_NAME}} styles | variables.css | XX | Too large |
| ... | ... | ... | ... | ... |
```

## 1.4 Current Import Graph

Map which stylesheets depend on which:

```text
{{ENTRY_FILE}}
├── reset.css
├── variables.css
├── base.css → [variables.css]
├── layouts.css → [variables.css]
├── components/
│   ├── {{COMPONENT_NAME}}.css → [variables.css, base.css]
│   └── ...
└── utilities.css → [variables.css]
```

## 1.5 Browser and Build Context

```bash
# Check browserslist configuration
cat .browserslistrc 2>/dev/null || rg "browserslist" package.json

# Check for PostCSS configuration
cat postcss.config.* 2>/dev/null

# Check for stylelint configuration
cat .stylelintrc* 2>/dev/null || rg "stylelint" package.json
```

- [ ] Document target browser support
- [ ] Document build pipeline (PostCSS, bundler, etc.)
- [ ] Document existing linting rules

---

## Checklist

- [ ] Ran file inventory commands and recorded output
- [ ] Counted lines per file and identified oversized files (>300 lines)
- [ ] Counted !important declarations and ID selectors
- [ ] Identified hard-coded values that should be tokens
- [ ] Checked for @layer usage (or lack thereof)
- [ ] Documented duplicate style declarations
- [ ] Created stylesheet responsibility map
- [ ] Mapped current @import dependency graph
- [ ] Documented browser support targets
- [ ] Documented build pipeline and tooling
- [ ] Prioritised issues by severity (blocking, major, minor)

## Verification

```bash
stylelint .
pnpm build
```

Verify the project builds as-is before making any changes. If it does not, fix build errors before proceeding.
