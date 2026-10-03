# Phase 6: Testing Strategy

Verify each refactoring change preserves correct behaviour in {{PROJECT_NAME}}.

## Objectives

- Define test coverage for each refactoring category
- Establish testing patterns for SvelteKit-specific code
- Ensure load functions, form actions, and components are tested
- Set up confidence gates before merging

## Testing Stack

| Tool | Purpose | Config File |
|------|---------|-------------|
| Vitest | Unit tests, server logic | `vitest.config.ts` |
| @testing-library/svelte | Component rendering tests | (via Vitest) |
| Playwright | End-to-end browser tests | `playwright.config.ts` |
| svelte-check | Type checking | `svelte.config.js` |

## Unit Testing with Vitest

### Testing Load Functions

```typescript
// src/routes/items/+page.server.test.ts
import { describe, it, expect, vi } from 'vitest';
import { load } from './+page.server';

describe('+page.server load', () => {
  it('returns items for authenticated user', async () => {
    const result = await load({
      locals: { user: { id: '1', role: 'admin' } },
      params: {},
      url: new URL('http://localhost/items'),
      // Mock other RequestEvent properties as needed
    } as Parameters<typeof load>[0]);

    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('throws 401 for unauthenticated user', async () => {
    await expect(
      load({
        locals: { user: null },
        params: {},
        url: new URL('http://localhost/items'),
      } as Parameters<typeof load>[0])
    ).rejects.toThrow();
  });
});
```

### Testing Form Actions

```typescript
// src/routes/items/+page.server.test.ts
import { describe, it, expect } from 'vitest';
import { actions } from './+page.server';

function createFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.append(key, value);
  }
  return fd;
}

describe('form actions', () => {
  it('create action validates required fields', async () => {
    const result = await actions.create({
      request: new Request('http://localhost', {
        method: 'POST',
        body: createFormData({ name: '' }),
      }),
      locals: { user: { id: '1', role: 'admin' } },
    } as Parameters<(typeof actions)['create']>[0]);

    expect(result?.status).toBe(400);
  });

  it('create action succeeds with valid data', async () => {
    const result = await actions.create({
      request: new Request('http://localhost', {
        method: 'POST',
        body: createFormData({ name: 'Test Item' }),
      }),
      locals: { user: { id: '1', role: 'admin' } },
    } as Parameters<(typeof actions)['create']>[0]);

    // Should redirect on success (throws redirect)
    expect(result).toBeUndefined();
  });
});
```

### Testing Server Services

```typescript
// src/lib/server/services/itemService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getItems, createItem } from './itemService';

describe('itemService', () => {
  beforeEach(async () => {
    // Reset test database or mocks
  });

  it('getItems returns filtered results', async () => {
    const items = await getItems({ status: 'active' });
    expect(items.every((i) => i.status === 'active')).toBe(true);
  });
});
```

## Component Testing with @testing-library/svelte

### Testing Migrated Components

```typescript
// src/lib/client/components/Counter.test.ts
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Counter from './Counter.svelte';

describe('Counter (migrated to Svelte 5)', () => {
  it('renders with initial count', () => {
    render(Counter, { props: { initialCount: 5 } });
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('calls onchange callback when incremented', async () => {
    let changedValue = 0;
    render(Counter, {
      props: {
        initialCount: 0,
        onchange: (value: number) => { changedValue = value; },
      },
    });

    const button = screen.getByRole('button', { name: /increment/i });
    await fireEvent.click(button);

    expect(changedValue).toBe(1);
  });
});
```

### Testing Components with Snippets

```typescript
// Snippet-based components require rendering with content
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CardWrapper from './CardWrapper.test.svelte';

// Create a test wrapper: CardWrapper.test.svelte
// that renders Card with snippet content

describe('Card with snippets', () => {
  it('renders children content', () => {
    render(CardWrapper);
    expect(screen.getByText('Card body content')).toBeTruthy();
  });
});
```

## End-to-End Testing with Playwright

### Critical Path Tests

```typescript
// tests/e2e/items.test.ts
import { test, expect } from '@playwright/test';

test.describe('Items page (post-refactor)', () => {
  test('loads and displays items', async ({ page }) => {
    await page.goto('/items');
    await expect(page.getByRole('heading', { name: /items/i })).toBeVisible();
    await expect(page.getByRole('list')).toBeVisible();
  });

  test('create item form works', async ({ page }) => {
    await page.goto('/items/new');
    await page.getByLabel('Name').fill('Test Item');
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page).toHaveURL(/\/items\/\w+/);
  });

  test('error states display correctly', async ({ page }) => {
    await page.goto('/items/nonexistent-id');
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
```

## Test Placement

```text
src/
  lib/
    server/
      services/
        itemService.ts
        itemService.test.ts        ← unit test beside source
    client/
      components/
        Counter.svelte
        Counter.test.ts            ← component test beside source
  routes/
    items/
      +page.server.ts
      +page.server.test.ts         ← load/action tests beside route
tests/
  e2e/
    items.test.ts                  ← E2E tests in dedicated dir
```

## Refactoring-Specific Test Plan

| Change Category | Test Type | What to Verify |
|----------------|-----------|----------------|
| `interface` → `type` | `pnpm check` only | Types still resolve |
| Store → rune | Unit + E2E | State changes propagate |
| `$:` → `$derived/$effect` | Component + E2E | Computed values correct |
| `export let` → `$props` | Component | Props received correctly |
| Slots → snippets | Component | Content renders in slots |
| Event dispatch → callbacks | Component | Parent receives events |
| Error handling | Unit + E2E | Error responses correct |

## Verification Gates

Run before every commit during refactoring:

```bash
pnpm check    # Must pass - zero type errors
pnpm lint     # Must pass - zero violations
pnpm test     # Must pass - zero failures
pnpm build    # Must pass - clean production build
```

## Checklist

- [ ] Vitest configured and running
- [ ] @testing-library/svelte installed and configured
- [ ] Playwright configured with test routes
- [ ] Load function tests written for affected routes
- [ ] Form action tests written for affected routes
- [ ] Component tests cover migrated components
- [ ] E2E tests cover critical user paths
- [ ] All tests pass before starting refactoring
- [ ] Test coverage baseline recorded
- [ ] Verification gates documented and enforced
