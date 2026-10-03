# {{PROJECT_NAME}} - Performance Guidelines

## Overview

Define type-level and runtime performance best practices for {{PROJECT_NAME}}. Covers avoiding deep type recursion, using `const` assertions, the `satisfies` operator, tree-shaking friendly exports, and compiler performance considerations.

## Status

🔴 Not Started

## Dependencies

- 01-code-style.md (import patterns established)
- 02-type-system.md (type patterns established)

---

## Step 1: Type-Level Performance

### Avoid Deep Recursive Types

```typescript
// ✗ AVOID: Deeply recursive types slow down the compiler
type DeepFlatten<T> = T extends Array<infer U>
  ? DeepFlatten<U>           // ← Unbounded recursion
  : T;

// ✓ PREFER: Bounded recursion with a depth limit
type DeepFlatten<T, Depth extends number = 5> = Depth extends 0
  ? T
  : T extends Array<infer U>
    ? DeepFlatten<U, [-1, 0, 1, 2, 3, 4][Depth]>
    : T;

// ✓ BEST: Use simpler, non-recursive alternatives when possible
type Flatten<T> = T extends Array<infer U> ? U : T;
```

### Avoid Excessive Union Distribution

```typescript
// ✗ AVOID: Large distributed unions slow down type checking
type AllPermutations<T extends string> = /* ... complex recursive type */;
type Result = AllPermutations<'a' | 'b' | 'c' | 'd' | 'e' | 'f'>;
// ← Generates 720 union members

// ✓ PREFER: Keep unions under ~50 members
type HttpStatus = 200 | 201 | 204 | 301 | 400 | 401 | 403 | 404 | 500;
```

### Prefer Interfaces over Intersection Types

```typescript
// ✗ SLOWER: Intersection types recalculated each time
type UserWithRole = User & { role: string } & { permissions: string[] };

// ✓ FASTER: Interface extends (cached by the compiler)
interface UserWithRole extends User {
  role: string;
  permissions: string[];
}
```

### Use Type Aliases for Complex Computations

```typescript
// ✗ SLOW: Recomputed at every usage site
function process(input: Pick<User, 'id' | 'name'> & { extra: string }): void {}

// ✓ FAST: Computed once, cached as a named type
type ProcessInput = Pick<User, 'id' | 'name'> & { extra: string };
function process(input: ProcessInput): void {}
```

---

## Step 2: `const` Assertions

### Use `as const` for Literal Types

```typescript
// Without as const: type is string[]
const ROLES = ['admin', 'user', 'guest'];
// typeof ROLES = string[]

// With as const: type is readonly tuple of literals
const ROLES = ['admin', 'user', 'guest'] as const;
// typeof ROLES = readonly ['admin', 'user', 'guest']

// Derive union type from const array
type Role = (typeof ROLES)[number]; // 'admin' | 'user' | 'guest'
```

### Const Objects for Configuration

```typescript
// ✗ Without as const: values widen to string/number
const CONFIG = {
  maxRetries: 3,
  timeout: 5000,
  environment: 'production',
};
// typeof CONFIG.environment = string

// ✓ With as const: values are literal types
const CONFIG = {
  maxRetries: 3,
  timeout: 5000,
  environment: 'production',
} as const;
// typeof CONFIG.environment = 'production'

// Derive types from const config
type Environment = typeof CONFIG.environment; // 'production'
type ConfigKey = keyof typeof CONFIG; // 'maxRetries' | 'timeout' | 'environment'
```

### Const Type Parameters (TypeScript 5.0+)

```typescript
// Without const: T widens to string[]
function createRoute<T extends readonly string[]>(segments: T): T {
  return segments;
}
const route = createRoute(['api', 'users']); // string[]

// With const: T preserves literal types
function createRoute<const T extends readonly string[]>(segments: T): T {
  return segments;
}
const route = createRoute(['api', 'users']); // readonly ['api', 'users']
```

---

## Step 3: The `satisfies` Operator

### Validate Without Widening

```typescript
// Problem: Type annotation widens the type
const palette: Record<string, string | number[]> = {
  red: '#ff0000',
  green: [0, 255, 0],
};
palette.red.toUpperCase(); // ✗ Error: string | number[] has no toUpperCase

// Solution: satisfies validates but preserves the narrow type
const palette = {
  red: '#ff0000',
  green: [0, 255, 0],
} satisfies Record<string, string | number[]>;

palette.red.toUpperCase();  // ✓ Works: red is inferred as string
palette.green.map(Number);  // ✓ Works: green is inferred as number[]
```

### Configuration with `satisfies`

```typescript
interface ServerConfig {
  port: number;
  host: string;
  cors: {
    origins: readonly string[];
    methods: readonly string[];
  };
}

// Validated against ServerConfig, but keeps literal types
const config = {
  port: 3000,
  host: 'localhost',
  cors: {
    origins: ['http://localhost:5173'] as const,
    methods: ['GET', 'POST', 'PUT', 'DELETE'] as const,
  },
} satisfies ServerConfig;

// config.port is number (validated)
// config.cors.origins is readonly ['http://localhost:5173'] (preserved)
```

### Use `satisfies` for Route Maps

```typescript
interface RouteMap {
  [path: string]: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    handler: string;
  };
}

const routes = {
  '/users': { method: 'GET', handler: 'listUsers' },
  '/users/:id': { method: 'GET', handler: 'getUser' },
  '/users': { method: 'POST', handler: 'createUser' },
} satisfies RouteMap;

// Type is validated but each entry preserves its literal types
```

---

## Step 4: Tree-Shaking Friendly Exports

### Named Exports over Default

```typescript
// ✗ Default exports are harder to tree-shake
export default class UserService { /* ... */ }

// ✓ Named exports enable tree-shaking
export class UserService { /* ... */ }
export function createUser(): User { /* ... */ }
```

### Explicit Barrel Exports

```typescript
// ✗ Wildcard re-exports prevent tree-shaking
export * from './user.service';
export * from './user.utils';
export * from './user.types';

// ✓ Explicit re-exports enable tree-shaking
export { UserService } from './user.service';
export { validateUser, formatUser } from './user.utils';
export type { User, UserInput } from './user.types';
```

### Side-Effect Free Modules

```typescript
// ✗ Module with side effects (runs on import)
const cache = new Map<string, User>(); // ← Side effect: allocates Map
export function getUser(id: string): User | undefined {
  return cache.get(id);
}

// ✓ Lazy initialization (no side effects on import)
let cache: Map<string, User> | null = null;

function getCache(): Map<string, User> {
  if (!cache) cache = new Map();
  return cache;
}

export function getUser(id: string): User | undefined {
  return getCache().get(id);
}
```

### Package.json `sideEffects`

```jsonc
// package.json - Declare which files have side effects
{
  "sideEffects": false, // or ["./src/polyfills.ts"]
}
```

---

## Step 5: Compiler Performance

### Project References for Large Codebases

```jsonc
// tsconfig.json (solution root)
{
  "files": [],
  "references": [
    { "path": "packages/core" },
    { "path": "packages/shared" },
    { "path": "apps/{{PROJECT_NAME}}" }
  ]
}

// packages/core/tsconfig.json
{
  "compilerOptions": { "composite": true },
  "references": [{ "path": "../shared" }]
}
```

### Incremental Compilation

```jsonc
// Enable incremental compilation for faster rebuilds
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "{{OUT_DIR}}/.tsbuildinfo"
  }
}
```

### Avoid Expensive Patterns

| Pattern | Impact | Alternative |
|---------|--------|-------------|
| `export * from` | Prevents dead code elimination | Explicit re-exports |
| Large union types (>50 members) | Slow type checking | Group into sub-unions |
| Deep recursive types | Exponential compile time | Add depth limit |
| Intersection chains (`A & B & C & D`) | Recomputed each use | Single `interface extends` |
| `skipLibCheck: false` | Checks all `.d.ts` files | `skipLibCheck: true` |

---

## Verification

```bash
tsc --noEmit
eslint .
vitest run
```

**Checklist:**

- [ ] No deeply recursive types without depth limits
- [ ] Union types kept under ~50 members
- [ ] `interface extends` preferred over intersection types
- [ ] Complex types aliased (not inlined at every usage)
- [ ] `as const` used for literal arrays and config objects
- [ ] `satisfies` used for validated-but-narrow types
- [ ] Named exports (no default exports unless framework requires)
- [ ] Explicit barrel re-exports (no `export *`)
- [ ] Modules are side-effect free where possible
- [ ] Incremental compilation enabled
- [ ] Project references set up for monorepos
- [ ] `tsc --noEmit` completes in reasonable time
