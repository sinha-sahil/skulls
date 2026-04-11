# Phase 4: CI/CD Changes

Audit pipelines, build agents, deploy scripts, adapter output, and Docker for target compatibility.

## Inputs

- Target release's engine and runtime requirements (from Phase 1)
- Adapter decision and output location (from Phase 1)
- Current pipeline, Dockerfile, and deploy configs

## Process

### 1. Inventory pipeline files

```bash
ls -la Jenkinsfile* .github/workflows/*.yml 2>/dev/null
ls -la .gitlab-ci.yml .circleci/config.yml .travis.yml 2>/dev/null
ls -la Dockerfile* docker-compose* 2>/dev/null
ls -la Makefile deploy.sh deploy/ scripts/deploy* scripts/build* 2>/dev/null
ls -la vercel.json netlify.toml wrangler.toml 2>/dev/null
```

Record every file, its role (build / test / deploy), and whether the target release's
requirements touch it.

### 2. Node.js version per environment

```bash
grep -n "nodejs\|node\|NodeJS\|nvm" Jenkinsfile* 2>/dev/null
grep -n "node-version" .github/workflows/*.yml 2>/dev/null
grep -n "FROM node\|FROM.*node" Dockerfile* 2>/dev/null
cat .nvmrc 2>/dev/null
```

| Environment | Current | Target (from Phase 1) | Action |
|-------------|---------|----------------------|--------|
| CI build agent | ___ | ___ | — |
| Docker image | ___ | ___ | — |
| `.nvmrc` | ___ | ___ | — |
| Dev machines | ___ | ___ | notify team |
| Serverless runtime | ___ | ___ | — |

Serverless runtime version may be forced by the adapter upgrade — check the adapter's changelog.

### 3. Package manager

```bash
grep -n "pnpm\|npm\|yarn\|corepack" Jenkinsfile* .github/workflows/*.yml 2>/dev/null
grep -n "packageManager" package.json
```

Verify the CI package manager version handles the new lockfile and `packageManager` field.

### 4. Build commands

```bash
grep -A 20 '"scripts"' package.json
grep -n "pnpm build\|npm run build\|pnpm install\|npm ci\|svelte-kit sync" \
  Jenkinsfile* .github/workflows/*.yml 2>/dev/null
```

For each command the pipeline runs, check:

- Does it still succeed after the dependency and config changes from Phase 1–2?
- Does the target compiler emit new warnings that the pipeline treats as errors?
- Does `svelte-check`'s new major change the exit code on any existing warnings?
- Does `svelte-kit sync` run in the right order (before `check`, before `build`)?

### 5. Adapter output validation

Know the adapter's expected output shape **before** the upgrade — then verify it's unchanged
(or document the new shape) after.

```bash
ls -la build/ .svelte-kit/output/ .vercel/output/ .netlify/ 2>/dev/null
```

For each pipeline step that reads the adapter output (deploy, upload, health check, size
threshold), confirm the file paths still resolve.

### 6. Deployment

```bash
grep -rn "deploy\|s3\|gcs\|cloudflare\|vercel deploy\|netlify deploy" \
  Jenkinsfile* .github/workflows/*.yml scripts/ Makefile 2>/dev/null
```

| Aspect | Check |
|--------|-------|
| Adapter output directory | May move between adapter majors |
| Serverless function format | May move between adapter majors |
| Static asset routing | Usually unchanged |
| CDN cache invalidation | Only if asset hashes change |
| Env var injection | Re-test dynamic env vars per adapter |
| Serverless runtime | May be forced by adapter upgrade |

### 7. CI cache invalidation

```bash
grep -n "cache\|restore\|store" Jenkinsfile* .github/workflows/*.yml 2>/dev/null
```

At minimum, invalidate:

- `node_modules`
- Package manager store (`pnpm store`, etc.)
- `.svelte-kit/` directory
- Adapter output (build artifacts)
- Docker layer cache (if base image changes)

### 8. Dockerfile

```bash
grep -n "FROM\|RUN.*install\|RUN.*build\|COPY.*package" Dockerfile* 2>/dev/null
```

For each line, verify it still works after dep / engine changes. Common updates:

- `FROM node:X` base image bumped to target minimum
- Install command valid for new lockfile format
- Build command produces expected output
- Entry point (`CMD`) matches the adapter's output path

### 9. Build-time environment variables

```bash
grep -n "SVELTE\|VITE_\|PUBLIC_\|NODE_ENV" Jenkinsfile* .github/workflows/*.yml .env* 2>/dev/null
grep -rn "\$env/static\|\$env/dynamic" src/
```

Static env vars are injected at build time — verify CI still passes them.
Dynamic env vars resolve at runtime per adapter — may need re-testing after adapter bump.
`PUBLIC_*` prefix convention for client-exposed vars should be preserved.

### 10. Rollback plan

For each change, document the rollback action:

| Change | Rollback |
|--------|----------|
| Node version bump | Revert `.nvmrc` / pipeline config |
| Package manager version | Revert `packageManager` field |
| Build command changes | Revert `package.json` scripts |
| Docker base image | Revert `Dockerfile` |
| Adapter bump | Revert adapter version — may require code revert |
| Deployment config | Revert `vercel.json` / `netlify.toml` / `wrangler.toml` |

Document whether parallel pipelines (old + new) are viable for staged rollout.

## Output

CI/CD change manifest:

- Per-file edits
- Version requirements per environment
- Adapter output verification
- Cache invalidation list
- Deployment impact assessment
- Rollback procedures

## Verification

- [ ] All pipeline files inventoried
- [ ] Node version confirmed per environment against Phase 1 target
- [ ] Package manager compat confirmed
- [ ] Build commands validated
- [ ] Adapter output location and shape confirmed
- [ ] Deployment scripts / config reviewed
- [ ] Cache invalidation plan recorded
- [ ] Dockerfile updated (if applicable)
- [ ] Serverless runtime matches adapter target
- [ ] Rollback plan documented
- [ ] Env vars (`$env/static` + `$env/dynamic`) preserved
