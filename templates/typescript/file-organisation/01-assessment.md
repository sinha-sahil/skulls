# {{PROJECT_NAME}} - File Organisation Assessment

## Overview

Audit the current file and directory structure of {{PROJECT_NAME}} to identify problems, inconsistencies, and opportunities for improvement.

## Status

🔴 Not Started

## Dependencies

None - This task can be done independently

---

## Step 1: Inventory Current Structure

Document the current directory layout:

```text
{{SRC_DIR}}
├── [list current top-level directories]
├── [list current top-level files]
└── ...
```

### Metrics to Capture

| Metric | Value |
|--------|-------|
| Total `.ts` files | |
| Total `.js` files (if mixed) | |
| Total `.d.ts` declaration files | |
| Deepest nesting level | |
| Largest directory (file count) | |
| Number of `index.ts` barrel files | |
| Number of `tsconfig*.json` files | |

---

## Step 2: Audit tsconfig Configuration

Review the current TypeScript configuration:

```jsonc
// Current tsconfig.json
{
  "compilerOptions": {
    "strict": false,        // ← Is strict mode enabled?
    "target": "???",        // ← What target?
    "module": "???",        // ← What module system?
    "paths": {},            // ← Any path aliases?
    "composite": false,     // ← Project references?
    "declaration": false    // ← Generating .d.ts?
  }
}
```

### tsconfig Checklist

- [ ] `strict: true` is enabled (or individual strict flags documented)
- [ ] `target` matches deployment environment
- [ ] `module` and `moduleResolution` are compatible
- [ ] Path aliases (`paths`) are documented
- [ ] `include` and `exclude` are correctly scoped
- [ ] No unnecessary `skipLibCheck: true`

---

## Step 3: Identify Problem Patterns

### Circular Dependencies

```bash
# Check for circular dependencies (if madge is available)
npx madge --circular {{SRC_DIR}}
```

Document any circular dependencies found:

| Cycle | Files Involved | Severity |
|-------|----------------|----------|
| | | |

### Overgrown Directories

Directories with more than 15-20 files need splitting:

| Directory | File Count | Proposed Split |
|-----------|------------|----------------|
| | | |

### Inconsistent Patterns

| Pattern | Occurrences | Example |
|---------|-------------|---------|
| Mixed `.js`/`.ts` files | | `src/utils.js` alongside `src/helpers.ts` |
| Missing type exports | | Module exports values but not types |
| Wildcard re-exports (`export *`) | | `export * from './helpers'` |
| Deep relative imports | | `import { x } from '../../../../shared'` |
| Type-only files without `.types.ts` suffix | | Types in `models.ts` instead of `models.types.ts` |

---

## Step 4: Map Import Graph

Document the top-level import relationships:

```text
Entry Point: {{ENTRY_POINT}}
│
├── {{MODULE_NAME}}/
│   ├── imports from: [list dependencies]
│   └── imported by: [list dependents]
│
├── shared/
│   ├── imports from: [should be minimal/none]
│   └── imported by: [list dependents]
│
└── types/
    ├── imports from: [none ideally]
    └── imported by: [everything]
```

---

## Step 5: Assess Declaration Files

| Question | Answer |
|----------|--------|
| Are `.d.ts` files generated or hand-written? | |
| Is `declaration: true` in tsconfig? | |
| Are ambient declarations (`declare module`) used? | |
| Is there a `global.d.ts` or `env.d.ts`? | |
| Are third-party types from `@types/*` up to date? | |

---

## Step 6: Document Findings

### Summary of Issues

1. **Critical**: [Issues that block development]
2. **High**: [Issues causing frequent pain]
3. **Medium**: [Issues that slow down the team]
4. **Low**: [Nice-to-have improvements]

### Recommended Actions

| Priority | Action | Effort | Phase |
|----------|--------|--------|-------|
| P0 | | | |
| P1 | | | |
| P2 | | | |

---

## Verification

```bash
tsc --noEmit
eslint .
```

**Checklist:**

- [ ] Current directory structure documented
- [ ] tsconfig configuration audited
- [ ] Circular dependencies identified
- [ ] Overgrown directories catalogued
- [ ] Inconsistent patterns listed
- [ ] Import graph mapped
- [ ] Declaration file status assessed
- [ ] Findings summarised with priorities
