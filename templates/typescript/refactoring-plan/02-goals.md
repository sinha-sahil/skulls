# {{PROJECT_NAME}} - Refactoring Goals

## Overview

Define measurable, time-bound refactoring objectives for {{PROJECT_NAME}}. Each goal must have a clear success criterion that can be verified with tooling.

## Status

🔴 Not Started

## Dependencies

- 01-assessment.md (must understand current type safety state)

---

## Step 1: Define Primary Objectives

Based on the assessment, define the refactoring goals:

### Goal 1: Eliminate `any` Types

```text
Metric:   Count of explicit `any` in {{SRC_DIR}}
Current:  [from assessment]
Target:   0
Verify:   grep -rn ': any' {{SRC_DIR}} --include='*.ts' | wc -l
```

### Goal 2: Enable Strict Mode

```text
Metric:   Number of strict flags enabled in tsconfig.json
Current:  [from assessment]
Target:   strict: true (all flags)
Verify:   Check tsconfig.json compilerOptions.strict === true
```

### Goal 3: Replace Type Assertions

```text
Metric:   Count of `as` casts (excluding safe patterns)
Current:  [from assessment]
Target:   Only in test files or with documented justification
Verify:   grep -rn ' as ' {{SRC_DIR}} --include='*.ts' | wc -l
```

### Goal 4: Type-Safe Error Handling

```text
Metric:   Untyped catch blocks and thrown non-Error values
Current:  [from assessment]
Target:   0 untyped catches, Result<T, E> for expected errors
Verify:   grep -rn 'catch (' {{SRC_DIR}} --include='*.ts'
```

---

## Step 2: Set Scope Boundaries

### In Scope

| Area | Description | Files |
|------|-------------|-------|
| {{MODULE_NAME}} module | {{REFACTOR_SCOPE}} | {{AFFECTED_FILES}} |
| Shared types | Extract and tighten utility types | `shared/types/` |
| Error handling | Introduce Result pattern | All service files |

### Out of Scope

| Area | Reason |
|------|--------|
| Test files | Test `any` usage is acceptable with `@ts-expect-error` |
| Generated code | Auto-generated files will be regenerated |
| Third-party types | Handled by `@types/*` packages |
| Runtime behaviour | Refactoring must not change runtime behaviour |

---

## Step 3: Define Success Criteria

Each criterion must be verifiable by a command or automated check:

```typescript
// Success criteria as a type (for illustration)
interface RefactoringSuccess {
  // Hard requirements - must all pass
  noExplicitAny: boolean;          // grep ': any' returns 0
  strictModeEnabled: boolean;       // tsconfig strict: true
  allTestsPass: boolean;            // vitest run exits 0
  noCompileErrors: boolean;         // tsc --noEmit exits 0

  // Soft requirements - measured improvement
  typeAssertionReduction: number;   // >= 80% reduction
  typeCoverage: number;             // >= 95% (via type-coverage tool)
}
```

### Verification Script

```bash
#!/bin/bash
# {{PROJECT_NAME}} refactoring verification

echo "=== Type Check ==="
tsc --noEmit

echo "=== Any Count ==="
ANY_COUNT=$(grep -rn ': any' {{SRC_DIR}} --include='*.ts' --include='*.tsx' | grep -v 'test' | wc -l)
echo "Explicit any count: $ANY_COUNT"

echo "=== Assertion Count ==="
AS_COUNT=$(grep -rn ' as ' {{SRC_DIR}} --include='*.ts' | grep -v 'test' | grep -v '.d.ts' | wc -l)
echo "Type assertion count: $AS_COUNT"

echo "=== Tests ==="
vitest run

echo "=== Lint ==="
eslint .
```

---

## Step 4: Define Milestones

### Milestone 1: Strict Foundations

- [ ] Enable `noImplicitAny` flag
- [ ] Fix all resulting compile errors
- [ ] Enable `strictNullChecks` flag
- [ ] Fix all null/undefined errors
- [ ] `tsc --noEmit` passes with new flags

### Milestone 2: Core Module Refactoring

- [ ] Remove all `any` from {{MODULE_NAME}} module
- [ ] Replace type assertions with type guards in {{MODULE_NAME}}
- [ ] Introduce discriminated unions for state types
- [ ] Extract shared utility types to `{{SRC_DIR}}shared/types/`
- [ ] `tsc --noEmit` passes

### Milestone 3: Error Handling

- [ ] Define `Result<T, E>` type
- [ ] Replace `throw` with `Result` for expected errors in services
- [ ] Add proper error narrowing to all `catch` blocks
- [ ] `vitest run` passes

### Milestone 4: Full Strict Mode

- [ ] Enable remaining strict flags
- [ ] Enable `strict: true` in tsconfig
- [ ] Fix all resulting compile errors
- [ ] Full test suite passes
- [ ] `tsc --noEmit && eslint . && vitest run` all pass

---

## Step 5: Define Constraints

### Non-Negotiable Rules

1. **No runtime behaviour changes**: Refactoring must be type-only
2. **Compilable after every step**: `tsc --noEmit` must pass between changes
3. **Tests pass after every step**: `vitest run` must remain green
4. **Small commits**: Each logical change is a separate commit
5. **No new `any`**: Do not introduce new `any` to fix existing ones

### Acceptable Trade-offs

| Trade-off | When Acceptable |
|-----------|----------------|
| `unknown` instead of specific type | Third-party data with no schema |
| `as const` assertion | Constant arrays/objects for literal types |
| Generic constraint `extends object` | When more specific constraint is impractical |
| `// @ts-expect-error` in tests | Testing invalid input handling |

---

## Verification

```bash
tsc --noEmit
eslint .
vitest run
```

**Checklist:**

- [ ] Primary objectives defined with metrics
- [ ] Current and target values documented
- [ ] Scope boundaries set (in/out of scope)
- [ ] Success criteria are all verifiable by command
- [ ] Milestones defined with checkboxes
- [ ] Constraints and acceptable trade-offs documented
- [ ] Verification script created
