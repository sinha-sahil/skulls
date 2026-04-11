# Quick Reference

> This template is a **process framework**. For any change path, run the phases against
> the target release's official migration guide.

## Phase sequence

| # | Phase | Primary output |
|---|-------|----------------|
| 1 | Dependency audit | version mapping table, peer conflict list, adapter decision |
| 2 | Config changes | per-file diff plan |
| 3 | Breaking changes impact | derived pattern set, counts, effort classification |
| 4 | CI/CD changes | pipeline / adapter / deploy manifest |
| 5 | Validation strategy | pass criteria per layer, go/no-go |

## Always-needed inputs

- Target release's official migration guide (primary source)
- Adapter's own changelog (adapter major decision)
- Current `package.json` + lockfile
- Current `src/hooks.*`, `src/app.d.ts`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`

## Detection command shapes

Generic patterns — substitute the actual before-form from the target migration guide:

```bash
# Count a specific API call
grep -rn "<api-call>" src/ --include="*.svelte" | wc -l

# Count a specific import
grep -rn "from '<old-module>'" src/ --include="*.svelte" --include="*.ts" | wc -l

# Count a specific syntactic pattern (anchored)
grep -rn "^\s*<pattern>" src/ --include="*.svelte" | wc -l

# Count files affected (not occurrences)
grep -rl "<pattern>" src/ --include="*.svelte" | wc -l
```

## Effort classes

| Class | Meaning |
|-------|---------|
| Mechanical | 1-to-1 rewrite, scriptable or auto-migratable |
| Moderate | Requires semantic understanding (cleanup, concurrency, data flow) |
| Redesign | No automatic mapping — human judgment per call site |

## Severity classes

| Severity | Meaning |
|----------|---------|
| Build break | Compile-time error |
| Runtime break | Passes build, fails in production — **always P0** |
| Deprecation | Old form still works with warning — P2 / P3 |
| Silent behavior change | Old form runs but semantics differ — **P0 until verified** |

## Config file inventory

| File | Typical concerns |
|------|------------------|
| `svelte.config.js` | Preprocessor import paths, compiler options, `kit.adapter`, `kit.alias`, `kit.paths` |
| `vite.config.ts` | Plugin import, Vite version, custom plugins |
| `tsconfig.json` | `moduleResolution`, `verbatimModuleSyntax`, version minimums, `extends` path |
| `src/hooks.server.ts` / `hooks.client.ts` | Control-flow helpers, cookie APIs, error handlers |
| `src/app.d.ts` | `App` namespace shapes |
| `eslint.config.js` / `.eslintrc` | Plugin version matches target compiler syntax |
| `.prettierrc` / `prettier.config.*` | `prettier-plugin-svelte` version |
| `.nvmrc` / `.node-version` | Node minimum |
| `Dockerfile` | Base image, install command, build command, entry point |
| `vercel.json` / `netlify.toml` / `wrangler.toml` | Adapter-specific deploy config |

## Go / No-Go blockers

- [ ] `pnpm install` — zero peer errors
- [ ] `pnpm exec svelte-kit sync` — exit 0
- [ ] `pnpm build` — exit 0
- [ ] Adapter output shape matches expected layout
- [ ] `pnpm check` runs
- [ ] `pnpm lint` runs
- [ ] Dev server + `preview` serve home + one dynamic route
- [ ] No runtime errors from Phase 3 runtime-break patterns

## Validation order

1. Clean install
2. `svelte-kit sync`
3. Production build
4. Type check
5. Lint
6. Bundle comparison
7. Dev server
8. Route + endpoint smoke
9. Adapter-specific smoke
10. Tests
11. CI pipeline

## Automated migration tools

If the target release ships one, use it **in dry-run only** during this phase.
The template does not apply migrations — that belongs in a separate execution phase.

```bash
# Svelte compiler migrations (varies by target)
# npx sv migrate <target>

# SvelteKit framework migrations (varies by target)
# npx svelte-migrate <target>
```

Record which categories the tool handles and which are left manual.
