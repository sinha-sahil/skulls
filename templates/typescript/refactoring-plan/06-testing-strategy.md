# {{PROJECT_NAME}} - Testing Strategy

## Overview

Define the testing approach for the refactoring of {{PROJECT_NAME}}. Tests must verify that refactoring preserves runtime behaviour while also validating type-level correctness using Vitest's type testing capabilities.

## Status

🔴 Not Started

## Dependencies

- 01-assessment.md (know current test coverage)
- 04-strategy.md (know refactoring patterns to test)
- 05-execution-plan.md (know execution order)

---

## Step 1: Baseline Test Coverage

Before any refactoring, ensure existing behaviour is captured:

```bash
# Run existing tests to establish baseline
vitest run

# Check coverage
vitest run --coverage

# Record results
echo "Baseline: $(vitest run 2>&1 | tail -1)" > .refactor-test-baseline
```

### Coverage Targets

| Module | Current Coverage | Required Before Refactoring |
|--------|-----------------|---------------------------|
| `{{MODULE_NAME}}` | % | ≥ 80% |
| `shared/types/` | N/A (types) | Type tests required |
| `shared/utils/` | % | ≥ 90% |

### Add Missing Tests Before Refactoring

```typescript
// {{SRC_DIR}}{{MODULE_NAME}}/__tests__/{{MODULE_NAME}}.service.test.ts

import { describe, it, expect } from 'vitest';
import { {{MODULE_NAME}}Service } from '../{{MODULE_NAME}}.service';

describe('{{MODULE_NAME}}Service', () => {
  describe('find', () => {
    it('returns data for valid id', async () => {
      const service = new {{MODULE_NAME}}Service();
      const result = await service.find('valid-id');
      expect(result).toBeDefined();
      // Capture current shape for regression testing
      expect(result).toHaveProperty('id');
    });

    it('handles missing id', async () => {
      const service = new {{MODULE_NAME}}Service();
      const result = await service.find('nonexistent');
      expect(result).toBeNull(); // or whatever current behaviour is
    });
  });
});
```

- [ ] Baseline test suite passes
- [ ] Coverage measured and recorded
- [ ] Missing tests added for modules being refactored

---

## Step 2: Type-Level Testing with `expectTypeOf`

Use Vitest's `expectTypeOf` to verify type constraints at compile time:

```typescript
// {{SRC_DIR}}shared/types/__tests__/utility.types.test.ts

import { describe, it, expectTypeOf } from 'vitest';
import type { Branded, DeepPartial, DeepReadonly, Prettify } from '../utility.types';

describe('Utility Types', () => {
  it('Branded prevents type mixing', () => {
    type UserId = Branded<string, 'UserId'>;
    type OrderId = Branded<string, 'OrderId'>;

    expectTypeOf<UserId>().not.toEqualTypeOf<OrderId>();
    expectTypeOf<UserId>().toMatchTypeOf<string>();
  });

  it('DeepPartial makes all nested properties optional', () => {
    type Input = { a: { b: { c: string } } };
    type Result = DeepPartial<Input>;

    expectTypeOf<Result>().toEqualTypeOf<{
      a?: { b?: { c?: string } };
    }>();
  });

  it('DeepReadonly makes all nested properties readonly', () => {
    type Input = { a: { b: string } };
    type Result = DeepReadonly<Input>;

    expectTypeOf<Result>().toMatchTypeOf<{
      readonly a: { readonly b: string };
    }>();
  });
});
```

```typescript
// {{SRC_DIR}}shared/types/__tests__/result.types.test.ts

import { describe, it, expect, expectTypeOf } from 'vitest';
import { Ok, Err, isOk, isErr } from '../result.types';
import type { Result } from '../result.types';

describe('Result Type', () => {
  it('Ok creates success result', () => {
    const result = Ok(42);
    expect(result).toEqual({ ok: true, value: 42 });
    expectTypeOf(result).toMatchTypeOf<Result<number, never>>();
  });

  it('Err creates error result', () => {
    const result = Err(new Error('fail'));
    expect(result).toEqual({ ok: false, error: new Error('fail') });
    expectTypeOf(result).toMatchTypeOf<Result<never, Error>>();
  });

  it('isOk narrows to success', () => {
    const result: Result<number, Error> = Ok(42);
    if (isOk(result)) {
      expectTypeOf(result.value).toBeNumber();
    }
  });

  it('isErr narrows to error', () => {
    const result: Result<number, Error> = Err(new Error('fail'));
    if (isErr(result)) {
      expectTypeOf(result.error).toEqualTypeOf<Error>();
    }
  });
});
```

- [ ] Type tests for utility types written
- [ ] Type tests for Result type written
- [ ] `vitest run` passes with type tests

---

## Step 3: Test Type Guards

Type guards need both runtime and type-level testing:

```typescript
// {{SRC_DIR}}shared/utils/__tests__/type-guards.test.ts

import { describe, it, expect, expectTypeOf } from 'vitest';
import { isNonNullable, hasProperty, isArrayOf } from '../type-guards';

describe('Type Guards', () => {
  describe('isNonNullable', () => {
    it('returns true for defined values', () => {
      expect(isNonNullable('hello')).toBe(true);
      expect(isNonNullable(0)).toBe(true);
      expect(isNonNullable(false)).toBe(true);
    });

    it('returns false for null and undefined', () => {
      expect(isNonNullable(null)).toBe(false);
      expect(isNonNullable(undefined)).toBe(false);
    });

    it('narrows the type', () => {
      const value: string | null = 'hello';
      if (isNonNullable(value)) {
        expectTypeOf(value).toBeString();
      }
    });
  });

  describe('hasProperty', () => {
    it('returns true when property exists', () => {
      expect(hasProperty({ name: 'test' }, 'name')).toBe(true);
    });

    it('returns false for null and non-objects', () => {
      expect(hasProperty(null, 'name')).toBe(false);
      expect(hasProperty('string', 'name')).toBe(false);
    });

    it('narrows to Record with property', () => {
      const value: unknown = { id: '123' };
      if (hasProperty(value, 'id')) {
        expectTypeOf(value).toEqualTypeOf<Record<'id', unknown>>();
      }
    });
  });

  describe('isArrayOf', () => {
    const isString = (v: unknown): v is string => typeof v === 'string';

    it('validates array element types', () => {
      expect(isArrayOf(['a', 'b'], isString)).toBe(true);
      expect(isArrayOf(['a', 1], isString)).toBe(false);
      expect(isArrayOf('not array', isString)).toBe(false);
    });
  });
});
```

- [ ] Type guard runtime tests written
- [ ] Type guard type-level tests written
- [ ] All guards have positive and negative test cases

---

## Step 4: Test Discriminated Unions

```typescript
// {{SRC_DIR}}{{MODULE_NAME}}/__tests__/{{MODULE_NAME}}.types.test.ts

import { describe, it, expectTypeOf } from 'vitest';
import type { {{TARGET_TYPE}} } from '../{{MODULE_NAME}}.types';

describe('{{TARGET_TYPE}} Discriminated Union', () => {
  it('idle state has no data or error', () => {
    const state: {{TARGET_TYPE}} = { status: 'idle' };
    if (state.status === 'idle') {
      // @ts-expect-error - data does not exist on idle
      state.data;
    }
  });

  it('success state has data', () => {
    const state: {{TARGET_TYPE}}<string> = { status: 'success', data: 'hello' };
    if (state.status === 'success') {
      expectTypeOf(state.data).toBeString();
    }
  });

  it('error state has error', () => {
    const state: {{TARGET_TYPE}} = { status: 'error', error: new Error('fail') };
    if (state.status === 'error') {
      expectTypeOf(state.error).toEqualTypeOf<Error>();
    }
  });

  it('rejects invalid status', () => {
    // @ts-expect-error - 'invalid' is not a valid status
    const _invalid: {{TARGET_TYPE}} = { status: 'invalid' };
  });
});
```

- [ ] Discriminated union tests cover all variants
- [ ] Tests verify narrowing works in each branch
- [ ] Tests verify invalid states are rejected

---

## Step 5: Regression Testing Strategy

### Before vs After Pattern

```typescript
// For each refactored function, verify identical runtime behaviour:

describe('{{MODULE_NAME}}Service (regression)', () => {
  it('find returns same shape after refactoring', async () => {
    const service = new {{MODULE_NAME}}Service();
    const result = await service.find('test-id');

    // Verify the Result wrapper doesn't break consumers
    if (result.ok) {
      expect(result.value).toMatchObject({
        id: expect.any(String),
        // ... same shape as before refactoring
      });
    }
  });
});
```

### Snapshot Testing for Complex Types

```typescript
import { describe, it, expect } from 'vitest';

describe('Type snapshots', () => {
  it('service response shape has not changed', () => {
    const response = {
      id: 'test',
      status: 'success' as const,
      data: { /* ... */ },
    };
    expect(response).toMatchSnapshot();
  });
});
```

- [ ] Regression tests verify identical runtime behaviour
- [ ] Snapshot tests capture complex response shapes
- [ ] No runtime behaviour change from refactoring

---

## Step 6: Continuous Verification Script

```bash
#!/bin/bash
# Run after every refactoring step

set -euo pipefail

echo "=== Type Check ==="
tsc --noEmit

echo "=== Tests ==="
vitest run

echo "=== Lint ==="
eslint .

echo "=== Any Count ==="
ANY_COUNT=$(grep -rn ': any' {{SRC_DIR}} --include='*.ts' | grep -v 'test' | grep -v '.d.ts' | wc -l)
echo "Remaining explicit any: $ANY_COUNT"

echo "=== Assertions Count ==="
AS_COUNT=$(grep -rn ' as ' {{SRC_DIR}} --include='*.ts' | grep -v 'test' | grep -v '.d.ts' | wc -l)
echo "Remaining type assertions: $AS_COUNT"

echo "=== All checks passed ==="
```

- [ ] Verification script created
- [ ] Script runs type check, tests, and lint
- [ ] Script reports remaining `any` and assertion counts

---

## Verification

```bash
tsc --noEmit
eslint .
vitest run
```

**Checklist:**

- [ ] Baseline test coverage measured and recorded
- [ ] Missing tests added before refactoring begins
- [ ] Type-level tests written with `expectTypeOf`
- [ ] Type guard tests cover runtime and type narrowing
- [ ] Discriminated union tests cover all variants
- [ ] Regression tests verify no runtime behaviour change
- [ ] Continuous verification script created
- [ ] All tests pass: `vitest run`
