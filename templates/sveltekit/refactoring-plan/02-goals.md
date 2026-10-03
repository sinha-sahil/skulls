# Phase 2: Goals

Define measurable refactoring objectives for {{REFACTOR_SCOPE}} in {{PROJECT_NAME}}.

## Objectives

- Set specific, measurable targets for each refactoring category
- Establish acceptance criteria that can be verified with tooling
- Prioritise goals based on assessment findings
- Define "done" for the refactoring effort

## Goal Categories

### Goal 1: Eliminate All `interface` Declarations

Replace every `interface` with `type` across the entire codebase.

```typescript
// BEFORE - legacy interface
interface UserDataType {
  id: string;
  name: string;
  email: string;
}

// AFTER - type alias (correct)
type UserDataType = {
  id: string;
  name: string;
  email: string;
};
```

**Acceptance criteria:**
```bash
# Must return zero results
grep -rn "^export interface\|^interface " src/ --include="*.ts" --include="*.svelte"
```

### Goal 2: Migrate All Stores to $state Runes

Replace Svelte stores with `$state` runes in `.svelte` and `.svelte.ts` files.

```typescript
// BEFORE - store.ts
import { writable, derived } from 'svelte/store';

export const count = writable(0);
export const doubled = derived(count, ($count) => $count * 2);

// AFTER - state.svelte.ts
let count = $state(0);
let doubled = $derived(count * 2);

export function getCount() {
  return count;
}

export function setCount(value: number) {
  count = value;
}
```

**Acceptance criteria:**
```bash
# Must return zero results
grep -rn "from 'svelte/store'" src/ --include="*.ts" --include="*.svelte"
```

### Goal 3: Replace All Reactive Declarations with Runes

Migrate `$:` statements to `$derived` or `$effect`.

```svelte
<!-- BEFORE -->
<script lang="ts">
  let count = 0;
  $: doubled = count * 2;
  $: if (count > 10) console.warn('High');
  $: {
    document.title = `Count: ${count}`;
  }
</script>

<!-- AFTER -->
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    if (count > 10) console.warn('High');
  });

  $effect(() => {
    document.title = `Count: ${count}`;
  });
</script>
```

**Acceptance criteria:**
```bash
grep -rn "^\s*\$:" src/ --include="*.svelte"
```

### Goal 4: Eliminate All `any` Types

Replace every `any` with a specific type.

```typescript
// BEFORE
function processData(data: any): any {
  return data.items.map((item: any) => item.name);
}

// AFTER
type DataPayloadType = {
  items: { name: string; id: string }[];
};

function processData(data: DataPayloadType): string[] {
  return data.items.map((item) => item.name);
}
```

**Acceptance criteria:**
```bash
grep -rn ": any\b\|as any\b" src/ --include="*.ts" --include="*.svelte"
```

### Goal 5: Consistent Error Handling with fail() and error()

Standardise all error responses in server code.

```typescript
// BEFORE - inconsistent
export const actions = {
  default: async ({ request }) => {
    try {
      // ...
    } catch (e) {
      return { error: 'Something went wrong' };
    }
  }
} satisfies Actions;

// AFTER - consistent with fail()
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    try {
      // ...
    } catch (e) {
      return fail(400, { message: 'Validation failed' });
    }
  }
} satisfies Actions;
```

### Goal 6: Proper Load Function Typing

Add explicit types to all load functions.

```typescript
// BEFORE
export const load = async ({ params }) => {
  const user = await getUser(params.id);
  return { user };
};

// AFTER
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const user = await getUser(params.id);
  return { user };
};
```

### Goal 7: Migrate Props and Events

Replace `export let` with `$props()` and `createEventDispatcher` with callback props.

## Goal Priority Matrix

| Goal | Priority | Effort | Risk | Order |
|------|----------|--------|------|-------|
| `interface` → `type` | High | Low | Low | 1 |
| `any` → specific types | High | Medium | Low | 2 |
| Load function typing | Medium | Low | Low | 3 |
| Error handling | Medium | Low | Low | 4 |
| `$:` → runes | High | Medium | Medium | 5 |
| `export let` → `$props` | High | Medium | Medium | 6 |
| Stores → runes | High | High | High | 7 |

## Checklist

- [ ] All goals have measurable acceptance criteria
- [ ] Goals are prioritised by risk and effort
- [ ] Each goal has before/after code examples
- [ ] Verification commands defined for each goal
- [ ] Goal order respects dependency chain
- [ ] Stakeholders aligned on priorities
- [ ] Timeline estimated for each goal
