# {{PROJECT_NAME}} - Execution Plan

## Overview

Step-by-step implementation plan for executing the refactoring of {{PROJECT_NAME}}. Each step is a single, atomic change that leaves the codebase in a compilable and testable state.

## Status

🔴 Not Started

## Dependencies

- 01-assessment.md (current state documented)
- 02-goals.md (targets defined)
- 03-impact-analysis.md (affected files and order known)
- 04-strategy.md (patterns chosen)

---

## Step 1: Prepare the Branch and Baseline

```bash
# Create refactoring branch
git checkout -b {{BRANCH_NAME}}

# Verify baseline compiles and tests pass
tsc --noEmit
eslint .
vitest run

# Record baseline metrics
grep -rn ': any' {{SRC_DIR}} --include='*.ts' | wc -l > .refactor-baseline
```

### Pre-Execution Checklist

- [ ] Branch `{{BRANCH_NAME}}` created
- [ ] `tsc --noEmit` passes on baseline
- [ ] `vitest run` passes on baseline
- [ ] `eslint .` passes on baseline
- [ ] Baseline `any` count recorded

---

## Step 2: Create Shared Utility Types

Create the foundational utility types that other refactoring steps depend on.

```typescript
// {{SRC_DIR}}shared/types/utility.types.ts

/** Branded type for type-safe primitives */
export type Branded<T, Brand extends string> = T & { readonly __brand: Brand };

/** Deep partial - all nested properties optional */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/** Deep readonly - all nested properties immutable */
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

/** Make specific keys required */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Flatten intersection types for readability */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
```

```typescript
// {{SRC_DIR}}shared/types/result.types.ts

export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}
```

```bash
# Verify and commit
tsc --noEmit
git add {{SRC_DIR}}shared/types/
git commit -m "refactor: add utility types and Result pattern"
```

- [ ] Utility types created
- [ ] Result type created
- [ ] `tsc --noEmit` passes
- [ ] Committed

---

## Step 3: Create Type Guards

Create type guards before removing assertions — the guards replace the `as` casts.

```typescript
// {{SRC_DIR}}shared/utils/type-guards.ts

export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function hasProperty<K extends string>(
  value: unknown,
  key: K
): value is Record<K, unknown> {
  return typeof value === 'object' && value !== null && key in value;
}

export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

// Domain-specific guard for {{TARGET_TYPE}}
export function is{{TARGET_TYPE}}(value: unknown): value is {{TARGET_TYPE}} {
  if (!hasProperty(value, 'id') || !hasProperty(value, 'type')) return false;
  return typeof value.id === 'string' && typeof value.type === 'string';
}
```

```bash
tsc --noEmit
vitest run
git add {{SRC_DIR}}shared/utils/type-guards.ts
git commit -m "refactor: add type guards for safe narrowing"
```

- [ ] Generic type guards created
- [ ] Domain-specific guards created
- [ ] `tsc --noEmit` passes
- [ ] Committed

---

## Step 4: Refactor Type Definitions

Update the core type definitions using patterns from the strategy phase.

```typescript
// BEFORE: {{SRC_DIR}}types/{{MODULE_NAME}}.types.ts
export interface {{TARGET_TYPE}} {
  status: string;
  data: any;
  error?: any;
}

// AFTER: {{SRC_DIR}}types/{{MODULE_NAME}}.types.ts
export type {{TARGET_TYPE}}<T = unknown> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: Error };
```

### Files to Update (in dependency order)

| Order | File | Change | Verify |
|-------|------|--------|--------|
| 4.1 | `shared/types/{{MODULE_NAME}}.types.ts` | Convert to discriminated union | `tsc --noEmit` |
| 4.2 | `shared/types/index.ts` | Update barrel exports | `tsc --noEmit` |
| 4.3 | All importers of `{{TARGET_TYPE}}` | Add generic argument | `tsc --noEmit` |

```bash
# After each file change
tsc --noEmit
git commit -m "refactor: convert {{TARGET_TYPE}} to discriminated union"
```

- [ ] Type definitions updated
- [ ] Barrel exports updated
- [ ] All importers updated
- [ ] `tsc --noEmit` passes after each change
- [ ] Committed

---

## Step 5: Refactor Service Layer

Replace `any` usage in service functions with proper types and generics.

```typescript
// BEFORE
export class {{MODULE_NAME}}Service {
  async find(id: string): Promise<any> { /* ... */ }
  async create(data: any): Promise<any> { /* ... */ }
  async update(id: string, data: any): Promise<any> { /* ... */ }
}

// AFTER
export class {{MODULE_NAME}}Service {
  async find(id: string): Promise<Result<{{TARGET_TYPE}}, NotFoundError>> {
    const item = await this.repository.findById(id);
    if (!item) return Err(new NotFoundError(`{{MODULE_NAME}} ${id} not found`));
    return Ok(item);
  }

  async create(data: Create{{TARGET_TYPE}}Input): Promise<Result<{{TARGET_TYPE}}, ValidationError>> {
    const validated = validate(data);
    if (!validated.ok) return validated;
    return Ok(await this.repository.insert(validated.value));
  }

  async update(
    id: string,
    data: Partial<{{TARGET_TYPE}}>
  ): Promise<Result<{{TARGET_TYPE}}, NotFoundError | ValidationError>> {
    /* ... */
  }
}
```

```bash
tsc --noEmit
vitest run
git commit -m "refactor: type-safe {{MODULE_NAME}} service methods"
```

- [ ] Service methods typed with Result return
- [ ] Input types created (no `any` parameters)
- [ ] `tsc --noEmit` passes
- [ ] `vitest run` passes
- [ ] Committed

---

## Step 6: Enable Strict Flags Incrementally

Enable one flag at a time, fixing all errors before moving to the next.

```jsonc
// Step 6.1: Enable noImplicitAny
{ "compilerOptions": { "noImplicitAny": true } }

// Step 6.2: Enable strictNullChecks
{ "compilerOptions": { "strictNullChecks": true } }

// Step 6.3: Enable strictFunctionTypes
{ "compilerOptions": { "strictFunctionTypes": true } }

// Step 6.4: Enable remaining flags + strict: true
{ "compilerOptions": { "strict": true } }
```

### Per-Flag Process

```bash
# 1. Enable flag in tsconfig.json
# 2. Run tsc to see errors
tsc --noEmit 2>&1 | head -50

# 3. Fix all errors
# 4. Verify
tsc --noEmit
vitest run

# 5. Commit
git commit -m "refactor: enable {{STRICT_FLAGS}} flag"
```

- [ ] `noImplicitAny` enabled and all errors fixed
- [ ] `strictNullChecks` enabled and all errors fixed
- [ ] `strictFunctionTypes` enabled and all errors fixed
- [ ] `strict: true` enabled (all flags)
- [ ] `tsc --noEmit` passes with full strict
- [ ] `vitest run` passes
- [ ] Each flag change is a separate commit

---

## Step 7: Final Verification and Cleanup

```bash
# Full verification
tsc --noEmit
eslint .
vitest run

# Verify any count is zero
ANY_COUNT=$(grep -rn ': any' {{SRC_DIR}} --include='*.ts' | grep -v test | wc -l)
echo "Remaining any: $ANY_COUNT"

# Verify no @ts-ignore left
grep -rn '@ts-ignore' {{SRC_DIR}} --include='*.ts' | wc -l
```

### Cleanup Tasks

- [ ] Remove any temporary `// @ts-expect-error` comments
- [ ] Remove unused type imports
- [ ] Remove dead code exposed by stricter types
- [ ] Update JSDoc/TSDoc to match new signatures
- [ ] Run `eslint . --fix` for auto-fixable issues

---

## Verification

```bash
tsc --noEmit
eslint .
vitest run
```

**Checklist:**

- [ ] Branch created and baseline recorded
- [ ] Shared utility types created and committed
- [ ] Type guards created and committed
- [ ] Type definitions refactored (discriminated unions, generics)
- [ ] Service layer refactored (no `any`, Result pattern)
- [ ] Strict flags enabled incrementally
- [ ] Zero `any` remaining (excluding tests)
- [ ] All tests pass
- [ ] All lint rules pass
- [ ] Each step committed separately
