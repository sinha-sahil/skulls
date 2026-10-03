# Refactoring Plan Templates - Quick Reference

## Template Variables Reference

Replace these placeholders when using templates:

### Core Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `{{PROJECT_NAME}}` | `my-app` | Project name |
| `{{STYLES_DIR}}` | `src/styles/` | Root stylesheet directory |
| `{{ENTRY_FILE}}` | `main.css` | Main entry stylesheet |
| `{{REFACTOR_SCOPE}}` | `specificity` | Scope of the refactoring |
| `{{COMPONENT_NAME}}` | `navigation` | Component being refactored |
| `{{OLD_PATTERN}}` | `#id selectors` | Current pattern to replace |
| `{{NEW_PATTERN}}` | `@layer` | Target pattern |
| `{{LAYER_NAME}}` | `components` | CSS @layer name |
| `{{AFFECTED_FILES}}` | `_header.css` | Files impacted by refactor |
| `{{BRANCH_NAME}}` | `refactor/layers` | Git branch for refactoring |
| `{{THEME_NAME}}` | `dark` | Theme name |

---

## Quick Decision Tree

```text
What needs refactoring?
├─ Specificity conflicts?
│  ├─ Caused by ID selectors → Replace #id with .class or [data-*]
│  ├─ Caused by nesting depth → Flatten selectors, max 3 levels
│  ├─ Caused by !important → Introduce @layer, remove !important
│  └─ Caused by source order → Adopt @layer for cascade control
│
├─ Hard-coded values?
│  ├─ Colours → Extract to --color-* custom properties
│  ├─ Spacing → Extract to --space-* custom properties
│  ├─ Font sizes → Extract to --text-* custom properties
│  └─ Breakpoints → Extract to @custom-media (or consistent values)
│
├─ Duplicated styles?
│  ├─ Same declarations in multiple files → Extract to shared component
│  ├─ Similar but slightly different → Parameterise with custom properties
│  └─ Vendor-specific duplicates → Remove outdated prefixes
│
├─ Responsive design issues?
│  ├─ Inconsistent breakpoints → Standardise breakpoint values
│  ├─ Desktop-first → Migrate to mobile-first (min-width)
│  └─ Media queries scattered → Colocate with component or use container queries
│
└─ Legacy patterns?
   ├─ Sass/Less → Migrate to native CSS nesting + custom properties
   ├─ Float layouts → Migrate to flexbox/grid
   ├─ Vendor prefixes → Remove if no longer needed (check caniuse)
   └─ px units → Migrate to rem/em for scalability
```

---

## Common Refactoring Patterns

### Pattern 1: !important Removal via @layer

```css
/* BEFORE */
.header .nav .link {
  color: blue;
}
.link.active {
  color: red !important; /* needed to override */
}

/* AFTER */
@layer components, states;

@layer components {
  .nav-link { color: blue; }
}
@layer states {
  .nav-link[aria-current="page"] { color: red; }
}
```

### Pattern 2: Hard-coded to Custom Properties

```css
/* BEFORE */
.card { background: #ffffff; border-radius: 8px; padding: 16px; }
.modal { background: #ffffff; border-radius: 8px; padding: 24px; }

/* AFTER */
.card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}
.modal {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
}
```

### Pattern 3: Media Query to Container Query

```css
/* BEFORE */
.card { padding: 1rem; }
@media (min-width: 768px) { .card { padding: 2rem; } }

/* AFTER */
.card-container { container-type: inline-size; }
.card {
  padding: 1rem;
  @container (inline-size > 400px) {
    padding: 2rem;
  }
}
```

### Pattern 4: Deep Nesting to Flat Selectors

```css
/* BEFORE */
.header .nav .list .item .link .icon { fill: currentColor; }

/* AFTER */
.nav-link-icon { fill: currentColor; }
```

---

## Implementation Phases

| Phase | File | Description |
|-------|------|-------------|
| 01 | Assessment | Audit stylesheet quality and catalog debt |
| 02 | Goals | Define measurable refactoring objectives |
| 03 | Impact Analysis | Map affected files and dependencies |
| 04 | Strategy | Choose refactoring approach |
| 05 | Execution Plan | Ordered implementation steps |
| 06 | Testing Strategy | Visual regression and validation |
| 07 | Rollback Plan | Git-based rollback plan |

---

## Checklist After Using Templates

- [ ] All `{{VARIABLES}}` replaced with actual values
- [ ] Baseline metrics recorded (specificity, file sizes, !important count)
- [ ] Visual regression screenshots captured before changes
- [ ] Refactoring goals are measurable with specific targets
- [ ] Impact analysis covers all affected files
- [ ] Strategy addresses root causes, not symptoms
- [ ] Execution plan is incremental (one component at a time)
- [ ] Each step verified with `stylelint .`
- [ ] Each step verified visually (no regressions)
- [ ] Git history preserved (used `git mv`)
- [ ] `stylelint .` passes
- [ ] `pnpm build` succeeds
- [ ] Visual regression tests pass
- [ ] Cross-browser testing completed

---

## Specificity Reference

| Selector Type | Specificity | Example |
|---------------|-------------|---------|
| Universal | 0-0-0 | `*` |
| Element | 0-0-1 | `div`, `p` |
| Class / attribute / pseudo-class | 0-1-0 | `.card`, `[type="text"]`, `:hover` |
| ID | 1-0-0 | `#header` |
| Inline style | 1-0-0-0 | `style="..."` |
| !important | Overrides all | `color: red !important` |
| @layer | Layer order wins | Lower specificity in higher layer wins |

### Rule of Thumb

```text
Prefer lower specificity → escalate only when needed
element → class → [data-*] → @layer escalation → (never !important)
```

---

## Getting Help

- See `templates/css/refactoring-plan/README.md` for detailed guide
- Check the Project Configuration section in README.md for placeholder values
