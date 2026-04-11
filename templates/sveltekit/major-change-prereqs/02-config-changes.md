# Phase 2: Config Changes

Catalogue every config file touched by the change. Record exact before/after for each.

## Inputs

- The target release's migration guide (config section)
- Phase 1 dependency decisions (import paths and package names may have moved)

## Process

### 1. Inventory configs

```bash
ls -la svelte.config.* vite.config.* tsconfig* .eslintrc* eslint.config.* 2>/dev/null
ls -la src/hooks.server.* src/hooks.client.* 2>/dev/null
ls -la .prettierrc* prettier.config.* postcss.config.* tailwind.config.* 2>/dev/null
ls -la app.html app.d.ts 2>/dev/null
```

Record each file's role and whether the target release touches it.

### 2. `svelte.config.js`

Audit for:

- Import paths that moved in the target release (e.g. preprocessor helpers may live in a different package)
- Deprecated / removed compiler options
- New compiler options to consider (e.g. strict / runes modes)
- `kit.adapter` — re-validate with adapter major from Phase 1
- `kit.alias` — verify `$lib`, `$app`, custom aliases still resolve
- `kit.paths.base` / `kit.paths.assets` — re-test if set

### 3. `vite.config.ts`

```bash
grep -n "sveltekit\|svelte\|preprocess" vite.config.* 2>/dev/null
```

Check:

- `@sveltejs/kit/vite` still exports `sveltekit()` — unchanged across SK majors so far
- Vite version in `package.json` matches target minimum
- Custom plugins still compatible
- `server.fs.allow` / `resolve.alias` still resolve

### 4. `tsconfig.json`

The SvelteKit-generated base is at `.svelte-kit/tsconfig.json` — extend, do not edit directly.

```bash
grep -n "moduleResolution\|verbatimModuleSyntax\|importsNotUsedAsValues\|extends" tsconfig.json
```

Check for:

- Options deprecated in the target TypeScript version
- Options replaced in the target TypeScript version
- `moduleResolution` value compatible with target bundler
- Types referenced by the target release (e.g. new ambient types)

### 5. `src/hooks.server.ts` / `src/hooks.client.ts`

Hooks files are commonly touched by framework-level breaking changes (control-flow helpers,
cookie APIs, error handlers). Record whether the file exists and whether Phase 3 patterns touch it.

```bash
grep -n "handle\|handleFetch\|handleError" src/hooks.server.* 2>/dev/null
```

### 6. `app.html` / `app.d.ts`

```bash
grep -n "%sveltekit\." app.html 2>/dev/null
cat src/app.d.ts 2>/dev/null
```

SvelteKit's `App` namespace interface (`App.Locals`, `App.PageData`, `App.Error`, `App.Platform`, `App.PageState`)
may have new or changed shapes in the target release.

### 7. ESLint / Prettier

```bash
grep -n "svelte\|eslint-plugin-svelte" eslint.config.* .eslintrc* 2>/dev/null
grep "prettier-plugin-svelte" package.json
```

Check plugin versions against target Svelte compiler — new syntax (runes, snippets) requires
plugins that understand it.

### 8. CSS tooling (PostCSS / Tailwind)

Usually unaffected. Re-test only if the preprocessor pipeline changes touch CSS processing.

### 9. Environment variable configs

```bash
grep -rn "\$env/static\|\$env/dynamic" src/
ls .env .env.local .env.production 2>/dev/null
```

Record which env vars are static (build-time) vs dynamic (runtime) — dynamic vars' resolution
depends on adapter and may need re-testing after an adapter bump.

### 10. Deployment config files

```bash
ls vercel.json netlify.toml wrangler.toml Dockerfile 2>/dev/null
```

Inventory here; diff planning happens in Phase 4.

## Output

Per-file changelog:

| File | Current | New | Reason |
|------|---------|-----|--------|
| ... | ... | ... | ... |

Include order-of-operations where changes are co-dependent
(e.g., remove an old preprocessor package only *after* the new import path works).

## Verification

- [ ] All config files inventoried
- [ ] Target release's migration guide config section applied to every relevant file
- [ ] `svelte.config.js` diff specified
- [ ] `vite.config.*` diff specified
- [ ] `tsconfig.json` diff specified (deprecated options removed, new ones added)
- [ ] `src/hooks.*` diff specified (if touched by Phase 3 patterns)
- [ ] `src/app.d.ts` `App` namespace reviewed
- [ ] ESLint + Prettier plugin versions match target compiler syntax
- [ ] `kit.adapter` / `kit.alias` / `kit.paths` re-validation recorded
- [ ] Env var inventory captured
- [ ] Deployment config files inventoried (diffed in Phase 4)
- [ ] Co-dependent changes ordered
