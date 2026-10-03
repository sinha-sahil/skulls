# Phase 3: Impact Analysis

**Dependencies:** Phase 1 (Assessment), Phase 2 (Goals)

**Can be implemented in parallel with:** None (requires assessment and goals)

## Overview

Map every file, module, and public API surface affected by the planned refactoring of `{{PROJECT_NAME}}`. Identify breaking changes, downstream impacts, and risk areas before any code is modified.

---

## 3.1 Affected Files Inventory

For each refactoring goal, list every file that will be modified:

```bash
# Find all files that use the pattern being refactored
rg "{{OLD_PATTERN}}" {{SRC_DIR}} --type rust -l

# Find all files importing the module being restructured
rg "use.*{{MODULE_NAME}}" {{SRC_DIR}} --type rust -l

# Find all files referencing the type being changed
rg "{{ERROR_TYPE}}|{{TRAIT_NAME}}" {{SRC_DIR}} --type rust -l
```

| File | Changes Required | Risk Level | Notes |
|------|-----------------|------------|-------|
| `{{SRC_DIR}}/{{MODULE_NAME}}/handler.rs` | Replace `unwrap()` with `?`, update return types | Medium | 12 `unwrap()` calls |
| `{{SRC_DIR}}/{{MODULE_NAME}}/storage.rs` | Already uses `Result`, minimal changes | Low | Only error type migration |
| `{{SRC_DIR}}/{{MODULE_NAME}}/helpers.rs` | Extract into trait, update error types | High | Complex business logic |
| `{{SRC_DIR}}/error.rs` | Add new error variants | Medium | Central to all modules |
| `{{SRC_DIR}}/main.rs` | Update module declarations if splitting | Low | Structural only |

---

## 3.2 Public API Surface Analysis

Check whether the refactoring changes any public API:

```bash
# List all pub items in affected modules
rg "^pub (fn|struct|enum|trait|type|const|mod)" {{SRC_DIR}}/{{MODULE_NAME}} --type rust

# Check for re-exports
rg "pub use" {{SRC_DIR}}/{{MODULE_NAME}} --type rust

# Find external consumers of this module
rg "use {{PROJECT_NAME}}::{{MODULE_NAME}}" --type rust
```

### Breaking Change Assessment

| Change | Breaking? | Affected Consumers | Migration Path |
|--------|-----------|-------------------|----------------|
| `fn get_item() -> Item` → `fn get_item() -> Result<Item, {{ERROR_TYPE}}>` | **Yes** | All callers | Add `?` at call sites |
| `pub struct Config` fields reordered | No | None (not positional) | No action needed |
| `pub fn helper()` moved to submodule | **Yes** | Importers | Update `use` paths |
| New error variant in `{{ERROR_TYPE}}` | **Maybe** | `match` exhaustive checks | Add arm or use `_` |
| Trait added to existing struct | No | None | New functionality only |

---

## 3.3 Dependency Graph

Map how modules depend on each other to determine safe refactoring order:

```text
{{PROJECT_NAME}} module dependency graph:
┌──────────────────────────────────────────────┐
│ main.rs                                      │
│   ├── router (depends on: handlers)          │
│   ├── {{MODULE_NAME}}/                       │
│   │   ├── handler.rs  → types, storage,      │
│   │   │                  helpers, error       │
│   │   ├── storage.rs  → types, error         │
│   │   ├── helpers.rs  → types, storage,      │
│   │   │                  error               │
│   │   └── types.rs    → (none)               │
│   └── error.rs        → (none, leaf module)  │
└──────────────────────────────────────────────┘
```

**Safe refactoring order** (leaf modules first):

1. `error.rs` — no dependents need changing first
2. `types.rs` — leaf module, no internal dependencies
3. `storage.rs` — depends only on types and error
4. `helpers.rs` — depends on types, storage, error
5. `handler.rs` — depends on everything, refactor last
6. `router.rs` — update after handler signatures stabilise

---

## 3.4 Risk Assessment per Module

| Module | Risk | Reason | Mitigation |
|--------|------|--------|------------|
| `error.rs` | Low | Additive changes only | Add variants, keep existing |
| `types.rs` | Low | Structural, no logic | Compiler catches issues |
| `storage.rs` | Medium | SQL queries, runtime behaviour | Test each query individually |
| `helpers.rs` | High | Complex business logic | Add tests BEFORE refactoring |
| `handler.rs` | Medium | Many `unwrap()` calls but mechanical | Systematic find-and-replace |
| `router.rs` | Low | Only wiring changes | Quick to verify |

---

## 3.5 Trait and Implementation Impact

If introducing or modifying traits:

```rust
// Check: Does the trait need to be object-safe?
// Object-safe traits can use `dyn Trait`, non-object-safe cannot.

// Object-safe (no generic methods, no Self in return position):
pub trait {{TRAIT_NAME}} {
    async fn get(&self, id: &str) -> Result<{{ENTITY_NAME}}, {{ERROR_TYPE}}>;
    async fn list(&self) -> Result<Vec<{{ENTITY_NAME}}>, {{ERROR_TYPE}}>;
}

// NOT object-safe (returns Self):
pub trait Builder {
    fn with_name(self, name: String) -> Self;  // Cannot use dyn Builder
}
```

---

## 3.6 External Integration Points

| Integration | Affected? | Risk | Notes |
|-------------|-----------|------|-------|
| HTTP API responses | Check JSON shape | High | Clients depend on response format |
| Database queries | Check SQL correctness | Medium | Test with actual DB |
| External API calls | Unlikely affected | Low | Wrapper functions unchanged |
| Configuration | Check env var names | Low | Only if config structs change |

---

## Checklist

- [ ] Every affected file is listed with required changes
- [ ] Public API changes are documented as breaking or non-breaking
- [ ] Module dependency graph is mapped
- [ ] Refactoring order determined (leaf modules first)
- [ ] Risk level assessed for each module
- [ ] Trait changes evaluated for object safety
- [ ] External integration points checked
- [ ] Migration path documented for each breaking change

## Verification

```bash
# Verify the dependency analysis by checking imports
cargo check
rg "use crate::" {{SRC_DIR}} --type rust | sort
```

Impact analysis must be complete before proceeding to Phase 4 (Strategy).
