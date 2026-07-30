# Phase 5: Verify & Retire

Two gates and a cutover. The **per-unit gate** runs before each row is `done`. The **global gate**
runs once, after every row is done, and is the only thing that unlocks **retire** — the atomic removal
of the old surface. Retire before the global gate passes and you leave dangling references; retire is
the last thing that happens, and it happens all at once.

## Objective

- Verify each unit against the **declared behavior contract** using the **discovered** commands.
- Pass the **global gate**: zero references to the old surface remain where they should not.
- **Retire** the old surface atomically.

## Critical Rules

1. **Verify against the contract from Phase 1.** Preserved → the baseline tests still pass unchanged.
   Intentional deltas → each listed delta is confirmed and nothing off-list changed.
2. **The global gate is a hard precondition for retire.** No "clean up later."
3. **Retire is atomic and wholesale.** Remove the entire old surface in one PR — never trickle-remove,
   which reintroduces half-migrated state.

## Part A: Per-Unit Gate (per row, from Phase 4 Step 6)

Run the repo's discovered commands:

```bash
<typecheck>   # must be clean
<lint>        # no dangling imports off the old surface
<test>        # behavior contract holds (baseline green, or expected deltas match)
```

Plus the per-unit no-lingering check:

```bash
# No consumer still reaches this unit through the old surface
grep -rn "\b<Unit>\b" src/ --include=*.ts --include=*.svelte --include=*.js
# Expect: only the new-surface definition; nothing via the old surface
```

Per-unit checklist: typecheck clean · tests match the contract · no consumer uses the old surface for
this unit · new surface is the single source of truth · row marked `done`.

## Part B: Global Gate (once, after all rows done)

Every non-`DROP`/`NO-OP` row is `done`. Now prove the old surface is fully orphaned:

```bash
# Zero references to the old surface where it should no longer appear
grep -rn "<old-surface-token>" src/ --include=*.ts --include=*.svelte --include=*.js
# Expect: nothing (or only the old surface's own files, about to be removed).

# Also check barrels, path aliases, and dependency manifests
grep -rn "<old-surface-token>" src/**/index.* svelte.config.* vite.config.* tsconfig*.json package.json 2>/dev/null
```

Global gate checklist: all rows `done` · repo-wide grep clean · no barrel re-exports the old surface ·
aliases/manifest no longer reference it · full `<typecheck> && <lint> && <test>` green on the
integrated branch.

## Part C: Retire (only when Part B passes)

In a single PR:

```bash
# Remove the old surface wholesale — delete files, and drop the dependency if it was a package
git rm -r <old-surface-path>
# If the old surface was a package, remove it from the manifest and update the lockfile
<package-manager> remove <old-package>
```

- Remove now-dead path aliases pointing at the old surface.
- Re-run the full discovered suite on the retire PR; it must be green with the old surface gone.

Retire checklist: old surface removed in one PR · dead aliases/manifest entries cleaned · full suite
green **after** removal · retire row in `checklist.md` marked `done`.

## Output

Every unit verified and `done`, the global gate passed, and the old surface atomically retired. The
migration is complete and satisfies its declared behavior contract.

## Done when

Per-unit gate passed for every row; global gate clean; old surface removed atomically in one PR; full
discovered suite green with it gone; the Phase 1 behavior contract holds end-to-end. *(Check the gate
and retire rows in the checklist.)*
