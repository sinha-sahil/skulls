# Migration — Quick Reference

## Is it a migration?

> **Migration = external driver** (package, dep version, tool, codegen, framework API) → adopt the new
> surface everywhere and **retire the old**. Behavior preserved *or* intentionally changed.
> **Refactor = internal driver**, behavior invariant, nothing retired → use the `refactor` template.

package swap · dep major upgrade · hand-written→codegen · framework-API/version pattern change → all
migration, differing only in what old→new surface discovery finds.

## Core invariant

**Old surface fully replaced and retired.** Done = every site on the new surface + zero references to
the old. (Behavior contract is a separate Phase-1 choice: preserved, or an explicit deltas list.)

## Discover, never assume

Phase 1 reads the repo for: package manager · typecheck/lint/test commands · codegen presence ·
path aliases/barrels. Every later phase uses these params — no hardcoded tools.

## Phases

| Phase | Does |
|-------|------|
| 1 Discover & Scope | detect params · name old/new surface · declare behavior contract → `00-overview.md` |
| 2 Inventory & Mapping | enumerate units · pick mapping shape · assign terminal states |
| 3 Sequencing | dependency order, cycles → combined units (SKIP if independent) |
| 4 Execute & Repoint | adopt new surface · repoint consumers · split shared imports |
| 5 Verify & Retire | per-unit gate · global gate · atomic retire |

## Mapping shapes (pick one)

- **Per-unit routing** — each unit → a chosen home (type→spec/types, fn→utils, const→constants).
- **Uniform transform rule** — `old API/pattern → new API/pattern` applied to N sites.

## Terminal states

`MIGRATE` (adopt new + repoint) · `REPOINT-ONLY` (new exists, only repoint) · `DROP` (dead — remove) ·
`NO-OP` (already on new surface).

## Checklist = the spine (multi-person coordination)

One unit = one row = one line. `| # | unit | old→new | terminal | owner | depends-on | status | PR |`
Status: `todo → claimed → in-progress → in-review → done`. Gate rows unlock only when all units `done`.
**Merge discipline:** claim only your row · never reflow/re-sort · append your PR link.

## Codegen hygiene (only if new home is a committed generated artifact)

Never hand-edit generated output · rebase → regenerate → resolve before each push · one unit per PR ·
record per-unit generator flags (nullability, optional handling) on the checklist row.

## Repoint safely (Phase 4)

```typescript
// split shared imports so parallel rows don't collide — one line per unit
import { WidgetType } from '<new-home>';           // migrated
import { Money } from '<old-surface>';             // still old, other rows
```

## Global gate before retire

```bash
grep -rn "<old-surface-token>" src/ --include=*.ts --include=*.svelte --include=*.js
# expect nothing → then: git rm -r <old-surface-path> ; <pm> remove <old-package>
```

## Verify

Run the **discovered** `<typecheck> · <lint> · <test>` against the declared behavior contract, plus
the global-gate grep.
