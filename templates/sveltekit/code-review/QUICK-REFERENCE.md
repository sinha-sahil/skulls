# Code Review Quick Reference

The Skulls baseline. The project's own rules win where they differ; note every conflict in the report.

## Placeholders

| Placeholder | Meaning |
|-------------|---------|
| `{{BASE_BRANCH}}` | The branch the change merges into, such as `main` or a stacked base |
| `{{HEAD_BRANCH}}` | The branch under review |
| `{{PR_NUMBER}}` | The pull request number, when there is one |
| `{{TASK_ID}}` | The plan's task id, such as `P1-04` |
| `{{MESSAGE_FILE}}` | A file holding the rewritten commit message |
| `{{OLD_BASE_COMMIT}}` | The base commit a dependent branch was built on, before the base was amended |
| `{{DEPENDENT_BRANCH}}` | A branch stacked on the one under review |

## Rule Sources to Collect

```bash
ls docs/standards/ docs/*.md 2>/dev/null
ls CLAUDE.md AGENTS.md CONTRIBUTING.md .claude/ 2>/dev/null
ls eslint.config.* .eslintrc* stylelint.config.* .stylelintrc* .prettierrc* 2>/dev/null
grep -E '"(type-crafter|typesafe-api-call|polymorph-ui-components)"' package.json
```

## Structure

- Feature code lives in modules: `src/lib/client/modules/<module>/` with `index.ts`, `types.ts`,
  `store.svelte.ts`, `remote.ts`, `utils.ts` and `ui/`. Leave out the files a module doesn't need.
- Modules import each other only through `index.ts`. No deep imports, no `../../`.
- `index.ts` exports what other code uses: components, the store's read side and mutators, remote
  functions and types. Never `utils.ts` helpers.
- Only `remote.ts` talks to the network or the platform adapter.
- Platform code stays in its adapter folder; nothing outside imports it except the active adapter.
- No new top-level folders (`services/`, `shared/`, `helpers/`) without the owner's say.

## Code

- No comments unless the code does something odd: a browser quirk, a workaround, an external
  contract, a deliberate deviation. No section banners, changelogs or TODOs.
- Functions and variables are camelCase, constants SCREAMING_SNAKE_CASE, types and components PascalCase.
- Defaults are named constants, not literals scattered through the code.
- No speculative options, props or abstractions. Delete dead code. Fix root causes.
- No redundant guards: the same condition is checked once.

## Svelte

- Runes only: `$state`, `$state.raw`, `$derived`, `$props`, `$bindable`. No `export let`, `$:`,
  `on:click`, slots or `createEventDispatcher`.
- No effects of any kind: `$effect`, `$effect.pre`. Derive with `$derived`, set up in `onMount`,
  react in event handlers.
- No `tick()` or other deferrals to wait for the DOM. Work on an element in an action on that element.
- Actions and attachments run after the element's children. A parent can't act first; make it
  respect what children already did, and learn history from events (such as `focusin`'s `relatedTarget`).
- Stores are `.svelte.ts` files exposing a read-only getter object plus named functions that change state.
- Components report events through callback props and take overridable content as snippets.
- JS transitions only for elements entering or leaving the DOM; everything else animates in CSS.
- No `{@html}` of user or network content.
- Type every component's props in the `$props()` destructuring.

## Component Library

- Every UI control comes from the project's component library (such as `polymorph-ui-components`).
  No local component kit.
- A gap or bug in the library is fixed in the library, with docs and a demo, then the dependency is bumped.
- Library props stay generic. A separate concern becomes its own component and is composed.
- Never set the library's CSS variables inside a component. Map them onto theme tokens in one file;
  variants are CSS classes passed through `classes`.
- Label text goes through `children`, never an HTML-rendering `text` prop.
- Name every control. Icon-only buttons say what they act on: "Close menu", not "Close".
- A popup is a modal dialog. A timed one composes a countdown and closes itself when it runs out.
- A nested dialog owns its keys: it stops Tab and Escape from reaching the dialog around it, takes
  focus on open and returns it on close.

## TypeScript

- Data types are generated (type-crafter) when the project uses a generator. Hand-write a type only
  when it holds functions or snippets, composing generated types.
- Never edit, format or lint generated files.
- `type`, never `interface`. `null`, never `undefined`.
- No `any`, `as` assertions, non-null assertions, type predicates or lint suppressions.
- Decode every external input: network responses, config files, messages, form values.
- `console.warn` and `console.error` only.

## Styling

- One theme file declares every design token. Components use tokens only: no custom properties of
  their own, no `var()` fallbacks, no hex or `rgb()`, no `px`, `rem`, `vh`, `ms` or `s`.
- A test checks that every token is declared and used. Add a token only when none fits; delete unused ones.
- Components take no size, tone or variant props. CSS decides; TypeScript sets data and attributes only.
- Icons are `1em`; the surrounding `font-size` sets their size.
- Flexbox only: no grid, `float` or tables for layout. No `auto` values, negative margins,
  `min-width: 0` or `min-height: 0`. Write `0`, not `0px`.
- Overlays use `position` with `inset` only where content truly overlaps.
- Decorative motion is skipped under `prefers-reduced-motion`; essential indicators may step instead.
- Keep secondary chrome (banners, progress bars, milestones) compact; check at 1280 px and 390 px.

## Tests

- Tests live in `tests/`, mirroring `src/lib/`. Shared builders and doubles live in `tests/support/`;
  pass overrides instead of writing new literals or per-file copies of a builder.
- Test behaviour through the public API: `index.ts` exports and what components render. Import
  internals only for a store's reset function and pure `utils.ts` helpers.
- Query by role and accessible name. A test that needs a CSS class should add an accessible name instead.
- Cover every branch a user can reach, the decoding of external input and the contract with the platform.
- A workaround in a test (such as firing `animationend` where the test DOM runs no CSS animations) gets a comment.
- For a bug fix, confirm the new test fails without the fix.
- Check screens in a browser at 1280 px and 390 px, and attach the screenshots to the pull request.

## Plans and Docs

- Plans live in the top-level `plans/` directory. One task, one pull request.
- A task file states why, what, how, acceptance criteria and tests. When it ships: set the status,
  add an "As built" section for anything that changed, tick the criteria and list the tests. Delete nothing.
- Standards docs change with the code: new modules, components, tokens and variant classes are listed.
- Indexes and counts stay in sync with the plans they summarise.

## Commits and Pull Requests

- One commit per branch. Amend and push with `--force-with-lease`; never stack fix-up commits.
- Subject `type: summary` in lowercase (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `ci`).
- Body: only `- area: fact` bullets naming the code touched. No headings, paragraphs or AI attribution.
- The description is lean: what changed, anything to do before merging, what was checked, what's still
  open. No story. Screenshots attached.
- In public repositories, never mention private projects, customers or internal links. Branch names
  describe the change. Never rename a pull request's head branch.
- Stacked branches are rebased after their base is amended, and re-checked.

## Finding Format

```markdown
- **Where:** `src/lib/client/modules/profile/ui/ProfileCard.svelte:42`
- **Rule:** Only `remote.ts` talks to the network (baseline, Structure)
- **Problem:** the component calls `fetch` directly
- **Fix:** Move the call into `remote.ts` and export it from `index.ts`
```
