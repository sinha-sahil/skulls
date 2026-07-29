# Phase 1: Discover & Scope

A refactor template must not assume your stack. This phase reads the **target repo** to learn how it
builds and tests, pins down the current shape and the target shape, and — most importantly — establishes
the **behavior-invariance baseline** the whole refactor is checked against. A refactor with no baseline
is a hope, not a plan.

## Objective

- Discover the repo-specific **parameters** (commands, tools, conventions) the rest of the plan uses.
- Define the **current shape**, the **target shape**, and the **refactor kind**.
- Establish the **behavior-invariance baseline** — and add characterization tests where coverage is thin.

## Critical Rules

1. **Record parameters, don't hardcode tools.** No later phase may name a command or path that was not
   discovered here.
2. **Behavior is invariant — there is no "deltas" option.** Unlike a migration, a refactor never
   intentionally changes behavior. If it must, that is a separate change (see Principle 4).
3. **The baseline is a precondition.** You cannot safely refactor code whose behavior is not pinned by
   tests. Where it is not, add characterization tests *before* touching the code.

## Step 1: Discover Repo Parameters

Inspect the target repo and record the results in `00-overview.md`:

```bash
# Package manager: lockfile tells you which (<pm> throughout the plan)
ls pnpm-lock.yaml package-lock.json yarn.lock 2>/dev/null

# Scripts: the real typecheck / lint / test commands
cat package.json   # read the "scripts" block; note the exact names used

# Test framework + coverage: how behavior is pinned
grep -iE "vitest|playwright|jest|@testing-library" package.json
grep -in "coverage" package.json

# Import conventions: aliases and barrels in use
cat svelte.config.* vite.config.* tsconfig*.json 2>/dev/null   # path aliases (e.g. $lib)
```

Record the **Discovered Parameters** table in `00-overview.md`:

| Parameter | Discovered value |
|-----------|------------------|
| package manager | (from lockfile) |
| typecheck command | (from scripts) |
| lint command | (from scripts) |
| test command | (from scripts) |
| test framework / coverage | (from deps) |
| path aliases / barrels | (from config) |

## Step 2: Define Current Shape, Target Shape, Refactor Kind

State all three precisely in `00-overview.md`:

- **Current shape** — how the in-scope code is organized today (the surface you will search over).
- **Target shape** — the exact end-state you are reshaping toward.
- **Refactor kind** — one or more of: `extract` · `rename` · `move` · `restructure` · `dedup` ·
  `normalize`. This drives the mapping shape in Phase 2.

```bash
# Confirm the in-scope surface is real and get a rough size (full inventory in Phase 2)
grep -rn "<in-scope-token>" src/ --include=*.ts --include=*.svelte --include=*.js | wc -l
```

## Step 3: Establish the Behavior-Invariance Baseline

The refactor is only as safe as the tests that pin the affected behavior.

```bash
# Find the tests that currently cover the in-scope code
grep -rn "<in-scope-token>" --include=*.test.* --include=*.spec.* .

# Run the suite now and capture the result — this is the frozen baseline
<test>
```

- Confirm the baseline is **green** on the current commit before any change.
- Judge coverage: does the suite actually exercise the observable behavior of the in-scope code?
- **If coverage is thin**, add **characterization tests** (tests that assert current behavior as-is,
  not desired behavior) so the refactor has something to be verified against. Record what you added.
- Note any behavior that is hard to pin (side effects, timing, I/O) and how you will observe it.

## Output

`00-overview.md` contains: **Goal · Scope · Current shape · Target shape · Refactor kind · Discovered
Parameters · Behavior-invariance baseline (suite result + characterization tests added) · Success
criteria**. This is the ground truth every later phase and the checklist reference.

## Done when

Discovered parameters recorded; current and target shape defined with a chosen refactor kind; the
behavior-invariance baseline is green and sufficient (characterization tests added where coverage was
thin). *(Carry each of these into `checklist.md` per the README convention.)*
