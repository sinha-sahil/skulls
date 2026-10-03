# Phase 4: Naming Conventions

**Dependencies:** Phase 1 (Assessment)

**Can be implemented in parallel with:** Phases 2, 3, 5

## 4.1 File Naming

Establish consistent file naming rules.

```text
# Recommended: kebab-case for all files
user-service.js          ✓
user-service.test.js     ✓
UserService.js           ✗ (PascalCase for files)
user_service.js          ✗ (snake_case for files)

# Suffixes indicate file purpose:
{{MODULE_NAME}}.service.js       # Business logic
{{MODULE_NAME}}.controller.js    # HTTP handlers
{{MODULE_NAME}}.model.js         # Data models
{{MODULE_NAME}}.repository.js    # Data access
{{MODULE_NAME}}.middleware.js    # Express/Koa middleware
{{MODULE_NAME}}.validation.js   # Input validation
{{MODULE_NAME}}.test.js          # Test file
{{MODULE_NAME}}.constants.js     # Constants
{{MODULE_NAME}}.errors.js        # Custom error classes
```

**Checklist:**

- [ ] Choose file naming convention (kebab-case recommended)
- [ ] Define file suffix conventions for each file type
- [ ] Document barrel file naming (`index.js`)
- [ ] Define test file naming pattern (`*.test.js` or `*.spec.js`)
- [ ] Choose configuration file naming (e.g., `vitest.config.js`)

## 4.2 Directory Naming

Establish directory naming conventions.

```text
# Directories: kebab-case, plural for collections
src/
├── features/           # plural
│   ├── user-auth/      # kebab-case, descriptive
│   ├── order-management/
│   └── billing/
├── shared/
│   ├── utils/          # plural
│   ├── middleware/      # singular (category name)
│   └── errors/         # plural
└── config/             # singular (category name)

# AVOID:
src/
├── Features/           ✗ PascalCase
├── user_auth/          ✗ snake_case
├── misc/               ✗ vague name
└── helpers/stuff/      ✗ ambiguous nesting
```

**Checklist:**

- [ ] Use kebab-case for all directory names
- [ ] Use plural names for directories containing multiple similar items
- [ ] Use singular names for category/namespace directories
- [ ] Limit directory names to 2-3 words maximum
- [ ] Avoid generic names (`misc/`, `stuff/`, `other/`)

## 4.3 Export Naming

Establish naming rules for exported members.

```javascript
// Functions: camelCase, verb-first
export function createUser(data) {}
export function getUserById(id) {}
export function validateEmail(email) {}

// Constants: UPPER_SNAKE_CASE
export const MAX_RETRY_COUNT = 3;
export const DEFAULT_PAGE_SIZE = 25;

// Classes: PascalCase
export class OrderService {}
export class ValidationError extends Error {}

// Enums/Objects used as enums: PascalCase + UPPER_SNAKE_CASE values
export const OrderStatus = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
});
```

**Checklist:**

- [ ] Functions: camelCase, verb-first (`create`, `get`, `update`, `delete`)
- [ ] Constants: UPPER_SNAKE_CASE
- [ ] Classes: PascalCase
- [ ] Enum-like objects: PascalCase container, UPPER_SNAKE_CASE values
- [ ] Boolean variables/params: prefix with `is`, `has`, `should`, `can`
- [ ] Private members: prefix with `_` or use `#` private fields

## 4.4 Import Ordering

Define a consistent import order convention.

```javascript
// 1. Node.js built-in modules
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// 2. External dependencies
import express from 'express';
import { z } from 'zod';

// 3. Internal path aliases (project modules)
import { config } from '#config';
import { logger } from '#shared/utils';

// 4. Relative imports (same feature/module)
import { validateInput } from './validation.js';
import { UserModel } from './user.model.js';
```

**Checklist:**

- [ ] Define import group ordering (builtins → external → internal → relative)
- [ ] Add blank line between import groups
- [ ] Use `node:` prefix for Node.js built-ins
- [ ] Configure eslint `import/order` rule to enforce
- [ ] Prefer named imports over default imports for clarity
