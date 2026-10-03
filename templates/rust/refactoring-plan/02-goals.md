# Phase 2: Refactoring Goals

**Dependencies:** Phase 1 (Assessment)

**Can be implemented in parallel with:** Phase 1 (Assessment)

## Overview

Define measurable, prioritised objectives for the `{{PROJECT_NAME}}` refactoring effort. Each goal must have a clear success criterion that can be verified with tooling. Goals are derived from the findings in Phase 1.

---

## 2.1 Goal Definition

Define each refactoring goal using this template:

### Goal Template

```markdown
**Goal:** [One-line description]
**Metric:** [How to measure success]
**Baseline:** [Current value from Phase 1]
**Target:** [Desired value]
**Verification:** [Command to check]
```

### Example Goals

**Goal:** Eliminate all `unwrap()` calls in production code
**Metric:** Count of `unwrap()` in `{{SRC_DIR}}/` (excluding tests)
**Baseline:** 47 occurrences
**Target:** 0 occurrences
**Verification:** `rg "\.unwrap\(\)" {{SRC_DIR}} --type rust --glob '!*test*' -c` returns nothing

**Goal:** Reduce clippy warnings to zero
**Metric:** `cargo clippy` warning count
**Baseline:** 23 warnings
**Target:** 0 warnings
**Verification:** `cargo clippy -- -D warnings` exits with code 0

**Goal:** Introduce centralised error type
**Metric:** Percentage of functions using `{{ERROR_TYPE}}`
**Baseline:** 30% of fallible functions use `{{ERROR_TYPE}}`
**Target:** 100% of fallible functions use `{{ERROR_TYPE}}`
**Verification:** `rg "-> Result<" {{SRC_DIR}} --type rust` all show `{{ERROR_TYPE}}`

**Goal:** Improve test coverage
**Metric:** Line coverage percentage
**Baseline:** 45%
**Target:** {{MIN_TEST_COVERAGE}}
**Verification:** `cargo tarpaulin --skip-clean` reports >= {{MIN_TEST_COVERAGE}}

**Goal:** Reduce largest module below 300 lines
**Metric:** Line count of largest `.rs` file
**Baseline:** 650 lines (`{{SRC_DIR}}/{{MODULE_NAME}}.rs`)
**Target:** No file exceeds 300 lines
**Verification:** `find {{SRC_DIR}} -name "*.rs" -exec wc -l {} + | awk '$1 > 300'` returns nothing

---

## 2.2 Prioritisation Matrix

Rate each goal on Impact (1-5) and Effort (1-5):

| Goal | Impact | Effort | Priority | Rationale |
|------|--------|--------|----------|-----------|
| Eliminate `unwrap()` | 5 | 2 | **P0** | Prevents runtime panics |
| Centralise error types | 5 | 3 | **P0** | Enables consistent error handling |
| Zero clippy warnings | 3 | 2 | **P1** | Quick wins, catches bugs |
| Split large modules | 4 | 3 | **P1** | Improves maintainability |
| Improve test coverage | 4 | 4 | **P2** | Safety net for future changes |
| Introduce newtype wrappers | 3 | 3 | **P2** | Compiler-enforced correctness |
| Remove dead code | 2 | 1 | **P3** | Low effort cleanup |

**Priority Guide:**

- **P0**: Must do. Addresses correctness or safety issues.
- **P1**: Should do. Significant quality improvement.
- **P2**: Good to do. Measurable improvement.
- **P3**: Nice to do. Cleanup and polish.

---

## 2.3 Success Criteria

Define the overall refactoring as successful when:

```bash
# All of these must pass:
cargo check                    # Compiles without errors
cargo clippy -- -D warnings    # Zero clippy warnings
cargo test                     # All tests pass
cargo fmt --check              # Formatting is correct

# And these metrics are met:
rg "\.unwrap\(\)" {{SRC_DIR}} --type rust --glob '!*test*' -c  # Returns nothing
cargo tarpaulin --skip-clean   # Coverage >= {{MIN_TEST_COVERAGE}}
```

---

## 2.4 Non-Goals

Explicitly document what this refactoring will NOT do:

- [ ] No new features will be added
- [ ] No database schema changes
- [ ] No API contract changes (unless documented in Phase 3)
- [ ] No dependency version upgrades (unless required for refactoring)
- [ ] No performance optimisation (unless it falls out of cleanup naturally)

---

## Checklist

- [ ] All goals have measurable success criteria
- [ ] Baseline metrics recorded from Phase 1
- [ ] Goals are prioritised using impact/effort matrix
- [ ] Non-goals are explicitly documented
- [ ] Overall success criteria defined
- [ ] Goals are achievable within the refactoring scope
- [ ] Team agreement on priorities (if applicable)

## Verification

```bash
# Verify baseline is still accurate before starting
cargo clippy 2>&1 | grep "warning\[" | wc -l
rg "\.unwrap\(\)" {{SRC_DIR}} --type rust --glob '!*test*' -c
```

Goals must be finalised before proceeding to Phase 3 (Impact Analysis).
