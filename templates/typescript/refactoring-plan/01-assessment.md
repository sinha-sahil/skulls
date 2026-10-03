# {{PROJECT_NAME}} - Type Safety Assessment

## Overview

Audit the current type safety of {{PROJECT_NAME}} to identify `any` usage, unsafe assertions, missing type annotations, and opportunities for stronger typing. This assessment drives the priorities for all subsequent refactoring phases.

## Status

🔴 Not Started

## Dependencies

None - This task can be done independently

---

## Step 1: Quantify `any` Usage

Run a codebase-wide scan for `any` occurrences:

```bash
# Count explicit any usage
grep -rn ': any' {{SRC_DIR}} --include='*.ts' --include='*.tsx' | wc -l

# Count any in function parameters
grep -rn '(.*: any' {{SRC_DIR}} --include='*.ts' | wc -l

# Count any in return types
grep -rn '): any' {{SRC_DIR}} --include='*.ts' | wc -l

# Count type assertions
grep -rn ' as ' {{SRC_DIR}} --include='*.ts' | wc -l
```

### `any` Inventory

| Category | Count | Files | Severity |
|----------|-------|-------|----------|
| Explicit `any` parameters | | | |
| `any` return types | | | |
| `any` in generic positions | | | |
| Type assertions (`as`) | | | |
| Implicit `any` (no annotation) | | | |
| `@ts-ignore` / `@ts-expect-error` | | | |

---

## Step 2: Audit tsconfig Strict Flags

Review which strict flags are currently enabled:

```jsonc
// Current tsconfig.json
{
  "compilerOptions": {
    "strict": false,                      // ← Is strict mode enabled?
    "noImplicitAny": false,               // ← Catches missing annotations
    "strictNullChecks": false,            // ← Catches null/undefined issues
    "strictFunctionTypes": false,         // ← Correct parameter variance
    "strictBindCallApply": false,         // ← Correct bind/call/apply
    "noImplicitThis": false,              // ← Explicit this in functions
    "strictPropertyInitialization": false, // ← Class property checks
    "noUncheckedIndexedAccess": false     // ← T | undefined for index access
  }
}
```

### Strict Flag Status

| Flag | Enabled | Impact if Enabled |
|------|---------|-------------------|
| `noImplicitAny` | ☐ | |
| `strictNullChecks` | ☐ | |
| `strictFunctionTypes` | ☐ | |
| `strictBindCallApply` | ☐ | |
| `noImplicitThis` | ☐ | |
| `strictPropertyInitialization` | ☐ | |
| `noUncheckedIndexedAccess` | ☐ | |

---

## Step 3: Catalog Unsafe Patterns

### Type Assertions Audit

```typescript
// Find all `as` assertions - each needs justification or replacement
// {{SRC_DIR}}{{AFFECTED_FILES}}

// Pattern: Casting unknown API responses
const data = response.json() as {{TARGET_TYPE}};

// Pattern: Casting DOM elements
const el = document.getElementById('app') as HTMLDivElement;

// Pattern: Bypassing type checks
const config = rawConfig as any as FinalConfig;
```

| File | Line | Assertion | Can Be Replaced With |
|------|------|-----------|---------------------|
| | | `as {{TARGET_TYPE}}` | Type guard |
| | | `as any` | Proper typing |
| | | `as unknown as X` | Discriminated union |

### Missing Generics

```typescript
// BEFORE: Untyped collections and wrappers
const cache = new Map();           // Map<any, any>
const items: Array<any> = [];      // No element type
function wrap(value: any) { }      // No generic constraint

// AFTER: Properly typed
const cache = new Map<string, {{TARGET_TYPE}}>();
const items: Array<{{TARGET_TYPE}}> = [];
function wrap<T extends {{GENERIC_CONSTRAINT}}>(value: T) { }
```

| Location | Current Type | Suggested Generic |
|----------|-------------|-------------------|
| | `Map()` | `Map<string, T>` |
| | `Array<any>` | `Array<T>` |
| | `Promise<any>` | `Promise<T>` |

---

## Step 4: Map Error Handling Patterns

Document how errors are currently handled:

```typescript
// Pattern A: Untyped catch
try {
  await doSomething();
} catch (error) {
  // error is 'unknown' in strict, 'any' in non-strict
  console.error(error.message); // ← unsafe property access
}

// Pattern B: No error narrowing
function handleError(error: unknown): void {
  // Missing: instanceof check or type guard
}

// Pattern C: Throwing non-Error values
throw 'something went wrong'; // ← not an Error instance
throw { code: 500 };          // ← untyped error
```

| Pattern | Count | Location |
|---------|-------|----------|
| Untyped `catch (error)` | | |
| `catch (error: any)` | | |
| Missing error narrowing | | |
| Throwing non-Error values | | |
| No Result/Either pattern | | |

---

## Step 5: Identify String Literal Abuse

Find places where string literals are used instead of discriminated unions:

```typescript
// BEFORE: String-based state
interface {{TARGET_TYPE}} {
  status: string;    // ← Any string is valid
  type: string;      // ← No compile-time safety
}

if (item.status === 'actve') { } // ← Typo compiles fine

// AFTER: Discriminated union
type Status = 'active' | 'inactive' | 'pending';
interface {{TARGET_TYPE}} {
  status: Status;    // ← Only valid values allowed
}
```

| Location | Field | Current Type | Suggested Union |
|----------|-------|-------------|-----------------|
| | `status` | `string` | `'active' \| 'inactive'` |
| | `type` | `string` | `'user' \| 'admin'` |
| | `event` | `string` | Template literal type |

---

## Step 6: Document Findings Summary

### Type Safety Score

| Metric | Current | Target |
|--------|---------|--------|
| Explicit `any` count | | 0 |
| Type assertions count | | Minimal |
| Strict flags enabled | /7 | 7/7 |
| Untyped catch blocks | | 0 |
| String literals (should be unions) | | 0 |

### Priority Ranking

1. **Critical**: [Issues causing runtime errors due to missing types]
2. **High**: [Widespread `any` in core modules]
3. **Medium**: [Missing generics, unsafe assertions]
4. **Low**: [Stylistic improvements, stricter constraints]

---

## Verification

```bash
tsc --noEmit
eslint .
```

**Checklist:**

- [ ] `any` usage counted and categorised
- [ ] tsconfig strict flags audited
- [ ] Type assertions catalogued
- [ ] Missing generics identified
- [ ] Error handling patterns documented
- [ ] String literal abuse identified
- [ ] Type safety score calculated
- [ ] Findings prioritised
