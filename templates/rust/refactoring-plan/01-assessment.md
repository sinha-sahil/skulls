# Phase 1: Code Quality Assessment

**Dependencies:** None

**Can be implemented in parallel with:** Phase 2 (Goals)

## Overview

Audit the current state of `{{PROJECT_NAME}}` to catalog technical debt, identify patterns that need improvement, and establish a baseline for measuring refactoring progress. Every finding should be quantified where possible.

---

## 1.1 Automated Code Audit

Run these commands to collect baseline metrics:

```bash
# Count unwrap() usage across the project
rg "\.unwrap\(\)" {{SRC_DIR}} --type rust -c

# Count expect() usage
rg "\.expect\(" {{SRC_DIR}} --type rust -c

# Find functions longer than 50 lines
rg --type rust -l "fn " {{SRC_DIR}} | xargs -I{} awk '/^[[:space:]]*(pub )?(async )?fn /{name=$0; count=0} {count++} count>50{print FILENAME": "name" ("count" lines)"}' {}

# Count clippy warnings
cargo clippy 2>&1 | grep "warning\[" | wc -l

# List all clippy warning categories
cargo clippy 2>&1 | grep "warning\[" | sort | uniq -c | sort -rn

# Find unsafe blocks
rg "unsafe\s*\{" {{SRC_DIR}} --type rust -c

# Find dead code warnings
cargo check 2>&1 | grep "dead_code" | wc -l

# Find TODO/FIXME/HACK markers
rg "TODO|FIXME|HACK|XXX" {{SRC_DIR}} --type rust

# Check test coverage (requires cargo-tarpaulin)
cargo tarpaulin --skip-clean --out json 2>/dev/null | jq '.coverage'

# Find large files likely needing decomposition
find {{SRC_DIR}} -name "*.rs" -exec wc -l {} + | sort -rn | head -20

# Count modules without tests
find {{SRC_DIR}} -name "*.rs" ! -path "*/tests/*" -exec grep -rL "#\[cfg(test)\]" {} +
```

**Checklist:**

- [ ] Record baseline `unwrap()` count: ___
- [ ] Record baseline `expect()` count: ___
- [ ] Record baseline clippy warning count: ___
- [ ] Record baseline `unsafe` block count: ___
- [ ] Record baseline test coverage percentage: ___
- [ ] List all files exceeding 300 lines

---

## 1.2 Technical Debt Inventory

Document each finding in this table format:

| # | Category | Location | Description | Severity | Effort |
|---|----------|----------|-------------|----------|--------|
| 1 | Error Handling | `{{SRC_DIR}}/{{MODULE_NAME}}/handler.rs:42` | Uses `unwrap()` on DB query result | High | Low |
| 2 | Module Size | `{{SRC_DIR}}/{{MODULE_NAME}}.rs` | 600+ lines, mixes handlers and storage | Medium | Medium |
| 3 | Type Safety | `{{SRC_DIR}}/{{MODULE_NAME}}/types.rs` | Uses `String` for IDs, easy to mix up | Medium | Medium |
| 4 | Dead Code | `{{SRC_DIR}}/helpers.rs:120` | Unused function `old_process()` | Low | Low |

**Severity Guide:**

- **Critical**: Will cause runtime panics in production (e.g., `unwrap()` on network calls)
- **High**: Causes maintenance burden or bugs (e.g., inconsistent error types)
- **Medium**: Reduces code quality but functional (e.g., large modules, missing types)
- **Low**: Cosmetic or minor (e.g., dead code, naming inconsistencies)

---

## 1.3 Error Handling Audit

```bash
# Map error handling patterns currently in use
rg "-> Result<" {{SRC_DIR}} --type rust -c

# Find functions returning raw StatusCode
rg "-> .*StatusCode" {{SRC_DIR}} --type rust

# Find functions returning String errors
rg "Result<.*String>" {{SRC_DIR}} --type rust

# Check if a centralised error type exists
rg "pub enum.*Error" {{SRC_DIR}} --type rust
```

Document the current error handling landscape:

| Pattern | Count | Location(s) | Target |
|---------|-------|-------------|--------|
| `unwrap()` | ___ | scattered | Replace with `?` |
| `Result<T, String>` | ___ | helpers | Migrate to `{{ERROR_TYPE}}` |
| `Result<T, StatusCode>` | ___ | handlers | Migrate to `{{ERROR_TYPE}}` |
| `Result<T, {{ERROR_TYPE}}>` | ___ | storage | Keep (correct pattern) |

---

## 1.4 Dependency and Coupling Analysis

```bash
# Map inter-module dependencies
rg "use crate::" {{SRC_DIR}} --type rust | awk -F: '{print $1 " -> " $2}' | sort

# Find circular dependency indicators
rg "use super::" {{SRC_DIR}} --type rust

# Check pub API surface
rg "^pub (fn|struct|enum|trait|type|const)" {{SRC_DIR}} --type rust -c
```

Document module coupling:

| Module | Depends On | Depended On By | Coupling Level |
|--------|-----------|----------------|----------------|
| `{{MODULE_NAME}}/handler` | types, storage, helpers | router | Normal |
| `{{MODULE_NAME}}/storage` | types | handler, helpers | Normal |
| `{{MODULE_NAME}}/helpers` | types, storage | handler | Review needed |

---

## 1.5 Performance Baseline

```bash
# Find potential allocation hotspots
rg "\.to_string\(\)|\.to_owned\(\)|\.clone\(\)" {{SRC_DIR}} --type rust -c

# Find blocking calls in async context
rg "std::thread::sleep|std::fs::" {{SRC_DIR}} --type rust

# Check for N+1 query patterns (loops with queries)
rg -U "for .* in .*\{[^}]*sqlx::query" {{SRC_DIR}} --type rust
```

---

## Checklist

- [ ] All automated audit commands have been run
- [ ] Technical debt inventory table is populated
- [ ] Error handling patterns are documented
- [ ] Module dependency map is created
- [ ] Files exceeding 300 lines are identified
- [ ] Baseline metrics are recorded for future comparison
- [ ] Performance hotspots are flagged
- [ ] Findings are prioritised by severity

## Verification

```bash
# Ensure the project compiles in its current state before starting
cargo check
cargo test
```

All findings should be documented before proceeding to Phase 2 (Goals).
