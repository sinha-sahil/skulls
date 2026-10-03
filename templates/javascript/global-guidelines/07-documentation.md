# Phase 7: Documentation

**Dependencies:** Phase 2 (Type System)

**Can be implemented in parallel with:** Phase 5 (Performance), Phase 6 (Security)

## 7.1 JSDoc Standards

Define consistent JSDoc documentation for all public APIs.

```javascript
// REQUIRED: Every exported function must have JSDoc

/**
 * Process an order by validating, charging, and fulfilling it.
 *
 * This function orchestrates the complete order lifecycle. It validates
 * the order data, charges the payment method, and initiates fulfilment.
 * Partial failures (e.g., payment succeeds but fulfilment fails) are
 * handled by the compensation logic in the order saga.
 *
 * @param {string} orderId - Unique order identifier
 * @param {ProcessOptions} [options] - Processing configuration
 * @param {boolean} [options.dryRun=false] - Simulate without side effects
 * @param {boolean} [options.notifyCustomer=true] - Send confirmation email
 * @returns {Promise<OrderResult>} The processed order with fulfilment status
 * @throws {NotFoundError} If the order does not exist
 * @throws {ValidationError} If the order data is invalid
 * @throws {PaymentError} If the payment charge fails
 *
 * @example
 * const result = await processOrder('order-123');
 * console.log(result.status); // 'fulfilled'
 *
 * @example
 * // Dry run mode for testing
 * const result = await processOrder('order-123', { dryRun: true });
 * console.log(result.status); // 'simulated'
 */
export async function processOrder(orderId, options = {}) {
  // implementation
}
```

```javascript
// JSDoc for constants and configuration

/**
 * Maximum number of retry attempts for transient failures.
 * @type {number}
 */
export const MAX_RETRIES = 3;

/**
 * Default pagination page size.
 * @type {number}
 */
export const DEFAULT_PAGE_SIZE = 25;

/**
 * Order status values.
 * @readonly
 * @enum {string}
 */
export const OrderStatus = Object.freeze({
  /** Order has been created but not yet processed */
  PENDING: 'pending',
  /** Payment has been captured */
  CONFIRMED: 'confirmed',
  /** Items have been shipped */
  SHIPPED: 'shipped',
  /** Customer has received the order */
  DELIVERED: 'delivered',
  /** Order was cancelled */
  CANCELLED: 'cancelled',
});
```

**Checklist:**

- [ ] Every exported function has `@param`, `@returns`, and `@throws`
- [ ] Complex functions include a description paragraph
- [ ] Add `@example` for functions with non-obvious usage
- [ ] Document constants with `@type` and a description
- [ ] Document enum-like objects with `@enum` and per-value descriptions
- [ ] Run `eslint` with `jsdoc/require-jsdoc` to enforce coverage

## 7.2 Type Definition Documentation

Document all custom type definitions.

```javascript
// Place in types.js or at the top of the module that owns the type

/**
 * Represents a user account in the system.
 *
 * @typedef {Object} User
 * @property {string} id - Unique identifier (UUID v4)
 * @property {string} name - Display name (1-100 characters)
 * @property {string} email - Email address (unique, lowercase)
 * @property {UserRole} role - Authorization role
 * @property {Date} createdAt - Account creation timestamp
 * @property {Date | null} lastLoginAt - Last successful login, null if never
 */

/**
 * Valid user roles in ascending order of privileges.
 *
 * - `guest`: Read-only access to public resources
 * - `user`: Standard authenticated access
 * - `editor`: Can create and modify content
 * - `admin`: Full system access
 *
 * @typedef {'guest' | 'user' | 'editor' | 'admin'} UserRole
 */

/**
 * Input for creating a new user account.
 *
 * @typedef {Object} CreateUserInput
 * @property {string} name - Display name (required, 1-100 chars)
 * @property {string} email - Email address (required, must be unique)
 * @property {UserRole} [role='user'] - Initial role (defaults to 'user')
 * @property {string} [bio] - Optional biography (max 500 chars)
 */

/**
 * Paginated query result.
 *
 * @template T
 * @typedef {Object} PaginatedResult
 * @property {T[]} items - The current page of results
 * @property {number} total - Total items across all pages
 * @property {number} page - Current page number (1-indexed)
 * @property {number} pageSize - Maximum items per page
 * @property {boolean} hasMore - Whether additional pages exist
 */
```

**Checklist:**

- [ ] Create `@typedef` for every domain entity
- [ ] Include property descriptions with constraints (length, format)
- [ ] Document nullable fields explicitly with `| null`
- [ ] Document optional fields with `[property]` syntax
- [ ] Document default values for optional fields
- [ ] Use `@template` for generic/reusable type definitions

## 7.3 README Conventions

Structure project README files consistently.

```markdown
# {{PROJECT_NAME}}

One-sentence description of what this project does.

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Run development server
npm run dev
\`\`\`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run eslint |
| `npm run build` | Build for production |

## Project Structure

\`\`\`text
src/
├── features/        # Feature modules
│   ├── auth/        # Authentication
│   └── orders/      # Order management
├── shared/          # Shared utilities and errors
├── config/          # Configuration loading
└── index.js         # Application entry point
\`\`\`

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `API_KEY` | Yes | — | External API key |
| `LOG_LEVEL` | No | `info` | Logging level |

## API Documentation

See [docs/api.md](docs/api.md) for API endpoint documentation.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.
```

**Checklist:**

- [ ] Include a clear one-sentence project description
- [ ] Include Quick Start section with copy-paste commands
- [ ] Document all npm scripts in a table
- [ ] Include project structure overview
- [ ] Document all environment variables with required/default
- [ ] Link to API documentation and contributing guide
- [ ] Keep README up-to-date when project structure changes

## 7.4 Inline Documentation Rules

Write code comments that explain WHY, not WHAT.

```javascript
// GOOD: Explains WHY — the reasoning behind a non-obvious choice
// Use setTimeout instead of setInterval to prevent overlap
// when handler execution exceeds the interval period.
function startPolling(handler, intervalMs) {
  async function poll() {
    await handler();
    setTimeout(poll, intervalMs);
  }
  poll();
}

// GOOD: Documents a known limitation or trade-off
// NOTE: This query does a full table scan on orders > 1M rows.
// Acceptable for admin dashboard (low traffic), but needs an index
// if used in customer-facing endpoints. See: JIRA-1234
const recentOrders = await db.query(
  'SELECT * FROM orders WHERE created_at > ? ORDER BY created_at DESC',
  [thirtyDaysAgo],
);

// GOOD: Explains a workaround with reference
// HACK: Express 4 does not catch async errors automatically.
// Remove this wrapper when migrating to Express 5 (which handles promises).
// See: https://expressjs.com/en/guide/error-handling.html
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// BAD: Restates the code (adds no value)
// Increment the counter
counter++;

// Get the user by ID
const user = await getUserById(id);

// Check if user exists
if (!user) {
  throw new NotFoundError('User', id);
}
```

```javascript
// Use TODO/FIXME/HACK/NOTE prefixes for actionable comments:

// TODO: Replace with WebSocket push when real-time requirements are confirmed
// FIXME: Race condition when two requests update the same order simultaneously
// HACK: Workaround for bug in library v3.2.1, remove after upgrade to v4
// NOTE: This function is intentionally synchronous for startup performance
```

**Checklist:**

- [ ] Comment WHY, not WHAT — code should be self-explanatory
- [ ] Use `TODO:` for planned improvements
- [ ] Use `FIXME:` for known bugs
- [ ] Use `HACK:` for workarounds (include link to issue/ticket)
- [ ] Use `NOTE:` for important context or non-obvious decisions
- [ ] Remove stale comments during code review
- [ ] Never comment out code — delete it (git has history)

## 7.5 API Documentation

Document HTTP APIs with consistent structure.

```javascript
// Document API endpoints in source code with JSDoc

/**
 * @api {get} /api/users/:id Get User
 * @description Retrieve a user by their unique identifier.
 *
 * @param {string} id - User ID (UUID v4)
 *
 * @returns {200} User object
 * @returns {404} User not found
 * @returns {401} Not authenticated
 *
 * @example Request
 * GET /api/users/550e8400-e29b-41d4-a716-446655440000
 *
 * @example Response 200
 * {
 *   "id": "550e8400-e29b-41d4-a716-446655440000",
 *   "name": "Alice",
 *   "email": "alice@example.com",
 *   "role": "user",
 *   "createdAt": "2024-01-15T10:30:00Z"
 * }
 *
 * @example Response 404
 * {
 *   "error": "NotFoundError",
 *   "message": "User not found: 550e8400-e29b-41d4-a716-446655440000"
 * }
 */
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  res.json(user);
}));
```

```javascript
// Alternative: OpenAPI/Swagger specification
// docs/openapi.yaml or generated from code annotations

// For programmatic API docs, consider:
// - swagger-jsdoc: Generate OpenAPI from JSDoc annotations
// - redocly: Generate documentation site from OpenAPI spec
// - express-openapi-validator: Validate requests/responses against spec
```

**Checklist:**

- [ ] Document every API endpoint: method, path, params, responses
- [ ] Include request and response examples
- [ ] Document error response formats
- [ ] Document authentication requirements per endpoint
- [ ] Document rate limiting headers
- [ ] Keep API documentation in sync with implementation
- [ ] Consider OpenAPI spec for machine-readable API documentation

## 7.6 Module Documentation

Document module-level concerns at the top of each file.

```javascript
/**
 * @module order-service
 *
 * Handles order lifecycle operations: creation, processing, fulfilment,
 * and cancellation. Coordinates between the payment gateway, inventory
 * system, and notification service.
 *
 * @requires #features/auth - For permission checks
 * @requires #shared/errors - For custom error classes
 * @requires #shared/utils/logger - For structured logging
 *
 * @see {@link ./orders.model.js} for data model definitions
 * @see {@link ../auth/index.js} for authentication context
 */

import { requireAuth } from '#features/auth';
import { NotFoundError, ValidationError } from '#shared/errors';
import { logger } from '#shared/utils/logger.js';

// ... module implementation
```

```javascript
// Barrel file documentation
/**
 * @module auth
 *
 * Public API for the authentication feature.
 * All auth-related functionality should be imported from this barrel file.
 *
 * @example
 * import { authenticate, requireAuth, AuthError } from '#features/auth';
 */
export { authenticate, logout } from './auth.service.js';
export { requireAuth, requireRole } from './auth.middleware.js';
export { AuthError, TokenExpiredError } from './auth.errors.js';
```

**Checklist:**

- [ ] Add `@module` documentation to feature entry points
- [ ] Document module dependencies with `@requires`
- [ ] Link related modules with `@see`
- [ ] Document barrel files with usage examples
- [ ] Include module-level `@example` for complex APIs
- [ ] Keep module documentation updated when adding/removing exports
