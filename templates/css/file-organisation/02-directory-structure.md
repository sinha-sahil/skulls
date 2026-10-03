# Phase 2: Directory Structure

**Dependencies:** Phase 1 (Assessment)

**Can be implemented in parallel with:** Phase 3, Phase 4, Phase 5

## Overview

Define the target directory layout for `{{PROJECT_NAME}}`. Decide on the architectural approach (ITCSS, domain-partitioned, or component-colocated), establish @layer ordering, and define the directory hierarchy that all stylesheets will follow.

---

## 2.1 Architecture Decision

### Option A: ITCSS-Inspired Layers (recommended for most projects)

Organise stylesheets by specificity layer, from generic to explicit:

```text
{{STYLES_DIR}}/
├── {{ENTRY_FILE}}                  # @layer order + @import list
├── settings/                       # Layer: tokens
│   ├── _colors.css
│   ├── _spacing.css
│   ├── _typography.css
│   └── _breakpoints.css
├── base/                           # Layer: base
│   ├── _reset.css
│   ├── _elements.css
│   └── _forms.css
├── layouts/                        # Layer: layouts
│   ├── _stack.css
│   ├── _cluster.css
│   ├── _grid.css
│   └── _sidebar.css
├── components/                     # Layer: components
│   ├── _card.css
│   ├── _button.css
│   ├── _navigation.css
│   └── _dialog.css
└── utilities/                      # Layer: utilities
    ├── _visually-hidden.css
    ├── _flow.css
    └── _wrapper.css
```

### Option B: Domain-Partitioned (for large feature-rich projects)

Organise by feature domain with shared resources:

```text
{{STYLES_DIR}}/
├── {{ENTRY_FILE}}
├── tokens/
│   ├── _global.css
│   └── themes/
│       ├── _light.css
│       └── _{{THEME_NAME}}.css
├── base/
│   └── _reset.css
├── features/
│   ├── auth/
│   │   ├── _login-form.css
│   │   └── _profile-card.css
│   ├── dashboard/
│   │   ├── _stats-grid.css
│   │   └── _activity-feed.css
│   └── shared/
│       ├── _button.css
│       └── _input.css
└── utilities/
    └── _helpers.css
```

### Option C: Component-Colocated (for component-driven frameworks)

Stylesheets live alongside their component files:

```text
src/
├── components/
│   ├── Card/
│   │   ├── Card.html
│   │   └── Card.css
│   ├── Button/
│   │   ├── Button.html
│   │   └── Button.css
│   └── ...
├── {{STYLES_DIR}}/
│   ├── {{ENTRY_FILE}}
│   ├── tokens/
│   │   └── _global.css
│   └── base/
│       └── _reset.css
```

### Decision Criteria

```text
Use ITCSS-INSPIRED when:
  - Project is primarily CSS-driven (not a JS framework)
  - Team prefers centralised style management
  - Design system patterns are dominant

Use DOMAIN-PARTITIONED when:
  - Project has many distinct feature areas
  - Teams own different feature domains
  - Features have independent style requirements

Use COMPONENT-COLOCATED when:
  - Using a component framework (Svelte, React, Vue)
  - Framework provides built-in style scoping
  - Only global tokens and base styles are shared
```

## 2.2 @layer Order Declaration

Define the cascade layer order in the entry file. This is the single source of truth for cascade priority:

```css
/* {{STYLES_DIR}}/{{ENTRY_FILE}} */

/* Layer order: later layers override earlier ones */
@layer reset, base, tokens, layouts, components, utilities;

/* Import stylesheets into their respective layers */
@import "./base/_reset.css" layer(reset);
@import "./settings/_colors.css" layer(tokens);
@import "./settings/_spacing.css" layer(tokens);
@import "./settings/_typography.css" layer(tokens);
@import "./base/_elements.css" layer(base);
@import "./base/_forms.css" layer(base);
@import "./layouts/_stack.css" layer(layouts);
@import "./layouts/_grid.css" layer(layouts);
@import "./components/_button.css" layer(components);
@import "./components/_card.css" layer(components);
@import "./components/_{{COMPONENT_NAME}}.css" layer(components);
@import "./utilities/_visually-hidden.css" layer(utilities);
@import "./utilities/_flow.css" layer(utilities);
```

## 2.3 File Naming Conventions

```text
Rule: All stylesheet partials prefixed with underscore
  _button.css        ✓ (partial, imported by entry file)
  button.css         ✗ (no underscore, ambiguous purpose)
  {{ENTRY_FILE}}     ✓ (entry file, no underscore)

Rule: Lowercase kebab-case for all file names
  _login-form.css    ✓
  _loginForm.css     ✗
  _LoginForm.css     ✗

Rule: One component per file
  _card.css          ✓ (single component)
  _card-and-modal.css ✗ (multiple components)
```

## 2.4 Token File Structure

Design tokens should be split by category:

```css
/* {{STYLES_DIR}}/settings/_colors.css */
@layer tokens {
  :root {
    /* Primitive palette */
    --color-blue-500: oklch(55% 0.22 265);
    --color-gray-100: oklch(95% 0 0);

    /* Semantic tokens (reference primitives) */
    --color-primary: var(--color-blue-500);
    --color-surface: var(--color-gray-100);
    --color-text: oklch(20% 0 0);
    --color-border: oklch(80% 0 0);
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

## 2.5 Theme File Structure

If theming is required, use scoped custom property overrides:

```css
/* {{STYLES_DIR}}/settings/themes/_{{THEME_NAME}}.css */
@layer tokens {
  [data-theme="{{THEME_NAME}}"] {
    --color-primary: oklch(75% 0.18 265);
    --color-surface: oklch(15% 0 0);
    --color-text: oklch(90% 0 0);
    --color-border: oklch(30% 0 0);
  }
}
```

---

## Checklist

- [ ] Decided: ITCSS, domain-partitioned, or component-colocated
- [ ] Defined target directory layout with all expected files
- [ ] Established @layer order in entry file
- [ ] Listed all @import statements with layer assignments
- [ ] Defined file naming conventions (underscore prefix, kebab-case)
- [ ] Defined token file split by category (colors, spacing, typography)
- [ ] Defined theme file structure if applicable
- [ ] Target layout addresses all pain points from Phase 1
- [ ] Target layout supports planned future growth

## Verification

```bash
stylelint .
pnpm build
```

If creating a new project, verify the skeleton builds before adding style content.
