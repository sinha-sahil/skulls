# Phase 3: Impact Analysis

Map the blast radius of refactoring changes across {{REFACTOR_SCOPE}} in {{PROJECT_NAME}}.

## Objectives

- Identify all files affected by each refactoring goal
- Map dependencies between routes, layouts, components, and server files
- Determine which changes cascade through shared code
- Identify high-risk areas requiring extra testing

## Route and Layout Dependency Map

### Shared Layout Analysis

Layouts affect all child routes. Changes to layouts have the widest blast radius.

```bash
# List all layout files
find src/routes -name "+layout*" -type f | sort

# List all layout server files
find src/routes -name "+layout.server.ts" -type f | sort

# Find components imported in layouts
grep -rn "import" src/routes/ --include="+layout.svelte" | grep -v "from '\$app\|from 'svelte"
```

### Route Inventory

```bash
# Count total routes
find src/routes -name "+page.svelte" -type f | wc -l

# Routes with server load functions
find src/routes -name "+page.server.ts" -type f | sort

# Routes with form actions
grep -rln "export const actions" src/routes/ --include="+page.server.ts"

# Routes with client-side load
find src/routes -name "+page.ts" -type f | sort
```

### Shared Component Analysis

```bash
# All shared components
find src/lib -name "*.svelte" -type f | sort

# For each component, find who imports it
# Replace ComponentName with actual component file name
grep -rln "import.*ComponentName" src/ --include="*.svelte" --include="*.ts"
```

## Impact Matrix Per Goal

### interface → type Impact

```bash
# Files containing interface declarations
grep -rln "^export interface\|^interface " src/ --include="*.ts" --include="*.svelte" | sort

# Check for interface re-exports (these cascade)
grep -rn "export.*interface\|export type.*interface" src/ --include="*.ts"
```

**Risk level:** Low - purely syntactic change, no runtime impact.

### Store Migration Impact

```bash
# Files that create stores
grep -rln "writable\|readable" src/ --include="*.ts" | sort

# Files that import stores
grep -rln "from.*store\|from.*stores" src/ --include="*.svelte" --include="*.ts" | sort

# Files that subscribe to stores ($storeName)
grep -rln "\$[a-z]" src/ --include="*.svelte" | sort
```

**Risk level:** High - changes runtime behaviour, affects multiple consumers.

### Reactive Declaration Impact

```bash
# Files with $: statements, grouped by directory
grep -rln "^\s*\$:" src/ --include="*.svelte" | sort

# Count $: statements per file
grep -rcn "^\s*\$:" src/ --include="*.svelte" | grep -v ":0$" | sort -t: -k2 -nr
```

**Risk level:** Medium - computed values may behave differently with fine-grained reactivity.

### Props Migration Impact

```bash
# Components with export let
grep -rln "export let " src/ --include="*.svelte" | sort

# Components using createEventDispatcher
grep -rln "createEventDispatcher" src/ --include="*.svelte" | sort

# Components using slots
grep -rln "<slot" src/ --include="*.svelte" | sort
```

**Risk level:** Medium - changes component API surface, parent components must update too.

### Load Function Typing Impact

```bash
# Untyped load functions
grep -rln "export const load" src/routes/ --include="*.ts" | while read f; do
  if ! grep -q "satisfies\|: PageServerLoad\|: LayoutServerLoad\|: PageLoad\|: LayoutLoad" "$f"; then
    echo "$f"
  fi
done
```

**Risk level:** Low - adding types only, no runtime change.

### Error Handling Impact

```bash
# Server files with inconsistent error patterns
grep -rln "throw new Error" src/routes/ --include="*.ts" | sort

# Form actions returning plain objects instead of fail()
grep -rln "return {" src/routes/ --include="+page.server.ts" | sort
```

**Risk level:** Low-Medium - changes error response shapes, may affect client-side handling.

## Dependency Graph Template

Document interconnected files:

```typescript
type ImpactNodeType = {
  file: string;
  refactoringGoals: string[];
  dependsOn: string[];
  dependedOnBy: string[];
  riskLevel: 'low' | 'medium' | 'high';
  testCoverage: 'none' | 'partial' | 'full';
};

type ImpactGraphType = {
  nodes: ImpactNodeType[];
  highRiskClusters: string[][];
};
```

## Change Cascade Rules

| Change In | Cascades To |
|-----------|-------------|
| `+layout.svelte` | All child `+page.svelte` files |
| `+layout.server.ts` | All child load functions (data shape) |
| `$lib/components/*.svelte` | Every file that imports the component |
| `$lib/server/services/*.ts` | All server endpoints using the service |
| `$lib/types/*.ts` | All files importing those types |
| Store files | All subscribers (components and other stores) |

## Checklist

- [ ] All routes inventoried with their server files
- [ ] Layout hierarchy mapped
- [ ] Shared components catalogued with their consumers
- [ ] Store dependency chains documented
- [ ] Impact matrix completed for each refactoring goal
- [ ] High-risk clusters identified
- [ ] Test coverage gaps mapped against high-impact areas
- [ ] Change cascade paths documented
