# Contributing to Skulls

Thank you for your interest in contributing to Skulls!

## Adding New Templates

Templates are the core of Skulls. Here's how to add new ones:

### 1. Create Language Directory (if new language)

If adding templates for a new language/framework, create a directory under `templates/`:

```text
templates/
├── rust/           # existing
├── your-language/  # new
│   └── meta.json
```

### 2. Add Language Metadata

Create a `meta.json` in your language directory:

```json
{
  "name": "Your Language",
  "description": "Brief description of what this language/framework covers",
  "version": "1.0.0"
}
```

### 3. Create Template Directory

Add a template directory with its own `meta.json` and phase files:

```text
templates/your-language/
└── your-template/
    ├── meta.json
    ├── 01-first-phase.md
    ├── 02-second-phase.md
    └── ...
```

### 4. Template Metadata

Each template needs a `meta.json`:

```json
{
  "name": "Your Template",
  "description": "What this template helps plan",
  "version": "1.0.0",
  "phases": [
    { "number": 1, "name": "First Phase", "file": "01-first-phase.md" },
    { "number": 2, "name": "Second Phase", "file": "02-second-phase.md" }
  ],
  "quickReference": "Optional quick reference content",
  "verification": [
    "Command or check to verify implementation"
  ]
}
```

### 5. Phase Files

Each phase file should include:

- Clear objective
- Step-by-step guidance
- Code patterns/examples where helpful
- Validation criteria

The MCP server reads templates dynamically - no code changes required!

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally (see [Development Guide](DEVELOPMENT.md))
5. Submit a pull request

## Code Style

- TypeScript for MCP server code
- ESLint + Prettier for formatting
- Markdown linting for documentation

## Questions?

Open an issue on GitHub if you have questions or suggestions.
