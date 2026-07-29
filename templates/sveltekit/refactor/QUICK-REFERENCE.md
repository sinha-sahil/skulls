# Refactor — Quick Reference

## Is it a refactor?

> **Refactor = internal driver** (readability, structure, dedup, extraction, reorganization). No
> external surface change, behavior **invariant**, nothing external retired.
> **Migration = external driver** (package, dep version, tool, codegen, framework API) → adopt new
> surface, retire old, behavior may change → use the `migration` template.
> Need to scope/go-no-go a disruptive upgrade first → `upgrade-readiness`.

extract/split module · rename symbol · move to canonical home · dedup helpers · restructure directory
(service → module) · normalize conventions → all refactor.

## Core invariant

**Behavior byte-for-byte identical.** The tests that passed before pass after, unchanged. A refactor
that changes behavior is two changes badly mixed — split the behavior change out.

## The safety net = characterization tests

You can only guarantee invariance to the extent tests pin the behavior. Thin coverage on the in-scope
code → **add characterization tests first** (Phase 1) to create the frozen baseline.

## Discover, never assume

Phase 1 reads the repo for: package manager · typecheck/lint/test commands · test framework · path
aliases/barrels. Every later phase uses these params — no hardcoded tools.

## Phases

| Phase | Does |
|-------|------|
| 1 Discover & Scope | detect params · current/target shape + kind · freeze behavior baseline → `00-overview.md` |
| 2 Inventory & Mapping | enumerate units · pick mapping shape · assign terminal states · materialize `checklist.md` |
| 3 Sequencing | dependency order, cycles → combined units (SKIP if independent) |
| 4 Execute & Transform | apply transform/relocate · repoint · split imports · re-check baseline per unit |
| 5 Verify & Cleanup | per-unit gate · global gate (suite == baseline) · remove old locations + dead code |

## Refactor kinds

`extract` · `rename` · `move` · `restructure` · `dedup` · `normalize`

## Mapping shapes (pick one)

- **Per-unit** — each unit → a rename/move/extraction target.
- **Uniform rule** — `current form → target form` applied to N sites.

## Terminal states

`TRANSFORM` (reshape/rename in place + repoint) · `RELOCATE` (move/extract to new internal home +
repoint + remove old at cleanup) · `DROP` (dead / redundant duplicate — delete) · `NO-OP` (already in
target shape).

## Checklist = the spine (multi-person coordination)

One unit = one row = one line. `| # | unit | action | target | terminal | owner | depends-on | status | PR |`
Status: `todo → claimed → in-progress → in-review → done`. Gate rows unlock only when all units `done`.
**Merge discipline:** claim only your row · never reflow/re-sort · append your PR link.

## Never mix a behavior change into a refactor

Found a bug or needed semantic change mid-refactor? Split it into its own non-refactor change. Every
refactor unit stays behavior-preserving.

## Repoint safely (Phase 4)

```typescript
// split shared imports so parallel rows don't collide — one line per unit
import { formatWidgetLabel } from '$lib/misc';     // renamed
import { widgetHelpers } from '$lib/misc';         // untouched, other rows
```

## Global gate before cleanup

```bash
<test>   # full suite matches the frozen Phase-1 baseline
grep -rn "<old-internal-path>" src/ --include=*.ts --include=*.svelte
# expect nothing → then: git rm <emptied-old-file>  (+ delete dead code)
```

## Verify

Run the **discovered** `<typecheck> · <lint> · <test>`; the suite must match the pre-refactor baseline.
