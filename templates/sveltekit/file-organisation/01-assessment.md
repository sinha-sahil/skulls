# Phase 1: Assessment

Audit the current SvelteKit project structure to identify organisational issues,
convention violations, and improvement opportunities.

## Objectives

- Map the current file and directory structure
- Identify violations of SvelteKit conventions
- Find server/client code mixing issues
- Document pain points and technical debt
- Establish baseline metrics for the restructuring

## Critical Rules

1. **Always use `type`, never `interface`**
2. **Audit before changing** - understand the full picture first
3. **Document findings** - create a clear record of issues found

## Assessment Checklist

### 1. Project Root Audit

Verify standard SvelteKit project files exist:

```bash
# Check for essential config files
ls svelte.config.js vite.config.ts tsconfig.json package.json

# Check for SvelteKit source directory
ls src/routes src/lib src/app.html

# Check for static assets directory
ls static/
```

Expected project root:

```text
{{LIB_PATH}}/
├── src/
├── static/
├── tests/
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

### 2. Route Structure Audit

Map the current route hierarchy and check for convention compliance:

```bash
# List all route files
find src/routes -name "+*" | sort

# Check for non-standard files in routes (should be +prefixed or components)
find src/routes -type f ! -name "+*" ! -name "*.svelte" ! -name "*.ts"

# Find routes missing +page.svelte
find src/routes -type d ! -exec test -f "{}"/+page.svelte \; -print
```

Document the current route tree:

```text
src/routes/
├── +page.svelte          ✓ Home page exists
├── +layout.svelte        ✓/✗ Root layout?
├── +error.svelte         ✓/✗ Error boundary?
├── [route-name]/
│   ├── +page.svelte      ✓/✗
│   ├── +page.ts           ✓/✗ Load function?
│   └── +page.server.ts   ✓/✗ Server load?
└── ...
```

### 3. Library Structure Audit

Check how `src/lib/` is organised:

```bash
# Map the lib directory structure
find src/lib -type d | sort

# Check for client/server/shared separation
ls src/lib/client/ src/lib/server/ src/lib/shared/ 2>/dev/null

# Find TypeScript files that might be misplaced
find src/lib -name "*.ts" | head -30
```

Record findings:

| Directory | Exists | Contents | Issues |
|-----------|--------|----------|--------|
| `src/lib/client/` | Yes/No | Components, modules | |
| `src/lib/server/` | Yes/No | DB, auth, services | |
| `src/lib/shared/` | Yes/No | Types, constants | |

### 4. Server/Client Code Mixing Detection

This is the most critical check. Server code imported in client bundles
causes build failures and security risks.

```bash
# Find server-only imports in non-server files
grep -rn "from.*\$lib/server" src/lib/client/ src/routes/**/+page.svelte
grep -rn "from.*\$env/static/private" src/lib/client/

# Find database imports in client code
grep -rn "import.*db\|import.*prisma\|import.*drizzle" src/lib/client/

# Find files that mix server and client concerns
grep -rn "import.*\$lib/server" src/routes --include="+page.svelte" --include="+page.ts"
```

### 5. Import Pattern Analysis

Check how imports are structured across the project:

```bash
# Find relative imports that cross module boundaries (smell)
grep -rn "from '\.\./\.\./\.\." src/lib/

# Find missing $lib alias usage
grep -rn "from '\.\./lib/" src/

# Check for circular dependencies (files importing each other)
# Look for files that import from their own module's consumer
```

Document import violations:

| File | Issue | Current Import | Should Be |
|------|-------|----------------|-----------|
| `src/lib/client/foo.ts` | Deep relative | `../../../shared/types` | `$lib/shared/types` |
| ... | ... | ... | ... |

### 6. Naming Convention Audit

```bash
# Find components not using PascalCase
find src -name "*.svelte" ! -name "+*" | grep -v "[A-Z]"

# Find TypeScript files using wrong casing
find src/lib -name "*.ts" | grep "[A-Z].*[A-Z]"  # PascalCase .ts files (should be camelCase)

# Check route directory naming
find src/routes -type d | grep "[A-Z]"  # Should be kebab-case
```

### 7. Type Definition Audit

```bash
# Find interface usage (should be type)
grep -rn "^export interface\|^interface " src/ --include="*.ts" --include="*.svelte"

# Count type vs interface usage
echo "Types: $(grep -rn "^export type\|^type " src/ --include="*.ts" | wc -l)"
echo "Interfaces: $(grep -rn "^export interface\|^interface " src/ --include="*.ts" | wc -l)"

# Find type files scattered outside shared/
find src -name "types.ts" -o -name "*.types.ts" | sort
```

### 8. Document Findings Summary

Create a summary of the assessment:

```text
## Assessment Summary for {{PROJECT_NAME}}

### Route Organisation
- Total routes: ___
- Missing load functions: ___
- Missing error boundaries: ___
- Route groups used: Yes/No

### Library Organisation
- Client/server separation: Good / Partial / Missing
- Shared types location: Centralised / Scattered
- Barrel exports: Used / Missing

### Code Mixing Issues
- Server imports in client: ___ occurrences
- Secret exposure risks: ___ occurrences

### Naming Violations
- Non-PascalCase components: ___
- Non-kebab-case routes: ___
- Interface usage (should be type): ___

### Import Issues
- Deep relative imports: ___
- Missing $lib usage: ___
- Potential circular deps: ___
```

## Output

The assessment produces:

1. Current structure map (directory tree)
2. List of convention violations
3. Server/client mixing issues
4. Import pattern problems
5. Priority-ranked list of changes needed

## Verification

Before moving to the next phase:

- [ ] Current route structure is fully mapped
- [ ] Library structure is documented
- [ ] Server/client code mixing issues identified
- [ ] Import patterns analysed
- [ ] Naming convention violations listed
- [ ] Type usage audited (type vs interface)
- [ ] Findings summary is complete
- [ ] Issues are prioritised by severity
