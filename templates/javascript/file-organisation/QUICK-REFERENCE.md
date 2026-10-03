# File Organisation - Quick Reference

## Template Variables Reference

Replace these placeholders when using templates:

### Core Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `{{PROJECT_NAME}}` | `my-app` | Project name |
| `{{PROJECT_ROOT}}` | `.` | Project root directory |
| `{{MODULE_SYSTEM}}` | `esm` | Module system (`esm`, `cjs`, `dual`) |
| `{{SRC_ROOT}}` | `src/` | Source root directory |
| `{{ENTRY_POINT}}` | `src/index.js` | Main entry file |
| `{{OUTPUT_DIR}}` | `dist/` | Build output directory |

### Module Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `{{MODULE_NAME}}` | `auth` | Module being organised |
| `{{BARREL_FILE}}` | `index.js` | Barrel export file |
| `{{PUBLIC_EXPORTS}}` | `createUser, validateEmail` | Publicly exported members |
| `{{PACKAGE_SCOPE}}` | `@myorg` | npm scope if monorepo |

---

## Quick Decision Tree

```text
Project Organisation Needed?
├─ What module system?
│  ├─ New project → ESM ("type": "module")
│  ├─ Library → Dual (exports field)
│  └─ Legacy Node.js → CJS (plan ESM migration)
│
├─ Single package or monorepo?
│  ├─ Single → Standard src/ layout
│  └─ Monorepo → Workspace packages
│
├─ Need barrel exports?
│  ├─ Library → YES (public API surface)
│  └─ Application → Selective (shared modules only)
│
└─ Bundler needed?
   ├─ Library → Rollup or unbundled
   ├─ Web app → Vite
   └─ Node service → unbundled or esbuild
```

---

## Implementation Phases

### Phase 1 (Assessment)

| Step | File | Description |
|------|------|-------------|
| 01 | `01-assessment.md` | Audit current structure and pain points |

### Phase 2 (Design)

| Step | File | Description |
|------|------|-------------|
| 02 | `02-directory-structure.md` | Define target directory layout |
| 03 | `03-module-boundaries.md` | Define module responsibilities |
| 04 | `04-naming-conventions.md` | Establish naming standards |
| 05 | `05-dependency-flow.md` | Plan import dependency graph |

### Phase 3 (Execution)

| Step | File | Description |
|------|------|-------------|
| 06 | `06-migration-plan.md` | Execute the restructuring |

---

## Common Patterns Quick Reference

### Pattern 1: Feature-Based Structure

```text
src/
├── features/
│   ├── auth/
│   │   ├── index.js          # barrel exports
│   │   ├── auth.service.js
│   │   ├── auth.middleware.js
│   │   └── auth.test.js
│   └── orders/
│       ├── index.js
│       ├── orders.service.js
│       └── orders.test.js
├── shared/
│   ├── utils/
│   └── config/
└── index.js
```

### Pattern 2: Layer-Based Structure

```text
src/
├── controllers/
├── services/
├── models/
├── middleware/
├── utils/
└── index.js
```

### Pattern 3: Monorepo Workspaces

```text
packages/
├── core/
│   ├── src/
│   └── package.json
├── cli/
│   ├── src/
│   └── package.json
└── shared/
    ├── src/
    └── package.json
```

---

## Module System Quick Reference

### ESM (recommended)

```json
{ "type": "module" }
```

```javascript
import { something } from './module.js';
export const value = 42;
export default function main() {}
```

### CJS (legacy)

```javascript
const { something } = require('./module');
module.exports = { value: 42 };
exports.helper = function() {};
```

### Dual Package (library)

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

---

## Checklist After Using Templates

- [ ] All `{{VARIABLES}}` replaced with actual values
- [ ] Module system decided and `package.json` configured
- [ ] Directory structure documented
- [ ] Barrel files created for public modules
- [ ] Import paths use correct extensions
- [ ] No circular dependencies
- [ ] `eslint .` passes
- [ ] `vitest run` passes
- [ ] Git history preserved during file moves
