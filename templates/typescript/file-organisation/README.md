# File Organisation Template - Overview

This directory contains templates for planning file and module organisation in TypeScript projects. It covers directory structure, barrel exports, declaration files, monorepo patterns with project references, and tsconfig organisation.

## Project Configuration

**Before using these templates, configure the following for your project:**

### Required Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project or package name | `my-app`, `@acme/core` |
| `{{SRC_DIR}}` | Source directory path | `src/`, `packages/core/src/` |
| `{{OUT_DIR}}` | Output/build directory | `dist/`, `build/` |
| `{{CONFIG_DIR}}` | Config files location | `./`, `config/` |
| `{{TEST_DIR}}` | Test files location | `tests/`, `__tests__/`, `src/` |

### Module Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{MODULE_NAME}}` | Module being organised | `auth`, `payments`, `utils` |
| `{{ENTRY_POINT}}` | Package entry point | `src/index.ts`, `src/main.ts` |
| `{{PACKAGE_SCOPE}}` | npm scope for monorepo | `@acme`, `@myorg` |

### Monorepo Placeholders (if applicable)

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{WORKSPACE_ROOT}}` | Monorepo root directory | `./`, `../../` |
| `{{PACKAGES_DIR}}` | Packages directory | `packages/`, `libs/` |
| `{{APPS_DIR}}` | Applications directory | `apps/`, `services/` |

---

## Template Structure

```text
templates/typescript/file-organisation/
├── README.md                       # This file
├── QUICK-REFERENCE.md              # Fast lookup guide
├── 01-assessment.md                # Audit current project structure
├── 02-directory-structure.md       # Design directory layout
├── 03-module-boundaries.md         # Define module boundaries and exports
├── 04-naming-conventions.md        # File and symbol naming standards
├── 05-dependency-flow.md           # Dependency graph and import rules
└── 06-migration-plan.md            # Step-by-step migration plan
```

## When to Use This Template

- Starting a new TypeScript project and need a solid structure
- Existing project has grown organically and needs reorganisation
- Migrating a JavaScript project to TypeScript
- Setting up a monorepo with TypeScript project references
- Barrel exports are causing circular dependencies or slow builds
- tsconfig is becoming unwieldy and needs restructuring
- Need to establish clear module boundaries for a growing team

## Implementation Order

### Phase 1 (Discovery)

- Step 1: Assessment (audit current structure)

### Phase 2 (Design)

- Step 2: Directory Structure (define layout)
- Step 3: Module Boundaries (define exports and contracts)
- Step 4: Naming Conventions (standardise naming)

### Phase 3 (Planning)

- Step 5: Dependency Flow (map and enforce import rules)
- Step 6: Migration Plan (incremental transition steps)

## Notes for LLM Implementation

1. **Compile after every change**: Run `tsc --noEmit` between each structural change
2. **Small commits**: Each moved/renamed file should be a separate commit
3. **Update imports**: After every file move, update all import paths
4. **Preserve behaviour**: File organisation changes should not change runtime behaviour
5. **Incremental progress**: Each step should leave the project in a compilable state
6. **Barrel exports**: Be cautious with barrel files - they can cause circular dependencies and slow compilation
