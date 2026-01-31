# Development Guide

## Prerequisites

- Node.js >= 18.0.0
- pnpm (recommended) or npm

## Setup

```bash
git clone https://github.com/sinha-sahil/skulls.git
cd skulls/mcp
pnpm install
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run with tsx (development mode) |
| `pnpm build` | Build with Rollup |
| `pnpm start` | Run built server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint issues |
| `pnpm format` | Format with Prettier |
| `pnpm typecheck` | Type check with TypeScript |
| `pnpm inspector` | Run MCP Inspector for testing |

## Project Structure

```text
skulls/
├── mcp/                    # MCP server
│   ├── src/
│   │   ├── index.ts        # Server entry point
│   │   └── services/
│   │       ├── session-manager.ts
│   │       └── template-loader.ts
│   ├── build/              # Compiled output
│   └── package.json
├── templates/              # Planning templates
│   ├── GLOBAL-INSTRUCTIONS.md
│   └── {language}/
│       ├── meta.json
│       └── {template}/
│           ├── meta.json
│           └── {phase}.md
└── README.md
```

## Testing Locally

### With MCP Inspector

```bash
cd mcp
pnpm build
pnpm inspector
```

### With Claude Code

```bash
cd mcp
pnpm build
claude mcp add skulls-dev -- node /path/to/skulls/mcp/build/index.js
```

## Publishing

```bash
cd mcp
pnpm build
npm publish
```

## Architecture

### Session Flow

1. `init_planning` - Creates session, returns available languages
2. `select_language` - Sets language, returns available templates
3. `get_template` - Sets template, returns full template content
4. `get_phase` - Returns specific phase (optional, for re-reading)
5. `get_quick_reference` - Returns condensed reference
6. `get_verification_steps` - Returns verification commands
7. `complete_planning` - Ends session

### Template Loading

Templates are loaded dynamically from the filesystem. The `prebuild` script copies
templates into the `mcp/` directory for npm packaging.
