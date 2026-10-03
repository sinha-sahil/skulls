# Phase 6: Testing Strategy

Plan how to verify correctness at each step of the refactoring, including automated
tests, type checking, and manual verification.

## Objectives

- Ensure existing tests continue to pass throughout migration
- Add targeted tests for migrated component behaviour
- Verify type safety after each migration step
- Plan manual testing for visual and interactive correctness

## Testing Layers

### Layer 1: Type Checking (`pnpm check`)

The first line of defence. Run after every change:

```bash
pnpm check
```

Common type errors after migration:

```typescript
// Error: Missing $bindable() for bound props
// Fix: Add $bindable() wrapper
type InputProps = {
  value: string; // If consumers use bind:value, this needs $bindable
};
let { value = $bindable('') }: InputProps = $props();

// Error: Snippet type mismatch
// Fix: Import and use correct Snippet generic
import type { Snippet } from 'svelte';
type CardProps = {
  actions?: Snippet<[item: Item]>; // typed snippet parameter
};

// Error: Event handler type mismatch after dispatcher removal
// Fix: Use correct callback prop signature
type ListProps = {
  onselect?: (item: Item) => void; // matches the call site
};
```

### Layer 2: Unit Tests (`pnpm test`)

Test component behaviour independently:

#### Testing $props() Migration

```typescript
// {{COMPONENT_NAME}}.test.ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import {{COMPONENT_NAME}} from './{{COMPONENT_NAME}}.svelte';

describe('{{COMPONENT_NAME}}', () => {
  it('renders with required props', () => {
    render({{COMPONENT_NAME}}, { props: { title: 'Test' } });
    expect(screen.getByText('Test')).toBeTruthy();
  });

  it('applies default values', () => {
    render({{COMPONENT_NAME}}, { props: { title: 'Test' } });
    // variant should default to 'default'
    const el = screen.getByRole('button');
    expect(el.classList.contains('btn-default')).toBe(true);
  });
});
```

#### Testing $state() and $derived() Migration

```typescript
import { render, screen, fireEvent } from '@testing-library/svelte';
import Counter from './Counter.svelte';

describe('Counter (migrated to runes)', () => {
  it('increments count with $state', async () => {
    render(Counter);
    const button = screen.getByRole('button', { name: /increment/i });

    await fireEvent.click(button);
    expect(screen.getByText('Count: 1')).toBeTruthy();

    await fireEvent.click(button);
    expect(screen.getByText('Count: 2')).toBeTruthy();
  });

  it('computes derived values', async () => {
    render(Counter, { props: { initial: 5 } });
    // $derived(count * 2) should show 10
    expect(screen.getByText('Doubled: 10')).toBeTruthy();
  });
});
```

#### Testing Callback Props (replacing dispatchers)

```typescript
import { render, screen, fireEvent } from '@testing-library/svelte';
import { vi } from 'vitest';
import SelectableList from './SelectableList.svelte';

describe('SelectableList (migrated events)', () => {
  it('calls onselect callback prop', async () => {
    const onselect = vi.fn();
    const items = [{ id: '1', label: 'Item 1' }];

    render(SelectableList, { props: { items, onselect } });

    await fireEvent.click(screen.getByText('Item 1'));
    expect(onselect).toHaveBeenCalledWith(items[0]);
  });

  it('handles missing callback gracefully', async () => {
    const items = [{ id: '1', label: 'Item 1' }];
    // No onselect prop - should not throw
    render(SelectableList, { props: { items } });

    await fireEvent.click(screen.getByText('Item 1'));
    // No error thrown
  });
});
```

#### Testing Snippet Migration

```typescript
import { render, screen } from '@testing-library/svelte';
import CardTest from './CardTest.svelte';

// CardTest.svelte is a test wrapper that uses Card with snippets:
// <Card>
//   {#snippet header()}<h2>Test Header</h2>{/snippet}
//   <p>Test Body</p>
//   {#snippet footer()}<button>Action</button>{/snippet}
// </Card>

describe('Card (migrated slots to snippets)', () => {
  it('renders snippet content', () => {
    render(CardTest);
    expect(screen.getByText('Test Header')).toBeTruthy();
    expect(screen.getByText('Test Body')).toBeTruthy();
    expect(screen.getByText('Action')).toBeTruthy();
  });
});
```

#### Testing Runes State Files

```typescript
// state.svelte.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getItems,
  getCount,
  getIsLoading,
  setItems,
  addItem,
  loadItems,
} from './state.svelte';

describe('Item state (migrated from store)', () => {
  beforeEach(() => {
    setItems([]);
  });

  it('manages items with $state', () => {
    setItems([{ id: '1', label: 'Test' }]);
    expect(getItems()).toHaveLength(1);
    expect(getItems()[0].label).toBe('Test');
  });

  it('computes count with $derived', () => {
    setItems([{ id: '1', label: 'A' }, { id: '2', label: 'B' }]);
    expect(getCount()).toBe(2);
  });

  it('adds items reactively', () => {
    addItem({ id: '1', label: 'New' });
    expect(getItems()).toHaveLength(1);
    expect(getCount()).toBe(1);
  });
});
```

### Layer 3: Linting (`pnpm lint`)

Catch style and pattern violations:

```bash
pnpm lint
```

Add lint rules to enforce Svelte 5 patterns:

```jsonc
// eslint.config.js additions
{
  "rules": {
    // Prevent legacy patterns from being reintroduced
    "no-restricted-imports": ["error", {
      "paths": [{
        "name": "svelte/store",
        "message": "Use .svelte.ts runes state files instead of stores."
      }]
    }]
  }
}
```

### Layer 4: Integration/Visual Testing

For components with complex interactions, verify manually or with visual tests:

| Component | Visual Check | Interactive Check | Accessibility Check |
|-----------|-------------|-------------------|---------------------|
| `{{COMPONENT_NAME}}` | [ ] Renders correctly | [ ] Events fire | [ ] Keyboard nav |
| ... | ... | ... | ... |

## Test Execution Order

Run tests in this order after each migration step:

```bash
# 1. Type safety first
pnpm check

# 2. Unit/component tests
pnpm test

# 3. Lint for pattern violations
pnpm lint

# 4. Build to catch SSR/bundling issues
pnpm build
```

## Regression Testing Checklist

After migrating each component:

- [ ] `pnpm check` passes with zero errors
- [ ] All existing tests for this component pass
- [ ] New tests added for migrated patterns
- [ ] Callback props tested with and without handlers
- [ ] Snippet rendering tested with and without content
- [ ] `$bindable` props tested with `bind:` in consumers
- [ ] `$state` mutations trigger re-renders
- [ ] `$derived` values update when dependencies change
- [ ] `$effect` cleanup runs correctly
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds

## Verification

Before moving to the next phase:

- [ ] Testing strategy covers all four layers
- [ ] Test templates prepared for common migration patterns
- [ ] Existing test suite passing as baseline
- [ ] New tests planned for each migrated component
- [ ] Integration/visual testing plan documented
- [ ] Regression checklist available for each migration step
