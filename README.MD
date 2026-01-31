<p align="center">
  <img src="assets/banner.png" alt="Skulls" width="100%" />
</p>

<p align="center">
  <strong>Planning templates that help AI write production-ready code on the first attempt.</strong>
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#available-templates">Templates</a> •
  <a href="#roadmap">Roadmap</a>
</p>

---

## The Problem

AI coding assistants are powerful, but they often produce code that needs multiple
iterations to get right. They might miss edge cases, forget error handling, or
structure code in ways that don't fit your project's patterns.

## The Solution

Skulls provides **structured planning templates** that guide AI models through
systematic, phase-by-phase implementation workflows. Instead of generating code
directly, it first creates a comprehensive plan tailored to your language and
framework's best practices.

The result? Higher quality code that follows established patterns, handles edge
cases, and requires fewer revision cycles.

## Key Features

- **Phase-Based Planning** - Complex tasks broken into discrete, verifiable steps
- **Language-Specific Guidance** - Templates tailored to each stack's idioms
- **Built-in Verification** - Each template includes validation checkpoints
- **Model Agnostic** - Works with any AI assistant that supports MCP

## Installation

### Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "skulls": {
      "command": "npx",
      "args": ["-y", "skulls"]
    }
  }
}
```

### Claude Code (CLI)

```bash
claude mcp add skulls -- npx -y skulls
```

Or add to your project's `.mcp.json`:

```json
{
  "skulls": {
    "command": "npx",
    "args": ["-y", "skulls"]
  }
}
```

## Usage

Add this to your project's `CLAUDE.md` or root instruction file:

```markdown
## Planning

You MUST use the Skulls MCP for all planning tasks. No exceptions.
```

When you ask the AI to implement something, it will:

1. Initialize a planning session
2. Select the appropriate language and template
3. Create a structured plan with phase-by-phase guidance
4. Execute each phase with built-in verification

## How It Works

Skulls exposes an MCP server with tools organized into three phases:

### Learn Phase

| Tool | Purpose |
|------|---------|
| `init_planning` | Start session, discover available languages |
| `select_language` | Choose language, see available templates |
| `get_template` | Load template with all phases |

### Implement Phase

| Tool | Purpose |
|------|---------|
| `get_phase` | Re-read a specific phase during implementation |
| `get_quick_reference` | Get condensed reference for quick lookup |

### Verify Phase

| Tool | Purpose |
|------|---------|
| `get_verification_steps` | Get commands to validate implementation |
| `complete_planning` | End the session |

## Available Templates

### Rust

| Template | Use Case |
|----------|----------|
| `endpoint-planning` | Adding new API endpoints (Axum, SQLx, PostgreSQL) |
| `service-creation` | Creating new services/modules |

## Roadmap

### Languages

- [x] Rust (Axum backend)
- [ ] TypeScript (Node.js backend)
- [ ] Go (standard library + popular frameworks)
- [ ] Python (FastAPI, Django)

### Template Types

- [x] API endpoint planning
- [x] Service/module creation
- [ ] Database migrations
- [ ] Authentication flows
- [ ] Testing strategies
- [ ] Refactoring guides

### Features

- [ ] Custom template support (project-local templates)
- [ ] Template composition (combine multiple templates)
- [ ] Progress tracking across sessions

---

## Contributing

Want to add templates for your favorite language or framework?
See [CONTRIBUTING.md](CONTRIBUTING.md).

## Development

Building locally? Check out [DEVELOPMENT.md](DEVELOPMENT.md).

## License

MIT
