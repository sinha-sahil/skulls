import { readFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  RootMeta,
  LanguageMeta,
  TemplateMeta,
  VerificationStep,
} from "../types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Service for loading templates from the filesystem.
 * Reads metadata files and template content from the templates directory.
 */
export class TemplateLoader {
  private templatesPath: string;

  constructor(templatesPath?: string) {
    // Default to ../templates relative to build/index.js
    this.templatesPath = templatesPath ?? join(__dirname, "..", "templates");
  }

  /**
   * Read and parse a JSON file.
   */
  private async readJson<T>(filePath: string): Promise<T> {
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  }

  /**
   * Read a text file, return null if not found.
   */
  private async readText(filePath: string): Promise<string | null> {
    try {
      return await readFile(filePath, "utf-8");
    } catch {
      return null;
    }
  }

  /**
   * Check if a file exists.
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get global instructions that apply to all templates.
   */
  async getGlobalInstructions(): Promise<string> {
    const instructionsPath = join(this.templatesPath, "GLOBAL-INSTRUCTIONS.md");
    const content = await this.readText(instructionsPath);
    return content ?? "";
  }

  /**
   * Get root metadata with all available languages.
   */
  async getRootMeta(): Promise<RootMeta> {
    const metaPath = join(this.templatesPath, "meta.json");
    return this.readJson<RootMeta>(metaPath);
  }

  /**
   * Get language metadata with available templates.
   */
  async getLanguageMeta(language: string): Promise<LanguageMeta> {
    const metaPath = join(this.templatesPath, language, "meta.json");
    return this.readJson<LanguageMeta>(metaPath);
  }

  /**
   * Get template metadata.
   */
  async getTemplateMeta(
    language: string,
    template: string
  ): Promise<TemplateMeta> {
    const metaPath = join(this.templatesPath, language, template, "meta.json");
    return this.readJson<TemplateMeta>(metaPath);
  }

  /**
   * Get all languages with their template counts.
   */
  async getLanguages(): Promise<
    Record<string, { description: string; templateCount: number }>
  > {
    const rootMeta = await this.getRootMeta();
    const result: Record<
      string,
      { description: string; templateCount: number }
    > = {};

    for (const [lang, info] of Object.entries(rootMeta.languages)) {
      try {
        const langMeta = await this.getLanguageMeta(lang);
        result[lang] = {
          description: info.description,
          templateCount: Object.keys(langMeta.templates).length,
        };
      } catch {
        // Language directory exists in meta but not on disk, skip
        console.error(`Warning: Language ${lang} not found on disk`);
      }
    }

    return result;
  }

  /**
   * Get all templates for a language.
   */
  async getTemplates(
    language: string
  ): Promise<Array<{ name: string; description: string; useCases: string[] }>> {
    const langMeta = await this.getLanguageMeta(language);
    return Object.entries(langMeta.templates).map(([name, info]) => ({
      name,
      description: info.description,
      useCases: info.use_cases,
    }));
  }

  /**
   * Get full template content including all phases.
   */
  async getTemplateContent(
    language: string,
    template: string
  ): Promise<{
    name: string;
    globalInstructions: string;
    overview: string;
    phases: Array<{
      number: number;
      name: string;
      file: string;
      content: string;
    }>;
    quickReference: string | null;
    verification: VerificationStep[];
  }> {
    const basePath = join(this.templatesPath, language, template);
    const meta = await this.getTemplateMeta(language, template);

    // Read global instructions
    const globalInstructions = await this.getGlobalInstructions();

    // Read README.md as overview
    const overview =
      (await this.readText(join(basePath, "README.md"))) ??
      "No overview available.";

    // Read each phase file
    const phases: Array<{
      number: number;
      name: string;
      file: string;
      content: string;
    }> = [];
    for (const phase of meta.phases) {
      const content =
        (await this.readText(join(basePath, phase.file))) ??
        `Phase file not found: ${phase.file}`;
      const number = this.extractPhaseNumber(phase.file);
      phases.push({
        number,
        name: phase.name,
        file: phase.file,
        content,
      });
    }

    // Sort phases by number
    phases.sort((a, b) => a.number - b.number);

    // Read QUICK-REFERENCE.md if exists
    const quickReference = await this.readText(
      join(basePath, "QUICK-REFERENCE.md")
    );

    return {
      name: meta.name,
      globalInstructions,
      overview,
      phases,
      quickReference,
      verification: meta.verification,
    };
  }

  /**
   * Get a specific phase by number.
   */
  async getPhase(
    language: string,
    template: string,
    phaseNumber: number
  ): Promise<{ number: number; name: string; content: string }> {
    const basePath = join(this.templatesPath, language, template);
    const meta = await this.getTemplateMeta(language, template);

    const phase = meta.phases.find(
      (p) => this.extractPhaseNumber(p.file) === phaseNumber
    );
    if (!phase) {
      throw new Error(`Phase ${phaseNumber} not found in template ${template}`);
    }

    const content =
      (await this.readText(join(basePath, phase.file))) ??
      `Phase file not found: ${phase.file}`;

    return {
      number: phaseNumber,
      name: phase.name,
      content,
    };
  }

  /**
   * Get quick reference for a template.
   */
  async getQuickReference(language: string, template: string): Promise<string> {
    const basePath = join(this.templatesPath, language, template);
    const content = await this.readText(join(basePath, "QUICK-REFERENCE.md"));
    if (!content) {
      throw new Error(`Quick reference not found for template ${template}`);
    }
    return content;
  }

  /**
   * Get verification steps for a template.
   */
  async getVerificationSteps(
    language: string,
    template: string
  ): Promise<VerificationStep[]> {
    const meta = await this.getTemplateMeta(language, template);
    return meta.verification;
  }

  /**
   * Extract phase number from filename (e.g., "01-types.md" -> 1)
   */
  private extractPhaseNumber(filename: string): number {
    const match = filename.match(/^(\d+)-/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Validate that a language exists.
   */
  async validateLanguage(language: string): Promise<void> {
    const metaPath = join(this.templatesPath, language, "meta.json");
    if (!(await this.fileExists(metaPath))) {
      throw new Error(
        `Language "${language}" not found. Call init_planning to see available languages.`
      );
    }
  }

  /**
   * Validate that a template exists.
   */
  async validateTemplate(language: string, template: string): Promise<void> {
    const metaPath = join(this.templatesPath, language, template, "meta.json");
    if (!(await this.fileExists(metaPath))) {
      throw new Error(
        `Template "${template}" not found in language "${language}". Call select_language to see available templates.`
      );
    }
  }
}
