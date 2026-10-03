# Phase 2: Directory Structure

**Dependencies:** Phase 1 (Assessment)

**Can be implemented in parallel with:** Phases 3, 4, 5

## 2.1 Root Layout

Define the top-level project structure.

```text
{{PROJECT_ROOT}}/
├── src/                    # Application source code
│   ├── index.js            # Entry point
│   ├── features/           # Feature modules (if feature-based)
│   ├── services/           # Service modules (if layer-based)
│   ├── shared/             # Shared utilities and helpers
│   └── config/             # Configuration loading
├── tests/                  # Test files (if not co-located)
├── scripts/                # Build and development scripts
├── dist/                   # Build output (gitignored)
├── package.json
├── vitest.config.js
└── eslint.config.js
```

**Checklist:**

- [ ] Define top-level directories
- [ ] Decide: co-located tests (`*.test.js`) or separate `tests/` directory
- [ ] Decide: configuration in root vs `config/` directory
- [ ] Define which directories are gitignored
- [ ] Document the purpose of each top-level directory

## 2.2 Source Directory Organisation

Choose and document the internal structure pattern.

### Feature-Based (recommended for applications)

```text
src/
├── features/
│   ├── {{MODULE_NAME}}/
│   │   ├── index.js              # Public API (barrel exports)
│   │   ├── {{MODULE_NAME}}.service.js
│   │   ├── {{MODULE_NAME}}.controller.js
│   │   ├── {{MODULE_NAME}}.model.js
│   │   ├── {{MODULE_NAME}}.validation.js
│   │   └── {{MODULE_NAME}}.test.js
│   └── ...
├── shared/
│   ├── utils/
│   │   ├── index.js
│   │   ├── date.js
│   │   └── string.js
│   ├── middleware/
│   └── errors/
└── index.js
```

### Layer-Based (simpler projects)

```text
src/
├── controllers/
│   ├── {{MODULE_NAME}}.controller.js
│   └── ...
├── services/
│   ├── {{MODULE_NAME}}.service.js
│   └── ...
├── models/
├── middleware/
├── utils/
└── index.js
```

**Checklist:**

- [ ] Choose feature-based or layer-based structure
- [ ] Define `shared/` directory for cross-cutting concerns
- [ ] Define `config/` directory for environment and app configuration
- [ ] Decide on `constants/` or inline constants
- [ ] Document maximum recommended nesting depth (suggest 4 levels)

## 2.3 Package.json Configuration

Configure module resolution and entry points.

```json
{
  "name": "{{PROJECT_NAME}}",
  "type": "module",
  "main": "./{{ENTRY_POINT}}",
  "exports": {
    ".": "./{{ENTRY_POINT}}",
    "./{{MODULE_NAME}}": "./src/features/{{MODULE_NAME}}/index.js"
  },
  "imports": {
    "#shared/*": "./src/shared/*",
    "#features/*": "./src/features/*",
    "#config": "./src/config/index.js"
  }
}
```

**Checklist:**

- [ ] Set `"type": "module"` for ESM
- [ ] Configure `exports` for all public entry points
- [ ] Set up `imports` for internal path aliases (Node.js subpath imports)
- [ ] Verify `files` field lists only published directories
- [ ] Add `engines` field to specify minimum Node.js version

## 2.4 Monorepo Structure (if applicable)

Define workspace layout for multi-package projects.

```text
{{PROJECT_ROOT}}/
├── packages/
│   ├── {{PACKAGE_SCOPE}}/core/
│   │   ├── src/
│   │   ├── package.json
│   │   └── vitest.config.js
│   ├── {{PACKAGE_SCOPE}}/cli/
│   │   ├── src/
│   │   └── package.json
│   └── {{PACKAGE_SCOPE}}/shared/
│       ├── src/
│       └── package.json
├── package.json              # Root workspace config
└── pnpm-workspace.yaml       # Workspace definition
```

**Checklist:**

- [ ] Define workspace root configuration
- [ ] List all packages and their purposes
- [ ] Configure inter-package dependencies
- [ ] Set up shared tooling config at root level
- [ ] Define package publishing strategy
