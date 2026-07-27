# Phase 1: Discover & Scope

A migration template must not assume your stack. This phase reads the **target repo** to learn how it
builds, tests, and organizes code, then pins down exactly which old surface is leaving and which new
surface is arriving. Everything downstream references what you record here.

## Objective

- Discover the repo-specific **parameters** (commands, tools, conventions) the rest of the plan uses.
- Identify the **old surface** (what is being migrated away from) and the **new surface** (what is
  being adopted).
- Declare the **behavior contract**: preserved, or changed with an explicit list of expected deltas.

## Critical Rules

1. **Record parameters, don't hardcode tools.** No later phase may name a command or path that was
   not discovered here.
2. **Name the old surface as a searchable token.** You must be able to `grep` for it later (import
   specifier, symbol, package name, API call).
3. **Decide the behavior contract now.** A migration either preserves behavior or changes it on
   purpose — never leave this implicit.

## Step 1: Discover Repo Parameters

Inspect the target repo and record the results in `00-overview.md`:

```bash
# Package manager: lockfile tells you which
ls pnpm-lock.yaml package-lock.json yarn.lock 2>/dev/null

# Scripts: the real typecheck / lint / test commands
cat package.json   # read the "scripts" block; note the exact names used

# Codegen present? (only relevant to some migrations)
grep -in "generate" package.json
grep -rln "@generated\|DO NOT EDIT\|AUTO-GENERATED" src/ 2>/dev/null

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
| codegen pipeline | present / absent (+ regenerate command) |
| path aliases / barrels | (from config) |

## Step 2: Identify Old & New Surface

State both precisely:

- **Old surface** — what leaves, as a token you can search for. Examples: a package name, an import
  specifier, a symbol/API, a directory, a deprecated pattern.
- **New surface** — what is adopted in its place, and where it lives (a package, a generated module,
  a utils/constants location, a new API).

```bash
# Confirm the old surface is real and find its blast radius (rough count now, full inventory in Phase 2)
grep -rn "<old-surface-token>" src/ --include=*.ts --include=*.svelte --include=*.js | wc -l
```

## Step 3: Declare the Behavior Contract

Choose one and record it in `00-overview.md`:

- **Preserved** — observable behavior must be identical. Note which existing tests are the baseline;
  confirm they are green on the current commit *before* any change.
- **Intentional deltas** — behavior changes on purpose (common for major dependency upgrades). List
  each expected delta and how it will be verified. Anything not on the list must still be unchanged.

```bash
# Find the tests that currently cover the old surface (baseline)
grep -rn "<old-surface-token>" --include=*.test.* --include=*.spec.* .
```

## Output

`00-overview.md` contains: **Goal · Scope · Old surface · New surface · Discovered Parameters ·
Behavior contract (preserved | deltas list) · Success criteria**. This is the ground truth every
later phase and the checklist reference.

## Done when

Discovered parameters recorded; old and new surface named with a searchable token; behavior contract
declared with a green baseline (or an explicit deltas list). *(Carry each of these into
`checklist.md` per the README convention.)*
