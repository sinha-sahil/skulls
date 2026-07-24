# Migration Template

Plan and execute a **migration** in any SvelteKit codebase: replace an old, externally-driven
surface with a new one across every site that touches it, coordinate the work across one or more
people via a shared checklist, and retire the old surface once nothing references it.

This template is **stack-agnostic**. It never assumes a package manager, codegen tool, test runner,
or directory layout — every such detail is **discovered from the target repo** in Phase 1 and
referenced as a parameter thereafter.

## What counts as a migration (vs a refactor)

> **Migration = the driver is external.** A new package, dependency version, tool, codegen pipeline,
> or framework API. There is an old externally-coupled surface to leave and a new one to adopt, and
> you **end by retiring the old coupling**. Behavior may be preserved or may shift intentionally.
>
> **Refactor = the driver is internal** (readability, structure, dedup). No external surface changes,
> behavior is invariant, nothing external is retired. Use the `refactor` template for that.

Examples that belong here: package swap, dependency major upgrade, hand-written → codegen, adopting a
framework API tied to a version bump. These differ only in *what old→new surface* Phase 1 discovers —
they are **not** separate templates.

## Core Invariant

**The old surface is fully replaced and retired.** The migration is done only when every coupled
site uses the new surface and zero references to the old surface remain. This — not
behavior-preservation — is the contract at the center. (Behavior preservation is a *per-migration
choice*, declared in Phase 1: preserved, or changed with an explicit list of expected deltas.)

## Principles

1. **Discover, never assume.** Commands, tools, destinations, and conventions come from the target
   repo (Phase 1), not from this template.
2. **The unit is the smallest independently-repointable thing** — a symbol, a call-site, an import —
   not a whole file. One file often couples to the old surface in several independent places.
3. **The mapping is general.** "Where does each unit go" can be *per-unit routing* (unit → a chosen
   destination) or a *uniform transform rule* (old API → new API applied to N sites). Pick the shape
   that fits; the template does not force one.
4. **Never edit the old surface in place.** Adopt the new surface at each site; remove the old surface
   wholesale in the final phase.
5. **The checklist is the spine.** For any migration touched by more than one person, `checklist.md`
   is the single shared, committed coordination artifact. Everything else is read-only methodology.
6. **Global gate before retire.** The old surface is deleted only after a repo-wide check shows no
   remaining references.

## Phases

1. **Discover & Scope** — detect repo parameters (typecheck/lint/test commands, package manager,
   import conventions, codegen presence); identify the **old** and **new** surface; declare the
   behavior contract (preserved, or the list of intended deltas). Fills `00-overview.md`.
2. **Inventory & Mapping** — enumerate every site coupled to the old surface; define the mapping
   (per-unit routing or uniform rule); assign each unit a reconcile terminal state.
3. **Sequencing** — order units by dependency, leaf-first, grouping cycles; *SKIP* when units are
   independent.
4. **Execute & Repoint** — the per-unit ritual: adopt the new surface, repoint consumers, keep the
   work parallel-safe — all using the discovered conventions.
5. **Verify & Retire** — verify with the discovered commands against the declared behavior contract,
   pass the global gate, and retire the old surface atomically.

## The Shared Checklist Convention

`checklist.md` (generated into the plan) is where a team coordinates. It is authored once here and
reused by the `refactor` template. It rides *with the artifact* so co-editors see the rules where
they work.

**Row schema — one unit per row, one row per line:**

```markdown
| # | unit | old→new | terminal | owner | depends-on | status | PR |
|---|------|---------|----------|-------|-----------|--------|----|
| 1 | castWidget | old caster → utils | MIGRATE | @a | — | todo | — |
| 2 | WIDGET_DEFAULTS | old default → constants | MIGRATE | @b | — | todo | — |
```

**Terminal states:** `MIGRATE` (adopt new + repoint) · `REPOINT-ONLY` (new already exists, only
repoint consumers) · `DROP` (nothing live uses it — remove, don't migrate) · `NO-OP` (already fully
on the new surface).

**Status lifecycle:** `todo → claimed → in-progress → in-review → done`.

**Gate rows** (unlock only when all unit rows are `done`): source-immutability holds · global gate
passes · retire.

**Merge discipline (why concurrent editing stays conflict-free):** one unit = one row = one line;
claim by editing only your row; never reflow or re-sort the table; append your PR link. Independent
lines mean two owners rarely touch the same line.

> Note: the MCP loader serves only each template's own README/phases/QUICK-REFERENCE — there is no
> cross-template include. "Shared with `refactor`" means the same authored convention text, kept
> consistent by hand.

## When to Use

- Swapping a package/library for another across the codebase
- A breaking dependency upgrade that touches many call-sites
- Moving hand-written code into a codegen pipeline
- Adopting a framework API/pattern tied to a version bump
- Any job that ends with "…and delete the old version"

## When NOT to Use

- Internal reshaping with no external surface change and invariant behavior → use `refactor`
- Building something new with no existing surface → use `client-module`
