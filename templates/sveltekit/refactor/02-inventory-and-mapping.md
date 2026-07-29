# Phase 2: Inventory & Mapping

Turn the in-scope surface into a complete list of **units** and decide, per unit, what happens to it.
This is where the refactor becomes concrete and idempotent: some units need reshaping, some need moving,
some are already in the target shape, and some are dead and just get dropped.

## Objective

- Enumerate every **unit** in scope (the smallest independently-changeable thing).
- Define the **mapping** from each unit to its target form — in whichever shape fits.
- Assign each unit a **terminal state**, then **materialize `checklist.md`**.

## Critical Rules

1. **Inventory is exhaustive before execution.** A missed unit becomes a dangling reference at cleanup
   time. Enumerate first, work second.
2. **The unit is not the file.** A file may hold several independent units; each is its own unit and its
   own checklist row.
3. **Choose the mapping shape deliberately** (see Step 2) — do not force a per-unit map onto a uniform
   normalization, or vice versa.

## Step 1: Enumerate Units

Using the in-scope token(s) from Phase 1:

```bash
grep -rn "<in-scope-token>" src/ --include=*.ts --include=*.svelte --include=*.js
```

Record what each unit is (a type, a function, a constant, a component, a call-site) — this informs its
target and terminal state.

## Step 2: Define the Mapping (pick the shape)

Pick whichever matches this refactor:

**Per-unit mapping** — each unit gets a specific target. Good for renames, moves, and extractions.

| Unit | Current | Target |
|------|---------|--------|
| `formatWidget` | `$lib/misc.ts` | rename → `formatWidgetLabel` (same file) |
| `widgetHelpers` | `$lib/misc.ts` | move → `$lib/widgets/utils.ts` |
| `WidgetRow` | `routes/+page.svelte` | extract → `$lib/widgets/WidgetRow.svelte` |

**Uniform rule** — one rule applied to every matching site. Good for normalizations and pattern cleanups.

```text
Rule: <current form>  →  <target form>
e.g.  default export   →  named export
Applies to: every site found in Step 1.
```

Record which shape you chose in `00-overview.md`.

## Step 3: Assign Terminal States (reconcile)

For each unit run two checks and assign exactly one state:

```bash
# Check A — is it used anywhere live (outside dead code)?
grep -rn "\b<Unit>\b" src/ --include=*.ts --include=*.svelte --include=*.js

# Check B — is it already in the target shape?
# (already renamed / already at the target path / already the canonical copy)
```

| Terminal state | When | Action |
|----------------|------|--------|
| `NO-OP` | Already in the target shape | nothing to do |
| `TRANSFORM` | Reshape/rename in place; unit is live | apply the transform + repoint (Phase 4) |
| `RELOCATE` | Move/extract to a new internal home; unit is live | move + repoint; remove old location at cleanup |
| `DROP` | Dead, or a now-redundant duplicate (Check A empty, or superseded by a canonical unit) | do not reshape; remove at cleanup |

> Deduplication: point every consumer at the canonical unit (`RELOCATE`/`TRANSFORM` on the consumers),
> then mark the redundant copies `DROP`.

## Output

A complete unit ledger: every unit with its action, its mapping (target or rule), and exactly one
terminal state.

**Materialize `checklist.md` now** — create the file in the plan directory and emit one row per unit,
using the row schema and terminal states from the README. This file is the shared coordination spine for
every later phase; phases 03–05 update its rows rather than re-authoring it.

## Done when

Every in-scope site is enumerated as a unit; the mapping shape is chosen and filled; every unit has
exactly one terminal state; dead/redundant units are `DROP` and already-shaped units are `NO-OP`.
*(Emit these as checklist rows per the README convention.)*
