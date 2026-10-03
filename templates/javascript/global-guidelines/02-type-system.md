# Phase 2: Type System

**Dependencies:** None

**Can be implemented in parallel with:** Phase 1 (Code Style)

## 2.1 JSDoc Type Annotations

JavaScript has no built-in static type system. Use JSDoc comments for type safety with editor tooling and optional `// @ts-check`.

```javascript
// Enable TypeScript-powered type checking in plain JS files:
// @ts-check

/**
 * Create a new user account.
 *
 * @param {string} name - Display name for the user
 * @param {string} email - Email address (must be valid)
 * @param {Object} [options] - Optional configuration
 * @param {string} [options.role='user'] - User role
 * @param {boolean} [options.sendWelcome=true] - Send welcome email
 * @returns {Promise<User>} The created user object
 * @throws {ValidationError} If email is invalid
 * @throws {ConflictError} If email already exists
 */
export async function createUser(name, email, options = {}) {
  const { role = 'user', sendWelcome = true } = options;
  // implementation
}

/**
 * Calculate the total price including tax.
 *
 * @param {number} subtotal - Pre-tax amount
 * @param {number} taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns {number} Total amount rounded to 2 decimal places
 */
export function calculateTotal(subtotal, taxRate) {
  return Math.round((subtotal * (1 + taxRate)) * 100) / 100;
}
```

**Checklist:**

- [ ] Add `@param` for every function parameter
- [ ] Add `@returns` for every function return value
- [ ] Add `@throws` for functions that throw known errors
- [ ] Use `[param]` syntax for optional parameters
- [ ] Use `[param=default]` to document default values
- [ ] Configure eslint `jsdoc/require-jsdoc` for exported functions

## 2.2 Type Definitions with @typedef

Define reusable types for domain objects.

```javascript
/**
 * @typedef {Object} User
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} email - Email address
 * @property {UserRole} role - User's role in the system
 * @property {Date} createdAt - Account creation timestamp
 * @property {Date | null} lastLoginAt - Last login timestamp
 */

/**
 * @typedef {'admin' | 'editor' | 'user' | 'guest'} UserRole
 */

/**
 * @typedef {Object} PaginatedResult
 * @property {Array<T>} items - Page of results
 * @property {number} total - Total number of items
 * @property {number} page - Current page number
 * @property {number} pageSize - Items per page
 * @property {boolean} hasMore - Whether more pages exist
 * @template T
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} ok - Whether the request succeeded
 * @property {T} [data] - Response data (present when ok is true)
 * @property {ApiError} [error] - Error details (present when ok is false)
 * @template T
 */

/**
 * @typedef {Object} ApiError
 * @property {string} code - Machine-readable error code
 * @property {string} message - Human-readable error message
 * @property {Object} [details] - Additional error context
 */
```

```javascript
// Using @typedef in function signatures:

/**
 * @param {string} id
 * @returns {Promise<User | null>}
 */
export async function getUserById(id) {
  return db.findOne('users', { id });
}

/**
 * @param {{ page?: number, pageSize?: number }} query
 * @returns {Promise<PaginatedResult<User>>}
 */
export async function listUsers(query = {}) {
  const { page = 1, pageSize = 25 } = query;
  // implementation
}
```

**Checklist:**

- [ ] Create `@typedef` for every domain entity (User, Order, Product, etc.)
- [ ] Use union types for enums (`'a' | 'b' | 'c'`)
- [ ] Use `@template` for generic/reusable types
- [ ] Place type definitions in a dedicated `types.js` file or at module top
- [ ] Use `| null` explicitly for nullable fields
- [ ] Import types with `@type {import('./types.js').User}` when needed

## 2.3 Advanced JSDoc Patterns

Use advanced JSDoc features for complex type scenarios.

```javascript
// Generic functions with @template
/**
 * @template T
 * @param {T[]} items
 * @param {(item: T) => string} keyFn
 * @returns {Map<string, T[]>}
 */
export function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    const group = map.get(key) ?? [];
    group.push(item);
    map.set(key, group);
  }
  return map;
}

// Type casting / assertion
const input = /** @type {HTMLInputElement} */ (document.getElementById('email'));

// Importing types from other files
/** @typedef {import('./user.model.js').User} User */
/** @typedef {import('./errors.js').AppError} AppError */

// Callback type definitions
/**
 * @callback EventHandler
 * @param {string} eventName
 * @param {Object} payload
 * @returns {void}
 */

/**
 * @param {string} event
 * @param {EventHandler} handler
 */
export function on(event, handler) {
  // implementation
}

// Enum-like patterns with JSDoc
/**
 * @readonly
 * @enum {string}
 */
export const LogLevel = Object.freeze({
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
});
```

**Checklist:**

- [ ] Use `@template` for generic utility functions
- [ ] Use `@callback` for reusable callback signatures
- [ ] Use `@enum` for Object.freeze enum patterns
- [ ] Use `@type {import(...)}` to import types across files
- [ ] Use `/** @type {T} */` for type assertions where needed
- [ ] Enable `// @ts-check` in critical files for editor type checking

## 2.4 Runtime Validation

JSDoc provides compile-time checking only. Add runtime validation for external input.

```javascript
// Pattern A: Manual validation with typeof / instanceof
/**
 * @param {unknown} input
 * @returns {string}
 */
export function ensureString(input) {
  if (typeof input !== 'string') {
    throw new ValidationError('input', `Expected string, got ${typeof input}`);
  }
  return input;
}

/**
 * @param {unknown} input
 * @returns {User}
 */
export function ensureUser(input) {
  if (input === null || typeof input !== 'object') {
    throw new ValidationError('user', 'Expected object');
  }
  if (typeof input.id !== 'string') {
    throw new ValidationError('user.id', 'Expected string');
  }
  if (typeof input.email !== 'string') {
    throw new ValidationError('user.email', 'Expected string');
  }
  return /** @type {User} */ (input);
}


// Pattern B: Schema validation with zod (recommended for complex inputs)
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'user']).default('user'),
});

/** @typedef {z.infer<typeof CreateUserSchema>} CreateUserInput */

/**
 * @param {unknown} input
 * @returns {CreateUserInput}
 */
export function validateCreateUser(input) {
  return CreateUserSchema.parse(input);
}


// Pattern C: Guard functions for narrowing
/**
 * @param {unknown} value
 * @returns {value is string}
 */
export function isString(value) {
  return typeof value === 'string';
}

/**
 * @param {unknown} value
 * @returns {value is NonNullable<unknown>}
 */
export function isDefined(value) {
  return value !== null && value !== undefined;
}
```

**Checklist:**

- [ ] Validate all external input (API requests, file reads, env vars)
- [ ] Use `typeof` checks for primitive types
- [ ] Use `instanceof` for class instances
- [ ] Use `Array.isArray()` for array checks
- [ ] Consider zod or similar for complex schema validation
- [ ] Trust internal function calls (JSDoc is sufficient between modules)
- [ ] Never trust data crossing trust boundaries (user input, API responses)

## 2.5 Type Safety Configuration

Configure tooling to enforce type safety.

```javascript
// jsconfig.json — enable TypeScript checking for JS files
// {
//   "compilerOptions": {
//     "checkJs": true,
//     "strict": true,
//     "module": "es2022",
//     "moduleResolution": "node16",
//     "target": "es2022",
//     "paths": {
//       "#shared/*": ["./src/shared/*"],
//       "#features/*": ["./src/features/*"],
//       "#config": ["./src/config/index.js"]
//     }
//   },
//   "include": ["src/**/*.js"],
//   "exclude": ["node_modules", "dist"]
// }
```

```javascript
// eslint.config.js — JSDoc enforcement rules
import jsdoc from 'eslint-plugin-jsdoc';

export default [
  jsdoc.configs['flat/recommended'],
  {
    rules: {
      'jsdoc/require-jsdoc': ['warn', {
        require: { FunctionDeclaration: true, MethodDefinition: true },
        publicOnly: true,
      }],
      'jsdoc/require-param-type': 'error',
      'jsdoc/require-returns-type': 'error',
      'jsdoc/check-types': 'error',
      'jsdoc/no-undefined-types': 'warn',
    },
  },
];
```

**Checklist:**

- [ ] Create `jsconfig.json` with `checkJs: true` and `strict: true`
- [ ] Install `eslint-plugin-jsdoc`
- [ ] Configure JSDoc eslint rules
- [ ] Add `// @ts-check` to critical source files
- [ ] Configure path aliases in `jsconfig.json` to match `package.json` imports
- [ ] Run `npx tsc --noEmit` periodically to check types across the project
