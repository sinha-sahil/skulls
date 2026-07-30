# Phase 2: Inventory & Mapping

Turn the old surface into a complete list of **units** and decide, per unit, what happens to it. This
is where the migration becomes concrete and idempotent: some units need full work, some only need a
repoint, some are already done, some are dead and just get dropped.

## Objective

- Enumerate every **unit** coupled to the old surface (the smallest independently-repointable thing).
- Define the **mapping** from each unit to its new form — in whichever shape fits.
- Assign each unit a **terminal state** so no-ops and dead code are not re-worked.

## Critical Rules

1. **Inventory is exhaustive before execution.** A missed unit becomes a dangling reference at retire
   time. Enumerate first, work second.
2. **The unit is not the file.** A file may couple to the old surface in several independent places;
   each is its own unit and its own checklist row.
3. **Choose the mapping shape deliberately** (see Step 2) — do not force per-unit routing onto a
   uniform codemod, or vice versa.

## Step 1: Enumerate Units

Using the old-surface token from Phase 1:

```bash
grep -rn "<old-surface-token>" src/ --include=*.ts --include=*.svelte --include=*.js
```

Classify what kind of unit each hit is — the classification only matters insofar as it drives the
mapping. Common kinds and where they tend to go:

| Unit kind | Typical new home (per repo — from discovery) |
|-----------|----------------------------------------------|
| a data type / shape | a codegen spec (if the repo has one) or a types module |
| a transform / caster / helper fn | a utils module |
| a default / literal value | a constants module |
| a UI component | a components location |
| a call-site of an old API | the equivalent new API call |
| non-representable code (e.g. holds functions, conditional shapes) | a hand-written location — never codegen |

## Step 2: Define the Mapping (pick the shape)

Pick whichever matches this migration:

**Per-unit routing** — each unit goes to a specific chosen destination. Good for consolidations and
fan-outs (one source file's type/fn/constant each land in different homes).

| Unit | Old location | New home |
|------|--------------|----------|
| `WidgetType` | old surface | types / codegen spec |
| `castWidget` | old surface | utils |
| `WIDGET_DEFAULTS` | old surface | constants |

**Uniform transform rule** — one rule applied to every matching site. Good for package swaps,
API-shape changes, pattern/version migrations.

```text
Rule: <old API call/pattern>  →  <new API call/pattern>
e.g.  oldClient.get(url)       →  newClient.fetch(url)
Applies to: every site found in Step 1.
```

Record which shape you chose in `00-overview.md`.

## Step 3: Assign Terminal States (reconcile)

For each unit run two checks and assign exactly one state:

```bash
# Check A — is it used anywhere live (outside dead code)?
grep -rn "\b<Unit>\b" src/ --include=*.ts --include=*.svelte --include=*.js

# Check B — does the new surface already cover it?
grep -rn "\b<Unit>\b" <new-surface-location>
```

| Terminal state | When | Action |
|----------------|------|--------|
| `NO-OP` | New surface already covers it AND nothing references the old one | nothing to do |
| `REPOINT-ONLY` | New surface already covers it, but consumers still use the old | only repoint (Phase 4) |
| `MIGRATE` | New surface does not cover it yet; unit is live | adopt new + repoint |
| `DROP` | Nothing live uses it (Check A empty) | do not migrate; remove at retire |

## Output

A complete unit ledger: every unit with its kind, its mapping (destination or rule), and exactly one
terminal state.

**Materialize `checklist.md` now** — create the file in the plan directory and emit one row per unit,
using the row schema and terminal states from the README. This file is the shared coordination spine
for every later phase; phases 03–05 update its rows rather than re-authoring it.

## Done when

Every old-surface site is enumerated as a unit; the mapping shape is chosen and filled; every unit
has exactly one terminal state; dead units are `DROP` and already-done units are `NO-OP`. *(Emit these
as checklist rows per the README convention.)*
