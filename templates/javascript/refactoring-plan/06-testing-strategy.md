# Phase 6: Testing Strategy

**Dependencies:** Phase 4 (Strategy)

**Can be implemented in parallel with:** Phase 5 (Execution Plan), Phase 7 (Rollback Plan)

## 6.1 Vitest Configuration

Set up the testing framework for the refactoring effort.

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run tests matching these patterns
    include: ['{{SRC_ROOT}}/**/*.test.js', 'tests/**/*.test.js'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      include: ['{{SRC_ROOT}}/**/*.js'],
      exclude: [
        '{{SRC_ROOT}}/**/*.test.js',
        '{{SRC_ROOT}}/**/*.constants.js',
        '{{SRC_ROOT}}/index.js',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },

    // Recommended settings
    globals: false,         // explicit imports from vitest
    restoreMocks: true,     // auto-restore mocks after each test
    mockReset: true,        // auto-reset mocks between tests
  },
});
```

**Checklist:**

- [ ] Create or update `vitest.config.js`
- [ ] Configure coverage thresholds
- [ ] Configure test file patterns
- [ ] Enable `restoreMocks` and `mockReset`
- [ ] Add test scripts to `package.json`
- [ ] Verify `vitest run` passes with current tests

## 6.2 Writing Tests Before Refactoring

Add tests to untested code BEFORE changing it.

```javascript
// PRINCIPLE: Characterisation tests capture existing behaviour.
// They prove the refactoring preserves the same outputs.

// Step 1: Write tests for the CURRENT (pre-refactor) code
// src/services/user.service.test.js

import { describe, it, expect, vi } from 'vitest';

// Import the CURRENT implementation (even if it uses var, callbacks, etc.)
import { getUser, createUser, deleteUser } from './user.service.js';

describe('UserService (pre-refactor characterisation)', () => {
  it('should return a user by id', async () => {
    const user = await getUser('user-123');

    expect(user).toEqual({
      id: 'user-123',
      name: 'Alice',
      email: 'alice@example.com',
    });
  });

  it('should return null for non-existent user', async () => {
    const user = await getUser('non-existent');

    expect(user).toBeNull();
  });

  it('should reject invalid input', async () => {
    await expect(createUser(null)).rejects.toThrow();
  });
});
```

**Checklist:**

- [ ] Identify files in `{{REFACTOR_SCOPE}}` without tests
- [ ] Write characterisation tests for each untested module
- [ ] Cover happy path, error cases, and edge cases
- [ ] Tests must pass BEFORE refactoring begins
- [ ] Aim for at least 80% line coverage on refactoring targets
- [ ] Commit tests separately: `test: add characterisation tests for {{REFACTOR_SCOPE}}`

## 6.3 Mocking with vi.fn()

Use Vitest mocking to isolate units under test.

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processOrder } from './order.service.js';

// Mock dependencies
vi.mock('./order.repository.js', () => ({
  findOrder: vi.fn(),
  saveOrder: vi.fn(),
}));

vi.mock('#shared/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { findOrder, saveOrder } from './order.repository.js';
import { logger } from '#shared/utils/logger.js';

describe('processOrder', () => {
  beforeEach(() => {
    // Reset all mocks between tests (automatic with mockReset: true)
  });

  it('should process a valid order', async () => {
    // Arrange
    const mockOrder = { id: 'order-1', status: 'pending', total: 99.99 };
    findOrder.mockResolvedValue(mockOrder);
    saveOrder.mockResolvedValue({ ...mockOrder, status: 'processed' });

    // Act
    const result = await processOrder('order-1');

    // Assert
    expect(findOrder).toHaveBeenCalledWith('order-1');
    expect(saveOrder).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'processed' })
    );
    expect(result.status).toBe('processed');
  });

  it('should throw NotFoundError for missing order', async () => {
    findOrder.mockResolvedValue(null);

    await expect(processOrder('missing')).rejects.toThrow('not found');
    expect(logger.error).toHaveBeenCalled();
  });
});
```

```javascript
// Mocking timers
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce.js';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should delay function execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();
  });
});
```

**Checklist:**

- [ ] Use `vi.mock()` for module-level mocking
- [ ] Use `vi.fn()` for individual function spies
- [ ] Use `vi.useFakeTimers()` for time-dependent code
- [ ] Use `mockResolvedValue` / `mockRejectedValue` for async mocks
- [ ] Verify mock call arguments with `toHaveBeenCalledWith()`
- [ ] Ensure `mockReset` is enabled to prevent test pollution

## 6.4 Snapshot Testing for Output Stability

Use snapshots to catch unintended output changes during refactoring.

```javascript
import { describe, it, expect } from 'vitest';
import { formatInvoice } from './invoice.formatter.js';
import { buildErrorResponse } from './error.handler.js';

describe('formatInvoice (snapshot)', () => {
  it('should match the expected invoice format', () => {
    const invoice = formatInvoice({
      orderId: 'order-123',
      items: [
        { name: 'Widget', quantity: 2, price: 9.99 },
        { name: 'Gadget', quantity: 1, price: 24.99 },
      ],
      tax: 4.50,
    });

    expect(invoice).toMatchSnapshot();
  });
});

describe('buildErrorResponse (snapshot)', () => {
  it('should match the expected error format', () => {
    const response = buildErrorResponse(
      new Error('Something went wrong'),
      500
    );

    // Inline snapshot for small outputs
    expect(response).toMatchInlineSnapshot(`
      {
        "error": {
          "message": "Something went wrong",
          "statusCode": 500,
        },
      }
    `);
  });
});
```

**Checklist:**

- [ ] Add snapshot tests for serialised outputs (JSON, HTML, text)
- [ ] Add snapshot tests for error response formats
- [ ] Use inline snapshots for small, readable outputs
- [ ] Use file snapshots for large outputs
- [ ] Review snapshot diffs carefully after refactoring
- [ ] Update snapshots intentionally with `vitest run -u` when format changes

## 6.5 Test Organisation

Structure tests to support incremental refactoring.

```text
# Test file co-location (recommended):
{{SRC_ROOT}}/
├── services/
│   ├── user.service.js
│   ├── user.service.test.js      # Unit tests for user service
│   ├── order.service.js
│   └── order.service.test.js
├── utils/
│   ├── format.js
│   └── format.test.js
└── ...

# Separate test directory (alternative):
tests/
├── unit/
│   ├── services/
│   │   ├── user.service.test.js
│   │   └── order.service.test.js
│   └── utils/
│       └── format.test.js
├── integration/
│   └── api.test.js
└── fixtures/
    └── sample-data.js
```

```javascript
// Test naming convention:
describe('ModuleName', () => {
  describe('functionName', () => {
    it('should [expected behaviour] when [condition]', () => {
      // Arrange → Act → Assert
    });

    it('should throw [ErrorType] when [invalid condition]', () => {
      // test error case
    });
  });
});
```

**Checklist:**

- [ ] Choose test co-location or separate directory
- [ ] Use consistent `describe` / `it` naming
- [ ] Group tests by module and function
- [ ] Separate unit tests from integration tests
- [ ] Create shared fixtures for test data
- [ ] Run tests in watch mode during refactoring: `vitest --watch`

## 6.6 Continuous Verification During Refactoring

Run tests continuously as refactoring progresses.

```bash
# Run tests in watch mode during development
npx vitest --watch

# Run tests for specific files being refactored
npx vitest run {{TARGET_FILES}}

# Run with coverage to track improvement
npx vitest run --coverage

# Run only tests affected by recent changes
npx vitest --changed
```

**Checklist:**

- [ ] Run tests after EVERY function refactored (not just per-file)
- [ ] Monitor coverage — it should never decrease during refactoring
- [ ] Run full test suite before each commit
- [ ] Run `eslint .` before each commit
- [ ] Fix failing tests immediately — never commit with failures
- [ ] Track test count: new tests added during refactoring
