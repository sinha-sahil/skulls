# Phase 4: Execute & Repoint

The repeatable ritual for taking **one unit** from `todo` to `done`. Run it per checklist row, in the
Phase 3 wave order, using only the conventions discovered in Phase 1. It is the same loop whether one
person runs it many times or many people each run it once.

## Objective

- Adopt the **new surface** for the unit (per its terminal state and mapping).
- Repoint **every** consumer off the old surface.
- Keep the work **parallel-safe** so concurrent owners do not serialize on shared files.

## Critical Rules

1. **Never edit the old surface in place.** Adopt the new surface at each site; the old surface stays
   untouched until retire (Phase 5).
2. **A unit is not `done` while any consumer still uses the old surface for it.** Repoint everything.
3. **Split shared imports; do not rewrite them wholesale.** Editing a shared barrel for every unit
   serializes the team — change only the one line your unit needs.

## The Ritual (per unit)

### Step 0: Confirm state & dependencies

Confirm the row's terminal state and that all `depends-on` rows are `done`.
`NO-OP` → check off with a note, stop. `DROP` → nothing now (retire removes it), stop.

### Step 1: Adopt the new surface

- `MIGRATE`: create the unit at its new home (write the codegen spec entry / add to utils / constants
  / types, or call the new API), per the mapping from Phase 2. If the new home is a partially-covering
  codegen artifact, add only what is missing (Phase 2 Check B).
- `REPOINT-ONLY`: the new surface already covers it — skip authoring, go to Step 3.

### Step 2: Regenerate if codegen

If the new home is a generated artifact, regenerate now using the discovered command and follow the
codegen hygiene rules (see QUICK-REFERENCE): rebase → regenerate → resolve, one unit per PR, never
hand-edit generated output.

### Step 3: Find every consumer

```bash
grep -rn "\b<Unit>\b" src/ --include=*.ts --include=*.svelte --include=*.js
```

### Step 4: Repoint consumers + split shared imports

Point each consumer at the new surface. Split shared/barrel imports so unrelated units don't collide:

```typescript
// BEFORE — one shared import; every unit's repoint touches this line
import { WidgetType, Money, castWidget } from '<old-surface>';

// AFTER — split; only the migrated unit moves, one line changes per unit
import { WidgetType } from '<new-home>';        // migrated this row
import { Money, castWidget } from '<old-surface>';  // still old, other rows
```

This lets two owners repoint two units in the same consumer file with minimal conflict, and keeps each
row's diff reviewable in isolation.

### Step 5: Record any surface-specific flags

If the new surface needs per-unit options (e.g. a generator's nullability/optional handling, or an
API's changed defaults), record them on the checklist row so a reviewer sees the choice was deliberate.

### Step 6: Verify the unit

Run the per-unit verification (Phase 5, Part A) before marking the row `in-review`/`done`.

## Output

Per unit: the new-surface artifact adopted, every consumer repointed, shared imports split, and the
checklist row advanced. The old surface is untouched.

## Done when

For each unit: terminal state honored; new surface adopted (or confirmed already covering); every
consumer repointed off the old surface; shared imports split, not wholesale-rewritten; old surface
unchanged. *(Advance the row's `status` in the checklist.)*
