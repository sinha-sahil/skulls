# Refactoring Plan - Quick Reference

## Template Variables Reference

| Variable | Example | Description |
|----------|---------|-------------|
| `{{PROJECT_NAME}}` | `my-app` | Project name |
| `{{SRC_ROOT}}` | `src/` | Source root directory |
| `{{TARGET_FILES}}` | `src/services/` | Files to refactor |
| `{{REFACTOR_SCOPE}}` | `auth module` | Scope of refactoring |
| `{{CURRENT_PATTERN}}` | `callbacks` | Pattern being replaced |
| `{{TARGET_PATTERN}}` | `async/await` | Pattern being adopted |
| `{{DEPENDENCY_TO_REMOVE}}` | `lodash` | Dependency to eliminate |

---

## Quick Decision Tree

```text
What needs refactoring?
├─ Syntax modernisation
│  ├─ var → const/let
│  ├─ callbacks → async/await
│  ├─ prototype → class or functions
│  └─ string concat → template literals
│
├─ Dependency removal
│  ├─ lodash → native Array/Object methods
│  ├─ moment → Intl.DateTimeFormat / date-fns
│  ├─ request → fetch / undici
│  └─ underscore → native methods
│
├─ Error handling
│  ├─ try/catch everywhere → Result pattern
│  ├─ silent failures → explicit error propagation
│  └─ string errors → Error subclasses
│
├─ Pattern migration
│  ├─ class → functional composition
│  ├─ mutable state → immutable patterns
│  └─ imperative → declarative
│
└─ Code quality
   ├─ Reduce function length (> 50 lines)
   ├─ Reduce file length (> 300 lines)
   └─ Reduce cyclomatic complexity (> 10)
```

---

## Common Refactoring Patterns

### Callbacks to Async/Await

```javascript
// BEFORE:
function getUser(id, callback) {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows[0]);
  });
}

// AFTER:
async function getUser(id) {
  const rows = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
}
```

### var to const/let

```javascript
// BEFORE:
var config = loadConfig();
var count = 0;
for (var i = 0; i < items.length; i++) { count++; }

// AFTER:
const config = loadConfig();
let count = 0;
for (let i = 0; i < items.length; i++) { count++; }
```

### Lodash to Native

```javascript
// BEFORE:
import _ from 'lodash';
const unique = _.uniq(items);
const grouped = _.groupBy(items, 'type');
const picked = _.pick(obj, ['a', 'b']);

// AFTER:
const unique = [...new Set(items)];
const grouped = Object.groupBy(items, (item) => item.type);
const { a, b } = obj;
const picked = { a, b };
```

---

## Verification Checklist

- [ ] All tests pass after refactoring
- [ ] `eslint .` reports no new issues
- [ ] No behaviour changes (same inputs → same outputs)
- [ ] Bundle size unchanged or reduced
- [ ] Performance benchmarks unchanged or improved
- [ ] No new circular dependencies
