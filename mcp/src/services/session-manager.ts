import { randomUUID } from "node:crypto";
import type { Session } from "../types";

/**
 * Manages planning sessions with in-memory storage.
 * Sessions track the current language and template selection.
 */
export class SessionManager {
  private sessions: Map<string, Session> = new Map();

  /**
   * Create a new session and return its ID.
   */
  createSession(): string {
    const id = randomUUID();
    const session: Session = {
      id,
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return id;
  }

  /**
   * Get a session by ID.
   * @throws Error if session not found
   */
  getSession(sessionId: string): Session {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(
        `Session not found: ${sessionId}. Call init_planning first to get a valid sessionId.`
      );
    }
    return session;
  }

  /**
   * Update a session's language selection.
   */
  setLanguage(sessionId: string, language: string): void {
    const session = this.getSession(sessionId);
    session.language = language;
    // Clear template when language changes
    session.template = undefined;
  }

  /**
   * Update a session's template selection.
   */
  setTemplate(sessionId: string, template: string): void {
    const session = this.getSession(sessionId);
    if (!session.language) {
      throw new Error(
        "No language selected. Call select_language first before selecting a template."
      );
    }
    session.template = template;
  }

  /**
   * Get the current language for a session.
   * @throws Error if no language selected
   */
  getLanguage(sessionId: string): string {
    const session = this.getSession(sessionId);
    if (!session.language) {
      throw new Error(
        "No language selected. Call select_language first to choose a language."
      );
    }
    return session.language;
  }

  /**
   * Get the current template for a session.
   * @throws Error if no template selected
   */
  getTemplate(sessionId: string): string {
    const session = this.getSession(sessionId);
    if (!session.template) {
      throw new Error(
        "No template selected. Call get_template first to select a template."
      );
    }
    return session.template;
  }

  /**
   * Delete a session.
   */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Check if a session exists.
   */
  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }
}
