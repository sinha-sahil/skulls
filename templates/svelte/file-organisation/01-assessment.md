# Phase 1: Assessment

Audit the current file structure, identify pain points, and map existing dependencies
before making any changes.

## Objectives

- Catalogue all existing Svelte component files and their locations
- Identify structural problems (deep nesting, scattered files, circular deps)
- Map component dependency relationships
- Document the current state as a baseline for improvement

## Step 1: Catalogue Existing Files

Scan the project for all Svelte-related files:

```bash
# Find all Svelte components
find {{LIB_PATH}} -name "*.svelte" | sort

# Find all TypeScript modules
find {{LIB_PATH}} -name "*.ts" -not -name "*.test.ts" -not -name "*.spec.ts" | sort

# Find all state files (runes-based .svelte.ts files)
find {{LIB_PATH}} -name "*.svelte.ts" | sort

# Count files per directory
find {{LIB_PATH}} -name "*.svelte" -o -name "*.ts" | \
  sed 's|/[^/]*$||' | sort | uniq -c | sort -rn
```

Record findings in a table:

| Directory | Component Count | Type Files | Util Files | State Files |
|-----------|----------------|------------|------------|-------------|
| `{{LIB_PATH}}/components/` | ? | ? | ? | ? |
| `{{LIB_PATH}}/features/` | ? | ? | ? | ? |
| ... | ... | ... | ... | ... |

## Step 2: Identify Structural Problems

Check for common issues:

### Flat File Dumps

```bash
# Directories with more than 10 direct Svelte files (too flat)
for dir in $(find {{LIB_PATH}} -type d); do
  count=$(find "$dir" -maxdepth 1 -name "*.svelte" | wc -l)
  if [ "$count" -gt 10 ]; then
    echo "$dir: $count components (consider splitting)"
  fi
done
```

### Deep Nesting

```bash
# Files nested more than 4 levels deep (too deep)
find {{LIB_PATH}} -name "*.svelte" -mindepth 5
```

### Orphaned Files

```bash
# Components not imported anywhere
for file in $(find {{LIB_PATH}} -name "*.svelte"); do
  name=$(basename "$file" .svelte)
  refs=$(grep -r "$name" {{LIB_PATH}} --include="*.svelte" --include="*.ts" -l | wc -l)
  if [ "$refs" -le 1 ]; then
    echo "Possibly orphaned: $file"
  fi
done
```

### Missing Index Files

```bash
# Directories with components but no index.ts
for dir in $(find {{LIB_PATH}} -name "*.svelte" -exec dirname {} \; | sort -u); do
  if [ ! -f "$dir/index.ts" ]; then
    echo "Missing index.ts: $dir"
  fi
done
```

## Step 3: Map Dependencies

### Import Analysis

```bash
# List all imports across Svelte files
grep -rn "import.*from" {{LIB_PATH}} --include="*.svelte" --include="*.ts" | \
  grep -v node_modules
```

### Circular Dependency Detection

```bash
# Check for potential circular imports between directories
# Component A imports from B, and B imports from A
grep -rn "import.*from.*components/" {{LIB_PATH}}/features/ --include="*.ts" --include="*.svelte"
grep -rn "import.*from.*features/" {{LIB_PATH}}/components/ --include="*.ts" --include="*.svelte"
```

Record dependency relationships:

| Source Module | Depends On | Type |
|---------------|-----------|------|
| `FeatureView.svelte` | `Button`, `Card` | component |
| `dashboardState.svelte.ts` | `userTypes` | type |
| ... | ... | ... |

## Step 4: Identify Svelte 5 Migration Gaps

Check for legacy patterns that affect file organisation:

```bash
# Legacy store files (should migrate to .svelte.ts runes)
grep -rn "writable\|readable\|derived" {{LIB_PATH}} --include="*.ts" -l

# Legacy slot usage (should migrate to snippets)
grep -rn "<slot" {{LIB_PATH}} --include="*.svelte" -l

# Legacy event dispatchers (should migrate to callback props)
grep -rn "createEventDispatcher" {{LIB_PATH}} --include="*.svelte" -l

# Files using legacy reactive statements
grep -rn "^\s*\$:" {{LIB_PATH}} --include="*.svelte" -l
```

## Step 5: Document Current State

Create a summary document capturing:

```markdown
## Current Structure Assessment

### Statistics
- Total components: __
- Total type files: __
- Total utility files: __
- Total state files: __
- Directories with barrel exports: __/__

### Problems Found
1. [Problem description and affected files]
2. [Problem description and affected files]

### Legacy Patterns
- Store files needing migration: __
- Components using slots: __
- Components using createEventDispatcher: __

### Dependency Issues
- Circular dependencies: [list]
- Orphaned files: [list]
```

## Verification

Before moving to the next phase:

- [ ] All Svelte component files catalogued
- [ ] File counts per directory recorded
- [ ] Flat file dump directories identified
- [ ] Deeply nested files identified
- [ ] Orphaned components found
- [ ] Missing index files noted
- [ ] Import dependencies mapped
- [ ] Circular dependencies detected
- [ ] Legacy Svelte patterns identified
- [ ] Current state documented as baseline
