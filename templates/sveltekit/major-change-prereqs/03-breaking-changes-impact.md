# Phase 3: Breaking Changes Impact

Derive the target release's breaking-change set from its migration guide.
Count occurrences of each affected pattern in the codebase.
Classify effort per category and produce a priority table.

## Inputs

- The target release's official migration guide (primary source of breaking changes)
- The target compiler's own migration guide (Svelte, if bumping the compiler alongside SvelteKit)
- The codebase (`src/`, `src/routes/`)

## Process

### 1. Enumerate breaking-change categories

Read the migration guide end-to-end. List every breaking change it documents.
Two families typically apply to a SvelteKit upgrade:

- **Compiler-level** — Svelte syntax and runtime API changes
  (props, reactivity, events, slots, lifecycle, custom elements)
- **SvelteKit-level** — framework API changes
  (`error` / `redirect` / `fail` control flow, `cookies`, `$app/*` imports, `load` functions,
  form actions, route helpers, hooks, env vars)

For each category, record:

- **Before pattern** (SvelteKit-1-era syntax / API)
- **After pattern** (target syntax / API)
- **Detection method** (how to find it — grep regex, AST query, etc.)
- **Effort class** (mechanical / moderate / requires-redesign)
- **Automation** (does the official migration tool handle it?)
- **Severity** (compile-time error / runtime break / deprecation / silent behavior change)

### 2. Derive detection commands

For each pattern, write a grep that finds occurrences. Good grep patterns:

- Match the **literal API call** or **import specifier**, not the intent
- Restrict file types with `--include="*.svelte"` or `--include="*.ts"`
- Use `| wc -l` for counts, `-l` for file counts
- Anchor on unambiguous tokens (e.g. `'^\s*\$:'` not `'\$:'` to avoid false matches)

Examples of the shape:

```bash
# Find a specific API call
grep -rn "<before-api-call>" src/ --include="*.svelte" | wc -l

# Find a specific import
grep -rn "from '<old-module>'" src/ --include="*.svelte" --include="*.ts" | wc -l

# Find a specific syntactic pattern (anchored)
grep -rn "^\s*<before-syntax>" src/ --include="*.svelte" | wc -l
```

### 3. Count occurrences

Run every detection command. Record:

- Total occurrences
- Files affected
- Routes affected (if a SvelteKit API pattern)

### 4. Classify effort

For each category:

| Class | Meaning |
|-------|---------|
| **Mechanical** | 1-to-1 rewrite, can be scripted or auto-migrated |
| **Moderate** | Requires understanding semantics (cleanup, concurrency, data flow) |
| **Requires redesign** | No automatic mapping — needs human judgment per call site |

### 5. Identify runtime-break patterns

Some breaking changes are **runtime errors** rather than compile-time errors.
These are P0 blockers because nothing fails at build time but the app breaks in production.

Flag every category whose pre-change form silently passes validation but fails at runtime.

### 6. Check automated-migration tool coverage

Most Svelte / SvelteKit upgrades ship an automated migration tool:

```bash
# Dry-run only — do not apply in this phase
# npx sv migrate <target>       # Svelte compiler migrations
# npx svelte-migrate <target>   # SvelteKit framework migrations
```

Record which categories the tool handles and which are left to manual work.

## Output

Impact summary:

| Family | Pattern | Count | Effort | Auto? | Severity | Priority |
|--------|---------|-------|--------|-------|----------|----------|
| Compiler | ... | ___ | mechanical / moderate / redesign | yes / partial / no | build / runtime / deprecation | P0-P3 |
| SvelteKit | ... | ___ | ... | ... | ... | ... |

Plus:

- Total component count
- Total route count
- Runtime-break blockers listed separately
- Automated-tool coverage summary (handled vs manual)

## Verification

- [ ] Target release's migration guide read in full
- [ ] Every documented breaking change has a category row
- [ ] Every category has a detection command
- [ ] Every category has a count recorded
- [ ] Every category has an effort class
- [ ] Every category has an automation flag
- [ ] Runtime-break patterns flagged as P0
- [ ] Compiler-level and SvelteKit-level families kept distinct
- [ ] Automated-tool coverage documented
- [ ] Priority order set
