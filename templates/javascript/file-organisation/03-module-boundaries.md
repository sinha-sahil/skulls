# Phase 3: Module Boundaries

**Dependencies:** Phase 1 (Assessment)

**Can be implemented in parallel with:** Phases 2, 4, 5

## 3.1 Module Identification

Define each module's responsibility and public API surface.

```javascript
// Each module directory MUST have an index.js barrel file
// that explicitly defines its public API:

// src/features/auth/index.js
export { authenticate } from './auth.service.js';
export { authMiddleware } from './auth.middleware.js';
export { AuthError } from './auth.errors.js';

// Internal implementation details are NOT exported:
// - auth.repository.js (internal)
// - auth.helpers.js (internal)
// - auth.constants.js (internal)
```

**Checklist:**

- [ ] List every module in `{{SRC_ROOT}}`
- [ ] Define each module's single responsibility
- [ ] Identify which functions/classes are public vs internal
- [ ] Create barrel file (`index.js`) export list for each module
- [ ] Flag any module that has more than one responsibility (split candidate)

## 3.2 Public API Contracts

Define what each module exposes to consumers.

```javascript
// GOOD: Explicit, minimal public API
// src/features/orders/index.js
export { createOrder } from './orders.service.js';
export { getOrderById, listOrders } from './orders.service.js';
export { OrderStatus } from './orders.constants.js';

// BAD: Re-exporting everything (leaky abstraction)
export * from './orders.service.js';
export * from './orders.repository.js';
export * from './orders.helpers.js';
```

```javascript
// Module consumers should ONLY import from the barrel:

// GOOD:
import { createOrder, OrderStatus } from '#features/orders';

// BAD: Reaching into module internals
import { buildOrderQuery } from '#features/orders/orders.repository.js';
```

**Checklist:**

- [ ] Define named exports for each module barrel file
- [ ] Avoid `export *` — prefer explicit named re-exports
- [ ] Document which modules can depend on which other modules
- [ ] Verify no external code imports module internals directly
- [ ] Add eslint rule `no-restricted-imports` for internal paths

## 3.3 Shared Module Boundaries

Define rules for shared/common code.

```javascript
// src/shared/ should contain ONLY truly cross-cutting code:
// ✓ Generic utilities (date formatting, string helpers)
// ✓ Common error classes
// ✓ Shared middleware
// ✓ Configuration loading

// src/shared/ should NOT contain:
// ✗ Business logic
// ✗ Feature-specific helpers
// ✗ Code used by only one module (move it into that module)
```

**Checklist:**

- [ ] Audit `shared/` for code used by only one module (move it)
- [ ] Define criteria for what belongs in `shared/`
- [ ] Ensure shared code has no dependencies on feature modules
- [ ] Define maximum size guidelines for shared utilities
- [ ] Create barrel exports for each shared sub-directory

## 3.4 Module Isolation Rules

Establish rules that prevent unwanted coupling.

```javascript
// Define a dependency matrix:
// features/auth    → shared/utils, shared/errors
// features/orders  → shared/utils, shared/errors, features/auth
// features/billing → shared/utils, features/orders
// shared/*         → NO feature imports allowed

// Enforce with eslint import/no-restricted-paths:
// or with package.json "imports" field limiting what can be resolved
```

**Checklist:**

- [ ] Create a module dependency matrix
- [ ] Ensure no circular dependencies between feature modules
- [ ] Ensure `shared/` never imports from `features/`
- [ ] Configure eslint rules to enforce boundaries
- [ ] Document allowed and forbidden dependency directions
