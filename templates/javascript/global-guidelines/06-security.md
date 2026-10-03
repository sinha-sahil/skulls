# Phase 6: Security

**Dependencies:** Phase 3 (Error Handling)

**Can be implemented in parallel with:** Phase 5 (Performance), Phase 7 (Documentation)

## 6.1 Input Sanitisation

Validate and sanitise all external input before processing.

```javascript
// RULE: Never trust user input. Validate at the boundary.

import { z } from 'zod';

// Schema validation for API input
const CreateUserSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().max(254).toLowerCase(),
  role: z.enum(['user', 'editor']).default('user'),
  bio: z.string().max(500).optional(),
});

/**
 * @param {unknown} input - Raw request body
 * @returns {import('zod').infer<typeof CreateUserSchema>}
 */
export function validateCreateUser(input) {
  return CreateUserSchema.parse(input);
}

// Usage in route handler:
app.post('/users', asyncHandler(async (req, res) => {
  const data = validateCreateUser(req.body); // Throws ZodError if invalid
  const user = await createUser(data);
  res.status(201).json(user);
}));


// BAD: Using raw input without validation
app.post('/users', async (req, res) => {
  const user = await db.insert('users', req.body); // Accepts ANYTHING
  res.json(user);
});

// BAD: Trusting client-provided IDs
app.put('/users/:id', async (req, res) => {
  await db.update('users', req.params.id, { role: req.body.role }); // Privilege escalation
});
```

```javascript
// Sanitise output for different contexts

/**
 * Escape HTML entities to prevent XSS.
 *
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => map[char]);
}

// Use parameterised queries for SQL — NEVER interpolate
// BAD:
const query = `SELECT * FROM users WHERE id = '${userId}'`; // SQL injection!

// GOOD:
const rows = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

**Checklist:**

- [ ] Validate all API request bodies with a schema library (zod, joi)
- [ ] Validate URL parameters and query strings
- [ ] Trim and normalise string inputs
- [ ] Reject unexpected fields (use `.strict()` in zod)
- [ ] Use parameterised queries for ALL database operations
- [ ] Escape output for the target context (HTML, SQL, shell)

## 6.2 XSS Prevention

Prevent cross-site scripting in server-rendered content and APIs.

```javascript
// If rendering HTML on the server:

// BAD: Direct interpolation of user data into HTML
const html = `<h1>Welcome, ${userName}</h1>`;  // XSS if userName contains <script>

// GOOD: Escape before interpolation
const html = `<h1>Welcome, ${escapeHtml(userName)}</h1>`;

// BETTER: Use a templating engine with auto-escaping (EJS, Handlebars, Nunjucks)
// ejs: <%= userName %>  (auto-escaped)
// ejs: <%- rawHtml %>   (NOT escaped — avoid unless intentional)


// For APIs returning JSON, set correct headers:
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// Security headers
import helmet from 'helmet';
app.use(helmet());
// Sets: X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security,
//       Content-Security-Policy, X-XSS-Protection, etc.


// Content Security Policy for web applications
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    frameAncestors: ["'none'"],
  },
}));
```

**Checklist:**

- [ ] Never interpolate user data into HTML without escaping
- [ ] Use a templating engine with auto-escaping for server-rendered pages
- [ ] Set `Content-Type: application/json` for API responses
- [ ] Use `helmet` middleware for security headers
- [ ] Configure Content Security Policy for web applications
- [ ] Set `X-Content-Type-Options: nosniff` on all responses

## 6.3 Prototype Pollution Prevention

Protect against object prototype manipulation attacks.

```javascript
// Prototype pollution: Attacker modifies Object.prototype through input

// VULNERABLE: Recursive merge without safeguards
function merge(target, source) {
  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = target[key] || {};
      merge(target[key], source[key]); // __proto__ can be set here!
    } else {
      target[key] = source[key];
    }
  }
}

// Attack payload:
// { "__proto__": { "isAdmin": true } }
// After merge: ({}).isAdmin === true  ← affects ALL objects!


// FIX: Block dangerous keys
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * @param {Object} target
 * @param {Object} source
 * @returns {Object}
 */
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (BLOCKED_KEYS.has(key)) continue;

    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      target[key] = target[key] || Object.create(null);
      safeMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// FIX: Use Object.create(null) for dictionaries
const lookup = Object.create(null); // No prototype chain!
lookup['key'] = 'value';
// lookup.__proto__ is undefined — safe from pollution

// FIX: Use Map instead of plain objects for dynamic keys
const config = new Map();
config.set(userProvidedKey, userProvidedValue); // No prototype risk

// FIX: Freeze objects that should not be modified
const DEFAULTS = Object.freeze({
  role: 'user',
  permissions: Object.freeze(['read']),
});
```

**Checklist:**

- [ ] Never use recursive merge on user-provided data without key filtering
- [ ] Block `__proto__`, `constructor`, and `prototype` keys in merges
- [ ] Use `Object.create(null)` for dictionaries indexed by user input
- [ ] Use `Map` instead of plain objects for dynamic key-value storage
- [ ] Freeze configuration and default objects with `Object.freeze()`
- [ ] Configure eslint rule `no-prototype-builtins: error`
- [ ] Test with prototype pollution payloads: `{"__proto__": {"polluted": true}}`

## 6.4 Dependency Auditing

Regularly check for known vulnerabilities in dependencies.

```bash
# Run npm audit to check for known vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# View detailed report
npm audit --json

# Check for outdated packages
npm outdated
```

```json
// package.json — automate auditing
{
  "scripts": {
    "audit": "npm audit --audit-level=high",
    "audit:fix": "npm audit fix",
    "deps:check": "npm outdated",
    "deps:update": "npx npm-check-updates -u"
  }
}
```

```javascript
// Lockfile integrity: Always commit package-lock.json
// Use npm ci in CI/CD (installs from lockfile, fails on mismatch)

// Pin exact versions for critical dependencies:
// package.json:
// {
//   "dependencies": {
//     "express": "4.18.2"       ← exact pin (no ^ or ~)
//   }
// }

// Use npm overrides to force-fix transitive vulnerability:
// {
//   "overrides": {
//     "vulnerable-package": "2.0.1"
//   }
// }
```

**Checklist:**

- [ ] Run `npm audit` in CI — fail builds on high/critical vulnerabilities
- [ ] Run `npm outdated` monthly to check for updates
- [ ] Always commit `package-lock.json` (or `pnpm-lock.yaml`)
- [ ] Use `npm ci` in CI/CD (not `npm install`)
- [ ] Pin exact versions for security-critical dependencies
- [ ] Use `npm overrides` to patch transitive vulnerabilities
- [ ] Review new dependencies before adding (check maintainers, download count)

## 6.5 Secrets Management

Never hardcode secrets. Load them from the environment.

```javascript
// BAD: Hardcoded secrets
const API_KEY = 'sk_live_abc123def456';
const DB_PASSWORD = 'supersecret';

// GOOD: Environment variables
const API_KEY = process.env.API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;

// BETTER: Validate required env vars at startup
/**
 * @param {string} name
 * @returns {string}
 */
function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const config = Object.freeze({
  apiKey: requireEnv('API_KEY'),
  dbUrl: requireEnv('DATABASE_URL'),
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
});

export { config };
```

```text
# .env file (NEVER commit to git)
API_KEY=sk_live_abc123def456
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
JWT_SECRET=your-256-bit-secret

# .gitignore — ALWAYS include:
.env
.env.local
.env.*.local
*.pem
*.key
```

```javascript
// Use dotenv for local development only
// src/config/index.js
if (process.env.NODE_ENV !== 'production') {
  const { config: loadDotenv } = await import('dotenv');
  loadDotenv();
}
```

**Checklist:**

- [ ] Never hardcode secrets, API keys, or passwords in source code
- [ ] Load secrets from environment variables
- [ ] Validate all required env vars at startup (fail fast)
- [ ] Add `.env` to `.gitignore`
- [ ] Provide `.env.example` with placeholder values (no real secrets)
- [ ] Use different secrets for development, staging, and production
- [ ] Rotate secrets regularly and after any suspected compromise
- [ ] Run `git log --all -p -S 'password'` to check for leaked secrets in history

## 6.6 Rate Limiting and Abuse Prevention

Protect APIs from abuse and denial of service.

```javascript
// Basic rate limiting with express-rate-limit
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per window per IP
  standardHeaders: true,       // Return rate limit info in headers
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

app.use('/api/', apiLimiter);

// Stricter limits for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,  // Only 10 login attempts per 15 minutes
});

app.use('/api/auth/', authLimiter);


// Request body size limits
import express from 'express';

app.use(express.json({ limit: '100kb' }));  // Reject large payloads
app.use(express.urlencoded({ limit: '100kb', extended: true }));
```

**Checklist:**

- [ ] Add rate limiting to all API endpoints
- [ ] Use stricter limits for authentication endpoints
- [ ] Set request body size limits
- [ ] Log rate-limited requests for monitoring
- [ ] Use IP-based and user-based rate limiting where appropriate
- [ ] Consider using a reverse proxy (nginx) for production rate limiting
