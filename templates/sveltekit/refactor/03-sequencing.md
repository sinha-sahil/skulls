# Phase 3: Sequencing

Some units depend on others: a type references another type, a helper uses a constant. Reshape or move a
dependent before its dependency and you break the build or leave imports pointing at a not-yet-moved
unit. This phase produces a safe order and groups cycles that must move together.

> **SKIP this phase** when units are independent (typical of a uniform normalization where each site
> stands alone). Mark it `SKIPPED` with that reason and move on.

## Objective

- Build the **dependency graph** over the units (including edges that cross owners).
- Produce a **leaf-first** order.
- Detect **cycles** and collapse each into one **combined unit** that moves together.

## Critical Rules

1. **Leaf-first.** A unit is workable only once every unit it depends on is `done` (or `NO-OP`).
2. **Cycles move together.** Mutually-referencing units cannot be split across PRs — each would import
   the not-yet-moved other. Co-work them as one combined unit.
3. **Ignore dead nodes.** Remove `DROP`/`NO-OP` units before ordering.

## Step 1: Extract Dependencies

For each `TRANSFORM`/`RELOCATE` unit, find which other in-scope units it references:

```bash
grep -n "\b\(<other-in-scope-units>\)\b" <file-defining-Unit>
```

| Unit | Depends on (in-scope units) |
|------|-----------------------------|
| `A` | `B`, `C` |
| `B` | `A` |
| `C` | — (leaf) |

## Step 2: Collapse Cycles

Any mutually-reachable set is a cycle → one combined unit, one PR:

| Combined unit | Members | Reason |
|---------------|---------|--------|
| `A+B` | `A`, `B` | mutual reference |

## Step 3: Leaf-First Waves

Order so every unit follows its dependencies. Units in the same wave are independent and can be worked
in parallel by different owners:

```text
Wave 1 (leaves):  C, ...
Wave 2:           A+B (combined), ...
Wave 3:           units depending on A/B
```

## Step 4: Label Cross-Owner Edges

If an edge crosses owners (owner X's unit depends on owner Y's unit), record it — it becomes the
`depends-on` value in the checklist and gates when that row may start.

## Output

A wave-ordered list of units and combined units, with cross-owner edges labeled. Feeds the `depends-on`
column of `checklist.md`.

## Done when

Dead nodes removed; every remaining unit's in-scope dependencies recorded; all cycles collapsed into
named combined units; a valid leaf-first ordering exists. *(Populate `depends-on` in the checklist.)*
