# Phase 2: Goals

**Dependencies:** Phase 1 (Assessment)

**Can be implemented in parallel with:** Phase 3 (Impact Analysis)

## 2.1 ESM Migration Objectives

Define targets for moving from CommonJS to ES Modules.

```json
// Target package.json configuration:
{
  "type": "module",
  "exports": {
    ".": "./src/index.js",
    "./utils": "./src/utils/index.js"
  },
  "imports": {
    "#shared/*": "./src/shared/*",
    "#features/*": "./src/features/*"
  }
}
```

```javascript
// BEFORE: CJS throughout
const express = require('express');
const { helper } = require('./utils');
module.exports = { handler };

// AFTER: ESM throughout
import express from 'express';
import { helper } from './utils.js';
export { handler };
```

**Checklist:**

- [ ] Set target: 100% ESM in `{{TARGET_FILES}}`
- [ ] Define exceptions (config files that must remain `.cjs`)
- [ ] Set target Node.js version (must support ESM — v16+)
- [ ] Decide on `node:` prefix convention for built-ins
- [ ] Define import path convention (always include `.js` extension)

## 2.2 Async/Await Adoption

Define targets for modernising asynchronous code.

```javascript
// GOAL: All async code uses async/await
// BEFORE:
function getUser(id) {
  return db.query('SELECT * FROM users WHERE id = ?', [id])
    .then((rows) => rows[0])
    .then((user) => {
      if (!user) throw new Error('User not found');
      return user;
    });
}

// AFTER:
/**
 * @param {string} id
 * @returns {Promise<User>}
 */
async function getUser(id) {
  const rows = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  const user = rows[0];
  if (!user) {
    throw new UserNotFoundError(id);
  }
  return user;
}
```

**Checklist:**

- [ ] Set target: zero callback-style functions in `{{REFACTOR_SCOPE}}`
- [ ] Set target: zero `.then()` chains longer than 1 level
- [ ] Define exception list (event emitters, streams that need callbacks)
- [ ] Require `async`/`await` for all new code
- [ ] Require JSDoc `@returns {Promise<T>}` on all async functions

## 2.3 JSDoc Coverage Objectives

Define type annotation targets using JSDoc.

```javascript
// GOAL: All public functions have JSDoc annotations
/**
 * Create a new order for the given customer.
 *
 * @param {string} customerId - The customer's unique identifier
 * @param {OrderInput} input - Order creation parameters
 * @param {string} input.productId - Product to order
 * @param {number} input.quantity - Number of units
 * @returns {Promise<Order>} The created order
 * @throws {ValidationError} If input is invalid
 * @throws {NotFoundError} If customer does not exist
 */
export async function createOrder(customerId, input) {
  // implementation
}

// GOAL: Type definitions for domain objects
/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} customerId
 * @property {string} productId
 * @property {number} quantity
 * @property {OrderStatus} status
 * @property {Date} createdAt
 */

/**
 * @typedef {'pending' | 'confirmed' | 'shipped' | 'delivered'} OrderStatus
 */
```

**Checklist:**

- [ ] Set target: JSDoc on 100% of exported functions
- [ ] Set target: `@typedef` for all domain objects
- [ ] Set target: `@param` and `@returns` on all public methods
- [ ] Set target: `@throws` for functions that throw known errors
- [ ] Configure eslint `jsdoc/require-jsdoc` for enforcement
- [ ] Enable `// @ts-check` in critical files for type validation

## 2.4 Error Handling Consistency

Define error handling standards.

```javascript
// GOAL: Custom error hierarchy
export class AppError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  /**
   * @param {string} field
   * @param {string} reason
   */
  constructor(field, reason) {
    super(`Validation failed for ${field}: ${reason}`);
    this.field = field;
    this.reason = reason;
    this.statusCode = 400;
  }
}

export class NotFoundError extends AppError {
  /**
   * @param {string} resource
   * @param {string} id
   */
  constructor(resource, id) {
    super(`${resource} not found: ${id}`);
    this.resource = resource;
    this.statusCode = 404;
  }
}
```

**Checklist:**

- [ ] Define base `AppError` class with structured metadata
- [ ] Define error subclasses for each error category
- [ ] Set target: zero `throw 'string'` occurrences
- [ ] Set target: zero empty `catch` blocks
- [ ] Set target: all async functions use `try/catch` or propagate errors
- [ ] Set target: centralised error logging (no `console.error` in business logic)

## 2.5 Measurable Success Criteria

Define quantifiable metrics to track refactoring progress.

```text
# Metrics to track:
#
# Syntax modernisation:
#   - var declarations:           {{CURRENT}} → 0
#   - require() calls:            {{CURRENT}} → 0
#   - callback functions:         {{CURRENT}} → 0
#   - string concatenation:       {{CURRENT}} → 0
#   - prototype assignments:      {{CURRENT}} → 0
#
# Quality:
#   - JSDoc coverage:             {{CURRENT}}% → 100% (public APIs)
#   - Empty catch blocks:         {{CURRENT}} → 0
#   - console.log statements:     {{CURRENT}} → 0
#   - ESLint warnings:            {{CURRENT}} → 0
#
# Testing:
#   - Test coverage:              {{CURRENT}}% → {{TARGET}}%
#   - Files without tests:        {{CURRENT}} → 0
```

**Checklist:**

- [ ] Record baseline count for each metric
- [ ] Set target value for each metric
- [ ] Define timeline for achieving each target
- [ ] Agree on which metrics are blocking (must-fix) vs aspirational
- [ ] Set up automated metric tracking (eslint rules, coverage reports)
- [ ] Schedule check-in reviews at 25%, 50%, 75% completion
