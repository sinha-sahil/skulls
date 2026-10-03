# Phase 3: Impact Analysis

Identify all files affected by the refactoring, map breaking changes, and document
dependency chains to understand the full blast radius.

## Objectives

- Map every file that will be modified during refactoring
- Identify breaking changes to component APIs
- Trace dependency chains to find cascading impacts
- Quantify risk for each component migration

## Step 1: Map Affected Files Per Component

For each component being refactored, trace all consumers:

```bash
# Find all files importing {{COMPONENT_NAME}}
grep -rn "import.*{{COMPONENT_NAME}}" {{LIB_PATH}} --include="*.svelte" --include="*.ts" -l

# Find all files using the component in markup
grep -rn "<{{COMPONENT_NAME}}" {{LIB_PATH}} --include="*.svelte" -l
```

| Component | Direct Consumers | Transitive Consumers | Total Affected |
|-----------|-----------------|---------------------|----------------|
| `{{COMPONENT_NAME}}` | ? | ? | ? |
| ... | ... | ... | ... |

## Step 2: Identify Breaking Changes

### Props Changes (`export let` → `$props()`)

Props migration is typically non-breaking for consumers **unless** the component
is used with `bind:`:

```svelte
<!-- Consumer code that MUST change if prop is $bindable -->
<Counter bind:count />

<!-- The component must use $bindable() for this to work -->
<script lang="ts">
  type CounterProps = {
    count: number;
  };

  let { count = $bindable(0) }: CounterProps = $props();
</script>
```

| Component | Prop | Used with `bind:` | Breaking | Action |
|-----------|------|--------------------|----------|--------|
| `{{COMPONENT_NAME}}` | `value` | Yes | Yes | Add `$bindable()` |
| `{{COMPONENT_NAME}}` | `title` | No | No | Standard `$props()` |

```bash
# Find all bind: usage for a component
grep -rn "bind:" {{LIB_PATH}} --include="*.svelte" | grep "{{COMPONENT_NAME}}"
```

### Slot Changes (Slots → Snippets)

Slot-to-snippet migration breaks every consumer that passes slot content:

```svelte
<!-- Consumer BEFORE (must change) -->
<Card>
  <svelte:fragment slot="header">
    <h2>Title</h2>
  </svelte:fragment>
  <p>Body content</p>
</Card>

<!-- Consumer AFTER -->
<Card>
  {#snippet header()}<h2>Title</h2>{/snippet}
  <p>Body content</p>
</Card>
```

| Component | Slots | Consumers Using Slots | Breaking |
|-----------|-------|-----------------------|----------|
| `{{COMPONENT_NAME}}` | `header`, `default`, `footer` | ? | Yes |

```bash
# Find consumers passing named slot content
grep -rn 'slot="' {{LIB_PATH}} --include="*.svelte" | grep -i "{{COMPONENT_NAME}}"

# Find consumers of default slot
grep -rn "<{{COMPONENT_NAME}}" {{LIB_PATH}} --include="*.svelte" -A 5 | grep -v "/>"
```

### Event Changes (Dispatcher → Callback Props)

Event migration breaks consumers using `on:` directives:

```svelte
<!-- Consumer BEFORE (must change) -->
<SelectableList on:select={handleSelect} on:delete={handleDelete} />

<!-- Consumer AFTER -->
<SelectableList onselect={handleSelect} ondelete={handleDelete} />
```

| Component | Events | Consumers Listening | Breaking |
|-----------|--------|--------------------|----------|
| `{{COMPONENT_NAME}}` | `select`, `delete` | ? | Yes |

```bash
# Find consumers with on: event handlers for this component
grep -rn "on:" {{LIB_PATH}} --include="*.svelte" | grep "{{COMPONENT_NAME}}"
```

### Store Changes (Stores → Runes State)

Store migration breaks every subscriber:

```svelte
<!-- Consumer BEFORE (must change) -->
<script lang="ts">
  import { items, count } from './store';
</script>
<p>{$count} items</p>

<!-- Consumer AFTER -->
<script lang="ts">
  import { getItems, getCount } from './state.svelte';
</script>
<p>{getCount()} items</p>
```

| Store File | Subscribers | Import Pattern | Breaking |
|------------|-------------|----------------|----------|
| `store.ts` | ? | `$storeName` auto-sub | Yes |

## Step 3: Dependency Chain Analysis

Map the full chain for components with many dependents:

```text
{{COMPONENT_NAME}} (being refactored)
├── ConsumerA.svelte (direct, uses slot + events)
│   ├── PageX.svelte (uses ConsumerA)
│   └── PageY.svelte (uses ConsumerA)
├── ConsumerB.svelte (direct, uses props only)
│   └── FeatureView.svelte (uses ConsumerB)
└── ConsumerC.svelte (direct, uses bind:)
```

### Risk Classification

| Risk Level | Criteria | Example |
|------------|----------|---------|
| **Low** | Props-only, no bind, no slots, no events | Simple display component |
| **Medium** | Has bind: usage OR named slots OR events | Form input, modal |
| **High** | Multiple: slots + events + bind + many consumers | Complex data table |
| **Critical** | Deeply nested dependency chain, used everywhere | Layout wrapper |

## Step 4: Impact Summary

```markdown
## Impact Summary for {{PROJECT_ROOT}}

### Total Files Affected
- Components to refactor: __
- Consumer files to update: __
- Store files to migrate: __
- Type files to update: __
- Total files touched: __

### Breaking Changes
- Components with slot changes: __ (affects __ consumers)
- Components with event changes: __ (affects __ consumers)
- Components with bind: changes: __ (affects __ consumers)
- Store migrations: __ (affects __ subscribers)

### Risk Distribution
- Low risk: __ components
- Medium risk: __ components
- High risk: __ components
- Critical risk: __ components
```

## Step 5: Consumer Update Templates

Prepare template patterns for common consumer updates:

### Slot Consumer Update

```svelte
<!-- Find: <svelte:fragment slot="NAME">...</svelte:fragment> -->
<!-- Replace: {#snippet NAME()}...{/snippet} -->

<!-- Find: <Component><content></Component> -->
<!-- Replace: <Component><content></Component> (unchanged for default/children) -->

<!-- Find: <svelte:fragment slot="NAME" let:item>...</svelte:fragment> -->
<!-- Replace: {#snippet NAME(item)}...{/snippet} -->
```

### Event Consumer Update

```svelte
<!-- Find: on:eventname={handler} -->
<!-- Replace: oneventname={handler} -->

<!-- Find: on:eventname={(e) => doThing(e.detail)} -->
<!-- Replace: oneventname={(value) => doThing(value)} -->
```

### Store Consumer Update

```svelte
<!-- Find: {$storeName} in markup -->
<!-- Replace: {getStoreName()} in markup -->

<!-- Find: $storeName in script -->
<!-- Replace: getStoreName() in script -->

<!-- Find: $storeName = value -->
<!-- Replace: setStoreName(value) -->
```

## Verification

Before moving to the next phase:

- [ ] All consumer files mapped for each component
- [ ] Breaking changes identified and classified
- [ ] `bind:` usage traced for all migrating components
- [ ] Slot consumer updates quantified
- [ ] Event consumer updates quantified
- [ ] Store subscriber updates quantified
- [ ] Dependency chains traced for high-risk components
- [ ] Risk level assigned to every component
- [ ] Impact summary document created
- [ ] Consumer update templates prepared
