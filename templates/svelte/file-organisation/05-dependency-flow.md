# Phase 5: Dependency Flow

Map and enforce unidirectional dependency relationships between modules to prevent
circular imports and maintain clean architecture.

## Objectives

- Define the dependency hierarchy between module layers
- Identify and resolve circular dependencies
- Establish rules for cross-module imports
- Create a dependency map that can be validated

## Dependency Hierarchy

Dependencies must flow in one direction, from higher-level to lower-level modules:

```text
Level 4: Pages / Routes
    ↓
Level 3: Features
    ↓
Level 2: Components
    ↓
Level 1: Shared (types, utils, state)
    ↓
Level 0: External (svelte, third-party)
```

### Rules

| From (importer) | Can Import From | Cannot Import From |
|-----------------|----------------|--------------------|
| Pages/Routes | Features, Components, Shared | - |
| Features | Components, Shared, other Features* | Pages/Routes |
| Components | Shared, other Components* | Features, Pages/Routes |
| Shared (types) | External only | Components, Features, Pages |
| Shared (utils) | Shared types, External | Components, Features, Pages |
| Shared (state) | Shared types, External | Components, Features, Pages |

*Cross-imports at the same level are allowed but must be through `index.ts` and acyclic.

## Mapping Current Dependencies

### Step 1: Generate Import Map

```bash
# Extract all local imports from Svelte and TS files
grep -rn "import.*from '\." {{LIB_PATH}} --include="*.svelte" --include="*.ts" | \
  awk -F: '{print $1 " -> " $3}' | sort
```

### Step 2: Classify by Layer

For each import relationship, classify source and target:

| Source File | Source Layer | Target Import | Target Layer | Valid? |
|-------------|-------------|---------------|--------------|--------|
| `features/dash/View.svelte` | Feature | `$components/Button` | Component | Yes |
| `components/Table/Table.svelte` | Component | `features/dash/types` | Feature | **NO** |
| `components/Modal/Modal.svelte` | Component | `$components/Button` | Component | Yes |

### Step 3: Identify Violations

```bash
# Components importing from features (VIOLATION)
grep -rn "import.*from.*features/" {{LIB_PATH}}/components/ \
  --include="*.svelte" --include="*.ts"

# Shared types/utils importing from components (VIOLATION)
grep -rn "import.*from.*components/" {{LIB_PATH}}/types/ {{LIB_PATH}}/utils/ \
  --include="*.ts"

# Circular: A imports B and B imports A
# Generate simplified import pairs and look for cycles
```

## Resolving Violations

### Pattern 1: Extract Shared Types

When a component and feature both need the same type:

```typescript
// BEFORE (violation): Component imports from Feature
// components/UserCard/userCardTypes.ts
import type { User } from '../../features/auth/types'; // WRONG

// AFTER: Extract to shared types
// types/user.ts
export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type UserRole = 'admin' | 'editor' | 'viewer';

// Now both component and feature import from shared
import type { User } from '$types';
```

### Pattern 2: Dependency Inversion with Snippets

When a component needs feature-specific rendering, use Svelte 5 snippets:

```svelte
<!-- BEFORE (violation): Component imports feature types -->
<script lang="ts">
  import type { DashboardMetric } from '../../features/dashboard/types';
  // Component is now coupled to dashboard feature
</script>

<!-- AFTER: Use generic types + snippet for customisation -->
<script lang="ts" module>
  export type DataListProps<T> = {
    items: T[];
    renderItem: import('svelte').Snippet<[item: T]>;
    emptyMessage?: string;
  };
</script>

<script lang="ts" generics="T">
  let { items, renderItem, emptyMessage = 'No items' }: DataListProps<T> = $props();
</script>

{#if items.length === 0}
  <p>{emptyMessage}</p>
{:else}
  {#each items as item (item)}
    {@render renderItem(item)}
  {/each}
{/if}
```

### Pattern 3: Callback Props Instead of Direct State Access

When a component needs to trigger a feature action:

```svelte
<!-- BEFORE (violation): Component imports feature state -->
<script lang="ts">
  import { deleteItem } from '../../features/items/state.svelte';
</script>
<button onclick={() => deleteItem(id)}>Delete</button>

<!-- AFTER: Accept callback prop -->
<script lang="ts" module>
  export type DeleteButtonProps = {
    label?: string;
    ondelete: () => void;
  };
</script>

<script lang="ts">
  let { label = 'Delete', ondelete }: DeleteButtonProps = $props();
</script>
<button onclick={ondelete}>{label}</button>
```

### Pattern 4: State Composition

When features need to share state, compose at a higher level:

```typescript
// WRONG: Feature A directly imports Feature B's state
// features/orders/state.svelte.ts
import { getUser } from '../auth/state.svelte'; // cross-feature dependency

// CORRECT: Compose in a parent or shared state module
// state/appState.svelte.ts
import { getUser } from '$features/auth';
import { getOrders } from '$features/orders';

let userOrders = $derived(
  getOrders().filter(o => o.userId === getUser()?.id)
);

export function getUserOrders(): Order[] {
  return userOrders;
}
```

## Dependency Map Visualisation

Document the final dependency map:

```text
{{LIB_PATH}}/
├── components/
│   ├── Button/        → (no local deps)
│   ├── DataTable/     → types/, utils/
│   ├── Modal/         → Button/
│   └── Form/          → Button/, Input/
│
├── features/
│   ├── dashboard/     → components/DataTable, components/Modal, state/, types/
│   └── auth/          → components/Form, components/Button, state/, types/
│
├── state/             → types/
├── types/             → (no local deps)
└── utils/             → types/
```

## Validation Script

Create or document a validation approach:

```bash
#!/bin/bash
# validate-deps.sh - Check for dependency violations

VIOLATIONS=0

# Components must not import from features
if grep -rqn "from.*features/" {{LIB_PATH}}/components/; then
  echo "VIOLATION: Components importing from features"
  grep -rn "from.*features/" {{LIB_PATH}}/components/ --include="*.svelte" --include="*.ts"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

# Shared must not import from components or features
if grep -rqn "from.*\(components\|features\)/" {{LIB_PATH}}/types/ {{LIB_PATH}}/utils/; then
  echo "VIOLATION: Shared modules importing from components/features"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

if [ "$VIOLATIONS" -eq 0 ]; then
  echo "All dependency rules pass"
else
  echo "$VIOLATIONS violation(s) found"
  exit 1
fi
```

## Verification

Before moving to the next phase:

- [ ] Dependency hierarchy documented (layers 0-4)
- [ ] All current imports mapped and classified
- [ ] Dependency violations identified
- [ ] Resolution strategy chosen for each violation
- [ ] Shared types extracted where needed
- [ ] Snippets used for dependency inversion
- [ ] Callback props replace direct state imports in components
- [ ] Cross-feature state composed at appropriate level
- [ ] Dependency map visualised
- [ ] Validation script or ESLint rules in place
