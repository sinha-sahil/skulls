# Global Guidelines Templates - Quick Reference

## Template Variables Reference

Replace these placeholders when using templates:

### Core Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `{{PROJECT_NAME}}` | `my-app` | Project name |
| `{{STYLES_DIR}}` | `src/styles/` | Root stylesheet directory |
| `{{ENTRY_FILE}}` | `main.css` | Main entry stylesheet |
| `{{THEME_NAME}}` | `dark` | Theme name |
| `{{BUNDLER}}` | `vite` | Build tool used |
| `{{LINTER}}` | `stylelint` | CSS linter |
| `{{BROWSER_TARGETS}}` | `last 2 versions` | Supported browsers |
| `{{TEST_RUNNER}}` | `playwright` | Visual regression tool |
| `{{NAMING_CONVENTION}}` | `BEM` | Selector naming pattern |
| `{{MAX_NESTING_DEPTH}}` | `3` | Maximum nesting depth |
| `{{MAX_SPECIFICITY}}` | `0-3-0` | Maximum allowed specificity |
| `{{BREAKPOINT_UNIT}}` | `em` | Unit for breakpoints |

---

## Quick Decision Tree

```text
Which guideline to consult?
├─ How should I name this selector?
│  └─ See 01-code-style.md → Naming Conventions section
│
├─ What custom property name should I use?
│  └─ See 02-design-tokens.md → Token Naming section
│
├─ Will this CSS feature work in our target browsers?
│  └─ See 03-fallbacks-and-progressive-enhancement.md → Browser Support
│
├─ How do I test a style change?
│  └─ See 04-testing.md → Testing Strategy section
│
├─ Is this pattern performant?
│  └─ See 05-performance.md → relevant subsection
│
├─ Is this CSS safe for CSP?
│  └─ See 06-security.md → CSP Compliance section
│
└─ How do I document this component's styles?
   └─ See 07-documentation.md → Component Documentation section
```

---

## Common Conventions at a Glance

### Naming (BEM)

```css
.block {}
.block__element {}
.block--modifier {}
.block__element--modifier {}
```

### Custom Property Naming

```css
--color-primary: oklch(65% 0.24 265);
--space-md: 1rem;
--font-body: system-ui, sans-serif;
--text-lg: 1.25rem;
--radius-md: 0.5rem;
--shadow-md: 0 4px 6px oklch(0% 0 0 / 0.1);
--z-modal: 100;
--duration-normal: 200ms;
--ease-out: cubic-bezier(0.33, 1, 0.68, 1);
```

### Property Order

```css
.component {
  /* 1. Layout */
  display: flex;
  position: relative;

  /* 2. Box model */
  margin: 0;
  padding: var(--space-md);
  width: 100%;

  /* 3. Typography */
  font-family: var(--font-body);
  font-size: var(--text-md);
  color: var(--color-text);

  /* 4. Visual */
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);

  /* 5. Interaction */
  cursor: pointer;
  transition: background var(--duration-normal) var(--ease-out);
}
```

---

## Implementation Phases

| Phase | File | Description |
|-------|------|-------------|
| 01 | Code Style | Naming, specificity, nesting, formatting |
| 02 | Design Tokens | Custom properties, themes, categories |
| 03 | Fallbacks & Progressive Enhancement | @supports, browser support |
| 04 | Testing | Visual regression, cross-browser, a11y |
| 05 | Performance | Critical CSS, containment, fonts |
| 06 | Security | CSP, url() safety, sanitisation |
| 07 | Documentation | Style docs, design system docs |

---

## Checklist After Using Templates

- [ ] All `{{VARIABLES}}` replaced with actual values
- [ ] Code style guidelines documented and stylelint configured
- [ ] Design token naming conventions established
- [ ] Custom property categories defined
- [ ] Theme switching mechanism documented
- [ ] Browser support policy defined
- [ ] Fallback patterns documented with @supports examples
- [ ] Visual regression testing set up
- [ ] Performance budget established
- [ ] CSP-compliant patterns documented
- [ ] Style documentation format agreed upon
- [ ] `stylelint .` passes
- [ ] `pnpm build` succeeds

---

## Stylelint Quick Config

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "selector-max-specificity": "{{MAX_SPECIFICITY}}",
    "max-nesting-depth": {{MAX_NESTING_DEPTH}},
    "declaration-no-important": true,
    "selector-max-id": 0,
    "custom-property-pattern": "^([a-z][a-z0-9]*)(-[a-z0-9]+)*$",
    "selector-class-pattern": "^[a-z][a-z0-9]*(__[a-z0-9-]+)?(--[a-z0-9-]+)?$"
  }
}
```

---

## Getting Help

- See `templates/css/global-guidelines/README.md` for detailed guide
- Check the Project Configuration section in README.md for placeholder values
