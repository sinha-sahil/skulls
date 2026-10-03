# {{PROJECT_NAME}} - Testing Guidelines

## Overview

Define testing standards for {{PROJECT_NAME}} using Vitest. Covers test organisation, type-level testing with `expectTypeOf`, mocking with proper types, coverage targets, and test naming conventions.

## Status

🔴 Not Started

## Dependencies

- 02-type-system.md (type patterns to test)
- 03-error-handling.md (error patterns to test)

---

## Step 1: Test File Organisation

### Co-located Tests

```text
{{SRC_DIR}}
├── features/
│   └── {{MODULE_NAME}}/
│       ├── {{MODULE_NAME}}.service.ts
│       ├── {{MODULE_NAME}}.service.test.ts     # Co-located unit test
│       ├── {{MODULE_NAME}}.types.ts
│       └── {{MODULE_NAME}}.types.test.ts       # Type-level test
├── shared/
│   ├── types/
│   │   ├── result.types.ts
│   │   └── result.types.test.ts
│   └── utils/
│       ├── type-guards.ts
│       └── type-guards.test.ts
└── __tests__/
    └── integration/                             # Integration tests
        └── {{MODULE_NAME}}.integration.test.ts
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['{{SRC_DIR}}**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['{{SRC_DIR}}**/*.ts'],
      exclude: [
        '{{SRC_DIR}}**/*.test.ts',
        '{{SRC_DIR}}**/*.types.ts',
        '{{SRC_DIR}}**/*.d.ts',
        '{{SRC_DIR}}**/index.ts',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.json',
    },
  },
});
```

---

## Step 2: Test Naming Conventions

### Describe/It Pattern

```typescript
import { describe, it, expect } from 'vitest';
import { {{MODULE_NAME}}Service } from './{{MODULE_NAME}}.service';

// describe: Name the unit under test
describe('{{MODULE_NAME}}Service', () => {

  // Nested describe: Group by method
  describe('findById', () => {

    // it: Describe the expected behaviour
    it('returns Ok with data when item exists', async () => {
      const service = create{{MODULE_NAME}}Service();
      const result = await service.findById('existing-id');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe('existing-id');
      }
    });

    it('returns Err with NotFoundError when item does not exist', async () => {
      const service = create{{MODULE_NAME}}Service();
      const result = await service.findById('nonexistent-id');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(NotFoundError);
      }
    });
  });

  describe('create', () => {
    it('returns Err with ValidationError for invalid input', async () => {
      // ...
    });

    it('returns Ok with created entity for valid input', async () => {
      // ...
    });
  });
});
```

### Naming Rules

| Pattern | Example |
|---------|---------|
| Positive case | `it('returns Ok with data when item exists')` |
| Negative case | `it('returns Err with NotFoundError when item does not exist')` |
| Edge case | `it('handles empty string input')` |
| Type test | `it('narrows to success type when ok is true')` |

---

## Step 3: Type-Level Testing with `expectTypeOf`

### Testing Type Narrowing

```typescript
// {{SRC_DIR}}shared/types/result.types.test.ts

import { describe, it, expectTypeOf } from 'vitest';
import { Ok, Err, isOk, isErr } from './result.types';
import type { Result } from './result.types';

describe('Result type-level tests', () => {
  it('Ok infers the value type', () => {
    const result = Ok(42);
    expectTypeOf(result).toMatchTypeOf<Result<number, never>>();
  });

  it('Err infers the error type', () => {
    const result = Err(new Error('fail'));
    expectTypeOf(result).toMatchTypeOf<Result<never, Error>>();
  });

  it('isOk narrows to success variant', () => {
    const result: Result<string, Error> = Ok('hello');
    if (isOk(result)) {
      expectTypeOf(result.value).toBeString();
      // @ts-expect-error - error does not exist on success
      result.error;
    }
  });

  it('isErr narrows to error variant', () => {
    const result: Result<string, Error> = Err(new Error('fail'));
    if (isErr(result)) {
      expectTypeOf(result.error).toEqualTypeOf<Error>();
      // @ts-expect-error - value does not exist on error
      result.value;
    }
  });
});
```

### Testing Utility Types

```typescript
// {{SRC_DIR}}shared/types/utility.types.test.ts

import { describe, it, expectTypeOf } from 'vitest';
import type { Branded, DeepPartial, DeepReadonly, Prettify } from './utility.types';

describe('Utility type-level tests', () => {
  it('Branded types are not interchangeable', () => {
    type UserId = Branded<string, 'UserId'>;
    type OrderId = Branded<string, 'OrderId'>;

    expectTypeOf<UserId>().not.toEqualTypeOf<OrderId>();
  });

  it('Branded types extend their base type', () => {
    type UserId = Branded<string, 'UserId'>;
    expectTypeOf<UserId>().toMatchTypeOf<string>();
  });

  it('DeepPartial makes nested properties optional', () => {
    type Nested = { a: { b: { c: string } } };
    type Result = DeepPartial<Nested>;

    expectTypeOf<Result>().toEqualTypeOf<{
      a?: { b?: { c?: string } };
    }>();
  });

  it('DeepReadonly makes nested properties readonly', () => {
    type Input = { a: { b: string } };
    type Result = DeepReadonly<Input>;

    const obj: Result = { a: { b: 'test' } };
    // @ts-expect-error - Cannot assign to readonly property
    obj.a.b = 'changed';
  });
});
```

---

## Step 4: Mocking with Proper Types

### Typed Mocks

```typescript
import { describe, it, expect, vi } from 'vitest';
import type { Repository } from './repository.types';

// ✓ Create typed mock that satisfies the interface
function createMockRepository(): Repository<{{TARGET_TYPE}}> {
  return {
    findById: vi.fn<[string], Promise<{{TARGET_TYPE}} | null>>(),
    save: vi.fn<[{{TARGET_TYPE}}], Promise<{{TARGET_TYPE}}>>(),
    delete: vi.fn<[string], Promise<boolean>>(),
  };
}

describe('{{MODULE_NAME}}Service with mocks', () => {
  it('calls repository.findById with correct id', async () => {
    const repository = createMockRepository();
    const service = new {{MODULE_NAME}}Service(repository);

    vi.mocked(repository.findById).mockResolvedValue({
      id: 'test-id',
      name: 'Test',
    });

    await service.findById('test-id');

    expect(repository.findById).toHaveBeenCalledWith('test-id');
    expect(repository.findById).toHaveBeenCalledTimes(1);
  });
});
```

### Mock Type Safety Rules

```typescript
// ✗ NEVER: Untyped mock
const mockService = { findById: vi.fn() } as any;

// ✓ ALWAYS: Typed mock satisfying the interface
const mockService: {{MODULE_NAME}}Service = {
  findById: vi.fn<[string], Promise<Result<{{TARGET_TYPE}}, NotFoundError>>>(),
  create: vi.fn<[Create{{TARGET_TYPE}}Input], Promise<Result<{{TARGET_TYPE}}, ValidationError>>>(),
};
```

---

## Step 5: Testing Error Paths

### Test Result Errors

```typescript
describe('error handling', () => {
  it('returns NotFoundError when item does not exist', async () => {
    const repository = createMockRepository();
    vi.mocked(repository.findById).mockResolvedValue(null);
    const service = new {{MODULE_NAME}}Service(repository);

    const result = await service.findById('nonexistent');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(NotFoundError);
      expect(result.error.code).toBe('NOT_FOUND');
      expect(result.error.statusCode).toBe(404);
    }
  });

  it('returns ValidationError for invalid input', async () => {
    const service = new {{MODULE_NAME}}Service(createMockRepository());

    const result = await service.create({ name: '' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.fields).toHaveProperty('name');
    }
  });
});
```

### Test Type Guards

```typescript
describe('isUser type guard', () => {
  it('returns true for valid User objects', () => {
    expect(isUser({ id: '1', name: 'Test', email: 'test@example.com' })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isUser(null)).toBe(false);
  });

  it('returns false for objects missing required fields', () => {
    expect(isUser({ id: '1' })).toBe(false);
    expect(isUser({ id: '1', name: 'Test' })).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isUser('string')).toBe(false);
    expect(isUser(42)).toBe(false);
    expect(isUser(undefined)).toBe(false);
  });
});
```

---

## Step 6: Coverage Requirements

### Coverage Targets

| Category | Minimum | Target |
|----------|---------|--------|
| Statements | 80% | 90% |
| Branches | 80% | 85% |
| Functions | 80% | 90% |
| Lines | 80% | 90% |

### What Must Be Tested

- [ ] All public/exported functions
- [ ] All Result success and error paths
- [ ] All type guards (positive and negative cases)
- [ ] All discriminated union variants
- [ ] Edge cases (empty input, null, undefined)
- [ ] Type-level correctness with `expectTypeOf`

### What May Be Excluded

- Type-only files (`*.types.ts`) from line coverage (test with `expectTypeOf` instead)
- Barrel exports (`index.ts`)
- Declaration files (`*.d.ts`)
- Configuration files

---

## Verification

```bash
tsc --noEmit
vitest run
vitest run --coverage
```

**Checklist:**

- [ ] Test files co-located with source files
- [ ] Vitest configured with typecheck enabled
- [ ] Naming convention: `describe` → unit, `it` → behaviour
- [ ] Type-level tests use `expectTypeOf`
- [ ] Mocks are properly typed (no `as any`)
- [ ] Error paths tested for all Result-returning functions
- [ ] Type guards tested with positive and negative inputs
- [ ] Coverage meets minimum thresholds
- [ ] `vitest run` passes
- [ ] `vitest run --coverage` meets thresholds
