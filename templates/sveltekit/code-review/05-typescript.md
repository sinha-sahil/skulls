# Phase 5: TypeScript

Check where types come from, how strict the code is, and that outside data is decoded.

## Objectives

- Confirm data types are generated and generated files untouched
- Confirm the strictness rules hold without suppressions
- Confirm every external input passes through a decoder

## Critical Rules

1. **Data types are generated** when the project has a generator. Hand-written types hold functions
   or snippets only.
2. **Generated files are never edited,** formatted or linted.
3. **`type`, never `interface`; `null`, never `undefined`.**
4. **No `any`, `as`, `!`, type predicates or lint suppressions.**
5. **Decode every external input.**

## Checks

```bash
# Generated files changed without their spec
git diff --name-only origin/{{BASE_BRANCH}}...HEAD -- src/generated docs/*.yaml

# Loose typing and suppressions
git diff origin/{{BASE_BRANCH}}...HEAD -- src tests | \
  grep -nE "^\+.*(\binterface\b|: any\b| as [A-Za-z]|\bundefined\b|!\.|eslint-disable|@ts-(ignore|expect-error|nocheck))"

# Logging
git diff origin/{{BASE_BRANCH}}...HEAD -- src | grep -nE "^\+.*console\.(log|info|debug)"
```

For each changed file, also check:

- **Hand-written types:** each one holds a function or snippet, or composes generated types around one.
  A plain data shape belongs in the generator's spec.
- **Generated output:** a changed generated file has a matching spec change and was regenerated,
  not edited by hand.
- **Named enums:** a value set used in more than one type is its own named type in the spec, so the
  generator emits a real name instead of a placeholder.
- **Decoding:** network responses, config files, `postMessage` data and form values go through a
  decoder before use.
- **Nullability:** optional spec fields arrive as `null`; code checks `=== null`, never truthiness.

## Examples

```typescript
// WRONG - trusting the network
const config = (await response.json()) as UserSettings;

// CORRECT - decode, then handle failure
const config = decodeUserSettings(await response.json());
if (config === null) {
  return null;
}
```

## Outputs

Record each finding in this phase's plan file using the finding format from the quick reference.

## Validation

- [ ] Every data type is generated, or holds functions or snippets
- [ ] Generated files changed only through regeneration
- [ ] No loose typing, suppressions or debug logging
- [ ] Every external input is decoded
