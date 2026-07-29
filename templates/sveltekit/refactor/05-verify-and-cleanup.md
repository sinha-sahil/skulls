# Phase 5: Verify & Cleanup

Two gates and an internal cleanup. The **per-unit gate** runs before each row is `done`. The **global
gate** runs once, after every row is done, and confirms the whole refactor left behavior byte-for-byte
identical. Only then do you **clean up** the emptied old locations and dead code. Unlike a migration,
nothing *external* is retired — cleanup is internal housekeeping.

## Objective

- Verify each unit against the **frozen Phase-1 baseline**.
- Pass the **global gate**: full suite matches the baseline; no references to old internal locations.
- **Clean up** relocated-from locations and dropped dead code.

## Critical Rules

1. **Behavior is the acceptance test.** The full suite must match the Phase-1 baseline exactly — same
   passes, same outputs. A new failure or a changed assertion means behavior moved; that is a defect,
   not a refactor.
2. **The global gate precedes cleanup.** Do not remove an old location while anything still imports it.
3. **Cleanup is internal only.** Remove emptied files, dead code, and stale internal aliases — never a
   dependency or an external surface (that would make this a migration).

## Part A: Per-Unit Gate (per row, from Phase 4 Step 4)

Run the repo's discovered commands:

```bash
<typecheck>   # must be clean
<lint>        # no dangling imports off the old name/location
<test>        # matches the Phase-1 baseline for this unit's behavior
```

Per-unit checklist: typecheck clean · behavior matches baseline · no consumer uses the old name/location ·
row marked `done`.

## Part B: Global Gate (once, after all rows done)

Every non-`DROP`/`NO-OP` row is `done`. Now prove the refactor as a whole preserved behavior and left no
dangling references:

```bash
# Behavior invariant: the FULL suite matches the frozen Phase-1 baseline (same passes, same outputs)
<test>

# No references remain to any relocated/renamed unit's old path or old name
grep -rn "<old-internal-path>" src/ --include=*.ts --include=*.svelte --include=*.js
grep -rn "\b<old-name>\b" src/ --include=*.ts --include=*.svelte --include=*.js
# Expect: nothing outside the old location itself (which is about to be removed).

# Barrels / aliases no longer re-export the old path
grep -rn "<old-internal-path>" src/**/index.* svelte.config.* vite.config.* tsconfig*.json 2>/dev/null
```

Global gate checklist: all rows `done` · full `<test>` matches baseline · `<typecheck>` + `<lint>` clean ·
no refs to old locations/names · no barrel/alias re-exports the old path.

## Part C: Cleanup (only when Part B passes)

In a single PR (or a small final batch):

```bash
# Remove emptied old locations (for RELOCATE units) and dead code (for DROP units)
git rm <emptied-old-file>
# Remove now-dead internal path aliases pointing at old locations
```

- Delete `DROP` units (dead code, redundant duplicates).
- Remove now-empty files/directories left behind by `RELOCATE`.
- Re-run the full discovered suite after cleanup — it must still match the baseline with the old
  locations gone.

Cleanup checklist: emptied old locations removed · dead/duplicate code deleted · stale internal aliases
removed · full suite matches baseline **after** cleanup · cleanup row in `checklist.md` marked `done`.

## Output

Every unit verified and `done`, the global gate passed (behavior byte-for-byte identical to the
baseline), and old internal locations and dead code cleaned up. The refactor is complete and provably
behavior-preserving.

## Done when

Per-unit gate passed for every row; global gate clean (full suite matches the Phase-1 baseline, no
dangling refs); old locations and dead code removed; full suite still matches the baseline after cleanup.
*(Check the gate and cleanup rows in the checklist.)*
