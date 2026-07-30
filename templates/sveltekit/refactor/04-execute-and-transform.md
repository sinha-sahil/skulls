# Phase 4: Execute & Transform

The repeatable ritual for taking **one unit** from `todo` to `done`. Run it per checklist row, in the
Phase 3 wave order, using only the conventions discovered in Phase 1. Every unit's change must be
**behavior-preserving** and is checked against the Phase-1 baseline before it is `done`.

## Objective

- Apply the unit's **transform or relocation** (per its terminal state and mapping).
- Repoint **every** consumer to the new name/location.
- Keep the work **parallel-safe**, and confirm behavior is unchanged after each unit.

## Critical Rules

1. **Behavior-preserving per unit.** After each unit, the Phase-1 baseline must still be green with no
   change to expected outputs. If it isn't, you changed behavior — revert and reconsider.
2. **Never mix in a behavior change.** If you spot a bug or a needed semantic change, split it into a
   separate, non-refactor change — do not fold it into a refactor unit.
3. **Split shared imports; do not rewrite them wholesale.** Editing a shared barrel for every unit
   serializes the team — change only the one line your unit needs.

## The Ritual (per unit)

### Step 0: Confirm state & dependencies

Confirm the row's terminal state and that all `depends-on` rows are `done`.
`NO-OP` → check off with a note, stop. `DROP` → nothing now (cleanup removes it), stop.

### Step 1: Apply the transform / relocation

- `TRANSFORM`: reshape or rename the unit in place (rename the symbol, change the signature shape, inline,
  normalize), per the mapping from Phase 2. Behavior of the unit itself must not change.
- `RELOCATE`: create the unit at its new internal home (move the definition / extract into a new file);
  leave the old location in place for now — it is removed at cleanup once nothing references it.

### Step 2: Find every consumer

```bash
grep -rn "\b<Unit>\b" src/ --include=*.ts --include=*.svelte --include=*.js
```

### Step 3: Repoint consumers + split shared imports

Point each consumer at the new name/location. Split shared/barrel imports so unrelated units don't
collide:

```typescript
// BEFORE — one shared import; every unit's repoint touches this line
import { formatWidget, widgetHelpers, Money } from '$lib/misc';

// AFTER — split; only the changed unit moves, one line changes per unit
import { formatWidgetLabel } from '$lib/misc';        // renamed this row
import { widgetHelpers, Money } from '$lib/misc';     // untouched, other rows
```

This lets two owners repoint two units in the same consumer file with minimal conflict, and keeps each
row's diff reviewable in isolation.

### Step 4: Confirm behavior held

Run the Phase-1 baseline (or the subset covering this unit) plus the discovered checks:

```bash
<test>        # baseline still green — no expected-output changes
<typecheck>   # clean
```

If anything went red that is not a pure mechanical fix (an import path), you changed behavior — back out.

### Step 5: Advance the row

Mark the checklist row `in-review`/`done`. The old location (for `RELOCATE`) stays until Phase 5.

## Output

Per unit: the transform/relocation applied, every consumer repointed, shared imports split, behavior
confirmed unchanged, and the checklist row advanced.

## Done when

For each unit: terminal state honored (`NO-OP`/`DROP` short-circuited); transform/relocation applied;
every consumer repointed; shared imports split, not wholesale-rewritten; the Phase-1 baseline still green.
*(Advance the row's `status` in the checklist.)*
