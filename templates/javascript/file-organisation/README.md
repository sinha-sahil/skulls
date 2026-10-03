# File Organisation Planning Template

This template guides the planning and execution of file and module organisation for a JavaScript project. It covers ESM and CJS module systems, barrel exports, package.json configuration, and migration strategies for restructuring existing code.

## Project Configuration

Before using these templates, configure your project-specific values:

### Core Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project name | `my-app`, `data-pipeline` |
| `{{PROJECT_ROOT}}` | Project root directory | `.`, `packages/core` |
| `{{MODULE_SYSTEM}}` | Module system in use | `esm`, `cjs`, `dual` |

### Structure Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{SRC_ROOT}}` | Source root directory | `src/`, `lib/` |
| `{{ENTRY_POINT}}` | Main entry file | `src/index.js`, `src/main.js` |
| `{{OUTPUT_DIR}}` | Build output directory | `dist/`, `build/` |
| `{{PACKAGE_SCOPE}}` | npm scope if monorepo | `@myorg` |

### Module Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{MODULE_NAME}}` | Module being organised | `auth`, `utils` |
| `{{BARREL_FILE}}` | Barrel export file | `index.js` |
| `{{PUBLIC_EXPORTS}}` | Publicly exported members | `createUser, validateEmail` |

---

## When to Use This Template

- Starting a new JavaScript project and deciding on file structure
- Migrating from CommonJS to ES Modules
- Restructuring a project that has grown organically
- Setting up a monorepo with workspaces
- Establishing barrel export patterns across a codebase
- Configuring package.json `exports` field for a library

## Template Files

| File | Description |
|------|-------------|
| [01-assessment.md](./01-assessment.md) | Audit current file structure and identify pain points |
| [02-directory-structure.md](./02-directory-structure.md) | Define target directory layout |
| [03-module-boundaries.md](./03-module-boundaries.md) | Define module responsibilities and public APIs |
| [04-naming-conventions.md](./04-naming-conventions.md) | Establish file and directory naming standards |
| [05-dependency-flow.md](./05-dependency-flow.md) | Plan module dependency graph and import strategy |
| [06-migration-plan.md](./06-migration-plan.md) | Step-by-step plan to reorganise existing code |

## Implementation Order

### Phase 1 (Assessment - start immediately)

- Step 1: Assessment (audit current state)

### Phase 2 (Design - after assessment)

- Step 2: Directory Structure (define target layout)
- Step 3: Module Boundaries (define responsibilities)
- Step 4: Naming Conventions (establish standards)
- Step 5: Dependency Flow (plan import graph)

### Phase 3 (Execution - after design is complete)

- Step 6: Migration Plan (execute restructuring)

## Key JavaScript Concepts

### ESM vs CJS

- **ESM** (`import`/`export`): The standard module system. Use `"type": "module"` in package.json.
- **CJS** (`require`/`module.exports`): Legacy Node.js system. Default without `"type": "module"`.
- **Dual**: Publish both formats using `exports` field conditional exports.

### Barrel Exports

```javascript
// src/utils/index.js — barrel file
export { formatDate } from './date.js';
export { validateEmail } from './email.js';
export { slugify } from './string.js';
```

### package.json `exports` Field

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "import": "./dist/utils/index.mjs",
      "require": "./dist/utils/index.cjs"
    }
  }
}
```

## Notes for LLM Implementation

1. **Assess before restructuring**: Always audit current state before proposing changes
2. **Incremental migration**: Move one module at a time, verify tests pass between steps
3. **Preserve git history**: Use `git mv` when moving files
4. **Barrel pattern**: Use `index.js` files to define public module APIs
5. **Avoid circular imports**: Design dependency flow as a directed acyclic graph
6. **ESM file extensions**: Always use `.js` extensions in ESM import paths
