# File Organisation Templates - Quick Reference

## Template Variables Reference

Replace these placeholders when using templates:

### Core Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `{{PROJECT_NAME}}` | `my-app` | Project name |
| `{{STYLES_DIR}}` | `src/styles/` | Root stylesheet directory |
| `{{ENTRY_FILE}}` | `main.css` | Main entry stylesheet |
| `{{TOKENS_DIR}}` | `tokens/` | Design tokens directory |
| `{{COMPONENTS_DIR}}` | `components/` | Component styles directory |
| `{{LAYOUTS_DIR}}` | `layouts/` | Layout styles directory |
| `{{UTILITIES_DIR}}` | `utilities/` | Utility styles directory |
| `{{VENDOR_DIR}}` | `vendor/` | Third-party styles directory |
| `{{COMPONENT_NAME}}` | `card` | Component being styled |
| `{{LAYER_NAME}}` | `components` | CSS @layer name |
| `{{THEME_NAME}}` | `dark` | Theme name |
| `{{BREAKPOINT_NAME}}` | `md` | Breakpoint identifier |

---

## Quick Decision Tree

```text
Stylesheet Architecture Decision?
├─ How large is the project?
│  ├─ SMALL (< 20 components) → Single-directory flat structure
│  ├─ MEDIUM (20-100 components) → ITCSS-inspired layered structure
│  └─ LARGE (100+ components) → Domain-partitioned with @layer
│
├─ Using a framework/bundler?
│  ├─ YES (Vite, Webpack) → Use @import with bundler resolution
│  └─ NO (plain CSS) → Use native @import or link concatenation
│
├─ Using @layer?
│  ├─ YES → Define layer order in entry file, assign each file to a layer
│  └─ NO  → Rely on source order (more fragile, consider migrating)
│
├─ Component scoping strategy?
│  ├─ BEM → .block__element--modifier naming
│  ├─ CSS Modules → :local() scoping via build tool
│  ├─ @scope → Native CSS scoping (modern browsers)
│  └─ Utility-first → Tailwind-style classes
│
├─ Design tokens approach?
│  ├─ Custom properties → :root { --token: value; }
│  ├─ Build-time tokens → Style Dictionary / design-tokens format
│  └─ Both → Tokens compiled to custom properties
│
└─ Theme support needed?
   ├─ YES → Custom properties with theme-scoped overrides
   └─ NO  → Single token set on :root
```

---

## Common CSS Project Structures

### Pattern 1: ITCSS-Inspired Layers

```text
{{STYLES_DIR}}/
├── {{ENTRY_FILE}}               # @layer order + @import list
├── settings/                    # Design tokens, custom properties
│   ├── _colors.css
│   ├── _spacing.css
│   ├── _typography.css
│   └── _breakpoints.css
├── base/                        # Reset, element defaults
│   ├── _reset.css
│   ├── _typography.css
│   └── _forms.css
├── layouts/                     # Layout primitives
│   ├── _stack.css
│   ├── _cluster.css
│   ├── _grid.css
│   └── _sidebar.css
├── components/                  # Component styles
│   ├── _card.css
│   ├── _button.css
│   ├── _navigation.css
│   └── _dialog.css
└── utilities/                   # Utility overrides
    ├── _visually-hidden.css
    ├── _flow.css
    └── _wrapper.css
```

### Pattern 2: Domain-Partitioned

```text
{{STYLES_DIR}}/
├── {{ENTRY_FILE}}
├── tokens/
│   ├── _global.css
│   └── _themes/
│       ├── _light.css
│       └── _dark.css
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

### Pattern 3: Component-Colocated

```text
src/
├── components/
│   ├── Card/
│   │   ├── Card.html
│   │   └── Card.css            # Scoped to Card component
│   ├── Button/
│   │   ├── Button.html
│   │   └── Button.css
│   └── ...
├── styles/
│   ├── {{ENTRY_FILE}}          # Global styles + token imports
│   ├── tokens/
│   │   └── _global.css
│   └── base/
│       └── _reset.css
```

---

## Implementation Phases

| Phase | File | Description |
|-------|------|-------------|
| 01 | Assessment | Audit current stylesheet structure |
| 02 | Directory Structure | Define target layout and @layer ordering |
| 03 | Module Boundaries | Define component scoping strategy |
| 04 | Naming Conventions | Establish selector and token naming |
| 05 | Dependency Flow | Plan @import graph and load order |
| 06 | Migration Plan | Execute restructuring |

---

## Checklist After Using Templates

- [ ] All `{{VARIABLES}}` replaced with actual values
- [ ] Current stylesheet structure audited
- [ ] Target directory structure defined and documented
- [ ] @layer order declared in entry file
- [ ] Component scoping strategy chosen and documented
- [ ] Naming conventions established and documented
- [ ] @import dependency flow is acyclic
- [ ] Migration plan is incremental (one stylesheet at a time)
- [ ] Each migration step verified with `stylelint .`
- [ ] Git history preserved (used `git mv`)
- [ ] All @import paths updated after file moves
- [ ] `stylelint .` passes
- [ ] `pnpm build` succeeds
- [ ] Visual regression tests pass

---

## @layer Quick Reference

| Layer | Purpose | Specificity |
|-------|---------|-------------|
| `reset` | Browser reset / normalise | Lowest |
| `base` | Element defaults (body, h1-h6, a) | Low |
| `tokens` | Custom property definitions | Low |
| `layouts` | Layout primitives (grid, stack) | Medium |
| `components` | Component styles (.card, .button) | Medium-High |
| `utilities` | Override utilities (.visually-hidden) | Highest |

### Layer Order Declaration

```css
/* {{ENTRY_FILE}} - declare once at the top */
@layer reset, base, tokens, layouts, components, utilities;
```

---

## Custom Property Naming Quick Reference

```css
/* Category prefixes */
--color-*       /* Colours: --color-primary, --color-surface */
--space-*       /* Spacing: --space-xs, --space-md */
--font-*        /* Font families: --font-body, --font-heading */
--text-*        /* Font sizes: --text-sm, --text-lg */
--radius-*      /* Border radii: --radius-sm, --radius-pill */
--shadow-*      /* Box shadows: --shadow-sm, --shadow-lg */
--z-*           /* Z-index: --z-dropdown, --z-modal */
--duration-*    /* Transitions: --duration-fast, --duration-slow */
--ease-*        /* Easings: --ease-in-out, --ease-spring */

/* Component-scoped (private) */
--_card-padding
--_button-height
```

---

## Getting Help

- See `templates/css/file-organisation/README.md` for detailed guide
- Check the Project Configuration section in README.md for placeholder values
