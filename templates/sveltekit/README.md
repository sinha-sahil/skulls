# SvelteKit Templates

Templates and standards for SvelteKit application development.

## Available Templates

| Template | Description |
|----------|-------------|
| [client-module](./client-module/) | Plan and implement client-side modules with stores, API, and UI |

## Framework

These templates are designed for:

- **SvelteKit** - Full-stack framework
- **Svelte 5** - UI components with runes
- **TypeScript** - Type-safe development
- **type-crafter** - Type generation and decoders (optional)
- **typesafe-api-call** - Type-safe API calls (recommended)

## Quick Start

1. Choose the appropriate template for your task
2. Run utility detection (type-crafter, typesafe-api-call, logger)
3. Follow the implementation phases
4. Validate against the verification checklists

## Key Principles

- **Always use `type`, never `interface`** in TypeScript
- **type-crafter first** - Check for type-crafter before creating types manually
- **typesafe-api-call recommended** - Use for type-safe API calls with decoders
- **Detect utilities** - Use project utilities if available, fallback to native alternatives

## Project Configuration

Each template uses detection-based configuration. Run the detection commands in Phase 1
to determine which utilities are available in your project.

### Common Detection Commands

```bash
# Check for type-crafter
grep -q "type-crafter" package.json && echo "type-crafter available"

# Check for typesafe-api-call
grep -q "typesafe-api-call" package.json && echo "typesafe-api-call available"

# Check for custom network utilities
grep -r "NetworkController\|ApiClient" src/

# Check for logger
grep -r "appLogger\|logger" src/
```
