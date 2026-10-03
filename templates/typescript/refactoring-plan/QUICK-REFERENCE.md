# Refactoring Plan - Quick Reference

## Template Variables Reference

### Project Configuration

| Variable | Example | Description |
|----------|---------|-------------|
| `{{PROJECT_NAME}}` | `my-api` | Project or package name |
| `{{MODULE_NAME}}` | `auth` | Module being refactored |
| `{{SRC_DIR}}` | `src/` | Source directory path |
| `{{REFACTOR_SCOPE}}` | `remove any types` | Scope of the refactoring |

### Code Placeholders

| Variable | Example | Description |
|----------|---------|-------------|
| `{{TARGET_TYPE}}` | `ApiResponse<T>` | Type being introduced or improved |
| `{{OLD_PATTERN}}` | `any`, `as` cast | Current pattern to replace |
| `{{NEW_PATTERN}}` | `unknown`, type guard | Target pattern |
| `{{AFFECTED_FILES}}` | `service.ts, handler.ts` | Files impacted by refactor |
| `{{BRANCH_NAME}}` | `refactor/remove-any` | Git branch for refactoring |

### TypeScript-Specific Placeholders

| Variable | Example | Description |
|----------|---------|-------------|
| `{{STRICT_FLAGS}}` | `noImplicitAny` | Strict mode flags to enable |
| `{{UTILITY_TYPE}}` | `DeepPartial<T>` | Utility type being introduced |
| `{{GENERIC_CONSTRAINT}}` | `extends Record<string, unknown>` | Generic constraint pattern |

---

## Quick Decision Tree

```text
Refactoring TypeScript code?
├─ Is the issue widespread `any` usage?
│  └─ YES → Phase 01 (Assessment) + Phase 04 (Strategy: any elimination)
│
├─ Are there unsafe type assertions (`as`)?
│  └─ YES → Replace with type guards and discriminated unions
│
├─ Is error handling inconsistent?
│  └─ YES → Introduce Result<T, E> pattern
│
├─ Are string literals used for state/events?
│  └─ YES → Replace with discriminated unions
│
├─ Are types duplicated across files?
│  └─ YES → Extract utility types to shared module
│
├─ Is this a JS → TS migration?
│  └─ YES → Phase 07 (JS to TS Migration)
│
└─ Is `strict: true` being enabled?
   └─ YES → Enable flags incrementally (noImplicitAny first)
```

---

## Common Refactoring Patterns

### Pattern 1: Removing `any`

```typescript
// BEFORE
function process(data: any): any {
  return data.value;
}

// AFTER
function process<T extends { value: unknown }>(data: T): T['value'] {
  return data.value;
}
```

### Pattern 2: Type Guard Instead of Assertion

```typescript
// BEFORE
const user = response as User;

// AFTER
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}

if (isUser(response)) {
  // response is User here
}
```

### Pattern 3: Discriminated Union

```typescript
// BEFORE
interface ApiResponse {
  status: string;
  data?: unknown;
  error?: string;
}

// AFTER
type ApiResponse<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
  | { status: 'loading' };
```

### Pattern 4: Branded Types

```typescript
// Prevent mixing up primitive types
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function createUserId(id: string): UserId {
  return id as UserId;
}

// Type error: UserId is not assignable to OrderId
function getOrder(orderId: OrderId): void { /* ... */ }
getOrder(createUserId('123')); // ← compile error
```

### Pattern 5: Exhaustive Check with `never`

```typescript
type Status = 'active' | 'inactive' | 'pending';

function handleStatus(status: Status): string {
  switch (status) {
    case 'active': return 'Active';
    case 'inactive': return 'Inactive';
    case 'pending': return 'Pending';
    default: {
      const _exhaustive: never = status;
      throw new Error(`Unhandled status: ${_exhaustive}`);
    }
  }
}
```

### Pattern 6: Template Literal Types

```typescript
// BEFORE
type EventName = string;

// AFTER
type EventName = `${Lowercase<string>}:${Lowercase<string>}`;
type CrudEvent = `${'create' | 'read' | 'update' | 'delete'}:${string}`;
```

### Pattern 7: Extracting Utility Types

```typescript
// Extract shared patterns into reusable utility types
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

type Prettify<T> = { [K in keyof T]: T[K] } & {};
```

---

## Strict Flag Progression

Enable `strict` flags incrementally in this order:

```text
1. noImplicitAny          ← Start here (biggest impact)
2. strictNullChecks       ← Catches null/undefined issues
3. strictFunctionTypes    ← Fixes function param variance
4. strictBindCallApply    ← Correct bind/call/apply types
5. noImplicitThis         ← Explicit this in functions
6. strictPropertyInitialization ← Class property checks
7. strict: true           ← Enables all at once
```

---

## Verification Commands

```bash
tsc --noEmit                  # Type check
eslint .                      # Lint
vitest run                    # Tests
```

---

## Checklist After Using Templates

- [ ] All `{{VARIABLES}}` replaced with actual values
- [ ] Assessment phase completed with metrics
- [ ] Refactoring goals are measurable
- [ ] Impact analysis covers all affected files
- [ ] Strategy chosen with code examples
- [ ] Execution plan ordered by dependency
- [ ] Testing strategy covers type-level and runtime
- [ ] Rollback plan documented with git strategy
- [ ] `tsc --noEmit` passes
- [ ] `eslint .` passes
- [ ] `vitest run` passes
