# Phase 1: Assessment

Audit components for legacy Svelte patterns and identify all refactoring opportunities
before making any changes.

## Objectives

- Catalogue all components using legacy patterns that need migration
- Quantify the scope of refactoring work across the codebase
- Identify quick wins vs complex migrations
- Establish a baseline for measuring refactoring progress

## Step 1: Detect Legacy Props (`export let`)

Components using `export let` need migration to `$props()`:

```bash
# Find all components using export let
grep -rn "export let" {{LIB_PATH}} --include="*.svelte"

# Count affected components
grep -rl "export let" {{LIB_PATH}} --include="*.svelte" | wc -l
```

Record each component and its props:

| Component | File | Props Count | Has Defaults | Priority |
|-----------|------|-------------|--------------|----------|
| `{{COMPONENT_NAME}}` | `{{COMPONENT_DIR}}/{{COMPONENT_NAME}}.svelte` | ? | Yes/No | High/Med/Low |
| ... | ... | ... | ... | ... |

### Legacy Props Example

```svelte
<!-- LEGACY: export let pattern -->
<script lang="ts">
  export let title: string;
  export let count: number = 0;
  export let items: Item[] = [];
  export let onchange: (value: string) => void = () => {};
</script>

<!-- TARGET: $props() rune -->
<script lang="ts">
  type Props = {
    title: string;
    count?: number;
    items?: Item[];
    onchange?: (value: string) => void;
  };

  let { title, count = 0, items = [], onchange }: Props = $props();
</script>
```

## Step 2: Detect Legacy Reactivity (`$:`)

Reactive declarations and statements need migration to `$derived()` and `$effect()`:

```bash
# Find reactive declarations (→ $derived)
grep -rn "^\s*\$:" {{LIB_PATH}} --include="*.svelte"

# Count affected files
grep -rl "^\s*\$:" {{LIB_PATH}} --include="*.svelte" | wc -l
```

Classify each reactive statement:

| Component | Line | Pattern | Migration Target |
|-----------|------|---------|-----------------|
| `{{COMPONENT_NAME}}` | 42 | `$: doubled = count * 2` | `$derived()` |
| `{{COMPONENT_NAME}}` | 55 | `$: { fetch(...) }` | `$effect()` |
| `{{COMPONENT_NAME}}` | 60 | `$: if (x) doThing()` | `$effect()` |

### Classification Rules

```typescript
// Pure computation → $derived()
// $: total = items.length;
let total = $derived(items.length);

// $: filtered = items.filter(i => i.active);
let filtered = $derived(items.filter(i => i.active));

// Side effect → $effect()
// $: { console.log(count); }
$effect(() => { console.log(count); });

// Conditional side effect → $effect() with condition
// $: if (query.length > 2) fetchResults(query);
$effect(() => { if (query.length > 2) fetchResults(query); });
```

## Step 3: Detect Legacy Slots

Components using `<slot>` need migration to snippets:

```bash
# Find slot usage
grep -rn "<slot" {{LIB_PATH}} --include="*.svelte"

# Find named slots
grep -rn 'slot="' {{LIB_PATH}} --include="*.svelte"

# Find slot props (let:)
grep -rn "let:" {{LIB_PATH}} --include="*.svelte"
```

| Component | Slot Type | Named Slots | Has Slot Props | Complexity |
|-----------|-----------|-------------|----------------|------------|
| `{{COMPONENT_NAME}}` | default | 0 | No | Low |
| `{{COMPONENT_NAME}}` | named | 3 | Yes | High |

## Step 4: Detect Legacy Event Dispatchers

Components using `createEventDispatcher` need callback props:

```bash
# Find event dispatchers
grep -rn "createEventDispatcher" {{LIB_PATH}} --include="*.svelte"

# Find on: directive usage (legacy event forwarding)
grep -rn "on:" {{LIB_PATH}} --include="*.svelte" | grep -v "onclick\|onchange\|oninput"
```

| Component | Events Dispatched | Consumers Count | Complexity |
|-----------|-------------------|-----------------|------------|
| `{{COMPONENT_NAME}}` | `select`, `close` | ? | Medium |

## Step 5: Detect Legacy Stores

Store files need migration to `.svelte.ts` runes:

```bash
# Find writable/readable/derived store imports
grep -rn "writable\|readable\|derived" {{LIB_PATH}} --include="*.ts" -l

# Find store subscriptions in components ($store syntax)
grep -rn "\$[a-zA-Z]" {{LIB_PATH}} --include="*.svelte" | grep -v "\$state\|\$derived\|\$effect\|\$props\|\$bindable"
```

| Store File | Type | Subscribers | Migration Target |
|------------|------|-------------|-----------------|
| `store.ts` | `writable` | 5 | `state.svelte.ts` with `$state` |
| `store.ts` | `derived` | 3 | `state.svelte.ts` with `$derived` |

## Step 6: Detect `interface` Usage

All `interface` keywords must be replaced with `type`:

```bash
# Find interface declarations
grep -rn "^export interface\|^interface" {{LIB_PATH}} --include="*.ts" --include="*.svelte"
```

## Step 7: Detect `onMount`/`onDestroy` Lifecycle

```bash
# Find lifecycle imports
grep -rn "onMount\|onDestroy\|beforeUpdate\|afterUpdate" {{LIB_PATH}} --include="*.svelte"
```

Note: `onMount` remains valid in Svelte 5 but many uses can be replaced with `$effect`.
Only migrate `onMount` when the logic is purely reactive, not when it needs cleanup or
is truly "mount-only".

## Assessment Summary Template

```markdown
## Refactoring Assessment for {{PROJECT_ROOT}}

### Scope
- Components with legacy props (`export let`): __
- Components with reactive declarations (`$:`): __
- Components using slots: __
- Components using event dispatchers: __
- Store files to migrate: __
- Files using `interface`: __

### Estimated Effort
- Quick wins (simple props migration): __
- Medium complexity (slots + events): __
- High complexity (stores + deep reactivity): __

### Recommended Priority
1. [Highest priority items]
2. [Medium priority items]
3. [Lower priority items]
```

## Verification

Before moving to the next phase:

- [ ] All components with `export let` catalogued
- [ ] All `$:` reactive statements classified ($derived vs $effect)
- [ ] All slot usage documented
- [ ] All event dispatchers found
- [ ] All legacy store files identified
- [ ] All `interface` usage found
- [ ] Lifecycle usage reviewed
- [ ] Component complexity rated (low/medium/high)
- [ ] Assessment summary document created
