# File Organisation Planning Template

This template guides the planning and execution of file and module organisation for a Rust project or workspace. It covers single-crate layouts, multi-crate workspaces, module hierarchy decisions, and migration strategies for restructuring existing code.

## Project Configuration

Before using these templates, configure your project-specific values:

### Core Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project or crate name | `my_api`, `data_pipeline` |
| `{{WORKSPACE_ROOT}}` | Workspace root directory | `.`, `crates/` |
| `{{CRATE_NAME}}` | Individual crate name | `api_server`, `core_lib` |

### Structure Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{SRC_ROOT}}` | Source root directory | `src/`, `crates/api/src/` |
| `{{BIN_NAME}}` | Binary target name | `server`, `cli` |
| `{{LIB_MODULES}}` | Top-level library modules | `domain, infra, api` |
| `{{SERVICES_DIR}}` | Services directory path | `src/services/` |

### Module Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{MODULE_NAME}}` | Module being organised | `auth`, `orders` |
| `{{PARENT_MODULE}}` | Parent module path | `crate::services` |
| `{{PUBLIC_TYPES}}` | Types re-exported from module | `User, UserRole` |

---

## When to Use This Template

- Starting a new Rust project and need to decide on crate structure
- Restructuring an existing project that has grown organically
- Splitting a monolithic crate into a workspace
- Establishing consistent module patterns across a team
- Migrating between `mod.rs` style and directory-based modules

## Template Files

| File | Description |
|------|-------------|
| [01-assessment.md](./01-assessment.md) | Audit current file structure and identify pain points |
| [02-directory-structure.md](./02-directory-structure.md) | Define target directory layout |
| [03-module-boundaries.md](./03-module-boundaries.md) | Define module responsibilities and API surfaces |
| [04-naming-conventions.md](./04-naming-conventions.md) | Establish file and module naming standards |
| [05-dependency-flow.md](./05-dependency-flow.md) | Plan module dependency graph |
| [06-migration-plan.md](./06-migration-plan.md) | Step-by-step plan to reorganise existing code |

## Implementation Order

### Phase 1 (Assessment - start immediately)

- Step 1: Assessment (audit current state)

### Phase 2 (Design - after assessment)

- Step 2: Directory Structure (define target layout)
- Step 3: Module Boundaries (define responsibilities)
- Step 4: Naming Conventions (establish standards)
- Step 5: Dependency Flow (plan module graph)

### Phase 3 (Execution - after design is complete)

- Step 6: Migration Plan (execute restructuring)

## Key Rust Concepts

### Crate vs Module

- **Crate**: A compilation unit. Either a binary (`main.rs`) or a library (`lib.rs`).
- **Module**: An organisational unit within a crate. Defined by `mod` declarations.
- **Workspace**: A collection of crates that share a `Cargo.lock` and output directory.

### Module Declaration Styles

**Directory with `mod.rs` (traditional):**

```text
src/
  services/
    mod.rs       <-- declares submodules
    auth.rs
    orders.rs
```

**Directory module (modern, Rust 2018+):**

```text
src/
  services.rs    <-- declares submodules
  services/
    auth.rs
    orders.rs
```

### `lib.rs` vs `main.rs`

- `lib.rs`: Library root. Use for shared code, importable by other crates.
- `main.rs`: Binary entry point. Should be thin - delegate to `lib.rs`.
- A crate can have both `lib.rs` and `main.rs`.

## Notes for LLM Implementation

1. **Assess before restructuring**: Always audit current state before proposing changes
2. **Incremental migration**: Move one module at a time, verify compilation between steps
3. **Preserve git history**: Use `git mv` when moving files
4. **Re-export pattern**: Use `pub use` in parent modules to maintain stable API
5. **Avoid circular deps**: Design dependency flow as a directed acyclic graph
6. **Feature flags**: Use Cargo features to optionally include modules
