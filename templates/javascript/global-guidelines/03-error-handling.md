# Phase 3: Error Handling

**Dependencies:** Phase 1 (Code Style)

**Can be implemented in parallel with:** Phase 4 (Testing)

## 3.1 Custom Error Classes

Define a structured error hierarchy for consistent error handling.

```javascript
// src/shared/errors/app-error.js

/**
 * Base application error. All custom errors should extend this.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {number} [statusCode=500] - HTTP status code
   * @param {Object} [context] - Additional error context
   */
  constructor(message, statusCode = 500, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.context = context;
    this.isOperational = true; // Distinguishes expected errors from bugs
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      statusCode: this.statusCode,
      ...(Object.keys(this.context).length > 0 && { context: this.context }),
    };
  }
}

export class ValidationError extends AppError {
  /**
   * @param {string} field - The field that failed validation
   * @param {string} reason - Why validation failed
   */
  constructor(field, reason) {
    super(`Validation failed for '${field}': ${reason}`, 400, { field, reason });
  }
}

export class NotFoundError extends AppError {
  /**
   * @param {string} resource - The resource type
   * @param {string} id - The resource identifier
   */
  constructor(resource, id) {
    super(`${resource} not found: ${id}`, 404, { resource, id });
  }
}

export class ConflictError extends AppError {
  /**
   * @param {string} resource
   * @param {string} field
   * @param {string} value
   */
  constructor(resource, field, value) {
    super(`${resource} with ${field} '${value}' already exists`, 409, {
      resource, field, value,
    });
  }
}

export class UnauthorizedError extends AppError {
  /** @param {string} [reason='Authentication required'] */
  constructor(reason = 'Authentication required') {
    super(reason, 401);
  }
}

export class ForbiddenError extends AppError {
  /** @param {string} [reason='Insufficient permissions'] */
  constructor(reason = 'Insufficient permissions') {
    super(reason, 403);
  }
}
```

**Checklist:**

- [ ] Create `AppError` base class with `statusCode`, `context`, and `toJSON()`
- [ ] Create subclasses for each error category (Validation, NotFound, Conflict, etc.)
- [ ] Add `isOperational` flag to distinguish expected errors from bugs
- [ ] Always throw `Error` instances, never strings or plain objects
- [ ] Export all error classes from a barrel file: `src/shared/errors/index.js`
- [ ] Configure eslint rule `no-throw-literal: error`

## 3.2 Try/Catch Patterns

Use try/catch with consistent patterns across the codebase.

```javascript
// GOOD: Specific error handling at service boundaries
export async function getUser(id) {
  try {
    const user = await db.findById('users', id);
    if (!user) {
      throw new NotFoundError('User', id);
    }
    return user;
  } catch (err) {
    if (err instanceof AppError) {
      throw err; // Re-throw known application errors
    }
    // Wrap unknown errors
    throw new AppError(`Failed to fetch user: ${err.message}`, 500, {
      originalError: err.name,
      userId: id,
    });
  }
}

// GOOD: Narrow try blocks — only wrap the code that can throw
export async function processPayment(orderId, amount) {
  const order = await getOrder(orderId); // Let errors propagate

  let paymentResult;
  try {
    paymentResult = await paymentGateway.charge(amount);
  } catch (err) {
    logger.error('Payment gateway failure', { orderId, amount, error: err.message });
    throw new AppError('Payment processing failed', 502, { orderId });
  }

  await updateOrderStatus(orderId, 'paid'); // Let errors propagate
  return paymentResult;
}

// BAD: Overly broad try/catch
try {
  const user = await getUser(id);
  const orders = await getOrders(user.id);
  const total = calculateTotal(orders);
  await sendReceipt(user.email, total);
} catch (err) {
  console.error(err); // Which operation failed? No idea.
}

// BAD: Empty catch block — hides bugs
try {
  JSON.parse(data);
} catch (e) {
  // silently swallowed
}
```

**Checklist:**

- [ ] Keep try blocks narrow — wrap only the code that can throw
- [ ] Handle specific error types with `instanceof` checks
- [ ] Re-throw known application errors without wrapping
- [ ] Wrap unknown errors in `AppError` with context
- [ ] Never use empty catch blocks
- [ ] Configure eslint rule `no-empty: ["error", { allowEmptyCatch: false }]`

## 3.3 Async Error Handling

Handle errors correctly in asynchronous code.

```javascript
// GOOD: async/await with try/catch
export async function fetchAndProcess(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new AppError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }
    return await response.json();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(`Network request failed: ${err.message}`, 503);
  }
}

// GOOD: Parallel async with error handling
export async function fetchUserData(userId) {
  const results = await Promise.allSettled([
    fetchProfile(userId),
    fetchOrders(userId),
    fetchPreferences(userId),
  ]);

  const [profile, orders, preferences] = results;

  if (profile.status === 'rejected') {
    throw new AppError('Failed to load user profile', 500);
  }

  return {
    profile: profile.value,
    orders: orders.status === 'fulfilled' ? orders.value : [],
    preferences: preferences.status === 'fulfilled' ? preferences.value : {},
  };
}

// GOOD: Global unhandled rejection handler (entry point only)
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  // Graceful shutdown in production
  process.exit(1);
});

// BAD: Fire-and-forget async without error handling
app.get('/users', (req, res) => {
  processData(req.body); // If this rejects, error is lost
  res.send('ok');
});

// GOOD: Await or handle the promise
app.get('/users', async (req, res, next) => {
  try {
    await processData(req.body);
    res.send('ok');
  } catch (err) {
    next(err);
  }
});
```

**Checklist:**

- [ ] Always `await` or `.catch()` promises — never fire-and-forget
- [ ] Use `Promise.allSettled()` when partial failures are acceptable
- [ ] Use `Promise.all()` when all operations must succeed
- [ ] Add `process.on('unhandledRejection')` handler in entry point
- [ ] Add `process.on('uncaughtException')` handler for graceful shutdown
- [ ] Wrap Express/Koa route handlers with async error forwarding

## 3.4 Promise Rejection Handling

Handle promise rejections consistently.

```javascript
// Pattern: Async wrapper for Express routes
/**
 * Wraps an async route handler to forward errors to Express error middleware.
 *
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>} fn
 * @returns {import('express').RequestHandler}
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage:
import { asyncHandler } from '#shared/utils/async-handler.js';

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await getUser(req.params.id);
  res.json(user);
}));

// Pattern: Centralised error middleware
/**
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError && err.isOperational) {
    logger.warn('Operational error', { error: err.toJSON(), path: req.path });
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Unexpected error — log full details, send generic response
  logger.error('Unexpected error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
  });
}
```

**Checklist:**

- [ ] Create `asyncHandler` wrapper for Express/Koa routes
- [ ] Create centralised error handler middleware
- [ ] Distinguish operational errors from programming bugs
- [ ] Log full error details server-side, send safe responses to clients
- [ ] Never expose stack traces or internal details to clients
- [ ] Test error handling paths explicitly

## 3.5 Error Logging Standards

Log errors consistently with structured data.

```javascript
// GOOD: Structured error logging with context
import { logger } from '#shared/utils/logger.js';

export async function deleteUser(userId, requestedBy) {
  try {
    const user = await getUserById(userId);
    await db.delete('users', userId);
    logger.info('User deleted', { userId, requestedBy });
  } catch (err) {
    logger.error('Failed to delete user', {
      userId,
      requestedBy,
      error: err.message,
      errorName: err.name,
      stack: err.stack,
    });
    throw err;
  }
}

// BAD: console.log for error logging
console.log('Error:', err);
console.error('Something went wrong', err.message);

// BAD: Logging without context
logger.error(err.message); // Which user? Which operation?
```

```javascript
// Logger interface recommendation:
// Use a structured logger (pino, winston) that outputs JSON in production.

// src/shared/utils/logger.js
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : undefined,
});
```

**Checklist:**

- [ ] Use a structured logger (pino or winston), not `console.log`
- [ ] Include context in every log message (user, resource, operation)
- [ ] Log at appropriate levels: `error`, `warn`, `info`, `debug`
- [ ] Configure eslint rule `no-console: ["warn", { allow: ["warn", "error"] }]`
- [ ] Never log sensitive data (passwords, tokens, PII)
- [ ] Include request ID in logs for tracing
