# Phase 1: Planning

Before writing any code, thoroughly plan the module's scope, responsibilities, and integration points.

## Objectives

- Define the specific problem domain the module addresses
- Establish clear boundaries and responsibilities
- Plan data flow and state requirements
- Design the component API
- Detect available project utilities

## Critical Rules

1. **Always use `type`, never `interface`**
2. **Check for type-crafter** before planning to create types manually
3. **Check for typesafe-api-call** for API calls (recommended approach)
4. **Detect project utilities** (network controller, logger) - use them if available, otherwise use native alternatives

## Planning Checklist

### 1. Problem Domain Definition

Answer these questions:

- What specific problem does this module solve?
- What are the core use cases?
- What data does it need to manage?
- What user interactions does it handle?

### 2. Scope and Boundaries

Define what the module WILL and WILL NOT do:

**In Scope:**

- List the features this module provides
- Define the data it manages
- Specify the UI components it includes

**Out of Scope:**

- Features handled by other modules
- Data managed elsewhere
- Shared components that should remain external

### 3. Project Utility Detection

Before planning implementation details, detect what utilities the project provides.

#### Check for Type-Crafter

```bash
# Check if type-crafter is available
grep -q "type-crafter" package.json && echo "type-crafter available"
ls *.type-crafter.yaml type-crafter.config.* 2>/dev/null
```

**If available:**

- Plan to define types in YAML specs
- Decoder functions (e.g., `decodeEntityType`) will be auto-generated
- Use decoders with typesafe-api-call for type-safe API responses

**If not available:**

- Plan to create types manually in types.ts
- Write decoder functions manually if using typesafe-api-call

#### Check for typesafe-api-call (Recommended for API Calls)

```bash
# Check if typesafe-api-call is available
grep -q "typesafe-api-call" package.json && echo "typesafe-api-call available"
```

**If available (recommended):**

- Use `APICaller.call()` for all API requests
- Use decoder functions for type-safe response parsing
- Check if typesafe-api-call MCP server is installed for usage guidance

**If not available:**

- Check for custom network utilities (see below)
- Fall back to native `fetch` if no utilities exist

#### Check for Custom Network Utilities (Fallback)

```bash
# Search for existing network/API utilities (only if typesafe-api-call not available)
grep -r "NetworkController\|ApiClient\|httpClient\|fetchWrapper" src/
grep -r "makeRequest\|apiCall" src/lib/services/
ls src/lib/services/network/ src/services/ 2>/dev/null
```

**If found:** Note the import path and method signatures for use in remote.ts
**If not found:** Plan to use native `fetch`

#### Check for Logger

```bash
# Search for existing logging utilities
grep -r "appLogger\|logger\|Logger" src/
ls src/lib/services/*log* src/services/*log* 2>/dev/null
```

**If found:** Note the import path and method signatures
**If not found:** Plan to use `console.error` or skip logging

### 4. Data Flow Planning

Map out the data lifecycle:

```text
[API/External Source]
       ↓
   remote.ts (fetch/mutate)
       ↓
   store.ts (state management)
       ↓
   ui/*.svelte (display/interact)
       ↓
   remote.ts (mutations back to API)
```

For each data entity, define:

- Source (API endpoint, local generation, etc.)
- Transformations needed
- Store structure
- Update triggers

### 5. State Requirements

Plan the store structure:

```typescript
// Always use type, never interface
type PlannedStore = {
  // Primary data
  data: DataType | null;

  // Loading states
  isLoaded: boolean;
  showLoader: boolean;

  // Error handling
  error: string | null;

  // Additional state as needed
  // filters?: FilterType;
  // selectedItem?: ItemType;
};
```

### 6. Type Planning

Determine which types need to be created:

| Type | Type-Crafter? | Manual? | Reason |
|------|---------------|---------|--------|
| Entity types | Yes (if available) | Fallback | Pure data |
| Decoder functions | Yes (if available) | Fallback | For typesafe-api-call |
| Store types | Yes (if available) | Fallback | Pure data |
| Props with callbacks | No | Always | Contains functions |
| Event map types | No | Always | Used with dispatcher |

### 7. Component API Design

For each planned component:

| Component | Purpose | Props | Events |
|-----------|---------|-------|--------|
| MainComponent | Primary display | data, variant | select, action |
| ListItem | Individual item | item | click |
| ... | ... | ... | ... |

### 8. API Integration Points

List the API endpoints needed:

| Endpoint | Method | Purpose | Request Type | Response Type | Decoder |
|----------|--------|---------|--------------|---------------|---------|
| /api/resource | GET | Fetch data | - | ResourceType[] | decodeResourceList |
| /api/resource/:id | POST | Create | CreateRequest | ResourceType | decodeResource |
| ... | ... | ... | ... | ... | ... |

### 9. Dependencies Summary

Document the detection results:

**Type Generation:**

- [ ] type-crafter available: Yes / No
- [ ] Generated types location: `$generated/types` or ___
- [ ] Decoder functions available: Yes / No

**API Calling (in priority order):**

- [ ] typesafe-api-call available: Yes / No (recommended)
- [ ] Custom network utility available: Yes / No
- [ ] Will use: typesafe-api-call / custom utility / native `fetch`

**Logging:**

- [ ] Custom logger available: Yes / No
- [ ] If yes, import path: ___
- [ ] If no, will use: `console.error`

**Other Dependencies:**

- Shared UI components (if any)
- Common utilities (if any)

## Output

Document your planning decisions before proceeding. This becomes the module's specification that guides implementation.

## Verification

Before moving to the next phase:

- [ ] Problem domain is clearly defined
- [ ] Scope boundaries are established
- [ ] Project utilities detected (type-crafter, typesafe-api-call, logger)
- [ ] Data flow is mapped
- [ ] Store structure is planned
- [ ] Type generation approach decided
- [ ] Decoder functions planned (for typesafe-api-call)
- [ ] Component APIs are designed
- [ ] API endpoints are identified
- [ ] Dependencies are documented
