# Phase 4: Testing

**Dependencies:** Phase 1 (Code Style)

**Can be implemented in parallel with:** Phase 3 (Error Handling)

## 4.1 Vitest Setup

Configure Vitest as the test runner for `{{PROJECT_NAME}}`.

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['{{SRC_ROOT}}/**/*.test.js', 'tests/**/*.test.js'],

    coverage: {
      provider: 'v8',
      include: ['{{SRC_ROOT}}/**/*.js'],
      exclude: [
        '{{SRC_ROOT}}/**/*.test.js',
        '{{SRC_ROOT}}/**/*.constants.js',
        '{{SRC_ROOT}}/**/index.js',       // barrel files
        '{{SRC_ROOT}}/**/types.js',        // type-only files
      ],
      thresholds: {
        lines: {{COVERAGE_TARGET}},
        functions: {{COVERAGE_TARGET}},
        branches: 75,
        statements: {{COVERAGE_TARGET}},
      },
    },

    globals: false,         // require explicit imports from 'vitest'
    restoreMocks: true,     // auto-restore mocks after each test
    mockReset: true,        // auto-reset mock state between tests
    testTimeout: 10_000,    // 10 second timeout per test
  },
});
```

```json
// package.json scripts
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

**Checklist:**

- [ ] Install vitest: `npm install --save-dev vitest @vitest/coverage-v8`
- [ ] Create `vitest.config.js` with coverage thresholds
- [ ] Add test scripts to `package.json`
- [ ] Enable `restoreMocks` and `mockReset`
- [ ] Configure test file patterns (`.test.js` or `.spec.js`)
- [ ] Verify `vitest run` executes with zero errors

## 4.2 Test Naming and Structure

Use consistent naming conventions and the Arrange-Act-Assert pattern.

```javascript
import { describe, it, expect } from 'vitest';
import { createUser, getUserById, deleteUser } from './user.service.js';

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid input', async () => {
      // Arrange
      const input = { name: 'Alice', email: 'alice@example.com' };

      // Act
      const user = await createUser(input);

      // Assert
      expect(user).toMatchObject({
        name: 'Alice',
        email: 'alice@example.com',
        role: 'user', // default role
      });
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should throw ValidationError when email is invalid', async () => {
      const input = { name: 'Alice', email: 'not-an-email' };

      await expect(createUser(input)).rejects.toThrow('Validation failed');
    });

    it('should throw ConflictError when email already exists', async () => {
      const input = { name: 'Alice', email: 'existing@example.com' };

      await expect(createUser(input)).rejects.toThrow('already exists');
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const user = await getUserById('user-123');

      expect(user).not.toBeNull();
      expect(user.id).toBe('user-123');
    });

    it('should throw NotFoundError when user does not exist', async () => {
      await expect(getUserById('non-existent')).rejects.toThrow('not found');
    });
  });
});
```

**Naming convention:**

```text
describe('ModuleName or ClassName')
  describe('functionName or methodName')
    it('should [expected behaviour] when [condition]')
    it('should throw [ErrorType] when [invalid condition]')
    it('should return [type] when [edge case]')
```

**Checklist:**

- [ ] Use `describe` blocks for module and function grouping
- [ ] Use `it('should ...')` for all test descriptions
- [ ] Follow Arrange-Act-Assert (AAA) pattern in every test
- [ ] Test happy path, error cases, and edge cases for each function
- [ ] One logical assertion per test (multiple `expect` calls are fine if testing one concept)
- [ ] Keep tests independent — no shared mutable state between tests

## 4.3 Mocking

Use Vitest mocking to isolate units under test.

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendNotification } from './notification.service.js';

// Module-level mock — replaces the entire module
vi.mock('./email.client.js', () => ({
  sendEmail: vi.fn(),
}));

vi.mock('#shared/utils/logger.js', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

import { sendEmail } from './email.client.js';
import { logger } from '#shared/utils/logger.js';

describe('sendNotification', () => {
  it('should send email for email notifications', async () => {
    // Arrange
    sendEmail.mockResolvedValue({ messageId: 'msg-123' });
    const notification = { type: 'email', to: 'alice@example.com', body: 'Hello' };

    // Act
    await sendNotification(notification);

    // Assert
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'alice@example.com',
      body: 'Hello',
    });
    expect(logger.info).toHaveBeenCalledWith(
      'Notification sent',
      expect.objectContaining({ type: 'email' }),
    );
  });

  it('should log error and rethrow when email fails', async () => {
    sendEmail.mockRejectedValue(new Error('SMTP timeout'));

    await expect(
      sendNotification({ type: 'email', to: 'x@x.com', body: 'Hi' }),
    ).rejects.toThrow('SMTP timeout');

    expect(logger.error).toHaveBeenCalled();
  });
});
```

```javascript
// Mocking timers
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retry } from './retry.js';

describe('retry', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('should retry failed operations with exponential backoff', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');

    const promise = retry(operation, { maxAttempts: 3, baseDelay: 100 });

    await vi.advanceTimersByTimeAsync(100); // first retry after 100ms
    await vi.advanceTimersByTimeAsync(200); // second retry after 200ms

    const result = await promise;
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });
});
```

**Checklist:**

- [ ] Use `vi.mock()` for module-level dependency replacement
- [ ] Use `vi.fn()` for individual function stubs
- [ ] Use `mockResolvedValue` / `mockRejectedValue` for async functions
- [ ] Use `vi.useFakeTimers()` for time-dependent tests
- [ ] Verify mock interactions with `toHaveBeenCalledWith()`
- [ ] Enable `restoreMocks: true` in config to prevent pollution

## 4.4 Assertion Patterns

Use expressive assertions for clear test failures.

```javascript
import { describe, it, expect } from 'vitest';

describe('assertion patterns', () => {
  // Equality
  it('should use toBe for primitives', () => {
    expect(add(1, 2)).toBe(3);
    expect(isActive).toBe(true);
    expect(result).toBeNull();
    expect(value).toBeUndefined();
  });

  it('should use toEqual for objects and arrays', () => {
    expect(getUser()).toEqual({ id: '123', name: 'Alice' });
    expect(getItems()).toEqual([1, 2, 3]);
  });

  // Partial matching
  it('should use toMatchObject for partial checks', () => {
    expect(response).toMatchObject({
      status: 200,
      data: expect.objectContaining({ id: expect.any(String) }),
    });
  });

  // Truthiness
  it('should use truthiness matchers appropriately', () => {
    expect(result).toBeTruthy();
    expect(result).toBeDefined();
    expect(list).toHaveLength(3);
    expect(list).toContain('item');
  });

  // Errors
  it('should assert on thrown errors', () => {
    expect(() => parse(invalid)).toThrow(ValidationError);
    expect(() => parse(invalid)).toThrow('Invalid input');
  });

  it('should assert on async errors', async () => {
    await expect(fetchUser('bad')).rejects.toThrow(NotFoundError);
    await expect(fetchUser('bad')).rejects.toThrow('not found');
  });

  // Snapshot
  it('should use snapshots for complex output', () => {
    expect(formatReport(data)).toMatchSnapshot();
    expect(buildResponse(data)).toMatchInlineSnapshot(`
      {
        "ok": true,
        "data": { "id": "123" },
      }
    `);
  });
});
```

**Checklist:**

- [ ] Use `toBe` for primitives, `toEqual` for objects/arrays
- [ ] Use `toMatchObject` for partial object assertions
- [ ] Use `expect.objectContaining` / `expect.any` for flexible matching
- [ ] Use `toThrow` with specific error type or message
- [ ] Use `rejects.toThrow` for async error assertions
- [ ] Use snapshots sparingly — only for serialised output formats

## 4.5 Coverage Targets

Set and enforce test coverage standards.

```text
# Coverage strategy:
#
# Tier 1 — Critical paths (auth, payments, data integrity):
#   Line coverage: 95%+
#   Branch coverage: 90%+
#
# Tier 2 — Core business logic (services, models):
#   Line coverage: {{COVERAGE_TARGET}}%+
#   Branch coverage: 75%+
#
# Tier 3 — Utilities and helpers:
#   Line coverage: 80%+
#
# Not covered (excluded from metrics):
#   - Barrel files (index.js)
#   - Type definition files (types.js)
#   - Configuration files
```

```javascript
// vitest.config.js — per-directory coverage thresholds
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        lines: {{COVERAGE_TARGET}},
        functions: {{COVERAGE_TARGET}},
        branches: 75,
        // Per-file thresholds for critical paths:
        // '{{SRC_ROOT}}/features/auth/**': { lines: 95 },
        // '{{SRC_ROOT}}/features/payments/**': { lines: 95 },
      },
    },
  },
});
```

**Checklist:**

- [ ] Set project-wide coverage threshold in vitest.config.js
- [ ] Set higher thresholds for critical path modules
- [ ] Exclude barrel files, type files, and config from coverage
- [ ] Run coverage in CI — fail the build on threshold violations
- [ ] Review uncovered lines monthly — add tests or justify exclusions
- [ ] Track coverage trend over time (should never decrease)

## 4.6 Test Organisation

Structure test files for maintainability.

```text
# Co-located tests (recommended):
{{SRC_ROOT}}/
├── services/
│   ├── user.service.js
│   ├── user.service.test.js      # unit tests next to source
│   ├── order.service.js
│   └── order.service.test.js
├── utils/
│   ├── format.js
│   └── format.test.js
└── ...

# Separate test directory (for integration/e2e):
tests/
├── integration/
│   ├── api.test.js
│   └── database.test.js
├── e2e/
│   └── user-flow.test.js
└── fixtures/
    ├── users.js
    └── orders.js
```

```javascript
// Test fixtures
// tests/fixtures/users.js
export const validUser = {
  name: 'Alice',
  email: 'alice@example.com',
  role: 'user',
};

export const adminUser = {
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
};

export function createMockUser(overrides = {}) {
  return {
    id: `user-${Math.random().toString(36).slice(2)}`,
    ...validUser,
    createdAt: new Date(),
    ...overrides,
  };
}
```

**Checklist:**

- [ ] Co-locate unit tests with source files (`*.test.js`)
- [ ] Place integration and e2e tests in `tests/` directory
- [ ] Create shared fixtures in `tests/fixtures/`
- [ ] Use factory functions for test data (not shared mutable objects)
- [ ] Run unit tests in watch mode during development
- [ ] Run full suite (including integration) in CI
