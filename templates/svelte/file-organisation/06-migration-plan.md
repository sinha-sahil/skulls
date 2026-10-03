# Phase 6: Migration Plan

Create and execute a safe, incremental migration from the current file structure
to the target organisation.

## Objectives

- Plan migration in small, independently verifiable steps
- Ensure no functionality breaks during migration
- Update all imports after each file move
- Validate with `pnpm check`, `pnpm lint`, `pnpm test` after each step

## Migration Principles

1. **One module at a time** - never move multiple unrelated modules simultaneously
2. **Verify after every move** - run the verification suite between steps
3. **Update imports immediately** - don't batch import updates
4. **Keep barrel exports current** - update `index.ts` files as you move
5. **Commit after each step** - maintain rollback points

## Step 1: Create Target Directories

Create the new directory structure without moving anything:

```bash
# Create target directory structure
mkdir -p {{LIB_PATH}}/components/primitives
mkdir -p {{LIB_PATH}}/components/composites
mkdir -p {{LIB_PATH}}/components/layout
mkdir -p {{LIB_PATH}}/components/shared
mkdir -p {{LIB_PATH}}/features
mkdir -p {{LIB_PATH}}/state
mkdir -p {{LIB_PATH}}/types
mkdir -p {{LIB_PATH}}/utils

# Verify
pnpm check && pnpm lint && pnpm test
```

- [ ] Target directories created
- [ ] Verification passes (nothing changed functionally)

## Step 2: Create Barrel Export Files

Create `index.ts` files in each new directory. Start empty - populate as files move:

```typescript
// {{LIB_PATH}}/components/index.ts
// Will be populated as components are migrated

// {{LIB_PATH}}/types/index.ts
// Will be populated as shared types are extracted

// {{LIB_PATH}}/utils/index.ts
// Will be populated as utilities are migrated

// {{LIB_PATH}}/state/index.ts
// Will be populated as state files are created
```

- [ ] Empty barrel exports created
- [ ] Verification passes

## Step 3: Extract Shared Types First

Shared types have the fewest dependencies, so extract them first:

```bash
# Identify types used across multiple modules
grep -rn "import type.*from" {{LIB_PATH}} --include="*.ts" --include="*.svelte" | \
  awk -F"from " '{print $2}' | sort | uniq -c | sort -rn
```

For each shared type:

1. Create the type file in `{{LIB_PATH}}/types/`
2. Export from `{{LIB_PATH}}/types/index.ts`
3. Update all imports to use the new path
4. Remove from old location
5. Verify

```typescript
// Example: Extract User type to shared types
// {{LIB_PATH}}/types/common.ts
export type User = {
  id: string;
  name: string;
  email: string;
};

export type Pagination = {
  page: number;
  perPage: number;
  total: number;
};
```

```bash
# After each type extraction
pnpm check && pnpm lint && pnpm test
```

- [ ] Shared types identified
- [ ] Types extracted to `{{LIB_PATH}}/types/`
- [ ] All imports updated
- [ ] Verification passes

## Step 4: Migrate Shared Utilities

```bash
# Identify utilities used across multiple modules
grep -rn "import.*from.*utils" {{LIB_PATH}} --include="*.ts" --include="*.svelte" | \
  awk -F"from " '{print $2}' | sort | uniq -c | sort -rn
```

For each shared utility:

1. Move to `{{LIB_PATH}}/utils/`
2. Export from `{{LIB_PATH}}/utils/index.ts`
3. Update all imports
4. Verify

- [ ] Shared utilities identified
- [ ] Utilities moved to `{{LIB_PATH}}/utils/`
- [ ] All imports updated
- [ ] Verification passes

## Step 5: Migrate Components (Leaf First)

Start with components that have no internal component dependencies (leaf nodes):

### Migration Order

```text
1. Leaf components (no internal deps): Button, Input, Icon
2. Components depending on leaves: Form (needs Button, Input)
3. Composite components: DataTable (needs multiple sub-components)
4. Layout components: Stack, Grid
```

### Per-Component Migration Steps

For each component `{{COMPONENT_NAME}}`:

```bash
# 1. Create component directory in target
mkdir -p {{COMPONENT_DIR}}/{{COMPONENT_NAME}}

# 2. Move component files
mv {{OLD_PATH}}/{{COMPONENT_NAME}}.svelte {{COMPONENT_DIR}}/{{COMPONENT_NAME}}/
mv {{OLD_PATH}}/{{camelCase}}Types.ts {{COMPONENT_DIR}}/{{COMPONENT_NAME}}/ 2>/dev/null
mv {{OLD_PATH}}/{{camelCase}}Utils.ts {{COMPONENT_DIR}}/{{COMPONENT_NAME}}/ 2>/dev/null

# 3. Create index.ts for the component
cat > {{COMPONENT_DIR}}/{{COMPONENT_NAME}}/index.ts << 'EOF'
export { default as {{COMPONENT_NAME}} } from './{{COMPONENT_NAME}}.svelte';
export type { {{COMPONENT_NAME}}Props } from './{{camelCase}}Types';
EOF

# 4. Update parent barrel export
# Add to {{COMPONENT_DIR}}/index.ts:
# export { {{COMPONENT_NAME}} } from './{{COMPONENT_NAME}}';

# 5. Update all imports across the project
grep -rn "{{COMPONENT_NAME}}" {{LIB_PATH}} --include="*.svelte" --include="*.ts" -l
# Update each file's import paths

# 6. Verify
pnpm check && pnpm lint && pnpm test
```

- [ ] Leaf components migrated
- [ ] Dependent components migrated
- [ ] Composite components migrated
- [ ] Layout components migrated
- [ ] All imports updated
- [ ] Verification passes after each component

## Step 6: Migrate State Files

Convert legacy store files to Svelte 5 runes `.svelte.ts` files:

```typescript
// BEFORE: store.ts (legacy)
import { writable, derived } from 'svelte/store';

const items = writable<Item[]>([]);
const count = derived(items, $items => $items.length);

export { items, count };

// AFTER: state.svelte.ts (Svelte 5 runes)
let items = $state<Item[]>([]);
let count = $derived(items.length);

export function getItems(): Item[] {
  return items;
}

export function getCount(): number {
  return count;
}

export function setItems(newItems: Item[]): void {
  items = newItems;
}

export function addItem(item: Item): void {
  items.push(item);
}
```

For each state file:

1. Create `.svelte.ts` file in target location
2. Migrate from stores to runes
3. Update all consumers
4. Remove old store file
5. Verify

- [ ] State files identified
- [ ] Migrated to `.svelte.ts` runes format
- [ ] All consumers updated
- [ ] Verification passes

## Step 7: Migrate Feature Modules

Move feature modules into the `features/` directory:

1. Create feature directory structure
2. Move feature components, state, types, and utils
3. Create feature `index.ts`
4. Update all imports
5. Verify

- [ ] Feature modules migrated
- [ ] Feature barrel exports created
- [ ] All imports updated
- [ ] Verification passes

## Step 8: Cleanup

```bash
# Remove empty old directories
find {{LIB_PATH}} -type d -empty -delete

# Verify no broken imports
pnpm check && pnpm lint && pnpm test

# Check for unused files
# (files not imported anywhere)
for file in $(find {{LIB_PATH}} -name "*.ts" -o -name "*.svelte"); do
  name=$(basename "$file" | sed 's/\..*//')
  refs=$(grep -r "$name" {{LIB_PATH}} --include="*.svelte" --include="*.ts" -l | wc -l)
  if [ "$refs" -le 1 ]; then
    echo "Possibly unused: $file"
  fi
done
```

- [ ] Empty directories removed
- [ ] No broken imports
- [ ] Unused files identified and handled
- [ ] Final verification passes

## Final Verification

Run the complete verification suite:

```bash
pnpm check && pnpm lint && pnpm test
```

- [ ] `pnpm check` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes
- [ ] All components render correctly
- [ ] No runtime errors in browser
- [ ] Import paths are clean and consistent
- [ ] Barrel exports are complete and correct
