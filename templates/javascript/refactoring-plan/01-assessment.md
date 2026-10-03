# Phase 1: Assessment

**Dependencies:** None

**Can be implemented in parallel with:** Nothing — this must be completed first

## 1.1 Code Smell Inventory

Scan `{{TARGET_FILES}}` for common JavaScript anti-patterns and legacy syntax.

```javascript
// var usage — block-scoping issues, hoisting surprises
var config = loadConfig();
var i;
for (var i = 0; i < items.length; i++) { /* i leaks to outer scope */ }

// Identify all occurrences:
// - var declarations (should be const or let)
// - Reassigned const candidates (const used where let is needed, or vice versa)
// - Variables declared far from usage
```

**Checklist:**

- [ ] Count `var` declarations across `{{TARGET_FILES}}`
- [ ] Identify variables that are never reassigned (candidates for `const`)
- [ ] Identify variables declared with `const` that need reassignment (`let`)
- [ ] Flag `var` inside loops (scoping bugs)
- [ ] Document files with the highest `var` density

## 1.2 Callback and Promise Audit

Identify asynchronous patterns that need modernisation.

```javascript
// Callback hell — deeply nested, hard to follow
fs.readFile(path, (err, data) => {
  if (err) return callback(err);
  db.query(sql, [data], (err, rows) => {
    if (err) return callback(err);
    cache.set(key, rows, (err) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  });
});

// Raw Promise chains without async/await
fetchUser(id)
  .then((user) => fetchOrders(user.id))
  .then((orders) => processOrders(orders))
  .catch((err) => console.error(err));

// Mixed patterns — some async/await, some callbacks in same file
```

**Checklist:**

- [ ] Count callback-style functions (functions accepting `(err, result)` parameters)
- [ ] Count `.then()/.catch()` chains longer than 2 levels
- [ ] Identify event-emitter-based flows that could use `async`
- [ ] Flag mixed async patterns within the same file
- [ ] List third-party libraries that force callback style

## 1.3 Module System Audit

Check for CJS/ESM inconsistencies.

```javascript
// CJS indicators:
const express = require('express');
const { readFile } = require('fs');
module.exports = { handler };
exports.helper = function () {};

// ESM indicators:
import express from 'express';
import { readFile } from 'node:fs/promises';
export { handler };
export default function main() {}

// Mixed in same project — will cause runtime errors
```

**Checklist:**

- [ ] Check `package.json` for `"type"` field
- [ ] Count files using `require()` vs `import`
- [ ] Count files using `module.exports` vs `export`
- [ ] Identify files mixing both systems
- [ ] Note `.mjs` or `.cjs` file extensions already in use
- [ ] Check if dynamic `require()` is used (harder to convert)

## 1.4 Error Handling Audit

Identify poor error handling patterns.

```javascript
// Silent swallowing — hides bugs
try {
  const data = JSON.parse(raw);
} catch (e) {
  // empty catch
}

// console.log debugging left in production
console.log('DEBUG:', user);
console.log('got here');

// String errors instead of Error objects
throw 'something went wrong';
throw { message: 'bad input' };

// Missing error handling on promises
fetchData(url); // no .catch(), no await in try/catch

// Overly broad catch — catches everything, handles nothing
try {
  /* 50 lines of code */
} catch (err) {
  res.status(500).send('error');
}
```

**Checklist:**

- [ ] Count empty `catch` blocks
- [ ] Count `console.log` / `console.debug` statements (non-logger usage)
- [ ] Identify thrown strings or plain objects (should be `Error` instances)
- [ ] Find unhandled promise rejections (missing `.catch()` or `try/catch`)
- [ ] Count overly broad `try/catch` blocks (more than 20 lines in `try`)
- [ ] Check for `process.on('unhandledRejection')` handler

## 1.5 Prototype and Class Patterns

Identify legacy object-oriented patterns.

```javascript
// Prototype manipulation — hard to follow, no static analysis
function User(name) {
  this.name = name;
}
User.prototype.greet = function () {
  return 'Hello, ' + this.name;
};

// String concatenation instead of template literals
const message = 'User ' + user.name + ' has ' + count + ' items';
const path = baseDir + '/' + subDir + '/' + filename;

// arguments object instead of rest parameters
function sum() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}
```

**Checklist:**

- [ ] Count `prototype` assignments
- [ ] Count constructor functions (non-class `function Foo()` with `this`)
- [ ] Count string concatenation with `+` that should use template literals
- [ ] Identify `arguments` usage (should be rest `...args`)
- [ ] Flag `apply`/`call` patterns that could use spread
- [ ] Count `.bind(this)` patterns (arrow functions eliminate these)

## 1.6 Assessment Summary

Compile findings into a prioritised refactoring backlog.

```text
# Priority ranking (by risk and impact):
# P0 — Bugs waiting to happen (var scoping, missing error handling)
# P1 — Maintenance burden (callbacks, prototype chains)
# P2 — Modernisation (string concat, require → import)
# P3 — Style consistency (minor patterns)
```

**Checklist:**

- [ ] Rank code smells by severity (P0–P3)
- [ ] Count total occurrences of each smell category
- [ ] Identify the 5 worst files (most smells per file)
- [ ] Estimate effort per category (hours or story points)
- [ ] Create a summary table: category, count, priority, effort
- [ ] Get team agreement on what to refactor first
