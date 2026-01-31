#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { SessionManager } from "./services/session-manager";
import { TemplateLoader } from "./services/template-loader";

/**
 * Skulls MCP Server
 *
 * Provides planning templates for software development organized by language.
 * Follows a Learn -> Implement -> Verify workflow pattern.
 */
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

    this.registerTools();
  }

  private registerTools(): void {
    this.registerInitPlanning();
    this.registerSelectLanguage();
    this.registerGetTemplate();
    this.registerGetPhase();
    this.registerGetQuickReference();
    this.registerGetVerificationSteps();
    this.registerCompletePlanning();
  }

  /**
   * LEARN PHASE - Step 1: Initialize planning session
   */
  private registerInitPlanning(): void {
    this.server.registerTool(
      "init_planning",
      {
        title: "Initialize Planning",
        description: `MANDATORY FIRST STEP: This tool MUST be called before any other Skulls tools.

Returns a sessionId that is REQUIRED for all subsequent tool calls.
Also returns available languages with their descriptions and template counts.

ALL OTHER SKULLS TOOLS WILL FAIL without a valid sessionId from this call.

═══════════════════════════════════════════════════════════════════════════════
CRITICAL - PLAN OUTPUT REQUIREMENTS (MUST FOLLOW)
═══════════════════════════════════════════════════════════════════════════════

STEP 1: CHECK YOUR WRITE PERMISSIONS FIRST
Before asking the user anything, determine where YOU can write files:
- Check your current mode (plan mode, full access, etc.)
- Identify directories you have write access to
- Common writable locations: ./plans, project root, temp directories

STEP 2: INFORM THE USER
Tell the user:
"I can write plans to: [list directories you have access to]
I'll create plans in: [your recommended directory]/[service-name]/
If you need plans in a different location I cannot access, please switch modes first."

STEP 3: GET CONFIRMATION BEFORE WRITING
Wait for user confirmation before creating any files.

STEP 4: CREATE DIRECTORY STRUCTURE
Service name is a DIRECTORY, not a filename prefix:

✓ CORRECT: ./plans/user-auth/00-overview.md  (directory structure)
✗ WRONG:   ./plans/user-auth-00-overview.md  (filename prefix)

Structure:
{plans_dir}/{service-name}/        <-- CREATE THIS DIRECTORY
├── 00-overview.md                 <-- files go INSIDE
├── 01-{phase}.md
└── checklist.md

RULES:
1. CHECK your write permissions FIRST - don't ask user then fail
2. INFORM user where you CAN write before asking where they WANT
3. If user wants a location you can't access, tell them to switch modes
4. CREATE A DIRECTORY for the service/feature being planned
5. PUT ALL FILES INSIDE that directory (not as filename prefixes)
6. Create ALL phase files (mark unused ones as SKIPPED)
7. Include checklist.md with trackable - [ ] items
═══════════════════════════════════════════════════════════════════════════════

Use this to:
1. Start a new planning session
2. Discover available languages (rust, svelte, sveltekit, etc.)
3. Get the sessionId needed for all other operations`,
      },
      async () => {
        try {
          const sessionId = this.sessionManager.createSession();
          const languages = await this.templateLoader.getLanguages();
          const globalInstructions =
            await this.templateLoader.getGlobalInstructions();

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    sessionId,
                    languages,
                    CRITICAL_INSTRUCTIONS: {
                      message:
                        "You MUST follow these plan output requirements exactly.",
                      workflow: {
                        step1_check_permissions:
                          "FIRST: Check where YOU can write files (based on your current mode/permissions)",
                        step2_inform_user:
                          "THEN: Tell user 'I can write to: [X]. I'll create plans in [X]/[service-name]/. If you need a different location, please switch modes.'",
                        step3_get_confirmation:
                          "WAIT: Get user confirmation before creating any files",
                        step4_create_files:
                          "FINALLY: Create directory structure and files",
                      },
                      planStructure: {
                        format: "{plans_dir}/{service-name}/[files]",
                        explanation:
                          "service-name is a DIRECTORY, not a filename prefix",
                        correct: [
                          "./plans/user-auth/00-overview.md",
                          "./plans/user-auth/01-types.md",
                        ],
                        wrong: [
                          "./plans/user-auth-00-overview.md",
                          "./plans/user-auth-01-types.md",
                        ],
                      },
                      rules: [
                        "CHECK your write permissions FIRST before asking user anything",
                        "INFORM user where you CAN write, not where they WANT",
                        "If user needs a location you can't access, tell them to SWITCH MODES",
                        "CREATE A DIRECTORY named after what is being planned",
                        "PUT ALL FILES INSIDE that directory - NOT as prefixed filenames",
                        "Create ALL phase files - even if not needed (mark as SKIPPED)",
                        "Include checklist.md with trackable - [ ] items",
                        "NEVER try to write somewhere you don't have permission",
                      ],
                      codeQuality: {
                        comments: {
                          rule: "Code MUST be self-explanatory. NO redundant comments.",
                          guidelines: [
                            "DO NOT comment obvious code (CRUD, standard patterns)",
                            "ONLY comment exceptional or non-obvious behavior",
                            "If code needs a comment, consider rewriting it first",
                          ],
                          bad: "// Create user\\nlet user = User::new();",
                          good: "let user = User::new();\\n// Delay to prevent timing attacks\\nsleep(100).await;",
                        },
                      },
                    },
                    globalInstructions,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error initializing planning: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * LEARN PHASE - Step 2: Select a language
   */
  private registerSelectLanguage(): void {
    this.server.registerTool(
      "select_language",
      {
        title: "Select Language",
        description: `Select a programming language/framework to get available templates.

Requires a valid sessionId from init_planning.
Returns all templates available for the selected language with their descriptions and use cases.

Call this after init_planning and before get_template.`,
        inputSchema: {
          sessionId: z.string().describe("Session ID from init_planning"),
          language: z
            .string()
            .describe(
              "Language to select (e.g., 'rust', 'svelte', 'sveltekit')"
            ),
        },
      },
      async ({ sessionId, language }) => {
        try {
          // Validate session exists
          this.sessionManager.getSession(sessionId);

          // Validate language exists
          await this.templateLoader.validateLanguage(language);

          // Set language in session
          this.sessionManager.setLanguage(sessionId, language);

          // Get templates for language
          const templates = await this.templateLoader.getTemplates(language);

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    sessionId,
                    language,
                    templates,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error selecting language: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * LEARN PHASE - Step 3: Get a template
   */
  private registerGetTemplate(): void {
    this.server.registerTool(
      "get_template",
      {
        title: "Get Template",
        description: `Get a planning template with all its phases.

Requires a valid sessionId with a language already selected via select_language.
Returns the full template including overview, all phases, quick reference, and verification steps.

The response includes PLAN_FILES_TO_CREATE which lists the EXACT file names you must create.
DO NOT modify or rename these files. Use them exactly as specified.

CRITICAL - PLAN OUTPUT STRUCTURE:
1. ASK user for plans directory if not specified
2. Create directory: {plans_dir}/{service-name}/
3. Create files with EXACT names from PLAN_FILES_TO_CREATE.files
4. NEVER rename or modify the file names from the template
5. ALWAYS include 00-overview.md and checklist.md`,
        inputSchema: {
          sessionId: z.string().describe("Session ID from init_planning"),
          template: z
            .string()
            .describe(
              "Template name to get (e.g., 'service-creation', 'endpoint-planning')"
            ),
        },
      },
      async ({ sessionId, template }) => {
        try {
          // Get language from session
          const language = this.sessionManager.getLanguage(sessionId);

          // Validate template exists
          await this.templateLoader.validateTemplate(language, template);

          // Set template in session
          this.sessionManager.setTemplate(sessionId, template);

          // Get full template content
          const content = await this.templateLoader.getTemplateContent(
            language,
            template
          );

          // Get actual phase file names from the template
          const phaseFiles = content.phases.map((p) => p.file);
          const allPlanFiles = [
            "00-overview.md",
            ...phaseFiles,
            "checklist.md",
          ];

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    sessionId,
                    PLAN_FILES_TO_CREATE: {
                      instruction:
                        "Create a DIRECTORY for the service, then put files INSIDE it",
                      directory_structure: `{plans_dir}/{service-name}/\n${allPlanFiles.map((f) => `├── ${f}`).join("\n")}`,
                      files: allPlanFiles,
                      correct_example: {
                        description:
                          'Planning "user-auth" in ./plans - CREATE DIRECTORY then files inside:',
                        paths: allPlanFiles.map((f) => `./plans/user-auth/${f}`),
                      },
                      wrong_example: {
                        description:
                          "DO NOT prefix filenames with service name:",
                        paths: allPlanFiles
                          .slice(0, 3)
                          .map((f) => `./plans/user-auth-${f}`),
                      },
                      rules: [
                        "FIRST: Create directory {plans_dir}/{service-name}/",
                        "THEN: Create files INSIDE that directory",
                        "WRONG: ./plans/user-auth-00-overview.md (filename prefix)",
                        "CORRECT: ./plans/user-auth/00-overview.md (directory + file)",
                        "Use EXACT file names from this list - do not rename",
                        "Create ALL files - even if a phase is not needed",
                        "For skipped phases: create file with '## Status: SKIPPED' and explain why",
                        "ASK user for plans directory if not specified",
                      ],
                    },
                    template: content,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error getting template: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * IMPLEMENT PHASE - Get a specific phase
   */
  private registerGetPhase(): void {
    this.server.registerTool(
      "get_phase",
      {
        title: "Get Phase",
        description: `Get a specific phase from the current template.

Useful for re-reading a phase during implementation without loading the entire template.
Requires a template to be selected via get_template first.`,
        inputSchema: {
          sessionId: z.string().describe("Session ID from init_planning"),
          phaseNumber: z
            .number()
            .int()
            .positive()
            .describe("Phase number to get (e.g., 1, 2, 3)"),
        },
      },
      async ({ sessionId, phaseNumber }) => {
        try {
          const language = this.sessionManager.getLanguage(sessionId);
          const template = this.sessionManager.getTemplate(sessionId);

          const phase = await this.templateLoader.getPhase(
            language,
            template,
            phaseNumber
          );

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    sessionId,
                    phase,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error getting phase: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * IMPLEMENT PHASE - Get quick reference
   */
  private registerGetQuickReference(): void {
    this.server.registerTool(
      "get_quick_reference",
      {
        title: "Get Quick Reference",
        description: `Get the quick reference for the current template.

Contains placeholder definitions, common patterns, and checklists for quick lookup
during implementation. Requires a template to be selected via get_template first.`,
        inputSchema: {
          sessionId: z.string().describe("Session ID from init_planning"),
        },
      },
      async ({ sessionId }) => {
        try {
          const language = this.sessionManager.getLanguage(sessionId);
          const template = this.sessionManager.getTemplate(sessionId);

          const quickReference = await this.templateLoader.getQuickReference(
            language,
            template
          );

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    sessionId,
                    quickReference,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error getting quick reference: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * VERIFY PHASE - Get verification steps
   */
  private registerGetVerificationSteps(): void {
    this.server.registerTool(
      "get_verification_steps",
      {
        title: "Get Verification Steps",
        description: `MUST be called after implementation is complete.

Returns the verification commands that should be run to validate the implementation.
These typically include compile checks, linting, and tests specific to the language/framework.

Run these commands and fix any issues before marking the planning session complete.`,
        inputSchema: {
          sessionId: z.string().describe("Session ID from init_planning"),
        },
      },
      async ({ sessionId }) => {
        try {
          const language = this.sessionManager.getLanguage(sessionId);
          const template = this.sessionManager.getTemplate(sessionId);

          const steps = await this.templateLoader.getVerificationSteps(
            language,
            template
          );

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    sessionId,
                    steps,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error getting verification steps: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * VERIFY PHASE - Complete planning session
   */
  private registerCompletePlanning(): void {
    this.server.registerTool(
      "complete_planning",
      {
        title: "Complete Planning",
        description: `Mark the planning session as complete.

Call this after all verification steps have passed.
Optionally provide a summary of what was implemented for logging purposes.

BEFORE COMPLETING - VERIFY PLAN STRUCTURE:
□ Plans are in {plans_dir}/{service-name}/ directory structure
□ 00-overview.md exists with goals, scope, success criteria
□ Each phase has its own numbered file (01-xxx.md, 02-xxx.md)
□ checklist.md exists with trackable - [ ] items
□ NO monolithic single-file plans were created

If any of these are missing, create them before calling this tool.`,
        inputSchema: {
          sessionId: z.string().describe("Session ID from init_planning"),
          summary: z
            .string()
            .optional()
            .describe("Optional summary of what was implemented"),
        },
      },
      async ({ sessionId, summary }) => {
        try {
          // Validate session exists
          this.sessionManager.getSession(sessionId);

          // Delete session (cleanup)
          this.sessionManager.deleteSession(sessionId);

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    sessionId,
                    completed: true,
                    summary:
                      summary ?? "Planning session completed successfully.",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error completing planning: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }

  /**
   * Start the MCP server with stdio transport.
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    // Log to stderr (stdout is for MCP protocol)
    console.error("Skulls MCP Server running on stdio");
  }
}

// Start the server
const server = new SkullsMcpServer();
server.run().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
