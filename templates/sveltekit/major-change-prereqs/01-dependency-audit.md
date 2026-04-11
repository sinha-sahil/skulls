# Phase 1: Dependency Audit

Map every direct and dev dependency to a version compatible with the target state of the change.
Surface peer conflicts, engine bumps, and removed/deprecated packages.

## Inputs

- The target release's official migration / upgrade guide
- Current `package.json` and lockfile
- Current `.nvmrc` / `.node-version` / `packageManager` field

## Process

### 1. Capture current state

```bash
pnpm list --depth 0
node -v
cat .nvmrc 2>/dev/null || cat .node-version 2>/dev/null
grep '"engines"\|"packageManager"' package.json
```

### 2. Read the target release's migration guide

Extract from it:

- Minimum Node.js version
- Minimum versions of `@sveltejs/kit`, `svelte`, `vite`, `typescript`
- Any dep that moved from transitive to **peer** (must be listed explicitly)
- Any dep that was **removed** (to be deleted)
- Any dep that was **replaced** (old → new name or import)
- Adapter compatibility matrix for your project's adapter

### 3. Sweep the Svelte / SvelteKit ecosystem

```bash
grep -E '"(@?svelte|svelte-|@sveltejs/)' package.json
```

For each package, check:

- Compatible release for the target `@sveltejs/kit` + `svelte` versions
- Peer dependency range
- Deprecation status (replaced by a built-in? moved to a runes-aware variant?)

### 4. Sweep SvelteKit-facing libraries

```bash
grep -E '"(superforms|sveltekit-|skeleton-|shadcn-svelte|formsnap|bits-ui|melt-ui)' package.json
```

For each: SK-target support, required version, breaking changes in its own changelog.

### 5. Check the adapter

The project's adapter is a first-class concern:

```bash
grep -E '"@sveltejs/adapter-' package.json
```

Pin the adapter major that the target `@sveltejs/kit` supports.
The adapter's own changelog is the source of truth — NOT the SvelteKit migration guide.

### 6. Engine requirements

Update across all environments where they appear:

- `package.json#engines`
- `.nvmrc` / `.node-version`
- `packageManager` field
- CI / Docker base images (audited fully in Phase 4)

### 7. Peer conflict dry-run

```bash
pnpm install --dry-run
```

For each conflict: `{package} requires {x}, conflicts with {y}, resolution: {z}`.

## Output

Dependency mapping table:

| Package | Current | Target | Action | Reason |
|---------|---------|--------|--------|--------|
| ... | ... | ... | upgrade / add / remove / replace | peer / removed / engine / ... |

Plus: peer conflict list, adapter version decision, engine bumps.

## Verification

- [ ] Target release's migration guide read in full
- [ ] `@sveltejs/kit` target version recorded
- [ ] Adapter major decided and verified against the adapter's own changelog
- [ ] Any peer-dep-promotions (transitive → peer) listed as direct deps
- [ ] `svelte` target version recorded (if bumping compiler)
- [ ] All direct deps mapped
- [ ] All dev deps mapped
- [ ] Removed packages documented
- [ ] Peer conflicts listed with resolutions
- [ ] Node.js minimum confirmed across environments
- [ ] `pnpm install --dry-run` passes (or conflicts documented)
