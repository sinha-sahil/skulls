# Phase 4: Testing

Establish testing conventions for Svelte 5 components using runes, snippets,
and callback props with Vitest and Testing Library.

## Objectives

- Define testing patterns for Svelte 5 rune-based components
- Establish conventions for testing snippets and callback props
- Set up patterns for testing `.svelte.ts` state files
- Create reusable test utilities and helpers

## Testing Stack

```bash
# Required dependencies
pnpm add -D vitest @testing-library/svelte @testing-library/jest-dom jsdom
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

## Component Test Patterns

### Testing $props()

```typescript
// {{COMPONENT_NAME}}.test.ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import {{COMPONENT_NAME}} from './{{COMPONENT_NAME}}.svelte';

describe('{{COMPONENT_NAME}}', () => {
  it('renders with required props', () => {
    render({{COMPONENT_NAME}}, {
      props: { title: 'Test Title', items: [] },
    });

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('applies default prop values', () => {
    render({{COMPONENT_NAME}}, {
      props: { title: 'Test', items: [] },
    });

    // variant defaults to 'default'
    const container = screen.getByTestId('component');
    expect(container).toHaveClass('default');
  });

  it('applies provided optional props', () => {
    render({{COMPONENT_NAME}}, {
      props: { title: 'Test', items: [], variant: 'compact' },
    });

    const container = screen.getByTestId('component');
    expect(container).toHaveClass('compact');
  });
});
```

### Testing $state() Reactivity

```typescript
import { render, screen, fireEvent } from '@testing-library/svelte';

describe('Counter', () => {
  it('updates $state on interaction', async () => {
    render(Counter, { props: { initial: 0 } });

    expect(screen.getByText('Count: 0')).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: /increment/i }));
    expect(screen.getByText('Count: 1')).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: /increment/i }));
    expect(screen.getByText('Count: 2')).toBeInTheDocument();
  });

  it('resets $state correctly', async () => {
    render(Counter, { props: { initial: 5 } });

    await fireEvent.click(screen.getByRole('button', { name: /increment/i }));
    expect(screen.getByText('Count: 6')).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByText('Count: 5')).toBeInTheDocument();
  });
});
```

### Testing $derived() Values

```typescript
describe('FilteredList', () => {
  it('computes $derived values from props', () => {
    const items = [
      { id: '1', label: 'Active', active: true },
      { id: '2', label: 'Inactive', active: false },
      { id: '3', label: 'Also Active', active: true },
    ];

    render(FilteredList, { props: { items } });

    // $derived(items.filter(i => i.active)) should show 2 items
    expect(screen.getByText('Showing 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Also Active')).toBeInTheDocument();
    expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
  });
});
```

### Testing Callback Props

```typescript
import { vi } from 'vitest';

describe('SelectableList', () => {
  it('calls onselect with the selected item', async () => {
    const onselect = vi.fn();
    const items = [
      { id: '1', label: 'Item A' },
      { id: '2', label: 'Item B' },
    ];

    render(SelectableList, { props: { items, onselect } });

    await fireEvent.click(screen.getByText('Item A'));

    expect(onselect).toHaveBeenCalledOnce();
    expect(onselect).toHaveBeenCalledWith(items[0]);
  });

  it('handles missing onselect callback gracefully', async () => {
    const items = [{ id: '1', label: 'Item A' }];

    // No onselect prop - should not throw
    render(SelectableList, { props: { items } });

    // Click should not throw
    await fireEvent.click(screen.getByText('Item A'));
  });

  it('calls ondelete with correct id', async () => {
    const ondelete = vi.fn();
    const items = [{ id: '42', label: 'Delete Me' }];

    render(SelectableList, { props: { items, ondelete } });

    await fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(ondelete).toHaveBeenCalledWith('42');
  });
});
```

### Testing Snippets

Create test wrapper components for snippet testing:

```svelte
<!-- test/CardTestWrapper.svelte -->
<script lang="ts">
  import Card from '$lib/components/Card/Card.svelte';
</script>

<Card title="Test Card">
  {#snippet header()}<h2 data-testid="custom-header">Custom Header</h2>{/snippet}
  <p data-testid="body-content">Body content</p>
  {#snippet footer()}<button data-testid="footer-action">Action</button>{/snippet}
</Card>
```

```typescript
import CardTestWrapper from './CardTestWrapper.svelte';

describe('Card snippets', () => {
  it('renders header snippet', () => {
    render(CardTestWrapper);
    expect(screen.getByTestId('custom-header')).toHaveTextContent('Custom Header');
  });

  it('renders children content', () => {
    render(CardTestWrapper);
    expect(screen.getByTestId('body-content')).toHaveTextContent('Body content');
  });

  it('renders footer snippet', () => {
    render(CardTestWrapper);
    expect(screen.getByTestId('footer-action')).toHaveTextContent('Action');
  });
});
```

### Testing $bindable() Props

```svelte
<!-- test/InputTestWrapper.svelte -->
<script lang="ts">
  import TextInput from '$lib/components/TextInput/TextInput.svelte';
  let value = $state('initial');
</script>

<TextInput bind:value label="Test Input" />
<p data-testid="bound-value">{value}</p>
```

```typescript
import InputTestWrapper from './InputTestWrapper.svelte';

describe('TextInput with $bindable', () => {
  it('supports two-way binding', async () => {
    render(InputTestWrapper);

    const input = screen.getByLabelText('Test Input');
    expect(input).toHaveValue('initial');

    await fireEvent.input(input, { target: { value: 'updated' } });
    expect(screen.getByTestId('bound-value')).toHaveTextContent('updated');
  });
});
```

## Testing `.svelte.ts` State Files

```typescript
// state.svelte.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getItems, getCount, setItems, addItem, removeItem } from './state.svelte';

describe('Item state', () => {
  beforeEach(() => {
    setItems([]);
  });

  it('initialises with empty state', () => {
    expect(getItems()).toEqual([]);
    expect(getCount()).toBe(0);
  });

  it('sets items', () => {
    const items = [{ id: '1', label: 'Test' }];
    setItems(items);
    expect(getItems()).toEqual(items);
    expect(getCount()).toBe(1);
  });

  it('adds items', () => {
    addItem({ id: '1', label: 'First' });
    addItem({ id: '2', label: 'Second' });
    expect(getCount()).toBe(2);
  });

  it('removes items by id', () => {
    setItems([
      { id: '1', label: 'Keep' },
      { id: '2', label: 'Remove' },
    ]);
    removeItem('2');
    expect(getCount()).toBe(1);
    expect(getItems()[0].label).toBe('Keep');
  });
});
```

## Test File Naming and Location

| Source File | Test File | Location |
|------------|-----------|----------|
| `Button.svelte` | `Button.test.ts` | Same directory |
| `state.svelte.ts` | `state.svelte.test.ts` | Same directory |
| `formatUtils.ts` | `formatUtils.test.ts` | Same directory |

## Test Checklist Per Component

- [ ] Required props render correctly
- [ ] Default values applied when optional props omitted
- [ ] `$state` updates reflected in DOM after interaction
- [ ] `$derived` values compute correctly
- [ ] All callback props called with correct arguments
- [ ] Missing callback props handled gracefully (no throws)
- [ ] Snippet content renders in correct locations
- [ ] `$bindable` props support two-way binding
- [ ] Error states render correctly
- [ ] Accessibility attributes present (`role`, `aria-*`)

## Verification

Before moving to the next phase:

- [ ] Test stack configured (Vitest + Testing Library)
- [ ] Test patterns documented for all rune types
- [ ] Callback prop testing convention established
- [ ] Snippet testing approach defined (wrapper components)
- [ ] State file testing patterns available
- [ ] Test file naming convention set (co-located)
- [ ] `pnpm test` passes
- [ ] `pnpm check` passes
