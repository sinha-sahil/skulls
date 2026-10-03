# Phase 5: Dependency Flow

**Dependencies:** Phase 2 (Directory Structure), Phase 3 (Module Boundaries)

**Can be implemented in parallel with:** Phase 4

## Overview

Plan the stylesheet dependency graph and @import ordering for `{{PROJECT_NAME}}`. Ensure that the import chain is acyclic, that tokens are available before they are consumed, and that @layer ordering is correctly enforced through the import sequence.

---

## 5.1 Dependency Rules

### Fundamental Principles

```text
1. Tokens flow DOWN (settings → base → layouts → components → utilities)
2. Components NEVER import other components
3. @layer order is declared ONCE at the entry point
4. Each file is imported ONCE (no circular or duplicate imports)
5. Partials are NEVER loaded directly by the browser (only via entry file)
```

### Dependency Direction

```text
ALLOWED dependency directions:

  settings/tokens → (consumed by everything below)
       ↓
  base/reset → (consumed by layouts, components)
       ↓
  layouts → (consumed by page templates, not by components)
       ↓
  components → (leaf nodes, consume only tokens and base)
       ↓
  utilities → (override layer, consume tokens)

FORBIDDEN:
  components → components    (no cross-component imports)
  base → components          (base must not know about components)
  utilities → components     (utilities are generic overrides)
  any → entry file           (entry file is the root)
```

## 5.2 Entry File Import Graph

The entry file is the single root of the import tree. It declares layer order and imports all partials:

```css
/* {{STYLES_DIR}}/{{ENTRY_FILE}} */

/* Step 1: Declare layer order (must be first) */
@layer reset, base, tokens, layouts, components, utilities;

/* Step 2: Import reset (no dependencies) */
@import "./base/_reset.css" layer(reset);

/* Step 3: Import tokens (no dependencies) */
@import "./settings/_colors.css" layer(tokens);
@import "./settings/_spacing.css" layer(tokens);
@import "./settings/_typography.css" layer(tokens);
@import "./settings/_breakpoints.css" layer(tokens);

/* Step 4: Import base styles (depends on tokens) */
@import "./base/_elements.css" layer(base);
@import "./base/_forms.css" layer(base);

/* Step 5: Import themes (depends on tokens) */
@import "./settings/themes/_light.css" layer(tokens);
@import "./settings/themes/_{{THEME_NAME}}.css" layer(tokens);

/* Step 6: Import layouts (depends on tokens + base) */
@import "./layouts/_stack.css" layer(layouts);
@import "./layouts/_cluster.css" layer(layouts);
@import "./layouts/_grid.css" layer(layouts);
@import "./layouts/_sidebar.css" layer(layouts);

/* Step 7: Import components (depends on tokens + base) */
@import "./components/_button.css" layer(components);
@import "./components/_card.css" layer(components);
@import "./components/_navigation.css" layer(components);
@import "./components/_{{COMPONENT_NAME}}.css" layer(components);

/* Step 8: Import utilities (depends on tokens, overrides everything) */
@import "./utilities/_visually-hidden.css" layer(utilities);
@import "./utilities/_flow.css" layer(utilities);
@import "./utilities/_wrapper.css" layer(utilities);
```

## 5.3 Visual Dependency Graph

```text
{{ENTRY_FILE}}
│
├── [layer: reset]
│   └── base/_reset.css
│
├── [layer: tokens]
│   ├── settings/_colors.css
│   ├── settings/_spacing.css
│   ├── settings/_typography.css
│   ├── settings/_breakpoints.css
│   └── settings/themes/
│       ├── _light.css
│       └── _{{THEME_NAME}}.css
│
├── [layer: base]
│   ├── base/_elements.css ──→ reads: tokens
│   └── base/_forms.css ──→ reads: tokens
│
├── [layer: layouts]
│   ├── layouts/_stack.css ──→ reads: tokens
│   ├── layouts/_cluster.css ──→ reads: tokens
│   ├── layouts/_grid.css ──→ reads: tokens
│   └── layouts/_sidebar.css ──→ reads: tokens
│
├── [layer: components]
│   ├── components/_button.css ──→ reads: tokens
│   ├── components/_card.css ──→ reads: tokens
│   ├── components/_navigation.css ──→ reads: tokens
│   └── components/_{{COMPONENT_NAME}}.css ──→ reads: tokens
│
└── [layer: utilities]
    ├── utilities/_visually-hidden.css ──→ reads: tokens
    ├── utilities/_flow.css ──→ reads: tokens
    └── utilities/_wrapper.css ──→ reads: tokens
```

## 5.4 Token Dependency Map

Document which token files each stylesheet depends on:

```text
| Stylesheet | Depends On (Tokens) | Custom Properties Used |
|------------|--------------------|-----------------------|
| _elements.css | _colors, _spacing, _typography | --color-text, --font-body, --space-md |
| _button.css | _colors, _spacing, _typography | --color-primary, --space-sm, --radius-md |
| _card.css | _colors, _spacing | --color-surface, --color-border, --space-md |
| _{{COMPONENT_NAME}}.css | ... | ... |
```

## 5.5 Circular Dependency Detection

Check for circular references:

```bash
# Look for @import within component files (should not exist)
rg "@import" {{STYLES_DIR}}/components/ --type css

# Look for @import within utility files (should not exist)
rg "@import" {{STYLES_DIR}}/utilities/ --type css

# Verify all imports are in the entry file
rg "@import" {{STYLES_DIR}} --type css -l
```

**Rule:** Only the entry file (`{{ENTRY_FILE}}`) should contain `@import` statements. If a component or utility file contains `@import`, it is a dependency violation.

## 5.6 Build Tool Integration

### Vite / PostCSS

```javascript
// postcss.config.js
export default {
  plugins: {
    'postcss-import': {},  // Resolves @import before other plugins
    'postcss-nesting': {}, // Polyfill nesting if needed
    'autoprefixer': {},
  },
};
```

### Import Resolution Order

```text
1. postcss-import resolves all @import statements
2. @layer declarations are preserved (native browser feature)
3. Custom properties are resolved at runtime (not compile time)
4. Bundler outputs a single CSS file with correct cascade order
```

## 5.7 Adding a New Stylesheet

When adding a new component or stylesheet:

```text
1. Create the file: {{COMPONENTS_DIR}}/_new-component.css
2. Add @import to {{ENTRY_FILE}} in the correct layer section
3. Ensure it reads only from tokens (no cross-component imports)
4. Run: stylelint . && pnpm build
5. Verify visually that no other component is affected
```

---

## Checklist

- [ ] Entry file declares @layer order as first statement
- [ ] All imports are in the entry file (no imports in partials)
- [ ] Import order matches layer declaration order
- [ ] No circular dependencies between stylesheets
- [ ] Token files are imported before any consumers
- [ ] Components only reference global tokens (no cross-component deps)
- [ ] Token dependency map is documented
- [ ] Build tool correctly resolves @import chain
- [ ] Process for adding new stylesheets is documented
- [ ] Dependency graph has been visually verified

## Verification

```bash
# Check for imports outside the entry file
rg "@import" {{STYLES_DIR}} --type css -l | grep -v "{{ENTRY_FILE}}"

# Verify build succeeds
stylelint .
pnpm build
```

All imports should be in the entry file. Any imports found elsewhere indicate a dependency violation.
