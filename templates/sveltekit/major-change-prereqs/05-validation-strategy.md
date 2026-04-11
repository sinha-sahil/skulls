# Phase 5: Validation Strategy

Define pass criteria for every layer. Produce go/no-go before feature code rewrites begin.

## Inputs

- The runtime-break patterns flagged in Phase 3 (for dedicated smoke checks)
- The adapter output shape from Phase 1 (for adapter-specific smoke)

## Layers

### 1. Dependency install

```bash
rm -rf node_modules pnpm-lock.yaml .svelte-kit
pnpm install
pnpm install 2>&1 | grep -i "peer\|warn\|error"
pnpm list --depth 0 | grep -i "sveltejs\|svelte\|vite"
```

Pass:

- [ ] Exit 0
- [ ] Zero unresolved peer errors
- [ ] Core packages (`@sveltejs/kit`, adapter, compiler, `@sveltejs/vite-plugin-svelte`) at target versions
- [ ] Lockfile generated without conflicts

### 2. `svelte-kit sync`

```bash
pnpm exec svelte-kit sync
```

Pass:

- [ ] Exit 0
- [ ] `.svelte-kit/tsconfig.json` regenerated
- [ ] Type references resolve

### 3. Production build

```bash
pnpm build && echo $?
```

Pass:

- [ ] Exit 0
- [ ] No compiler errors (warnings acceptable)
- [ ] Adapter output directory populated (shape matches Phase 1 adapter decision)
- [ ] Build time comparable to baseline

### 4. Type check

```bash
pnpm check
```

Pass:

- [ ] Runs without crash
- [ ] No new type errors from infra changes
- [ ] `svelte-check` at target version
- [ ] Types resolve for `$app/*`, `$env/*`, `$lib/*`

### 5. Lint

```bash
pnpm lint
```

Pass:

- [ ] Runs without crash
- [ ] No new lint errors from config changes
- [ ] New compiler syntax (if any) parses
- [ ] `eslint-plugin-svelte` parses route files (`+page.svelte`, `+layout.svelte`)

### 6. Bundle comparison

Capture baseline (on the pre-change branch) and change (on the upgrade branch).

```bash
pnpm build
du -sh .svelte-kit/output/ 2>/dev/null
find .svelte-kit/output/ -name "*.js" -exec wc -c {} + 2>/dev/null | tail -1
```

| Metric | Before | After | Δ | OK? |
|--------|--------|-------|---|-----|
| Total output size | ___ | ___ | ___ | |
| Client JS total | ___ | ___ | ___ | |
| Server JS total | ___ | ___ | ___ | |
| Prerendered HTML count | ___ | ___ | ___ | |

Thresholds:

- Size increase < 20% acceptable for initial rollout (adjust per project)
- Output layout must match the adapter's expected shape
- Prerendered page count must be equal or greater

### 7. Route + endpoint smoke test

Start the app locally (via adapter-node, `pnpm preview`, or deployed preview URL):

```bash
pnpm preview &
sleep 2

# Page route
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/

# Dynamic page route (project-specific)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/{sample-page}

# API endpoint (+server.ts)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/api/{sample-endpoint}

# Form action
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:4173/{form-route}?/default

# Not-found handler
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/does-not-exist
```

Pass:

- [ ] Home page renders (200)
- [ ] Dynamic page route renders (200)
- [ ] API endpoint responds (expected status)
- [ ] Form action responds (expected status)
- [ ] Not-found handler works
- [ ] No runtime errors from Phase 3 runtime-break patterns
- [ ] `load` functions return expected data (no empty first-paint)

### 8. Adapter-specific smoke test

Match the project's adapter:

| Adapter | Smoke test |
|---------|-----------|
| `adapter-node` | Start the output process, health check returns 200 |
| `adapter-static` | Every prerendered route exists as HTML, 404 fallback present |
| `adapter-vercel` | `vercel dev` or preview deployment serves routes + functions |
| `adapter-netlify` | `netlify dev` or preview serves functions + static |
| `adapter-cloudflare` | `wrangler dev` serves the worker, bindings resolve |

Pass:

- [ ] Adapter output starts / serves correctly locally
- [ ] Serverless function entry point matches expected format
- [ ] `$env/dynamic/*` vars resolve at runtime (if used)

### 9. Test suite

```bash
pnpm test
pnpm test:e2e 2>/dev/null
```

Pass:

- [ ] Vitest runner starts
- [ ] Playwright runner starts (if present)
- [ ] No new failures from infra changes alone
- [ ] Failures caused by target-release API changes classified as code-phase work

### 10. Dev server

```bash
pnpm dev
```

Pass:

- [ ] Starts clean
- [ ] Existing routes render
- [ ] HMR works for `.svelte` files
- [ ] `+page.server.ts` / `+server.ts` reload on change
- [ ] No browser console errors

## Go / No-Go

Blockers (all must pass):

- [ ] `pnpm install` — zero peer errors
- [ ] `pnpm exec svelte-kit sync` — exit 0
- [ ] `pnpm build` — exit 0
- [ ] Adapter output shape matches expected layout
- [ ] `pnpm check` runs
- [ ] `pnpm lint` runs
- [ ] Dev server starts + renders home + one dynamic route
- [ ] `preview` or local adapter-output start serves routes correctly
- [ ] No runtime errors from Phase 3 runtime-break patterns

Important (not blocking):

- [ ] Bundle size within threshold
- [ ] Existing tests pass
- [ ] HMR works
- [ ] No new deprecation warnings
- [ ] CI pipeline builds green

## Execution order

1. Clean install
2. `svelte-kit sync`
3. Production build
4. Type check
5. Lint
6. Bundle comparison
7. Dev server
8. Route + endpoint smoke test
9. Adapter-specific smoke test
10. Test suite
11. CI pipeline run

## Output

Validation report: per-layer status, bundle comparison, route/endpoint results,
adapter output verification, failure classification (infra vs code),
go/no-go decision with justification.

## Verification

- [ ] All layers have pass criteria
- [ ] Bundle baseline recorded
- [ ] Adapter output shape confirmed
- [ ] Route + endpoint smoke test defined and run
- [ ] Adapter-specific smoke test defined
- [ ] Phase 3 runtime-break patterns have dedicated smoke checks
- [ ] Go/no-go criteria agreed
- [ ] Execution order documented
- [ ] Infra vs code failures distinguished
- [ ] CI pipeline validation included
