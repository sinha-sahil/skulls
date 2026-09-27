# Phase 3: Structure

Check where the code lives, how modules reach each other, and whether it reads cleanly.

## Objectives

- Confirm feature code sits in modules with the expected files
- Confirm modules import each other only through `index.ts`
- Check naming, comments and simplicity

## Critical Rules

1. **Modules connect through `index.ts` only.** No deep imports and no `../../`.
2. **`index.ts` exports what other code uses,** never `utils.ts` helpers.
3. **Only `remote.ts` talks to the network** or the platform adapter.
4. **No comments unless the code does something odd.**
5. **No speculative code** and no redundant guards.

## Module Layout

```text
src/lib/client/modules/[module-name]/
├── index.ts          # public exports only
├── types.ts          # hand-written types holding functions or snippets
├── store.svelte.ts   # state in runes: getter object + named mutators
├── remote.ts         # calls that leave the app
├── utils.ts          # module-private helpers
└── ui/
    ├── index.ts
    └── *.svelte
```

## Checks

```bash
# Deep imports into another module
git diff origin/{{BASE_BRANCH}}...HEAD -- src | grep -E "^\+.*from '\\\$client/modules/[^']+/[^']+'"

# Relative paths that climb out of a folder
git diff origin/{{BASE_BRANCH}}...HEAD -- src | grep -E "^\+.*from '\.\./\.\./"

# Network calls outside remote.ts
git diff --name-only origin/{{BASE_BRANCH}}...HEAD -- src | grep -v remote.ts | xargs grep -ln "fetch(" 2>/dev/null

# Comments added by the change
git diff origin/{{BASE_BRANCH}}...HEAD -- src | grep -E "^\+\s*(//|/\*|<!--)"
```

For each changed file, also check:

- **New folders:** a new top-level folder (`services/`, `shared/`, `helpers/`) needs the owner's say.
- **Comments:** each one explains a quirk, workaround, external contract or deliberate deviation.
  Anything else (what a function does, section banners, TODOs) goes.
- **Naming:** camelCase functions and variables, SCREAMING_SNAKE_CASE constants, PascalCase types and
  components. Names say what things do. A component name must not collide with a type name.
- **Defaults:** repeated or meaningful literals are named constants.
- **Simplicity:** no options, props or layers nothing uses yet; no dead code; one check per condition.
- **Platform code:** stays inside its adapter folder.

## Examples

```typescript
// WRONG - two checks for the same condition
if (items.length === 0) {
  return;
}
const summary = summarise(items); // also returns null for no items

// CORRECT - one check
const summary = summarise(items);
if (summary === null) {
  return;
}
```

## Outputs

Record each finding in this phase's plan file using the finding format from the quick reference.

## Validation

- [ ] No deep or climbing imports between modules
- [ ] Every `index.ts` exports only what other code uses
- [ ] Network and platform calls sit in `remote.ts` or the adapter
- [ ] Every added comment is justified
- [ ] Names, constants and guards follow the rules
