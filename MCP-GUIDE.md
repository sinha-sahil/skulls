# How We Built the Skulls MCP Server

A guide to the architecture, patterns, and conventions used to build an MCP (Model Context Protocol) server in this project.

## Stack

| Layer | Choice |
|-------|--------|
| Language | TypeScript (ES2022, ESM) |
| Runtime | Node.js >= 18 |
| MCP SDK | `@modelcontextprotocol/sdk` v1.0.0 |
| Validation | Zod v3.25 |
| Bundler | Rollup (single-file ESM output) |
| Transport | stdio (stdin/stdout) |

## Project Layout

```
skulls/
├── mcp/                          # MCP server package (npm-publishable)
│   ├── src/
│   │   ├── index.ts              # Server class + tool registration
│   │   ├── types.ts              # All TypeScript interfaces
│   │   └── services/
│   │       ├── session-manager.ts # In-memory session state
│   │       └── template-loader.ts # Filesystem template reader
│   ├── build/                    # Rollup output (build/index.js)
│   ├── package.json
│   ├── rollup.config.js
│   └── tsconfig.json
├── templates/                    # Source-of-truth templates (markdown + JSON)
│   ├── meta.json                 # Root: lists all languages
│   ├── GLOBAL-INSTRUCTIONS.md    # Rules applied to every template
│   └── {language}/
│       ├── meta.json             # Lists templates for this language
│       └── {template}/
│           ├── meta.json         # Phases, verification steps, use_cases
│           ├── README.md         # Template overview
│           ├── QUICK-REFERENCE.md
│           └── 01-phase-name.md  # Phase files (numbered)
```

Templates live outside `mcp/` so they can be edited independently. A `prebuild` script copies them into `mcp/templates/` before bundling for npm.

---

## 1. Server Entry Point

The server is a single class `SkullsMcpServer` in `mcp/src/index.ts`.

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

class SkullsMcpServer {
  private server: McpServer;
  private sessionManager: SessionManager;
  private templateLoader: TemplateLoader;

  constructor() {
    this.server = new McpServer({
      name: "skulls",
      version: "1.0.0",
    });
    this.sessionManager = new SessionManager();
    this.templateLoader = new TemplateLoader();
    this.registerTools();  // all tools registered here
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Skulls MCP Server running on stdio");
  }
}
```

**Key points:**
- `McpServer` comes from the official SDK. You give it a name and version.
- `StdioServerTransport` uses stdin/stdout for the MCP protocol. All logging goes to `stderr`.
- Services are instantiated in the constructor, tools are registered immediately after.

---

## 2. Registering Tools

Each tool is registered via `this.server.registerTool()` with three arguments:

```typescript
this.server.registerTool(
  "tool_name",                // 1. Unique tool identifier
  {
    title: "Human Title",     // 2. Metadata object
    description: "...",       //    Description shown to the LLM
    inputSchema: {            //    Zod schemas for parameters (optional)
      param: z.string().describe("..."),
    },
  },
  async ({ param }) => {      // 3. Handler function
    // ... do work ...
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify(result, null, 2),
      }],
    };
  }
);
```

### Tool registration pattern

Every tool in this project follows the same structure:

1. **Validate** - Check session exists, required state is set
2. **Execute** - Call services (SessionManager, TemplateLoader)
3. **Return** - JSON-stringified result wrapped in `{ content: [{ type: "text", text: "..." }] }`
4. **Error** - Catch block returns `{ content: [...], isError: true }` with a helpful message

```typescript
async ({ sessionId }) => {
  try {
    const session = this.sessionManager.getSession(sessionId);  // validates
    const data = await this.templateLoader.doSomething();        // executes
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ sessionId, data }, null, 2),      // returns
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: "text" as const,
        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
      }],
      isError: true,                                              // error flag
    };
  }
}
```

---

## 3. Input Validation with Zod

Tool parameters are defined as Zod schemas in the `inputSchema` field. The SDK handles parsing and validation automatically.

```typescript
inputSchema: {
  sessionId: z.string().describe("Session ID from init_planning"),
  language: z.string().describe("Language to select (e.g., 'rust', 'sveltekit')"),
  phaseNumber: z.number().int().positive().describe("Phase number to get"),
  summary: z.string().optional().describe("Optional summary"),
}
```

The `.describe()` calls are important - the SDK exposes these descriptions to the LLM so it knows what to pass.

---

## 4. Session Management

Sessions provide stateful context across multiple tool calls. The `SessionManager` uses an in-memory `Map<string, Session>`.

```typescript
interface Session {
  id: string;
  language?: string;
  template?: string;
  createdAt: Date;
}
```

**Design decisions:**
- **UUID generation** via `randomUUID()` from `node:crypto`
- **State progression**: `init_planning` creates session -> `select_language` sets language (clears template) -> `get_template` sets template
- **Validation at each step**: Every getter throws a descriptive error if the prerequisite state isn't set
- **Cleanup**: `complete_planning` deletes the session from the map
- **No persistence**: Sessions are in-memory only (appropriate for a stdio-based process-per-connection model)

---

## 5. Template Loading from Filesystem

The `TemplateLoader` reads templates from disk using a three-level metadata hierarchy:

```
templates/meta.json           -> RootMeta   (which languages exist)
templates/rust/meta.json      -> LanguageMeta (which templates exist for rust)
templates/rust/endpoint/meta.json -> TemplateMeta (phases, verification, use_cases)
```

**How template content is assembled** (`getTemplateContent`):

1. Read the template's `meta.json` for phase definitions
2. Read `GLOBAL-INSTRUCTIONS.md` from the templates root
3. Read `README.md` as the template overview
4. Read each phase file (`01-xxx.md`, `02-xxx.md`, ...) listed in `meta.json`
5. Extract phase numbers from filenames via regex: `/^(\d+)-/`
6. Sort phases by number
7. Optionally read `QUICK-REFERENCE.md`
8. Return everything as a single structured object

**Path resolution**: The constructor defaults to `../templates` relative to the built `index.js` file, using `import.meta.url` to find its own location:

```typescript
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
this.templatesPath = templatesPath ?? join(__dirname, "..", "templates");
```

---

## 6. Type System

All types live in `mcp/src/types.ts`. There are three categories:

**Metadata types** (what's on disk):
- `RootMeta`, `LanguageMeta`, `TemplateMeta`
- `PhaseInfo` (`{ file, name }`)
- `VerificationStep` (`{ command, description }`)

**Session type** (runtime state):
- `Session` (`{ id, language?, template?, createdAt }`)

**Response types** (what tools return):
- `InitPlanningResponse`, `SelectLanguageResponse`, `GetTemplateResponse`, etc.

This separation keeps disk format, runtime state, and API contracts independent.

---

## 7. The Seven Tools

Tools are organized into a **Learn -> Implement -> Verify** workflow:

### Learn Phase

| Tool | Input | Purpose |
|------|-------|---------|
| `init_planning` | _(none)_ | Creates session. Returns sessionId + available languages. |
| `select_language` | `sessionId`, `language` | Sets language. Returns available templates with use_cases. |
| `get_template` | `sessionId`, `template` | Sets template. Returns full content (overview, phases, verification). |

### Implement Phase

| Tool | Input | Purpose |
|------|-------|---------|
| `get_phase` | `sessionId`, `phaseNumber` | Re-read a single phase during implementation. |
| `get_quick_reference` | `sessionId` | Get condensed reference (QUICK-REFERENCE.md). |

### Verify Phase

| Tool | Input | Purpose |
|------|-------|---------|
| `get_verification_steps` | `sessionId` | Get verification commands (e.g., `cargo check`, `cargo test`). |
| `complete_planning` | `sessionId`, `summary?` | End session + cleanup. |

---

## 8. Guiding LLM Behavior via Tool Descriptions

A distinctive pattern in this project: tool descriptions contain **structured instructions** that guide how the LLM should use the returned data. This is especially prominent in `init_planning` and `get_template`.

The `init_planning` description includes a full section on plan output requirements:

```
═══════════════════════════════════════════════════════════════════════════════
CRITICAL - PLAN OUTPUT REQUIREMENTS (MUST FOLLOW)
═══════════════════════════════════════════════════════════════════════════════

STEP 1: CHECK YOUR WRITE PERMISSIONS FIRST
...
STEP 4: CREATE DIRECTORY STRUCTURE
Service name is a DIRECTORY, not a filename prefix:

✓ CORRECT: ./plans/user-auth/00-overview.md
✗ WRONG:   ./plans/user-auth-00-overview.md
```

The response data also embeds these instructions as structured JSON:

```typescript
return {
  sessionId,
  CRITICAL_INSTRUCTIONS: {
    workflow: { step1: "...", step2: "...", ... },
    planStructure: { correct: [...], wrong: [...] },
    rules: [...],
    codeQuality: { ... },
  },
  globalInstructions,
};
```

This dual approach (description + response data) reinforces the instructions since LLMs see both.

---

## 9. Adding a New Template (Zero Code Changes)

Templates are entirely metadata-driven. To add a new template:

1. **Create the directory**: `templates/{language}/{template-name}/`

2. **Add `meta.json`**:
```json
{
  "name": "my-template",
  "description": "What this template plans",
  "use_cases": ["keyword1", "keyword2"],
  "phases": [
    { "file": "01-setup.md", "name": "Setup" },
    { "file": "02-implementation.md", "name": "Implementation" }
  ],
  "verification": [
    { "command": "npm test", "description": "Run tests" }
  ]
}
```

3. **Write phase files**: `01-setup.md`, `02-implementation.md`, etc.

4. **Optionally add**: `README.md` (overview), `QUICK-REFERENCE.md`

5. **Register in parent meta.json**: Add to `templates/{language}/meta.json`

6. **If new language**: Also add to `templates/meta.json`

No TypeScript changes needed. The `TemplateLoader` discovers everything from the filesystem.

---

## 10. Build & Distribution

### Build Pipeline

```bash
cd mcp

# 1. prebuild: copies templates/ and assets/ from parent into mcp/
pnpm prebuild

# 2. build: Rollup bundles src/index.ts -> build/index.js (ESM)
pnpm build
```

**Rollup config** bundles all local code into a single file but keeps dependencies external:

```javascript
export default {
  input: "src/index.ts",
  output: { file: "build/index.js", format: "esm", sourcemap: true },
  external: [
    "@modelcontextprotocol/sdk/server/mcp.js",
    "@modelcontextprotocol/sdk/server/stdio.js",
    "zod",
    "node:crypto", "node:fs/promises", "node:path", "node:url",
  ],
  plugins: [resolve(), typescript()],
};
```

### npm Publishing

The `package.json` uses `"bin"` to make it executable and `"files"` to control what's published:

```json
{
  "bin": { "skulls": "./build/index.js" },
  "files": ["build", "templates", "assets", "README.md"]
}
```

The built `index.js` has a `#!/usr/bin/env node` shebang so it runs directly.

### Installation

```bash
# Claude Desktop (claude_desktop_config.json)
{ "skulls": { "command": "npx", "args": ["-y", "skulls"] } }

# Claude Code CLI
claude mcp add skulls -- npx -y skulls
```

---

## 11. Error Handling Conventions

1. **Service-level validation**: `SessionManager` and `TemplateLoader` throw descriptive errors that tell the LLM what to do next:
   ```
   "No language selected. Call select_language first before selecting a template."
   ```

2. **Tool-level catch**: Every tool handler wraps its logic in try/catch and returns errors with `isError: true`.

3. **Graceful degradation**: `readText()` returns `null` for missing files instead of throwing. Optional files like `QUICK-REFERENCE.md` are handled gracefully.

4. **Logging**: Only to `stderr`. stdout is reserved for the MCP protocol.

---

## 12. Development & Testing

```bash
# Run in dev mode (tsx, no build step)
pnpm dev

# Test with MCP Inspector (visual tool)
pnpm build && pnpm inspector

# Test with Claude Code locally
pnpm build
claude mcp add skulls-dev -- node /path/to/mcp/build/index.js

# Lint, format, typecheck
pnpm lint && pnpm format && pnpm typecheck
```

---

## Summary of Patterns

| Pattern | How We Do It |
|---------|-------------|
| Tool registration | `server.registerTool(name, metadata, handler)` |
| Input validation | Zod schemas in `inputSchema` |
| State management | In-memory `Map` with UUID sessions |
| Content storage | Filesystem: JSON metadata + Markdown content |
| Response format | `{ content: [{ type: "text", text: JSON.stringify(...) }] }` |
| Error format | Same as response but with `isError: true` |
| LLM guidance | Instructions embedded in both tool descriptions and response data |
| Extensibility | Metadata-driven templates, zero code changes to add content |
| Build | Rollup single-file ESM bundle with external deps |
| Transport | stdio (stdin/stdout for protocol, stderr for logs) |
