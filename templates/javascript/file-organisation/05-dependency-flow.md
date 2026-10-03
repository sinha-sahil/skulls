# Phase 5: Dependency Flow

**Dependencies:** Phase 1 (Assessment)

**Can be implemented in parallel with:** Phases 2, 3, 4

## 5.1 Dependency Direction Rules

Define the allowed import directions between layers.

```text
# Dependency flow MUST be a directed acyclic graph (DAG):

Entry Point (index.js)
    │
    ▼
Controllers / Routes
    │
    ▼
Services (business logic)
    │
    ▼
Repositories (data access)
    │
    ▼
Models / Types

Shared utilities ← imported by any layer
Config          ← imported by any layer

# NEVER: Repository → Controller (reverse direction)
# NEVER: Model → Service (reverse direction)
# NEVER: Circular: A → B → A
```

**Checklist:**

- [ ] Draw the dependency direction graph for the project
- [ ] Verify all imports follow the defined direction
- [ ] Identify and resolve any circular dependencies
- [ ] Document which layers can import from which
- [ ] Ensure `shared/` has zero imports from feature modules

## 5.2 Circular Dependency Detection

Identify and resolve circular import patterns.

```javascript
// PROBLEM: Circular dependency
// user.service.js
import { sendNotification } from './notification.service.js';

// notification.service.js
import { getUserEmail } from './user.service.js';

// SOLUTION 1: Extract shared dependency
// user-email.repository.js (new file)
export function getUserEmail(userId) { /* ... */ }

// SOLUTION 2: Dependency injection
// notification.service.js
export function sendNotification(email, message) {
  // No longer depends on user.service.js
}

// SOLUTION 3: Event-based decoupling
// user.service.js
import { eventBus } from '#shared/events';
eventBus.emit('user:created', { userId, email });

// notification.service.js
import { eventBus } from '#shared/events';
eventBus.on('user:created', ({ email }) => {
  sendWelcomeEmail(email);
});
```

**Checklist:**

- [ ] Run a circular dependency detection tool (`madge --circular`)
- [ ] List all circular dependencies found
- [ ] Choose resolution strategy for each (extract, inject, or event)
- [ ] Verify resolution does not create new circular dependencies
- [ ] Add CI check to prevent future circular dependencies

## 5.3 External Dependency Management

Define rules for third-party dependency usage.

```javascript
// GOOD: Wrap external dependencies behind an internal interface
// src/shared/http-client.js
import ky from 'ky';

export async function httpGet(url, options) {
  return ky.get(url, options).json();
}

export async function httpPost(url, body, options) {
  return ky.post(url, { json: body, ...options }).json();
}

// Consumers import your wrapper, not the library:
import { httpGet } from '#shared/http-client';
```

**Checklist:**

- [ ] Identify external packages imported in more than 5 files
- [ ] Wrap frequently-used external packages behind internal interfaces
- [ ] Define a single location for each external package import
- [ ] Audit `package.json` for unused dependencies
- [ ] Separate `dependencies` from `devDependencies` correctly

## 5.4 Path Alias Strategy

Configure internal path resolution for cleaner imports.

```json
// package.json — Node.js subpath imports (recommended)
{
  "imports": {
    "#features/*": "./src/features/*",
    "#shared/*": "./src/shared/*",
    "#config": "./src/config/index.js"
  }
}
```

```javascript
// Before: fragile relative imports
import { logger } from '../../../shared/utils/logger.js';

// After: stable aliased imports
import { logger } from '#shared/utils/logger.js';
```

**Checklist:**

- [ ] Configure `imports` field in `package.json` for path aliases
- [ ] Replace deep relative imports (`../../..`) with aliases
- [ ] Update eslint config to understand path aliases
- [ ] Update test config to resolve path aliases
- [ ] Document all available path aliases in the project README

## 5.5 Dependency Graph Documentation

Create a visual or textual dependency map.

```text
# Example dependency graph for {{PROJECT_NAME}}:

features/auth
├── → shared/utils
├── → shared/errors
└── → shared/config

features/orders
├── → shared/utils
├── → shared/errors
├── → features/auth (authenticate only)
└── → shared/config

features/billing
├── → shared/utils
├── → features/orders (getOrder, OrderStatus only)
└── → shared/config

shared/utils    → (no internal dependencies)
shared/errors   → (no internal dependencies)
shared/config   → (no internal dependencies)
```

**Checklist:**

- [ ] Document dependency graph for every feature module
- [ ] Specify which exports are used (not just module-level)
- [ ] Verify graph matches actual code imports
- [ ] Flag any module with more than 5 dependencies (simplification candidate)
- [ ] Store dependency graph in project documentation
