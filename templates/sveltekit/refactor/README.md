# Refactor Template

Plan and execute an **internal-driven refactor** in any SvelteKit codebase: reshape, rename, extract,
move, or deduplicate code across every affected site, coordinate the work across one or more people via
a shared checklist, and keep observable behavior **byte-for-byte identical** throughout.

This template is **stack-agnostic**. It never assumes a package manager, test runner, or directory
layout — every such detail is **discovered from the target repo** in Phase 1 and referenced as a
parameter thereafter. It is the internal-driven sibling of the `migration` template and reuses the same
discovery model and checklist convention.

## What counts as a refactor (vs a migration)

> **Refactor = the driver is internal.** Readability, structure, dedup, extraction, reorganization.
> **No external surface changes** (no dependency added/removed/upgraded, no tool or framework API
> change), behavior is **invariant**, and nothing external is retired.
>
> **Migration = the driver is external** (a new package, dependency version, tool, codegen pipeline, or
> framework API); you adopt a new surface and retire the old one, and behavior may shift intentionally.
> Use the `migration` template for that.

Examples that belong here: extract/split a module, rename a symbol across the tree, move code to a
canonical home, deduplicate helpers, restructure a directory layout (e.g. service → module
architecture), normalize conventions. If the change is *driven by* a dependency/tool/version, it is a
migration, not a refactor.

## Core Invariant

**Observable behavior is byte-for-byte identical, before and after.** The tests that passed before must
pass after, unchanged — same inputs, same outputs, same side effects. This is the contract at the
center, and it never bends: a refactor that changes behavior is not a refactor, it's two changes badly
mixed. If a behavior change is genuinely needed, it is done as a **separate, non-refactor change**.

**The safety net is characterization tests.** You can only guarantee invariance to the extent behavior
is pinned by tests. Where coverage of the in-scope code is thin, **add characterization tests first**
(Phase 1) so the refactor has a baseline to be checked against.

## Principles

1. **Discover, never assume.** Commands, tools, and conventions come from the target repo (Phase 1),
   not from this template.
2. **The unit is the smallest independently-changeable thing** — a symbol, a definition, a call-site —
   not a whole file. One file often has several independent refactor units.
3. **The mapping is general.** "What happens to each unit" can be *per-unit* (rename map, move map,
   extraction boundaries) or a *uniform rule* (one normalization applied to N sites). Pick the shape
   that fits; the template does not force one.
4. **Never mix a behavior change into a refactor.** If you discover a bug or a needed semantic change
   mid-refactor, split it out into its own change — keep every refactor unit behavior-preserving.
5. **The checklist is the spine.** For any refactor touched by more than one person, `checklist.md` is
   the single shared, committed coordination artifact. Everything else is read-only methodology.
6. **Verify against the frozen baseline.** Behavior is confirmed unchanged by re-running the Phase-1
   baseline; cleanup of old internal locations happens only after references to them are gone.

## Phases

1. **Discover & Scope** — detect repo parameters (typecheck/lint/test commands, package manager,
   test framework, import conventions); define the current shape, the target shape, and the refactor
   kind; establish the behavior-invariance baseline (add characterization tests where thin). Fills
   `00-overview.md`.
2. **Inventory & Mapping** — enumerate every in-scope unit; define the mapping (per-unit or uniform
   rule); assign each unit a terminal state; materialize `checklist.md`.
3. **Sequencing** — order units by dependency, leaf-first, grouping cycles; *SKIP* when units are
   independent.
4. **Execute & Transform** — the per-unit ritual: apply the transform/relocation, repoint consumers,
   keep the work parallel-safe, and re-run the baseline after each unit to confirm behavior held.
5. **Verify & Cleanup** — verify with the discovered commands against the frozen baseline, confirm no
   references to old internal locations remain, and remove the emptied old locations and any dead code.

## The Shared Checklist Convention

`checklist.md` (generated into the plan) is where a team coordinates. It is the same convention the
`migration` template uses, adapted to refactor actions. It rides *with the artifact* so co-editors see
the rules where they work.

**Row schema — one unit per row, one row per line:**

```markdown
| # | unit | action | target | terminal | owner | depends-on | status | PR |
|---|------|--------|--------|----------|-------|-----------|--------|----|
| 1 | formatWidget | rename | formatWidgetLabel | TRANSFORM | @a | — | todo | — |
| 2 | widgetHelpers | move | $lib/widgets/utils | RELOCATE | @b | — | todo | — |
```

**Terminal states:** `TRANSFORM` (reshape/rename in place + repoint) · `RELOCATE` (move/extract to a
new internal home + repoint + remove old location at cleanup) · `DROP` (dead or now-redundant duplicate
— delete) · `NO-OP` (already in the target shape).

**Status lifecycle:** `todo → claimed → in-progress → in-review → done`.

**Gate rows** (unlock only when all unit rows are `done`): full suite matches the frozen baseline ·
no references to old internal locations · cleanup.

**Merge discipline (why concurrent editing stays conflict-free):** one unit = one row = one line; claim
by editing only your row; never reflow or re-sort the table; append your PR link.

> Note: the MCP loader serves only each template's own README/phases/QUICK-REFERENCE — there is no
> cross-template include. Sharing the convention with `migration` means the same authored convention
> text, kept consistent by hand.

## When to Use

- Extracting/splitting modules or restructuring a directory layout (e.g. service → module)
- Renaming symbols, types, or modules across the codebase
- Moving code to canonical homes; deduplicating helpers/types
- Normalizing conventions or reshaping an internal API — with no behavior change

## When NOT to Use

- The change is driven by a dependency/tool/framework-version, or retires an external surface, or
  intentionally changes behavior → use `migration`
- A disruptive upgrade you first need to scope and get go/no-go on → use `upgrade-readiness`
- Building something new with no existing code → use `client-module`
