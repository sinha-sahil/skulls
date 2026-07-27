# Skulls Templates

Project templates and standards organized by language/technology.

## Languages

| Language | Description | Status |
|----------|-------------|--------|
| [rust](./rust/) | Backend API templates (Axum, SQLx) | Active |
| [svelte](./svelte/) | Svelte 5 component templates | Planned |
| [sveltekit](./sveltekit/) | SvelteKit application templates | Active |
| [typescript](./typescript/) | TypeScript type patterns | Planned |
| [javascript](./javascript/) | JavaScript utility patterns | Planned |
| [css](./css/) | CSS styling conventions | Planned |
| [html](./html/) | HTML structure and accessibility | Planned |

## Structure

```text
templates/
├── rust/
│   ├── endpoint-planning/
│   └── service-creation/
├── svelte/
├── sveltekit/
├── typescript/
├── javascript/
├── css/
└── html/
```

## Usage

Each language folder contains domain-specific templates.
Templates use `{{PLACEHOLDER}}` syntax for project-specific values.

## MCP Integration

These templates are exposed via MCP (Model Context Protocol) for LLM access.
See the MCP server documentation for API details.
