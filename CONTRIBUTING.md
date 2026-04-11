# Contributing to Skulls

Thank you for your interest in contributing to Skulls!

## Adding New Templates

Templates are the core of Skulls. Here's how to add new ones.

The canonical schema is defined by the TypeScript types in
[`mcp/src/types.ts`](mcp/src/types.ts) (`RootMeta`, `LanguageMeta`, `TemplateMeta`). If
this document and the types disagree, the types are the source of truth.

### 1. Register the Language in Root Metadata (if new language)

If adding templates for a new language, add an entry to `templates/meta.json`:

```json
{
  "version": "1.0.0",
  "languages": {
    "your-language": {
      "description": "Brief description of what this language/framework covers"
    }
  }
}
```

### 2. Create the Language Directory

```text
templates/
├── rust/              # existing
├── sveltekit/         # existing
├── your-language/     # new
│   ├── meta.json      # language-level metadata (see step 3)
│   └── your-template/ # one directory per template (see step 4)
```

### 3. Add Language-Level `meta.json`

Create `templates/your-language/meta.json` listing every template the language provides:

```json
{
  "language": "your-language",
  "templates": {
    "your-template": {
      "description": "What this template helps plan",
      "use_cases": [
        "primary use case",
        "another use case",
        "another use case"
      ]
    }
  }
}
```

Fields:

- `language` — kebab-case identifier, matches the directory name
- `templates` — map of `<template-name>` to its description and use cases
- `use_cases` — short phrases the MCP server surfaces for template discovery

### 4. Create the Template Directory

Each template lives in its own directory with a `meta.json`, a `README.md`, numbered phase
files, and an optional `QUICK-REFERENCE.md`:

```text
templates/your-language/your-template/
├── meta.json
├── README.md              # template overview (read as the `overview` field)
├── 01-first-phase.md
├── 02-second-phase.md
├── ...
└── QUICK-REFERENCE.md     # optional condensed reference
```

### 5. Template-Level `meta.json`

```json
{
  "name": "your-template",
  "description": "What this template helps plan",
  "use_cases": [
    "primary use case",
    "another use case"
  ],
  "phases": [
    { "file": "01-first-phase.md", "name": "First Phase" },
    { "file": "02-second-phase.md", "name": "Second Phase" }
  ],
  "verification": [
    { "command": "your-lint-command", "description": "What this check verifies" },
    { "command": "your-test-command", "description": "What this check verifies" }
  ]
}
```

Notes:

- `name` must match the template directory name (kebab-case).
- Phase `number` is **parsed from the filename prefix** (`01-`, `02-`, ...), not stored in
  `meta.json`. Use two-digit, hyphen-separated prefixes.
- `verification` is an array of `{ command, description }` objects, not strings.
- `QUICK-REFERENCE.md` is a separate file loaded by `get_quick_reference`. Do **not** add a
  `quickReference` field to `meta.json`.
- There is no `version` field on the template meta.

### 6. Phase Files

Each phase file should include:

- **Objective** — what this phase accomplishes
- **Step-by-step guidance** — numbered sections with concrete instructions
- **Code / command examples** — where helpful
- **Validation criteria** — a trackable `[ ]` checklist for phase completion

See `templates/GLOBAL-INSTRUCTIONS.md` for the mandatory plan-output rules that every
template implicitly inherits.

The MCP server reads templates dynamically from the filesystem — no code changes required
when adding or updating templates.

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
