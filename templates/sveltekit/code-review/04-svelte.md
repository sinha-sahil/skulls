# Phase 4: Svelte

Check components and stores against the Svelte 5 rules, the component library rules and accessibility.

## Objectives

- Confirm runes-only Svelte 5 with no effects and no deferrals
- Confirm stores, events and snippets follow the patterns
- Confirm every control comes from the component library, named and themed correctly
- Check focus, keyboard and motion behaviour for anything interactive

## Critical Rules

1. **Runes only.** No `export let`, `$:`, `on:click`, slots or `createEventDispatcher`.
2. **No effects of any kind** (`$effect`, `$effect.pre`) **and no `tick()`**.
3. **Every UI control comes from the component library.** Gaps are fixed in the library, not worked around.
4. **Library props stay generic.** A separate concern is its own component, composed.
5. **Name every control** by what it acts on.

## Checks

```bash
# Legacy syntax, effects and deferrals
git diff origin/{{BASE_BRANCH}}...HEAD -- src | \
  grep -nE "^\+.*(export let|\\\$:|on:[a-z]+=|<slot|createEventDispatcher|\\\$effect|tick\(\))"

# HTML rendering
git diff origin/{{BASE_BRANCH}}...HEAD -- src | grep -nE "^\+.*\{@html"

# Native controls where the library has one
git diff origin/{{BASE_BRANCH}}...HEAD -- 'src/**/*.svelte' | grep -nE "^\+.*<(button|input|select|dialog)\b"
```

### State and Events

- Stores are `.svelte.ts` files: module-level runes, a read-only getter object, named mutators.
  `$state.raw` for data that is always replaced whole.
- Values are derived with `$derived`; setup runs in `onMount`; reactions happen in event handlers.
- Work on an element happens in an action (`use:`) on that element, never after a `tick()`.
- Actions and attachments run after the element's children, so a parent can't act first. It must
  respect what its children already did (for example, leave focus where a child dialog put it) and
  learn history from events (for example, `focusin`'s `relatedTarget`) instead of capturing it early.
- Components report events through callback props and take overridable content as snippets.
- Props are typed in the `$props()` destructuring.
- JS transitions only for elements entering or leaving the DOM.

### Component Library

- Controls come from the library; a local button, dialog or input is a finding.
- A library gap is fixed upstream with docs and a demo, then the dependency is bumped.
- A prop that bakes one use case into a generic component (for example a countdown flag on a modal)
  is a finding: the concern becomes its own component, composed by the consumer.
- The library's CSS variables are never set inside a component; they are mapped in one theme file.
- Label text goes through `children`, not a prop the library renders as HTML.

### Accessibility and Behaviour

- Icon-only buttons and unlabelled fields have names that say what they act on ("Close menu").
- A popup is a modal dialog. It takes focus on open, keeps Tab inside, closes on Escape without
  closing the dialog around it, and returns focus on close. A timed one composes a countdown.
- Live messages sit in a region that exists before its content changes.
- Decorative motion stops under `prefers-reduced-motion`.

## Examples

```svelte
<!-- WRONG - waiting for the DOM, then focusing -->
<script lang="ts">
  import { onMount, tick } from 'svelte';
  let dialog: HTMLElement | null = $state(null);
  onMount(() => {
    tick().then(() => dialog?.focus());
  });
</script>

<!-- CORRECT - an action on the element itself -->
<script lang="ts">
  function holdFocus(dialog: HTMLElement) {
    dialog.focus();
  }
</script>
<div use:holdFocus role="dialog" tabindex="-1"></div>
```

## Outputs

Record each finding in this phase's plan file using the finding format from the quick reference.

## Validation

- [ ] No legacy syntax, effects, `tick()` or `{@html}` in the change
- [ ] Stores, events and snippets follow the patterns
- [ ] Every control comes from the library, generic, named and themed through the mapping file
- [ ] Focus, keyboard and reduced-motion behaviour checked for anything interactive
