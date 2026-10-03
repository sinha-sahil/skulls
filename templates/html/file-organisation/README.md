# File Organisation Planning Template

Plan and document the file and template organisation for an HTML project.

## Overview

A well-organised HTML project separates concerns between pages, layouts, partials, and assets.
This template guides you through auditing the current structure, defining a target layout,
and migrating incrementally.

## Project Configuration

### Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{PROJECT_NAME}}` | Project name | `my-site` |
| `{{SITE_NAME}}` | Site display name | `My Website` |
| `{{BASE_URL}}` | Base URL | `https://example.com` |
| `{{SRC_DIR}}` | Source directory | `src/` |
| `{{DIST_DIR}}` | Build output directory | `dist/` |
| `{{ASSETS_DIR}}` | Static assets directory | `assets/` |

## When to Use

- Setting up a new HTML project or static site
- Restructuring an existing site that has grown organically
- Planning a template/partial system for shared markup
- Organising assets (images, fonts, scripts, styles)

## Phases

| File | Description |
|------|-------------|
| [01-assessment.md](./01-assessment.md) | Audit current file structure and identify issues |
| [02-directory-structure.md](./02-directory-structure.md) | Define target directory layout |
| [03-module-boundaries.md](./03-module-boundaries.md) | Define page, layout, and partial boundaries |
| [04-naming-conventions.md](./04-naming-conventions.md) | Establish file and ID naming rules |
| [05-dependency-flow.md](./05-dependency-flow.md) | Plan asset loading and template inheritance |
| [06-migration-plan.md](./06-migration-plan.md) | Step-by-step plan to reorganise |
