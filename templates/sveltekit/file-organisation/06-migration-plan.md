# Phase 6: Migration Plan

Plan the step-by-step reorganisation of the SvelteKit project from its current
structure to the target layout, with safety measures at each step.

## Objectives

- Create a sequenced migration plan based on assessment findings
- Ensure the project builds and passes tests at each step
- Handle route moves without breaking navigation
- Update all imports after file relocations

## Critical Rules

1. **Always use `type`, never `interface`**
2. **Verify after every move** - run `pnpm check` and `pnpm build` between steps
3. **Move in small batches** - one module or route group at a time
4. **Commit after each successful step** - enable easy rollback
5. **Update imports immediately** - never leave broken imports

## Pre-Migration Checklist

Before starting any file moves:

- [ ] Git working directory is clean (commit or stash current changes)
- [ ] All tests pass: `pnpm test`
- [ ] Type check passes: `pnpm check`
- [ ] Build succeeds: `pnpm build`
- [ ] Create a migration branch: `git checkout -b refactor/file-organisation`

## Migration Sequence

Execute in this order to minimise breakage. Each step must pass verification
before proceeding to the next.

### Step 1: Create Target Directory Structure

Create empty directories first. This changes nothing and cannot break anything.

```bash
# Create the target structure
mkdir -p src/lib/client/components/ui
mkdir -p src/lib/client/components/domain
mkdir -p src/lib/client/modules
mkdir -p src/lib/client/utils
mkdir -p src/lib/server/db
mkdir -p src/lib/server/auth
mkdir -p src/lib/server/services
mkdir -p src/lib/server/utils
mkdir -p src/lib/shared/types
mkdir -p src/lib/shared/constants
mkdir -p src/lib/shared/schemas
mkdir -p src/lib/shared/utils
mkdir -p src/params
```

```bash
# Verify
pnpm check && pnpm build
git add -A && git commit -m "chore: create target directory structure"
```

### Step 2: Move Shared Types First

Types have no runtime behaviour, so moving them is the safest starting point.

```bash
# For each type file being moved:
# 1. Copy to new location
cp src/lib/types/user.ts src/lib/shared/types/user.ts

# 2. Update the file to use `type` instead of `interface` if needed
# 3. Create barrel export
# src/lib/shared/types/index.ts
```

```typescript
// src/lib/shared/types/index.ts
export type { UserType, UserRoleType } from './user';
export type { PostType, PostStatusType } from './post';
// ... add all type re-exports
```

After moving types, update ALL imports across the project:

```bash
# Find all files importing from the old location
grep -rn "from.*\$lib/types" src/ --include="*.ts" --include="*.svelte"

# Update each import to the new path
# Old: import type { UserType } from '$lib/types';
# New: import type { UserType } from '$lib/shared/types';
```

```bash
# Verify
pnpm check && pnpm build && pnpm test
git add -A && git commit -m "refactor: move shared types to \$lib/shared/types"
```

### Step 3: Move Shared Utilities

```bash
# Move isomorphic utilities (work in both server and browser)
cp src/lib/utils/format.ts src/lib/shared/utils/format.ts
cp src/lib/utils/validation.ts src/lib/shared/utils/validation.ts

# Create barrel export
# src/lib/shared/utils/index.ts
```

```bash
# Update imports
grep -rn "from.*\$lib/utils" src/ --include="*.ts" --include="*.svelte"
# Update each to $lib/shared/utils/ or $lib/client/utils/ or $lib/server/utils/
# depending on where the utility actually belongs

# Verify
pnpm check && pnpm build && pnpm test
git add -A && git commit -m "refactor: move shared utilities to \$lib/shared/utils"
```

### Step 4: Move Server Code

Move server-only code to `$lib/server/`. This step will surface any accidental
server imports in client code.

```bash
# Move database code
cp src/lib/db.ts src/lib/server/db/client.ts

# Move auth code
cp src/lib/auth.ts src/lib/server/auth/session.ts

# Move server services
cp src/lib/services/userService.ts src/lib/server/services/userService.ts
```

```bash
# Update all server-file imports
grep -rn "from.*\$lib/db\|from.*\$lib/auth\|from.*\$lib/services" src/ --include="*.server.ts" --include="*.ts"

# Verify - this step may surface hidden server/client mixing
pnpm check && pnpm build && pnpm test
git add -A && git commit -m "refactor: isolate server code in \$lib/server"
```

### Step 5: Move Client Components

```bash
# Move generic UI components
cp src/lib/components/Button.svelte src/lib/client/components/ui/Button.svelte
cp src/lib/components/Modal.svelte src/lib/client/components/ui/Modal.svelte

# Move domain components
cp src/lib/components/UserCard.svelte src/lib/client/components/domain/UserCard.svelte

# Create barrel exports for each directory
```

```typescript
// src/lib/client/components/ui/index.ts
export { default as Button } from './Button.svelte';
export { default as Modal } from './Modal.svelte';
```

```bash
# Update all component imports
grep -rn "from.*\$lib/components" src/ --include="*.svelte" --include="*.ts"

# Verify
pnpm check && pnpm build && pnpm test
git add -A && git commit -m "refactor: organise client components"
```

### Step 6: Reorganise Routes

Route reorganisation is the most visible change. Move routes into groups.

```typescript
// Before: src/routes/login/+page.svelte
// After:  src/routes/(auth)/login/+page.svelte
// URL remains: /login (route group doesn't affect URL)
```

```bash
# Create route groups
mkdir -p src/routes/\(auth\)
mkdir -p src/routes/\(app\)
mkdir -p src/routes/\(marketing\)

# Move routes into groups
mv src/routes/login src/routes/\(auth\)/login
mv src/routes/register src/routes/\(auth\)/register
mv src/routes/dashboard src/routes/\(app\)/dashboard
mv src/routes/settings src/routes/\(app\)/settings
mv src/routes/about src/routes/\(marketing\)/about
```

Create group layouts if needed:

```svelte
<!-- src/routes/(auth)/+layout.svelte -->
<script lang="ts">
  // Minimal auth layout
</script>

<div class="auth-layout">
  <slot />
</div>
```

```bash
# Verify all routes still work
pnpm check && pnpm build && pnpm test

# Check no hardcoded paths broke (route groups don't change URLs)
grep -rn "href=\"/login\|goto('/login" src/ --include="*.svelte" --include="*.ts"

git add -A && git commit -m "refactor: organise routes into groups"
```

### Step 7: Update Load Functions

After moving routes, ensure all load functions reference correct imports:

```typescript
// Before move - might have relative imports
import { db } from '../../../lib/db';

// After move - use $lib alias
import { db } from '$lib/server/db';
```

```bash
# Find any remaining relative imports crossing boundaries
grep -rn "from '\.\./\.\./\.\." src/ --include="*.ts" --include="*.svelte"

# Verify
pnpm check && pnpm build && pnpm test
git add -A && git commit -m "refactor: update all load function imports"
```

### Step 8: Clean Up Old Directories

Only after everything works in the new structure:

```bash
# Remove old directories (verify they're empty or only have moved files)
ls src/lib/types/       # Should be empty or moved
ls src/lib/components/  # Should be empty or moved
ls src/lib/services/    # Should be empty or moved
ls src/lib/utils/       # Should be empty or moved

# Remove old directories
rm -rf src/lib/types src/lib/components src/lib/services src/lib/utils

# Final verification
pnpm check && pnpm build && pnpm test
git add -A && git commit -m "chore: remove old directory structure"
```

## Rollback Strategy

If any step fails and cannot be quickly fixed:

```bash
# Option 1: Revert the current step
git checkout -- .

# Option 2: Go back to last working commit
git log --oneline -5
git reset --hard <last-working-commit>

# Option 3: Abort the entire migration
git checkout main
git branch -D refactor/file-organisation
```

## Post-Migration Verification

After all steps are complete:

```bash
# Full verification suite
pnpm check          # Type checking
pnpm lint           # Linting
pnpm test           # All tests
pnpm build          # Production build

# Verify no old imports remain
grep -rn "from.*\$lib/types[^/]" src/    # Old type imports
grep -rn "from.*\$lib/db[^/]" src/       # Old db imports
grep -rn "from '\.\./\.\./\.\." src/     # Deep relative imports
```

## Verification

Before marking migration complete:

- [ ] All files moved to target locations
- [ ] All imports updated to new paths
- [ ] `pnpm check` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` succeeds
- [ ] Old directories removed
- [ ] No deep relative imports remain
- [ ] No old $lib paths remain
- [ ] Git history has clean, incremental commits
- [ ] Rollback strategy was documented and available
