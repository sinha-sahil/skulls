/**
 * Root metadata file structure (templates/meta.json)
 */
export interface RootMeta {
  version: string;
  languages: Record<string, LanguageInfo>;
}

export interface LanguageInfo {
  description: string;
}

/**
 * Language-level metadata (templates/{language}/meta.json)
 */
export interface LanguageMeta {
  language: string;
  templates: Record<string, TemplateInfo>;
}

export interface TemplateInfo {
  description: string;
  use_cases: string[];
}

/**
 * Template-level metadata (templates/{language}/{template}/meta.json)
 */
export interface TemplateMeta {
  name: string;
  description: string;
  use_cases: string[];
  phases: PhaseInfo[];
  verification: VerificationStep[];
}

export interface PhaseInfo {
  file: string;
  name: string;
}

export interface VerificationStep {
  command: string;
  description: string;
}

/**
 * Session management
 */
export interface Session {
  id: string;
  language?: string;
  template?: string;
  createdAt: Date;
}

/**
 * Tool response types
 */
export interface InitPlanningResponse {
  sessionId: string;
  languages: Record<
    string,
    {
      description: string;
      templateCount: number;
    }
  >;
}

export interface SelectLanguageResponse {
  sessionId: string;
  language: string;
  templates: Array<{
    name: string;
    description: string;
    useCases: string[];
  }>;
}

export interface GetTemplateResponse {
  sessionId: string;
  template: {
    name: string;
    overview: string;
    phases: Array<{
      number: number;
      name: string;
      content: string;
    }>;
    quickReference: string | null;
    verification: VerificationStep[];
  };
}

export interface GetPhaseResponse {
  sessionId: string;
  phase: {
    number: number;
    name: string;
    content: string;
  };
}

export interface GetQuickReferenceResponse {
  sessionId: string;
  quickReference: string;
}

export interface GetVerificationStepsResponse {
  sessionId: string;
  steps: VerificationStep[];
}

export interface CompletePlanningResponse {
  sessionId: string;
  completed: boolean;
  summary?: string;
}
