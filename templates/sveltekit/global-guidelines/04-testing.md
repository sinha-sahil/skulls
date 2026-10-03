# Phase 4: Testing

Testing standards and patterns for {{PROJECT_NAME}}.

## Objectives

- Establish testing stack and configuration
- Define patterns for unit, component, and E2E tests
- Set conventions for testing SvelteKit-specific code
- Document test file placement and naming

## Testing Stack

| Tool | Purpose | Install |
|------|---------|---------|
| Vitest | Unit tests, server logic | `pnpm add -D vitest` |
| @testing-library/svelte | Component rendering | `pnpm add -D @testing-library/svelte` |
| @testing-library/jest-dom | DOM assertions | `pnpm add -D @testing-library/jest-dom` |
| Playwright | End-to-end tests | `pnpm add -D @playwright/test` |

## Test File Placement

Tests live beside the code they test:

```text
src/
  lib/
    server/
      services/
        userService.ts
        userService.test.ts          ← unit test
    client/
      components/
        UserCard.svelte
        UserCard.test.ts             ← component test
      utils/
        formatDate.ts
        formatDate.test.ts           ← unit test
  routes/
    items/
      +page.server.ts
      +page.server.test.ts           ← load/action test
tests/
  e2e/
    items.test.ts                    ← E2E test
    auth.test.ts
```

## Unit Testing with Vitest

### Testing Utility Functions

```typescript
// src/lib/client/utils/formatDate.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, formatRelativeDate } from './formatDate';

describe('formatDate', () => {
  it('formats ISO date to readable string', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toBe('January 15, 2024');
  });

  it('returns empty string for invalid date', () => {
    const result = formatDate('invalid');
    expect(result).toBe('');
  });
});

describe('formatRelativeDate', () => {
  it('returns "just now" for recent dates', () => {
    const now = new Date().toISOString();
    expect(formatRelativeDate(now)).toBe('just now');
  });
});
```

### Testing Server Services

```typescript
// src/lib/server/services/userService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getUser, updateUser } from './userService';

// Mock the database
vi.mock('$lib/server/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { db } from '$lib/server/db';

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUser returns user by ID', async () => {
    const mockUser = { id: '1', name: 'Test', email: 'test@example.com' };
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser);

    const result = await getUser('1');

    expect(db.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(result).toEqual(mockUser);
  });

  it('getUser returns null for missing user', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);

    const result = await getUser('nonexistent');
    expect(result).toBeNull();
  });
});
```

### Testing Load Functions

```typescript
// src/routes/items/+page.server.test.ts
import { describe, it, expect, vi } from 'vitest';
import { load, actions } from './+page.server';

describe('items page load', () => {
  it('returns items for authenticated user', async () => {
    const result = await load({
      locals: { user: { id: '1', name: 'Test', role: 'admin' } },
      url: new URL('http://localhost/items'),
      params: {},
    } as Parameters<typeof load>[0]);

    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('throws 401 when not authenticated', async () => {
    await expect(
      load({
        locals: { user: null },
        url: new URL('http://localhost/items'),
        params: {},
      } as Parameters<typeof load>[0])
    ).rejects.toMatchObject({ status: 401 });
  });
});
```

### Testing Form Actions

```typescript
// src/routes/items/+page.server.test.ts
import { describe, it, expect } from 'vitest';
import { actions } from './+page.server';

function mockFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

function mockRequest(data: Record<string, string>): Request {
  return new Request('http://localhost', {
    method: 'POST',
    body: mockFormData(data),
  });
}

describe('items form actions', () => {
  describe('create', () => {
    it('fails with 400 for empty name', async () => {
      const result = await actions.create({
        request: mockRequest({ name: '' }),
        locals: { user: { id: '1', name: 'Test', role: 'admin' } },
      } as Parameters<(typeof actions)['create']>[0]);

      expect(result?.status).toBe(400);
    });

    it('succeeds with valid data', async () => {
      await expect(
        actions.create({
          request: mockRequest({ name: 'New Item' }),
          locals: { user: { id: '1', name: 'Test', role: 'admin' } },
        } as Parameters<(typeof actions)['create']>[0])
      ).rejects.toMatchObject({ status: 303 }); // redirect
    });
  });
});
```

## Component Testing

```typescript
// src/lib/client/components/UserCard.test.ts
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import UserCard from './UserCard.svelte';

describe('UserCard', () => {
  const defaultProps = {
    user: { id: '1', name: 'Alice', email: 'alice@example.com' },
  };

  it('renders user name and email', () => {
    render(UserCard, { props: defaultProps });

    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('alice@example.com')).toBeTruthy();
  });

  it('calls onselect when clicked', async () => {
    const onselect = vi.fn();
    render(UserCard, { props: { ...defaultProps, onselect } });

    await fireEvent.click(screen.getByRole('button'));

    expect(onselect).toHaveBeenCalledWith(defaultProps.user);
  });

  it('shows inactive badge when user is inactive', () => {
    render(UserCard, {
      props: { ...defaultProps, user: { ...defaultProps.user, status: 'inactive' } },
    });

    expect(screen.getByText('Inactive')).toBeTruthy();
  });
});
```

## E2E Testing with Playwright

```typescript
// tests/e2e/items.test.ts
import { test, expect } from '@playwright/test';

test.describe('Items page', () => {
  test.beforeEach(async ({ page }) => {
    // Login or set auth state
    await page.goto('/items');
  });

  test('displays list of items', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /items/i })).toBeVisible();
    const items = page.getByRole('listitem');
    await expect(items).toHaveCount(await items.count());
  });

  test('creates a new item via form', async ({ page }) => {
    await page.getByRole('link', { name: /new item/i }).click();
    await page.getByLabel('Name').fill('Test Item');
    await page.getByRole('button', { name: /create/i }).click();

    await expect(page).toHaveURL(/\/items\/\w+/);
    await expect(page.getByText('Test Item')).toBeVisible();
  });

  test('shows validation error for empty name', async ({ page }) => {
    await page.getByRole('link', { name: /new item/i }).click();
    await page.getByRole('button', { name: /create/i }).click();

    await expect(page.getByText(/name is required/i)).toBeVisible();
  });

  test('handles 404 for non-existent item', async ({ page }) => {
    await page.goto('/items/nonexistent');
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
```

## Test Commands

```bash
pnpm test                    # Run all Vitest tests
pnpm test -- --watch         # Watch mode
pnpm test -- --coverage      # With coverage report
pnpm test -- --grep "items"  # Filter by name
pnpm exec playwright test    # Run E2E tests
pnpm exec playwright test --ui  # E2E with UI
```

## Checklist

- [ ] Vitest configured in `vitest.config.ts`
- [ ] @testing-library/svelte installed
- [ ] Playwright configured with `playwright.config.ts`
- [ ] Test file naming convention followed (`.test.ts`)
- [ ] Load function tests cover success and error cases
- [ ] Form action tests cover validation and success paths
- [ ] Component tests cover rendering and interactions
- [ ] E2E tests cover critical user flows
- [ ] CI pipeline runs all test suites
- [ ] `pnpm test` passes with zero failures
