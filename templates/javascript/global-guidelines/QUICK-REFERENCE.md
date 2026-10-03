# Global Guidelines - Quick Reference

## Template Variables Reference

| Variable | Example | Description |
|----------|---------|-------------|
| `{{PROJECT_NAME}}` | `my-app` | Project name |
| `{{SRC_ROOT}}` | `src/` | Source root directory |
| `{{NODE_VERSION}}` | `20` | Minimum Node.js version |
| `{{COVERAGE_TARGET}}` | `80` | Test coverage target % |
| `{{MAX_FUNCTION_LENGTH}}` | `40` | Max function line count |
| `{{MAX_FILE_LENGTH}}` | `300` | Max file line count |
| `{{MAX_COMPLEXITY}}` | `10` | Max cyclomatic complexity |

---

## Quick Decision Tree

```text
Writing new code?
├─ Variables
│  ├─ Will it be reassigned?  → let
│  └─ Otherwise              → const (default)
│
├─ Functions
│  ├─ Method on object?       → shorthand method
│  ├─ Needs `this` binding?   → regular function
│  └─ Otherwise              → arrow function
│
├─ Async code
│  ├─ Single operation?       → await
│  ├─ Multiple independent?   → Promise.all([...])
│  └─ Stream/events?          → async iterator or callback
│
├─ Error handling
│  ├─ Expected error?         → Custom Error class + throw
│  ├─ External input?         → Validate first, throw ValidationError
│  └─ System failure?         → Log + propagate
│
├─ Types
│  ├─ Function params?        → @param JSDoc
│  ├─ Return value?           → @returns JSDoc
│  ├─ Domain object?          → @typedef JSDoc
│  └─ Runtime check needed?   → typeof / instanceof / zod
│
└─ Testing
   ├─ Pure function?          → Direct assertion
   ├─ External dependency?    → vi.mock()
   ├─ Async function?         → await + expect
   └─ Output format?          → Snapshot test
```

---

## Essential ESLint Rules

```javascript
// eslint.config.js
export default [
  {
    rules: {
      // Code style
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'object-shorthand': 'error',
      'no-useless-rename': 'error',

      // Error handling
      'no-throw-literal': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-implicit-coercion': 'error',

      // Quality
      'max-lines-per-function': ['warn', { max: 40 }],
      'complexity': ['warn', 10],
      'no-nested-ternary': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'eqeqeq': ['error', 'always'],
    },
  },
];
```

---

## Common Patterns Quick Reference

### Module Structure

```javascript
// 1. Imports (ordered: builtins → external → internal → relative)
import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { config } from '#config';
import { helper } from './helper.js';

// 2. Constants
const MAX_RETRIES = 3;

// 3. Type definitions (JSDoc)
/** @typedef {Object} User @property {string} id @property {string} name */

// 4. Main exports
export async function getUser(id) { /* ... */ }

// 5. Internal helpers (not exported)
function validate(input) { /* ... */ }
```

### Error Pattern

```javascript
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}
```

### Test Pattern

```javascript
import { describe, it, expect } from 'vitest';
import { myFunction } from './module.js';

describe('myFunction', () => {
  it('should [behaviour] when [condition]', () => {
    const result = myFunction(input);
    expect(result).toEqual(expected);
  });
});
```

---

## Verification Checklist

- [ ] All `{{VARIABLES}}` replaced with actual values
- [ ] eslint.config.js configured with recommended rules
- [ ] vitest.config.js configured with coverage thresholds
- [ ] `eslint .` passes with zero errors
- [ ] `vitest run` passes with coverage above `{{COVERAGE_TARGET}}`%
- [ ] All exported functions have JSDoc annotations
- [ ] No `var`, `require()`, or `module.exports` in source code
- [ ] No empty catch blocks or thrown strings
- [ ] No `console.log` in production code
