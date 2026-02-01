# Client Module Template

Plan and implement a client-side module with stores, API integration, and UI components
following established architectural patterns.

## Overview

Client-side modules are self-contained, reusable units that handle specific business logic
and UI components. Each module is designed to be independent and functional in standalone
environments.

## Module Location

All client-side modules are located in: `src/lib/client/modules/`

## Critical Rules

### 1. Always Use `type`, Never `interface`

```typescript
// CORRECT
type ModuleStore = {
  data: DataType | null;
};

// WRONG - never use interface
interface ModuleStore {
  data: DataType | null;
}
```

### 2. Type-Crafter First

Before creating types manually:

- Check if project uses type-crafter (`grep -q "type-crafter" package.json`)
- If available, define types in YAML specs and generate
- Decoder functions are auto-generated with type-crafter
- Only create types manually if type-crafter is unavailable

**Exception:** Types containing functions (callbacks, event maps) must always be created
manually since type-crafter cannot generate them.

### 3. typesafe-api-call for API Calls (Recommended)

Before implementing API calls:

- Check if project uses typesafe-api-call (`grep -q "typesafe-api-call" package.json`)
- If available, use `APICaller.call()` with decoder functions
- If typesafe-api-call MCP server is installed, use it for usage guidance
- If not available, fall back to custom network utilities or native fetch

```typescript
// Recommended pattern with typesafe-api-call
import { APICaller, APISuccess, type APIRequest } from 'typesafe-api-call';
import { decodeEntity } from '$generated/types';  // From type-crafter

const response = await APICaller.call(request, decodeEntity);
if (response instanceof APISuccess) {
  // Type-safe response.response
}
```

### 4. Detect Project Utilities

If typesafe-api-call is not available:

- Check for network utilities (`grep -r "NetworkController\|ApiClient" src/`)
- Check for logger (`grep -r "appLogger\|logger" src/`)
- Use them if available, otherwise use native fetch/console

## Architecture Principles

1. **Independence:** Each module must function independently without external dependencies beyond the core framework
2. **Single Responsibility:** Each module targets a specific set of problems and solves them comprehensively
3. **Minimal Surface Area:** Expose only what's necessary through the index.ts file
4. **Type Safety:** Leverage generated types and decoders wherever possible

## Standard Module Structure

```text
src/lib/client/modules/[module-name]/
├── index.ts           # Main export file (minimal, essential exports only)
├── remote.ts          # API calls (typesafe-api-call recommended)
├── store.ts           # Svelte stores for state management
├── types.ts           # Local type definitions + manual decoders if needed
├── utils.ts           # Internal utility functions (module-private)
└── ui/                # Svelte components directory
    ├── index.ts       # UI component exports
    └── *.svelte       # Individual component files
```

## Phases

1. **Planning** - Define problem domain, detect utilities (type-crafter, typesafe-api-call, logger)
2. **Setup** - Create directory structure and initial files
3. **Type Definitions** - Define types (via type-crafter or manually) + decoders
4. **State Management** - Implement stores in store.ts
5. **API Integration** - Create remote operations (typesafe-api-call recommended)
6. **Utilities** - Add helper functions in utils.ts
7. **UI Components** - Build Svelte components in ui/
8. **Integration** - Export module interface and test independence

## When to Use

- Creating a new client-side feature module
- Adding frontend functionality with state management
- Building reusable UI component libraries
- Implementing API integration on the client
- Any new feature that requires stores, components, and API calls

## Best Practices

- **Type Safety:** Use typesafe-api-call with decoder functions for validated API responses
- **Error Handling:** Always include proper error handling in remote operations
- **Loading States:** Provide clear loading indicators for async operations
- **No `any` Types:** Leverage TypeScript fully, avoid `any` types
- **Performance:** Consider lazy loading for heavy components
- **Accessibility:** Ensure UI components follow accessibility guidelines
