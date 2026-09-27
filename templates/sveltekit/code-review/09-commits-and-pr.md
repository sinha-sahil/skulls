# Phase 9: Commits and Pull Request

Check the commit and the pull request description as carefully as the code.

## Objectives

- Confirm one commit per branch, in the expected message style
- Confirm the description is lean, accurate and has its screenshots
- Confirm public repositories carry no private names
- Confirm stacked branches are in order

## Critical Rules

1. **One commit per branch.** Amend and push with `--force-with-lease`; never stack fix-up commits.
2. **Subject:** `type: summary` in lowercase. **Body:** only `- area: fact` bullets naming the code touched.
3. **No AI attribution** in commits or pull requests.
4. **Lean descriptions:** what changed, what to do before merging, what was checked, what's still open.
5. **Public repositories never mention private projects,** customers or internal links.

## Checks

```bash
# One commit on top of the base
git rev-list --count origin/{{BASE_BRANCH}}..HEAD

# The message
git log -1 --format=%B

# The description
gh pr view {{PR_NUMBER}} --json title,body -q '.title + "\n\n" + .body'

# Is the repository public?
gh repo view --json visibility -q .visibility
```

For the commit, check:

- **Subject:** a type from the project's list (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `ci`),
  lowercase, saying what the change does.
- **Bullets:** each starts with the area touched (a module, file or folder: `profile:`, `tests:`,
  `plans:`) and states a fact a reviewer can use. No headings, paragraphs or vague bullets.
- **Accuracy:** every bullet still matches the code after the fixes; stale bullets are rewritten.
- **Attribution:** no `Co-Authored-By` or "Generated with" lines.

For the pull request, check:

- **Title:** plain words for what ships.
- **Body:** a few bullets, no narrative; numbers and names match the final code; nothing to do before
  merging is left unsaid.
- **Screenshots:** attached for changed screens at 1280 px and 390 px. When the tools can't upload
  images, hand the saved files to the owner to attach.
- **Public repositories:** no private project, customer or internal link anywhere in the branch name,
  commit or description. The branch name describes the change, and a pull request's head branch is
  never renamed.
- **Stacks:** each branch is based on the previous one and was rebased after its base changed.

## Examples

```text
# WRONG
Fixed stuff and cleaned up the code

- Refactored a lot of things to make them better
- Co-Authored-By: ...

# CORRECT
fix: keep focus inside the modal when a sheet opens with it

- modal: an action moves focus in and back; Tab and Escape stay with the dialog
- sheet: focuses its panel only when nothing inside already has focus
- tests: nested dialog focus, Escape and focus return
```

## Outputs

Record each finding in this phase's plan file using the finding format from the quick reference.

## Validation

- [ ] One commit on the base, in the message style, without attribution
- [ ] The description is lean and matches the final code
- [ ] Screenshots attached or handed to the owner
- [ ] No private names in a public repository
- [ ] Stacked branches rebased and re-checked
