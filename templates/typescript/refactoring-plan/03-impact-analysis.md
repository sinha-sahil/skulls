# {{PROJECT_NAME}} - Impact Analysis

## Overview

Map all files, types, and modules affected by the refactoring in {{PROJECT_NAME}}. Understand the dependency graph to determine safe refactoring order and identify high-risk areas.

## Status

🔴 Not Started

## Dependencies

- 01-assessment.md (know what needs refactoring)
- 02-goals.md (know the target state)

---

## Step 1: Map Type Dependencies

Trace how types flow through the codebase. Changes to shared types cascade to all consumers.

```text
Type Dependency Graph for {{TARGET_TYPE}}:

{{TARGET_TYPE}} (defined in {{SRC_DIR}}types/{{MODULE_NAME}}.types.ts)
├── Used by: {{MODULE_NAME}}.service.ts
│   ├── process{{MODULE_NAME}}()  → param type
│   └── get{{MODULE_NAME}}()      → return type
├── Used by: {{MODULE_NAME}}.handler.ts
│   └── handle{{MODULE_NAME}}Request() → response body
├── Used by: {{MODULE_NAME}}.test.ts
│   └── Test fixtures and assertions
└── Re-exported from: index.ts
    └── Consumed by: [list external consumers]
```

### Type Impact Matrix

| Type Being Changed | Defined In | Used By (Files) | Change Type |
|-------------------|------------|-----------------|-------------|
| `{{TARGET_TYPE}}` | | | Tighten from `any` |
| | | | Add generic parameter |
| | | | Convert to discriminated union |
| | | | Extract to utility type |

---

## Step 2: Identify Affected Files

### Direct Impact (Files with `any` or Unsafe Patterns)

| File | `any` Count | Assertions | Risk Level |
|------|------------|------------|------------|
| `{{SRC_DIR}}{{AFFECTED_FILES}}` | | | |
| | | | |
| | | | |

### Indirect Impact (Files Importing Changed Types)

```typescript
// Find all files importing from the module being refactored
// Search: import.*from.*'{{MODULE_NAME}}'

// Files that import {{TARGET_TYPE}}:
// 1. {{SRC_DIR}}services/{{MODULE_NAME}}.service.ts
// 2. {{SRC_DIR}}handlers/{{MODULE_NAME}}.handler.ts
// 3. {{SRC_DIR}}tests/{{MODULE_NAME}}.test.ts
```

| File | Imports | Likely Changes Needed |
|------|---------|----------------------|
| | `{{TARGET_TYPE}}` | Update to new generic signature |
| | `{{OLD_PATTERN}}` | Replace with `{{NEW_PATTERN}}` |

---

## Step 3: Analyse Generic Propagation

When adding generics to a type, the generic parameter propagates to all consumers:

```typescript
// BEFORE: Non-generic
interface Repository {
  find(id: string): Promise<any>;
  save(entity: any): Promise<void>;
}

// AFTER: Generic - EVERY consumer must provide T
interface Repository<T extends { id: string }> {
  find(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
}

// Impact: All classes implementing Repository must now specify T
class UserRepository implements Repository<User> { /* ... */ }
class OrderRepository implements Repository<Order> { /* ... */ }
```

### Generic Propagation Map

| Type | New Generic | Propagates To | Files Affected |
|------|------------|---------------|----------------|
| `Repository` | `<T>` | All implementations | |
| `Service` | `<TInput, TOutput>` | All services | |
| `Handler` | `<TRequest, TResponse>` | All handlers | |

---

## Step 4: Assess Breaking Changes

### Internal Breaking Changes

Changes that affect code within {{PROJECT_NAME}}:

| Change | Files Affected | Fix Strategy |
|--------|---------------|--------------|
| `any` → specific type | All consumers of the type | Update call sites |
| Add required generic param | All implementations | Add type argument |
| String → discriminated union | All comparisons | Update to use union members |
| `as` assertion removal | File containing assertion | Add type guard |

### External Breaking Changes (If Library)

Changes that affect downstream consumers:

```typescript
// BEFORE (current public API)
export function parse(input: any): any;

// AFTER (new public API) - BREAKING if consumed externally
export function parse<T>(input: string): Result<T, ParseError>;
```

| Export | Change | Semver Impact | Migration Path |
|--------|--------|---------------|----------------|
| `parse()` | Signature change | Major | Provide overload |
| `{{TARGET_TYPE}}` | Add generic | Major | Default generic |
| `Config` | Narrow string to union | Minor | Update literals |

---

## Step 5: Determine Refactoring Order

Order changes from least-dependent to most-dependent:

```text
Refactoring Order (bottom-up):

1. Shared types     ← Change type definitions first
2. Utility types    ← Extract DeepPartial, Branded, etc.
3. Type guards      ← Create guards before removing assertions
4. Service layer    ← Update services to use new types
5. Handler layer    ← Update handlers (depend on services)
6. Entry points     ← Update exports and public API
7. Tests            ← Update test fixtures and assertions last
```

### Dependency-Safe Order Table

| Step | File/Module | Depends On | Must Complete Before |
|------|------------|------------|---------------------|
| 1 | `shared/types/` | Nothing | Everything |
| 2 | `shared/utils/type-guards.ts` | Step 1 | Steps 3-6 |
| 3 | `{{MODULE_NAME}}.types.ts` | Step 1 | Steps 4-6 |
| 4 | `{{MODULE_NAME}}.service.ts` | Steps 1-3 | Steps 5-6 |
| 5 | `{{MODULE_NAME}}.handler.ts` | Steps 1-4 | Step 6 |
| 6 | `index.ts` (exports) | Steps 1-5 | Tests |
| 7 | `*.test.ts` | Steps 1-6 | Nothing |

---

## Step 6: Risk Assessment

### High-Risk Areas

| Area | Risk | Mitigation |
|------|------|------------|
| Generic propagation | Many files affected | Add default generic: `<T = unknown>` |
| Discriminated union migration | Runtime comparisons may break | Keep old string values as union members |
| Error type changes | catch blocks throughout codebase | Use `instanceof` narrowing |
| Null checks (`strictNullChecks`) | Widespread `undefined` access | Enable flag last, fix incrementally |

### Rollback Points

| Checkpoint | Commit Message | Can Revert To |
|------------|---------------|---------------|
| Before refactoring | `chore: snapshot before refactoring` | Clean baseline |
| After shared types | `refactor: tighten shared types` | Types only |
| After service layer | `refactor: update services` | Services + types |
| After full refactor | `refactor: complete {{REFACTOR_SCOPE}}` | Full refactor |

---

## Verification

```bash
tsc --noEmit
eslint .
vitest run
```

**Checklist:**

- [ ] Type dependency graph mapped
- [ ] All affected files identified (direct and indirect)
- [ ] Generic propagation paths documented
- [ ] Breaking changes catalogued with semver impact
- [ ] Refactoring order determined (bottom-up)
- [ ] High-risk areas identified with mitigations
- [ ] Rollback points defined
- [ ] `tsc --noEmit` passes at current state
