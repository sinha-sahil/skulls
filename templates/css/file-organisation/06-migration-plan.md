# Phase 6: Migration Plan

**Dependencies:** Phase 1 (Assessment), Phase 2 (Directory Structure), Phase 3 (Module Boundaries), Phase 4 (Naming Conventions), Phase 5 (Dependency Flow)

**Can be implemented in parallel with:** None (this is the execution phase)

## Overview

Execute the restructuring of `{{PROJECT_NAME}}` stylesheets from the current state (documented in Phase 1) to the target state (defined in Phases 2-5). Each step must leave the project in a buildable, visually correct state. Work on a dedicated branch and verify after every change.

---

## 6.1 Pre-Migration Setup

### Create Branch and Baseline

```bash
# Create a dedicated branch
git checkout -b {{BRANCH_NAME}}

# Capture visual regression baseline (screenshots of key pages)
# Use your visual regression tool of choice
npx playwright test --update-snapshots  # or equivalent

# Record baseline metrics
find {{STYLES_DIR}} -name "*.css" -exec wc -l {} + | sort -rn > /tmp/css-baseline.txt
rg "!important" {{STYLES_DIR}} --type css -c > /tmp/important-baseline.txt
```

### Verify Starting State

```bash
stylelint .
pnpm build
```

- [ ] Branch created: `{{BRANCH_NAME}}`
- [ ] Visual regression baseline captured
- [ ] Baseline metrics recorded
- [ ] Build passes in current state

## 6.2 Step 1: Create Directory Skeleton

Create the target directory structure without moving any files yet:

```bash
# Create directories as defined in Phase 2
mkdir -p {{STYLES_DIR}}/settings
mkdir -p {{STYLES_DIR}}/settings/themes
mkdir -p {{STYLES_DIR}}/base
mkdir -p {{STYLES_DIR}}/layouts
mkdir -p {{STYLES_DIR}}/components
mkdir -p {{STYLES_DIR}}/utilities
```

```bash
# Verify and commit
stylelint .
pnpm build
git add -A && git commit -m "chore: create target stylesheet directory structure"
```

- [ ] All target directories created
- [ ] Build still passes
- [ ] Committed

## 6.3 Step 2: Extract Design Tokens

Extract hard-coded values into token files:

```css
/* {{STYLES_DIR}}/settings/_colors.css */
@layer tokens {
  :root {
    --color-primary: /* extract from existing styles */;
    --color-surface: /* extract from existing styles */;
    --color-text: /* extract from existing styles */;
    --color-border: /* extract from existing styles */;
    /* ... */
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

```css
/* {{STYLES_DIR}}/settings/_typography.css */
@layer tokens {
  :root {
    --font-body: /* extract from existing styles */;
    --font-heading: /* extract from existing styles */;
    --text-sm: /* extract from existing styles */;
    --text-md: /* extract from existing styles */;
    --text-lg: /* extract from existing styles */;
  }
}
```

```bash
stylelint .
pnpm build
git add -A && git commit -m "feat: extract design tokens into settings files"
```

- [ ] Colour tokens extracted
- [ ] Spacing tokens extracted
- [ ] Typography tokens extracted
- [ ] Build passes
- [ ] No visual regressions
- [ ] Committed

## 6.4 Step 3: Create Entry File with @layer

Create the new entry file with layer declarations:

```css
/* {{STYLES_DIR}}/{{ENTRY_FILE}} */
@layer reset, base, tokens, layouts, components, utilities;

/* Tokens first */
@import "./settings/_colors.css" layer(tokens);
@import "./settings/_spacing.css" layer(tokens);
@import "./settings/_typography.css" layer(tokens);

/* Then gradually add existing files to appropriate layers */
```

```bash
stylelint .
pnpm build
git add -A && git commit -m "feat: create entry file with @layer declarations"
```

- [ ] Entry file created with @layer order
- [ ] Token imports added
- [ ] Build passes
- [ ] Committed

## 6.5 Step 4: Migrate Files One at a Time

For each file identified in the assessment, follow this process:

### Per-File Migration Checklist

```text
File: _{{COMPONENT_NAME}}.css
From: {{STYLES_DIR}}/old-location/{{COMPONENT_NAME}}.css
To:   {{STYLES_DIR}}/components/_{{COMPONENT_NAME}}.css

Steps:
1. git mv old-location to new-location
2. Add @layer wrapper around all rules
3. Replace hard-coded values with token references
4. Rename selectors to match naming convention
5. Add @import to entry file in correct position
6. Update any HTML/template class references
7. Run: stylelint . && pnpm build
8. Visual check: no regressions
9. Commit: git commit -m "refactor: migrate {{COMPONENT_NAME}} styles"
```

### Example Migration

```css
/* BEFORE: old scattered file */
#main-nav .nav-item a {
  color: #333;
  padding: 8px 16px;
  font-size: 14px;
}
#main-nav .nav-item a:hover {
  color: blue !important;
}

/* AFTER: properly structured component */
@layer components {
  .nav-link {
    color: var(--color-text);
    padding: var(--space-xs) var(--space-md);
    font-size: var(--text-sm);

    &:hover {
      color: var(--color-primary);
    }
  }
}
```

## 6.6 Step 5: Migrate Remaining Categories

Follow this order for migration batches:

```text
Batch 1: Reset/base styles → base/ directory
Batch 2: Layout patterns → layouts/ directory
Batch 3: Components (one at a time) → components/ directory
Batch 4: Utility classes → utilities/ directory
Batch 5: Theme files → settings/themes/ directory
```

**Rule:** Complete each batch fully before moving to the next. Verify build and visuals after each individual file migration.

## 6.7 Step 6: Clean Up Old Files

Once all styles have been migrated to the new structure:

```bash
# Remove old files that have been migrated
git rm {{STYLES_DIR}}/old-file.css

# Remove empty directories
find {{STYLES_DIR}} -type d -empty -delete

# Verify nothing is broken
stylelint .
pnpm build

git add -A && git commit -m "chore: remove old stylesheet files after migration"
```

## 6.8 Step 7: Remove !important Declarations

With @layer in place, systematically remove !important:

```bash
# Find remaining !important declarations
rg "!important" {{STYLES_DIR}} --type css

# For each one: move the rule to a higher @layer instead
```

```bash
stylelint .
pnpm build
git add -A && git commit -m "refactor: remove !important declarations using @layer"
```

## 6.9 Post-Migration Verification

```bash
# Compare metrics to baseline
find {{STYLES_DIR}} -name "*.css" -exec wc -l {} + | sort -rn
rg "!important" {{STYLES_DIR}} --type css -c

# Full build verification
stylelint .
pnpm build

# Visual regression comparison
npx playwright test  # or equivalent
```

---

## Checklist

- [ ] Branch created and baseline captured
- [ ] Target directory skeleton created
- [ ] Design tokens extracted into settings files
- [ ] Entry file created with @layer declarations
- [ ] All stylesheets migrated to target locations
- [ ] All hard-coded values replaced with token references
- [ ] All selectors renamed to match naming convention
- [ ] HTML/template class references updated
- [ ] Old files removed
- [ ] !important declarations removed or minimised
- [ ] `stylelint .` passes
- [ ] `pnpm build` succeeds
- [ ] No visual regressions
- [ ] Git history preserved (used `git mv`)
- [ ] Branch ready for review and merge

## Verification

```bash
stylelint .
pnpm build
```

All migration steps are complete and the project is in a clean, well-organised state matching the target architecture defined in Phase 2.
