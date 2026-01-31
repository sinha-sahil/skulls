# Skulls MCP Server

MCP (Model Context Protocol) server for Skulls planning templates.

## Installation

```bash
cd mcp
pnpm install
pnpm build
```

## Usage

### With Claude Code

Add to your Claude Code configuration:

```bash
claude mcp add skulls -- node /path/to/skulls/mcp/build/index.js
```

Or add to `.mcp.json`:

```json
{
  "skulls": {
    "command": "node",
    "args": ["/path/to/skulls/mcp/build/index.js"]
  }
}
```

### Development

```bash
# Run with tsx (no build needed)
pnpm dev

# Build and run
pnpm build && pnpm start

# Test with MCP Inspector
pnpm inspector
```

## Available Tools

### Learn Phase

1. **`init_planning`** - Initialize a planning session (MANDATORY FIRST)
   - Returns: `sessionId`, available languages

2. **`select_language`** - Select a programming language
   - Input: `sessionId`, `language`
   - Returns: Available templates for language

3. **`get_template`** - Get a planning template
   - Input: `sessionId`, `template`
   - Returns: Full template with phases

### Implement Phase

1. **`get_phase`** - Get a specific phase
   - Input: `sessionId`, `phaseNumber`
   - Returns: Phase content

2. **`get_quick_reference`** - Get quick reference
   - Input: `sessionId`
   - Returns: Placeholder definitions, patterns

### Verify Phase

1. **`get_verification_steps`** - Get verification commands
   - Input: `sessionId`
   - Returns: Commands to run (cargo check, etc.)

2. **`complete_planning`** - Mark session complete
   - Input: `sessionId`, optional `summary`

## Workflow

```text
init_planning() → sessionId + languages
       ↓
select_language(sessionId, "rust") → templates
       ↓
get_template(sessionId, "service-creation") → phases
       ↓
[Follow phases, implement code]
       ↓
get_verification_steps(sessionId) → commands
       ↓
[Run verification commands, fix issues]
       ↓
complete_planning(sessionId)
```

## Adding Templates

1. Create directory: `templates/{language}/{template-name}/`
2. Add `meta.json` with phases and verification steps
3. Add `README.md`, `QUICK-REFERENCE.md`, and phase files
4. Update `templates/{language}/meta.json`
5. Update `templates/meta.json` if adding new language

No MCP code changes needed.
