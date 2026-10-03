# Phase 5: Execution Plan

**Dependencies:** Phase 3 (Impact Analysis), Phase 4 (Strategy)

**Can be implemented in parallel with:** None (this is the step-by-step implementation guide)

## Overview

Ordered implementation steps for refactoring `{{PROJECT_NAME}}` stylesheets. Each step is atomic — the project must build and render correctly after every step. Follow the dependency chain from Phase 3 and apply the strategies from Phase 4.

---

## 5.1 Execution Rules

```text
1. ONE file per commit (or one logical change per commit)
2. Run `stylelint . && pnpm build` after EVERY change
3. Visual check after every change (compare to baseline screenshots)
4. If a step breaks the build, revert and investigate before retrying
5. Update HTML/template references in the SAME commit as CSS changes
6. Never leave the codebase in a broken state at end of day
```

## 5.2 Step 1: Foundation Setup

### 1a: Create Token Files

```bash
# Create settings directory and token files
mkdir -p {{STYLES_DIR}}/settings
```

```css
/* {{STYLES_DIR}}/settings/_colors.css */
@layer tokens {
  :root {
    /* Map existing hard-coded values to tokens */
    --color-primary: /* value from assessment */;
    --color-surface: /* value from assessment */;
    --color-text: /* value from assessment */;
    --color-text-muted: /* value from assessment */;
    --color-border: /* value from assessment */;
  }
}
```

```css
/* {{STYLES_DIR}}/settings/_spacing.css */
@layer tokens {
  :root {
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
  }
}
```

```bash
stylelint . && pnpm build
git add -A && git commit -m "feat: add design token files"
```

- [ ] Token files created
- [ ] Build passes
- [ ] Committed

### 1b: Add @layer Declaration to Entry File

```css
/* Add to the very top of {{STYLES_DIR}}/{{ENTRY_FILE}} */
@layer reset, base, tokens, layouts, components, utilities;

/* Import tokens */
@import "./settings/_colors.css" layer(tokens);
@import "./settings/_spacing.css" layer(tokens);
```

```bash
stylelint . && pnpm build
git add -A && git commit -m "feat: add @layer declaration and token imports"
```

- [ ] @layer order declared
- [ ] Token imports added
- [ ] Build passes
- [ ] Committed

## 5.3 Step 2: ID Selector Removal (per file)

For each file containing ID selectors (from Impact Analysis):

```text
File: {{STYLES_DIR}}/{{AFFECTED_FILES}}
Changes:
  - #header → .site-header
  - #main-nav → .main-nav
  - #sidebar → .sidebar
HTML updates:
  - id="header" → class="site-header" (keep id if needed for JS/anchors)
  - id="main-nav" → class="main-nav"
```

```css
/* BEFORE */
#header { display: flex; align-items: center; }
#header .logo { height: 2rem; }

/* AFTER */
.site-header { display: flex; align-items: center; }
.site-header__logo { height: 2rem; }
```

```bash
stylelint . && pnpm build
# Visual check: header renders identically
git add -A && git commit -m "refactor: replace #header ID with .site-header class"
```

- [ ] All ID selectors in file replaced
- [ ] HTML references updated
- [ ] Build passes
- [ ] No visual regressions
- [ ] Committed

Repeat for each file.

## 5.4 Step 3: Wrap Rules in @layer (per file)

For each stylesheet, wrap all rules in the appropriate @layer:

```css
/* BEFORE: {{STYLES_DIR}}/components/_button.css */
.button { padding: 8px 16px; background: blue; color: white; }
.button:hover { background: darkblue; }

/* AFTER */
@layer components {
  .button {
    padding: 8px 16px;
    background: blue;
    color: white;

    &:hover {
      background: darkblue;
    }
  }
}
```

```bash
stylelint . && pnpm build
git add -A && git commit -m "refactor: wrap button styles in @layer components"
```

Order of wrapping:

```text
1. base/ files → @layer base
2. layouts/ files → @layer layouts
3. components/ files → @layer components
4. utilities/ files → @layer utilities
```

- [ ] All base rules wrapped in @layer base
- [ ] All layout rules wrapped in @layer layouts
- [ ] All component rules wrapped in @layer components
- [ ] All utility rules wrapped in @layer utilities
- [ ] Build passes after each file
- [ ] Committed after each file

## 5.5 Step 4: Replace Hard-coded Values with Tokens (per file)

Work through one file at a time, replacing hard-coded values:

```css
/* BEFORE */
@layer components {
  .card {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

/* AFTER */
@layer components {
  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    box-shadow: var(--shadow-sm);
  }
}
```

```bash
stylelint . && pnpm build
git add -A && git commit -m "refactor: replace hard-coded values in card with tokens"
```

- [ ] Colours replaced with --color-* tokens
- [ ] Spacing replaced with --space-* tokens
- [ ] Typography replaced with --text-* and --font-* tokens
- [ ] Radii replaced with --radius-* tokens
- [ ] Shadows replaced with --shadow-* tokens
- [ ] Build passes
- [ ] No visual regressions
- [ ] Committed

## 5.6 Step 5: Remove !important (per occurrence)

With @layer in place, remove each !important by ensuring the rule is in the correct layer:

```css
/* BEFORE: in @layer components */
.tooltip { z-index: 9999 !important; }

/* AFTER: still in @layer components, layer handles cascade */
.tooltip { z-index: var(--z-tooltip); }

/* If override is needed, use a higher layer */
@layer utilities {
  .tooltip.is-pinned { z-index: var(--z-modal); }
}
```

```bash
stylelint . && pnpm build
git add -A && git commit -m "refactor: remove !important from tooltip styles"
```

- [ ] Each !important removed individually
- [ ] Build and visual check after each removal
- [ ] Committed after each removal (or batch per file)

## 5.7 Step 6: Flatten Selectors (per component)

```css
/* BEFORE */
.page .content .sidebar .widget .title { font-weight: bold; }

/* AFTER */
@layer components {
  .widget__title { font-weight: 700; }
}
```

```bash
stylelint . && pnpm build
git add -A && git commit -m "refactor: flatten widget selectors to BEM"
```

## 5.8 Step 7: Responsive Design Cleanup

```css
/* BEFORE: inconsistent breakpoints */
@media (max-width: 767px) { ... }
@media (min-width: 769px) { ... }

/* AFTER: consistent mobile-first */
@layer components {
  .{{COMPONENT_NAME}} {
    /* Mobile styles (default) */

    @media (width >= 48em) {
      /* Tablet and above */
    }

    @media (width >= 64em) {
      /* Desktop and above */
    }
  }
}
```

## 5.9 Step 8: Final Cleanup

```bash
# Remove vendor prefixes (autoprefixer handles them)
rg "-(webkit|moz|ms|o)-" {{STYLES_DIR}} --type css

# Remove empty rule blocks
rg "\{\s*\}" {{STYLES_DIR}} --type css

# Remove commented-out code
rg "/\*.*\*/" {{STYLES_DIR}} --type css | grep -i "old\|todo\|hack\|temp"

# Final verification
stylelint .
pnpm build
```

---

## Checklist

- [ ] Token files created and imported
- [ ] @layer order declared in entry file
- [ ] All ID selectors replaced (with HTML updates)
- [ ] All rules wrapped in appropriate @layer
- [ ] All hard-coded values replaced with custom properties
- [ ] All !important declarations removed
- [ ] All selectors flattened to target specificity
- [ ] Responsive design standardised
- [ ] Vendor prefixes cleaned up
- [ ] Dead code removed
- [ ] `stylelint .` passes with zero warnings
- [ ] `pnpm build` succeeds
- [ ] No visual regressions

## Verification

```bash
stylelint .
pnpm build
```

Each step has been committed individually with a descriptive message.
