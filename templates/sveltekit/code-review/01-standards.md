# Phase 1: Standards

Collect every rule the change must meet before reading any code.

## Objectives

- Find the project's written standards and the owner's instructions
- Detect the tools the rules depend on: type generator, component library, linters, test runner
- Fill the gaps with the Skulls baseline
- Note where the project and the baseline disagree

## Critical Rules

1. **The project's rules win** over the baseline. The baseline covers only what the project leaves unsaid.
2. **Rules come from more than docs.** Agent instruction files, lint configs and the owner's stated
   preferences count as much as a standards folder.
3. **Read the whole set** before reviewing. A rule you haven't read can't be checked.

## Collect the Project's Rules

```bash
# Standards and design docs
ls docs/standards/ docs/*.md 2>/dev/null

# Agent and contributor instructions
ls CLAUDE.md AGENTS.md CONTRIBUTING.md .claude/ 2>/dev/null
find . -name "AGENTS.md" -not -path "*/node_modules/*"

# Enforced rules: lint, style and format configs
ls eslint.config.* .eslintrc* stylelint.config.* .stylelintrc* .prettierrc* tsconfig.json 2>/dev/null
```

Also gather what the owner said while the work was done: corrections, preferences and rejected
approaches. They are rules too, even when no doc records them yet.

## Detect Project Tools

```bash
grep -E '"(type-crafter|typesafe-api-call|polymorph-ui-components)"' package.json
grep -E '"(check|lint|test|build)"' package.json
ls src/generated/ tests/ plans/ 2>/dev/null
```

| Tool | Changes the review |
|------|--------------------|
| Type generator (type-crafter) | Data types must be generated; generated files untouched |
| Component library | Every control comes from it; gaps are fixed upstream |
| Theme file (`src/styles/theme.css`) | Components use its tokens only |
| Test runner and `tests/` | Tests mirror `src/lib/`; shared builders in `tests/support/` |
| `plans/` directory | Task plans must be updated when work ships |

## Fill the Gaps

For each area in [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) (Structure, Code, Svelte, Component Library,
TypeScript, Styling, Tests, Plans and Docs, Commits and Pull Requests), write down whether the project
covers it, and where. The baseline applies to every area the project leaves open.

## Outputs

Record in this phase's plan file:

- The list of rule sources, with paths
- The detected tools
- The areas that fall back to the baseline
- Every conflict between the project and the baseline, with the rule the review will follow

## Validation

- [ ] Every standards doc, instruction file and lint config is listed and read
- [ ] The owner's stated preferences are recorded
- [ ] Each baseline area is marked as covered by the project or by the baseline
- [ ] Conflicts are recorded with the rule that wins
