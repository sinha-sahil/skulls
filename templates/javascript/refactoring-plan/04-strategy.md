# Phase 4: Strategy

**Dependencies:** Phase 2 (Goals), Phase 3 (Impact Analysis)

**Can be implemented in parallel with:** Nothing — needs goals and impact data

## 4.1 var to const/let

Replace `var` declarations with block-scoped alternatives.

```javascript
// RULE: Use const by default, let only when reassignment is needed

// BEFORE:
var config = loadConfig();
var count = 0;
var items = [];
for (var i = 0; i < data.length; i++) {
  var item = transform(data[i]);
  items.push(item);
  count++;
}

// AFTER:
const config = loadConfig();
let count = 0;
const items = [];
for (let i = 0; i < data.length; i++) {
  const item = transform(data[i]);
  items.push(item);
  count++;
}

// WATCH OUT: var hoisting differences
// BEFORE (works because var is hoisted):
console.log(name); // undefined (no error)
var name = 'Alice';

// AFTER (throws ReferenceError — desired behaviour):
console.log(name); // ReferenceError
const name = 'Alice';
```

**Automation:**

```bash
# eslint can auto-fix most var → const/let:
npx eslint --fix --rule '{"no-var": "error", "prefer-const": "error"}' {{TARGET_FILES}}
```

**Checklist:**

- [ ] Run eslint `--fix` for `no-var` and `prefer-const`
- [ ] Manually review hoisting-dependent code
- [ ] Check for `var` in `switch` statements (scoping pitfall)
- [ ] Verify loop variables use `let` not `const`
- [ ] Run tests after conversion

## 4.2 Callbacks to Async/Await

Convert callback-based and promise-chain code to async/await.

```javascript
// Pattern A: Node-style callback → async/await
// BEFORE:
import { readFile } from 'node:fs';

function loadConfig(path, callback) {
  readFile(path, 'utf8', (err, data) => {
    if (err) return callback(err);
    try {
      const config = JSON.parse(data);
      callback(null, config);
    } catch (parseErr) {
      callback(parseErr);
    }
  });
}

// AFTER:
import { readFile } from 'node:fs/promises';

/**
 * @param {string} path
 * @returns {Promise<Config>}
 */
async function loadConfig(path) {
  const data = await readFile(path, 'utf8');
  return JSON.parse(data);
}


// Pattern B: Promise chain → async/await
// BEFORE:
function processOrder(orderId) {
  return getOrder(orderId)
    .then((order) => validateOrder(order))
    .then((validOrder) => calculateTotal(validOrder))
    .then((total) => chargePayment(total))
    .catch((err) => {
      logger.error('Order processing failed', err);
      throw err;
    });
}

// AFTER:
/**
 * @param {string} orderId
 * @returns {Promise<PaymentResult>}
 */
async function processOrder(orderId) {
  try {
    const order = await getOrder(orderId);
    const validOrder = await validateOrder(order);
    const total = await calculateTotal(validOrder);
    return await chargePayment(total);
  } catch (err) {
    logger.error('Order processing failed', err);
    throw err;
  }
}


// Pattern C: Parallel operations
// BEFORE:
Promise.all([fetchUser(id), fetchOrders(id)])
  .then(([user, orders]) => ({ ...user, orders }));

// AFTER:
async function getUserWithOrders(id) {
  const [user, orders] = await Promise.all([
    fetchUser(id),
    fetchOrders(id),
  ]);
  return { ...user, orders };
}
```

**Checklist:**

- [ ] Convert Node.js callback APIs to `node:*/promises` imports
- [ ] Convert callback-accepting functions to return `Promise`
- [ ] Flatten `.then()` chains to `await` sequences
- [ ] Preserve parallel execution with `Promise.all()`
- [ ] Add `try/catch` for error handling at appropriate boundaries
- [ ] Update callers of converted functions
- [ ] Run tests after each function conversion

## 4.3 require() to import

Convert CommonJS requires to ES Module imports.

```javascript
// Pattern A: Default require → default import
// BEFORE:
const express = require('express');

// AFTER:
import express from 'express';


// Pattern B: Destructured require → named import
// BEFORE:
const { readFile, writeFile } = require('node:fs/promises');

// AFTER:
import { readFile, writeFile } from 'node:fs/promises';


// Pattern C: module.exports → export
// BEFORE:
function createServer() { /* ... */ }
function startServer() { /* ... */ }
module.exports = { createServer, startServer };

// AFTER:
export function createServer() { /* ... */ }
export function startServer() { /* ... */ }


// Pattern D: Conditional require → dynamic import
// BEFORE:
let chalk;
if (process.env.COLORS !== 'false') {
  chalk = require('chalk');
}

// AFTER:
let chalk;
if (process.env.COLORS !== 'false') {
  chalk = (await import('chalk')).default;
}


// Pattern E: __dirname / __filename replacement
// BEFORE:
const configPath = path.join(__dirname, 'config.json');

// AFTER:
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, 'config.json');
```

**Checklist:**

- [ ] Set `"type": "module"` in `package.json`
- [ ] Convert all `require()` to `import` statements
- [ ] Convert all `module.exports` to `export` statements
- [ ] Add `.js` extension to all relative import paths
- [ ] Replace `__dirname`/`__filename` with `import.meta.url`
- [ ] Convert conditional `require()` to dynamic `import()`
- [ ] Rename config files that must stay CJS to `.cjs`

## 4.4 Prototype to Class or Functional

Modernise object construction patterns.

```javascript
// Option A: Prototype → Class (when inheritance is needed)
// BEFORE:
function User(name, email) {
  this.name = name;
  this.email = email;
}
User.prototype.getDisplayName = function () {
  return this.name + ' <' + this.email + '>';
};
User.prototype.validate = function () {
  return this.email.includes('@');
};

// AFTER (class):
export class User {
  /** @param {string} name  @param {string} email */
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  getDisplayName() {
    return `${this.name} <${this.email}>`;
  }

  validate() {
    return this.email.includes('@');
  }
}


// Option B: Prototype → Functional (preferred for stateless logic)
// AFTER (functional):
/**
 * @param {string} name
 * @param {string} email
 * @returns {User}
 */
export function createUser(name, email) {
  return Object.freeze({
    name,
    email,
    getDisplayName: () => `${name} <${email}>`,
    validate: () => email.includes('@'),
  });
}
```

**Checklist:**

- [ ] Identify all prototype-based constructors
- [ ] Decide per case: convert to `class` or functional factory
- [ ] Convert prototype methods to class methods or closures
- [ ] Replace `new Function()` patterns with `class` or factory
- [ ] Update all `new Constructor()` call sites if API changes
- [ ] Run tests after each constructor migration

## 4.5 String Concatenation to Template Literals

Replace string concatenation with template literals.

```javascript
// BEFORE:
const greeting = 'Hello, ' + user.name + '! You have ' + count + ' items.';
const url = baseUrl + '/api/v' + version + '/users/' + userId;
const query = 'SELECT * FROM ' + table + ' WHERE id = ' + id;
const multiline = 'Line 1\n' +
  'Line 2\n' +
  'Line 3';

// AFTER:
const greeting = `Hello, ${user.name}! You have ${count} items.`;
const url = `${baseUrl}/api/v${version}/users/${userId}`;
const query = `SELECT * FROM ${table} WHERE id = ${id}`;
const multiline = `Line 1
Line 2
Line 3`;

// NOTE: For SQL queries, prefer parameterised queries over interpolation:
const query = 'SELECT * FROM users WHERE id = ?';
const rows = await db.query(query, [id]);
```

**Automation:**

```bash
# Use a codemod for mechanical conversion:
npx jscodeshift -t ./codemods/string-concat-to-template.js {{TARGET_FILES}}
```

**Checklist:**

- [ ] Convert string concatenation to template literals
- [ ] Convert multiline string concatenation to template literals
- [ ] Verify SQL strings still use parameterised queries (not interpolation)
- [ ] Check for HTML strings — ensure no XSS via interpolation
- [ ] Run tests after conversion

## 4.6 Strategy Selection Summary

Choose the execution order based on risk and dependency.

```text
# Recommended refactoring order:
#
# 1. var → const/let        (automated, lowest risk, immediate benefit)
# 2. String → template lit   (automated, low risk)
# 3. require → import        (file-by-file, medium risk, enables other changes)
# 4. Callback → async/await  (function-by-function, medium risk)
# 5. Prototype → class/func  (case-by-case, medium risk)
# 6. Error handling           (cross-cutting, do alongside other changes)
# 7. JSDoc coverage           (additive, no risk, do throughout)
```

**Checklist:**

- [ ] Order refactoring steps by risk (lowest first)
- [ ] Identify steps that can be automated (eslint --fix, codemods)
- [ ] Identify steps that need manual review
- [ ] Define "done" criteria for each pattern
- [ ] Estimate time per pattern across `{{REFACTOR_SCOPE}}`
- [ ] Get team agreement on execution order
