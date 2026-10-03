# Phase 1: Code Style

**Dependencies:** None

**Can be implemented in parallel with:** Phase 2 (Type System)

## 1.1 Variable Declarations

Use `const` by default, `let` only when reassignment is required. Never use `var`.

```javascript
// GOOD: const for values that don't change
const config = loadConfig();
const users = await fetchUsers();
const MAX_RETRIES = 3;

// GOOD: let only when reassignment is needed
let count = 0;
let currentUser = null;
for (let i = 0; i < items.length; i++) {
  count++;
}

// BAD: var (hoisting issues, function-scoped, not block-scoped)
var config = loadConfig();
var i;
for (var i = 0; i < items.length; i++) { /* i leaks */ }
```

```javascript
// GOOD: Destructure at declaration
const { name, email } = user;
const [first, ...rest] = items;
const { port = 3000, host = 'localhost' } = config;

// BAD: Separate declarations for related values
const name = user.name;
const email = user.email;
```

**Checklist:**

- [ ] Configure eslint rule `no-var: error`
- [ ] Configure eslint rule `prefer-const: error`
- [ ] Configure eslint rule `prefer-destructuring: warn`
- [ ] Verify no `var` declarations exist in `{{SRC_ROOT}}`
- [ ] Review `let` usages — convert to `const` where reassignment is unnecessary

## 1.2 Functions

Prefer arrow functions for callbacks and short expressions. Use regular functions for named exports and methods.

```javascript
// GOOD: Arrow functions for callbacks
const sorted = items.sort((a, b) => a.name.localeCompare(b.name));
const names = users.map((user) => user.name);
const active = users.filter((user) => user.isActive);

// GOOD: Named function declarations for exports
export async function createUser(data) {
  const validated = validateInput(data);
  return db.insert('users', validated);
}

// GOOD: Object method shorthand
const service = {
  async getUser(id) {
    return db.findById('users', id);
  },
  formatName(first, last) {
    return `${first} ${last}`;
  },
};

// BAD: function keyword in callbacks
items.sort(function (a, b) { return a.name.localeCompare(b.name); });

// BAD: Arrow function for complex multi-line exports (prefer named function)
export const createUser = async (data) => {
  // 30 lines of logic...
};
```

**Checklist:**

- [ ] Configure eslint rule `prefer-arrow-callback: error`
- [ ] Configure eslint rule `object-shorthand: error`
- [ ] Use arrow functions for all callbacks and inline expressions
- [ ] Use named `function` declarations for exported functions
- [ ] Use method shorthand in object literals
- [ ] Always include parentheses around arrow function parameters

## 1.3 Template Literals

Use template literals for string interpolation and multiline strings.

```javascript
// GOOD: Template literals for interpolation
const greeting = `Hello, ${user.name}!`;
const url = `${baseUrl}/api/v${version}/users/${userId}`;
const message = `Order ${orderId} has ${itemCount} items totalling $${total}`;

// GOOD: Template literals for multiline
const html = `
  <div class="card">
    <h2>${title}</h2>
    <p>${description}</p>
  </div>
`;

// BAD: String concatenation
const greeting = 'Hello, ' + user.name + '!';
const url = baseUrl + '/api/v' + version + '/users/' + userId;

// BAD: Multiline with concatenation
const html = '<div class="card">\n' +
  '  <h2>' + title + '</h2>\n' +
  '</div>';
```

**Checklist:**

- [ ] Configure eslint rule `prefer-template: error`
- [ ] Convert all string concatenation to template literals
- [ ] Use template literals for multiline strings
- [ ] Exception: static strings with no interpolation can use single quotes

## 1.4 ES Module Imports

Use ES Module syntax exclusively. Never use CommonJS `require()`.

```javascript
// GOOD: Named imports
import { readFile, writeFile } from 'node:fs/promises';
import { z } from 'zod';

// GOOD: Default imports (when package exports default)
import express from 'express';

// GOOD: Namespace import (when many exports needed)
import * as path from 'node:path';

// GOOD: Import ordering (builtins → external → internal → relative)
import { readFile } from 'node:fs/promises';    // 1. Node.js builtins
import { join } from 'node:path';

import express from 'express';                   // 2. External packages
import { z } from 'zod';

import { config } from '#config';                // 3. Internal aliases
import { logger } from '#shared/utils';

import { validate } from './validation.js';      // 4. Relative imports
import { UserModel } from './user.model.js';

// BAD: CommonJS
const fs = require('fs');
const { z } = require('zod');
module.exports = { handler };
```

**Checklist:**

- [ ] Set `"type": "module"` in `package.json`
- [ ] Use `node:` prefix for Node.js built-in imports
- [ ] Always include `.js` extension in relative imports
- [ ] Configure import ordering with blank lines between groups
- [ ] Configure eslint `import/order` rule
- [ ] Never use `require()` in source code

## 1.5 Destructuring and Spread

Use destructuring for cleaner access and spread for immutable operations.

```javascript
// GOOD: Parameter destructuring
export function createUser({ name, email, role = 'user' }) {
  return { id: generateId(), name, email, role };
}

// GOOD: Spread for shallow cloning and merging
const updated = { ...user, name: 'New Name' };
const merged = { ...defaults, ...overrides };
const copy = [...items];
const combined = [...listA, ...listB];

// GOOD: Rest parameters
export function log(message, ...args) {
  console.log(`[${new Date().toISOString()}] ${message}`, ...args);
}

// BAD: Manual property access
function createUser(options) {
  const name = options.name;
  const email = options.email;
  const role = options.role || 'user';
}

// BAD: Object.assign for simple merging
const updated = Object.assign({}, user, { name: 'New Name' });

// BAD: arguments object
function log() {
  console.log.apply(console, arguments);
}
```

**Checklist:**

- [ ] Configure eslint rule `prefer-rest-params: error`
- [ ] Configure eslint rule `prefer-spread: error`
- [ ] Use destructuring for function parameters with 2+ properties
- [ ] Use spread for object/array cloning (no `Object.assign`)
- [ ] Use rest parameters instead of `arguments`

## 1.6 File and Naming Conventions

Establish consistent naming across the project.

```text
# File naming: kebab-case with purpose suffix
user-service.js           # service module
user-service.test.js      # test file
order.controller.js       # HTTP handler
order.model.js            # data model
auth.middleware.js         # middleware
validation.constants.js   # constants
app-error.js              # shared class

# Directory naming: kebab-case
src/
├── features/             # plural for collections
│   ├── user-auth/        # kebab-case feature name
│   └── order-management/
├── shared/
│   ├── errors/
│   └── utils/
└── config/               # singular for categories
```

```javascript
// Naming conventions in code:
// Functions: camelCase, verb-first
export function getUserById(id) {}
export function validateInput(data) {}
export async function sendNotification(userId, message) {}

// Constants: UPPER_SNAKE_CASE
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_TIMEOUT_MS = 5000;

// Classes: PascalCase
export class ValidationError extends Error {}
export class UserService {}

// Booleans: prefix with is, has, should, can
const isActive = user.status === 'active';
const hasPermission = roles.includes('admin');
const shouldRetry = attempts < MAX_RETRIES;
```

**Checklist:**

- [ ] Use kebab-case for all file and directory names
- [ ] Use purpose suffixes: `.service.js`, `.test.js`, `.controller.js`
- [ ] Use camelCase for functions and variables
- [ ] Use UPPER_SNAKE_CASE for constants
- [ ] Use PascalCase for classes
- [ ] Use `is`/`has`/`should`/`can` prefixes for boolean variables
- [ ] Document naming conventions in project README or CONTRIBUTING.md
