# Refactoring Plan Template

Plan and execute a structured refactoring effort for HTML markup.

## Overview

HTML refactoring improves semantic correctness, accessibility, and maintainability.
This template guides you through assessing the current markup, defining goals,
analysing impact, and executing changes incrementally.

## Project Configuration

### Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project name | `my-site` |
| `{{SITE_NAME}}` | Site display name | `My Website` |
| `{{BASE_URL}}` | Base URL | `https://example.com` |
| `{{SRC_DIR}}` | Source directory | `src/` |
| `{{PAGE_NAME}}` | Page being refactored | `about`, `contact` |

## When to Use

- Improving semantic markup (replacing div soup)
- Fixing accessibility (WCAG) compliance issues
- Modernising from legacy HTML to HTML5
- Adding structured data (Schema.org)
- Consolidating duplicate markup patterns

## Phases

| File | Description |
|------|-------------|
| [01-assessment.md](./01-assessment.md) | Audit current markup quality |
| [02-goals.md](./02-goals.md) | Define refactoring objectives |
| [03-impact-analysis.md](./03-impact-analysis.md) | Map affected pages and dependencies |
| [04-strategy.md](./04-strategy.md) | Choose refactoring approach |
| [05-execution-plan.md](./05-execution-plan.md) | Ordered refactoring steps |
| [06-testing-strategy.md](./06-testing-strategy.md) | Validation and testing plan |
| [07-rollback-plan.md](./07-rollback-plan.md) | Recovery procedures |
