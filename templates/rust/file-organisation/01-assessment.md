# Phase 1: Assessment

**Dependencies:** None

**Can be implemented in parallel with:** None (this must come first)

## Overview

Audit the current file structure of the Rust project. Identify pain points such as circular dependencies, deep nesting, unclear module boundaries, overly large files, and inconsistent naming. This assessment informs all subsequent phases.

---

## 1.1 Inventory Current Structure

Run these commands to get a snapshot of the current project layout:

```bash
# List all Rust source files
find {{SRC_ROOT}} -name "*.rs" | head -50

# Count files per directory
find {{SRC_ROOT}} -name "*.rs" | xargs -I {} dirname {} | sort | uniq -c | sort -rn

# Find the largest files (likely candidates for splitting)
find {{SRC_ROOT}} -name "*.rs" -exec wc -l {} + | sort -rn | head -20

# Show module tree (requires cargo-modules: cargo install cargo-modules)
cargo modules generate tree --lib
```

Record the output in a structured inventory:

```text
{{SRC_ROOT}}
├── main.rs          (XX lines)
├── lib.rs           (XX lines)
├── config.rs        (XX lines)
├── error.rs         (XX lines)
└── services/
    ├── mod.rs       (XX lines)
    ├── {{MODULE_NAME}}/
    │   ├── mod.rs   (XX lines)
    │   ├── ...
    └── ...
```

## 1.2 Identify Pain Points

Evaluate each category and document specific findings:

### Circular Dependencies

```bash
# Check for circular module dependencies (requires cargo-modules)
cargo modules generate graph --lib | grep "cycle"

# Manual check: look for cross-imports between sibling modules
rg "use (super|crate)::services::" {{SRC_ROOT}} --type rust
```

**Document findings:**

- [ ] List any circular dependency chains found
- [ ] Note which modules import from each other bidirectionally

### Deep Nesting

```bash
# Find deeply nested module paths (more than 3 levels)
find {{SRC_ROOT}} -name "*.rs" -mindepth 4
```

**Threshold:** Modules nested deeper than 3 levels (`crate::a::b::c::d`) are candidates for flattening.

### Large Files

**Threshold:** Files exceeding 500 lines likely need splitting.

```bash
find {{SRC_ROOT}} -name "*.rs" -exec wc -l {} + | awk '$1 > 500' | sort -rn
```

### Unclear Module Boundaries

Look for signs of poor boundaries:

```bash
# Modules with many pub items (may be exposing too much)
rg "^pub (fn|struct|enum|trait|type|const|static)" {{SRC_ROOT}} --type rust -c | sort -t: -k2 -rn

# Functions that import from many different modules
rg "^use " {{SRC_ROOT}} --type rust -c | sort -t: -k2 -rn | head -20
```

### Inconsistent Naming

```bash
# Check for non-snake_case file names
find {{SRC_ROOT}} -name "*.rs" | grep -E "[A-Z]"

# Check for mod.rs vs module.rs style mixing
find {{SRC_ROOT}} -name "mod.rs" | head -10
find {{SRC_ROOT}} -name "*.rs" -not -name "mod.rs" -not -name "lib.rs" -not -name "main.rs" | head -10
```

## 1.3 Module Responsibility Map

Document what each top-level module is responsible for:

```text
| Module | Responsibility | Dependencies | Line Count | Issues |
|--------|---------------|--------------|------------|--------|
| config | App configuration | std::env | XX | None |
| error  | Error types | axum, sqlx | XX | None |
| services/{{MODULE_NAME}} | {{MODULE_NAME}} logic | error, config | XX | Too large |
| ... | ... | ... | ... | ... |
```

## 1.4 Current Dependency Graph

Map which modules depend on which:

```text
main.rs
  └── lib.rs
      ├── config
      ├── error
      └── services
          ├── {{MODULE_NAME}} → [error, config]
          └── ...
```

---

## Checklist

- [ ] Ran file inventory commands and recorded output
- [ ] Counted lines per file and identified oversized files (>500 lines)
- [ ] Checked for circular dependencies
- [ ] Identified deeply nested modules (>3 levels)
- [ ] Documented unclear module boundaries
- [ ] Checked for naming inconsistencies
- [ ] Created module responsibility map
- [ ] Mapped current dependency graph
- [ ] Documented all pain points with specific file references
- [ ] Prioritised issues by severity (blocking, major, minor)

## Verification

```bash
cargo check
cargo clippy
```

Verify the project compiles as-is before making any changes. If it does not, fix compilation errors before proceeding.
