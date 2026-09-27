# Phase 6: Styling

Check that every visual value comes from the theme and that CSS follows the layout rules.

## Objectives

- Confirm components use theme tokens only
- Confirm new tokens are declared, used and documented
- Confirm the layout rules hold
- Check the result in a browser at desktop and phone widths

## Critical Rules

1. **One theme file declares every token.** Components declare no custom properties and use no
   fallbacks, hex or `rgb()` colours, or `px`, `rem`, `vh`, `ms` or `s` values.
2. **CSS decides styling.** Components take no size, tone or variant props.
3. **Flexbox only.** No grid, `float`, `auto` values, negative margins, `min-width: 0` or `min-height: 0`.
4. **Component library variables are mapped in one file,** never set inside a component.

## Checks

```bash
# Raw values and forbidden layout in component styles
git diff origin/{{BASE_BRANCH}}...HEAD -- 'src/**/*.svelte' | \
  grep -nE "^\+.*(#[0-9a-fA-F]{3,8}\b|rgba?\(|[0-9](px|rem|vh|ms|s)\b|display: grid|float:|: auto\b|margin[a-z-]*: -)"

# Custom properties declared inside components
git diff origin/{{BASE_BRANCH}}...HEAD -- 'src/**/*.svelte' | grep -nE "^\+\s+--[a-z-]+:"

# Tokens added to or removed from the theme file
git diff origin/{{BASE_BRANCH}}...HEAD -- src/styles/theme.css
```

For each changed style, also check:

- **Tokens:** a new token is needed (no existing one fits), used, and listed in the styling standard.
  A removed use leaves no token unused; the token test proves both.
- **Size by context:** icons are `1em` and the parent's `font-size` sets them; a component's own icon
  size variable maps to the same token.
- **Variants:** a restyled library component uses a variant class from the mapping file, passed through
  `classes`, or a wrapper element the component styles.
- **Overlays:** `position` with `inset` only where content truly overlaps.
- **Motion:** decorative animation stops under `prefers-reduced-motion`; durations come from tokens that
  the reduced-motion block zeroes.
- **Density:** banners, progress bars and badges stay compact; measure them before and after a change.

## Browser Check

Open the changed screens at 1280 px and 390 px. Check overflow, wrapping, overlap and focus rings, and
save a screenshot of each for the pull request.

## Outputs

Record each finding in this phase's plan file using the finding format from the quick reference.

## Validation

- [ ] Component styles use tokens only
- [ ] New tokens are needed, used and documented; no token is left unused
- [ ] Layout rules hold
- [ ] Screens checked, with screenshots, at 1280 px and 390 px
