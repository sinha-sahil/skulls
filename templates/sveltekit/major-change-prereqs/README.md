# major-change-prereqs

Readiness-plan process for disruptive changes in a SvelteKit project:
SvelteKit version bump, Svelte compiler bump, core-dep bump, adapter swap, toolchain overhaul.

**This template is a process framework, not a lookup table.** Phase files describe the
*process* of auditing a major change. Concrete patterns, detection commands, and version
maps are derived per-change from the target release's migration guide — not shipped in
the template.

## Phases

| # | File | Produces |
|---|------|----------|
| 1 | `01-dependency-audit.md` | version mapping, peer conflicts, adapter + engine requirements |
| 2 | `02-config-changes.md` | per-file config diff plan (svelte, vite, ts, hooks, lint/format) |
| 3 | `03-breaking-changes-impact.md` | breaking-change set derived from target guide, counted, classified |
| 4 | `04-ci-cd-changes.md` | pipeline, build agents, adapter-driven deploy, cache updates |
| 5 | `05-validation-strategy.md` | install / build / check / route / adapter gates + go/no-go |

## Scope

- In: deps, configs, CI/CD, route + endpoint + adapter validation
- Out: feature code rewrites — use a separate execution template

## Rules

- Pin exact target versions. Never use ranges.
- **Read the target release's migration guide in full before running Phase 3.**
  The breaking-change set is derived from it, not assumed.
- Audit adapter compatibility before bumping `@sveltejs/kit`.
- Svelte compiler breaking changes and SvelteKit API breaking changes are separate
  concerns — keep them distinct in Phase 3.
- Flag runtime-break patterns (compile silently, fail in production) as P0 regardless of effort.
- Infra changes and code changes live in separate plans.

## How to use

1. Identify the change path (source release → target release).
2. Fetch the target release's official migration guide.
3. Run each phase in order, filling in project-specific values.
4. Produce go/no-go at the end of Phase 5 before touching component code.

## Use when

- SvelteKit major version upgrade
- Svelte compiler major upgrade inside a SvelteKit app
- Major bump of Vite, TypeScript, or Node LTS
- Adapter swap or deployment target change
- Go / no-go on a disruptive change
