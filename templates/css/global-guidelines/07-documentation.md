# Phase 7: Documentation

**Dependencies:** Phase 1 (Code Style), Phase 2 (Design Tokens)

**Can be implemented in parallel with:** All phases (documentation can be written alongside implementation)

## Overview

Establish CSS documentation patterns for `{{PROJECT_NAME}}`, covering inline style documentation, design system documentation, component style documentation, and custom property documentation. Good documentation ensures that styles are maintainable by any team member.

---

## 7.1 Inline CSS Documentation

### Comment Style Guide

```css
/* ── Section Header ── */
/* Use section headers to divide major areas within a file */

/* Brief explanation of a rule or group */
.component { }

/*
 * Multi-line explanation for complex patterns.
 * Explain WHY the rule exists, not WHAT it does.
 * Include links to design specs or bug tickets when relevant.
 */
.complex-pattern { }

/* TODO: description — tracked in {{PROJECT_NAME}}-123 */
/* HACK: description — required because of browser bug (link) */
/* NOTE: description — important context for future maintainers */
```

### When to Comment

```text
| Situation | Comment? | Example |
|-----------|----------|---------|
| Obvious property | No | color: var(--color-text); |
| Magic number | Yes | z-index: 42; /* Must be above overlay (40) */ |
| Browser workaround | Yes | /* Safari needs -webkit-backdrop-filter */ |
| Non-obvious side effect | Yes | /* contain: paint creates a new stacking context */ |
| Design decision | Yes | /* 48px min-height matches design spec DS-042 */ |
| Override reason | Yes | /* Override vendor default padding */ |
| Empty rule block | Yes | /* Intentionally empty: styles come from @layer base */ |
```

### File Header

```css
/**
 * {{COMPONENT_NAME}} Component Styles
 *
 * Renders a {{COMPONENT_NAME}} with header, body, and footer regions.
 * Uses container queries for responsive layout.
 *
 * @layer components
 * @see designs/{{COMPONENT_NAME}}.figma
 * @see docs/components/{{COMPONENT_NAME}}.md
 */
@layer components {
  .{{COMPONENT_NAME}} { }
}
```

## 7.2 Custom Property Documentation

### Token Documentation Format

```css
/**
 * Colour Tokens
 *
 * Primitive colours define the raw palette.
 * Semantic colours define purpose-based usage.
 * Components should only reference semantic colours.
 *
 * Naming: --color-{semantic-name}
 * Colour space: oklch (perceptually uniform)
 *
 * @see docs/tokens/colours.md for full reference
 */
@layer tokens {
  :root {
    /* ── Primitives (do not use directly) ── */
    --blue-500: oklch(55% 0.22 265);   /* Primary brand blue */
    --gray-900: oklch(15% 0 0);        /* Darkest neutral */

    /* ── Semantic Colours ── */
    --color-primary: var(--blue-500);        /* Primary actions, links */
    --color-primary-hover: var(--blue-600);  /* Hover state of primary */
    --color-text: var(--gray-900);           /* Default body text */
    --color-text-muted: var(--gray-500);     /* Secondary/hint text */
    --color-surface: var(--gray-50);         /* Page background */
    --color-border: var(--gray-200);         /* Default borders */
  }
}
```

### Token Reference Document

Create a standalone reference document listing all tokens:

```markdown
# Design Tokens Reference

## Colours

| Token | Value | Usage |
|-------|-------|-------|
| --color-primary | oklch(55% 0.22 265) | Primary actions, links |
| --color-text | oklch(15% 0 0) | Default body text |
| --color-surface | oklch(98% 0 0) | Page background |
| ... | ... | ... |

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| --space-xs | 0.5rem | Tight spacing (inside buttons) |
| --space-sm | 0.75rem | Compact spacing |
| --space-md | 1rem | Default spacing |
| --space-lg | 1.5rem | Section spacing |
| ... | ... | ... |
```

## 7.3 Component Style Documentation

### Component Documentation Template

For each component, document its styling API:

```markdown
# {{COMPONENT_NAME}} Component

## Selectors

| Selector | Description |
|----------|-------------|
| .{{COMPONENT_NAME}} | Root element |
| .{{COMPONENT_NAME}}__header | Header region |
| .{{COMPONENT_NAME}}__body | Main content region |
| .{{COMPONENT_NAME}}__footer | Footer region |

## Modifiers

| Modifier | Description |
|----------|-------------|
| .{{COMPONENT_NAME}}--compact | Reduced padding variant |
| .{{COMPONENT_NAME}}--featured | Highlighted/promoted variant |

## States

| State | Selector | Description |
|-------|----------|-------------|
| Active | .{{COMPONENT_NAME}}.is-active | Currently active |
| Disabled | .{{COMPONENT_NAME}}[aria-disabled] | Disabled state |

## Custom Properties (overridable)

| Property | Default | Description |
|----------|---------|-------------|
| --_padding | var(--space-md) | Internal padding |
| --_gap | var(--space-sm) | Gap between children |
| --_radius | var(--radius-md) | Border radius |

## Container Queries

| Breakpoint | Behaviour |
|-----------|-----------|
| < 30rem | Single column, stacked |
| >= 30rem | Two-column side-by-side |

## Usage Example

```html
<div class="{{COMPONENT_NAME}} {{COMPONENT_NAME}}--featured">
  <div class="{{COMPONENT_NAME}}__header">Title</div>
  <div class="{{COMPONENT_NAME}}__body">Content</div>
  <div class="{{COMPONENT_NAME}}__footer">Actions</div>
</div>
```
```

## 7.4 Design System Documentation

### Living Style Guide

A living style guide is generated from the actual CSS and stays in sync:

```text
{{PROJECT_NAME}} Design System
├── Tokens
│   ├── Colours (swatches + names)
│   ├── Spacing (visual scale)
│   ├── Typography (font samples)
│   ├── Shadows (visual examples)
│   └── Motion (animation demos)
├── Base Styles
│   ├── Typography (headings, body, links)
│   ├── Forms (inputs, selects, buttons)
│   └── Lists and Tables
├── Layout Primitives
│   ├── Stack (vertical spacing)
│   ├── Cluster (horizontal grouping)
│   ├── Grid (responsive grid)
│   └── Sidebar (content + sidebar)
├── Components
│   ├── Button (variants, states)
│   ├── Card (variants, container query behaviour)
│   ├── Navigation (responsive, states)
│   └── {{COMPONENT_NAME}} (...)
└── Utilities
    ├── Visibility (.visually-hidden)
    ├── Flow (.flow)
    └── Wrapper (.wrapper)
```

### Storybook / Component Playground

```javascript
// If using Storybook or similar tool
export default {
  title: 'Components/{{COMPONENT_NAME}}',
  parameters: {
    docs: {
      description: {
        component: 'A flexible card component with container query responsive layout.',
      },
    },
  },
};

export const Default = () => `
  <div class="{{COMPONENT_NAME}}">
    <div class="{{COMPONENT_NAME}}__header">Title</div>
    <div class="{{COMPONENT_NAME}}__body">Content goes here</div>
  </div>
`;

export const Compact = () => `
  <div class="{{COMPONENT_NAME}} {{COMPONENT_NAME}}--compact">
    <div class="{{COMPONENT_NAME}}__body">Compact content</div>
  </div>
`;
```

## 7.5 @layer Documentation

```css
/**
 * Cascade Layer Architecture
 *
 * Layers are ordered from lowest to highest priority.
 * Styles in later layers always override earlier layers,
 * regardless of selector specificity.
 *
 * Layer order (declared in {{ENTRY_FILE}}):
 *
 *   1. reset      — Browser normalisation (lowest priority)
 *   2. base       — Element defaults (body, h1-h6, a, form)
 *   3. tokens     — Custom property definitions
 *   4. layouts    — Layout primitives (stack, grid, sidebar)
 *   5. components — Component styles (card, button, nav)
 *   6. utilities  — Override utilities (highest priority)
 *
 * Rules:
 *   - Every CSS rule MUST be inside a @layer
 *   - Components may NOT import or override other components
 *   - Utilities are the only way to override component styles
 *   - Third-party overrides go in a vendor sub-layer
 */
@layer reset, base, tokens, layouts, components, utilities;
```

## 7.6 Documentation Maintenance

### When to Update Documentation

```text
| Change Type | Documentation Update Required |
|-------------|------------------------------|
| New component | Add component doc + style guide entry |
| New token | Add to token reference + style guide |
| Naming convention change | Update code style doc + examples |
| Breaking change | Add migration guide |
| Bug fix | No (unless it changes documented behaviour) |
| Refactoring | Update if public API changes |
```

### Documentation Review Checklist

```text
For each PR that changes CSS:
- [ ] New/changed components have documentation
- [ ] New tokens are added to the token reference
- [ ] File headers are accurate
- [ ] Code comments explain "why", not "what"
- [ ] No stale comments remain
- [ ] Examples match the actual implementation
```

---

## Checklist

- [ ] Inline comment style guide established
- [ ] File header format defined
- [ ] Token documentation format established
- [ ] Token reference document created
- [ ] Component documentation template defined
- [ ] @layer architecture documented
- [ ] Design system / style guide structure planned
- [ ] Documentation maintenance rules established
- [ ] PR review checklist includes documentation
- [ ] All existing components documented
- [ ] All existing tokens documented

## Verification

```bash
stylelint .
pnpm build
```

Documentation should be created alongside code, not as an afterthought. Treat documentation files as part of the deliverable.
