# Phase 7 · Rollback Plan

## Objective

Define rollback procedures for every phase of the HTML refactoring in **{{PROJECT_NAME}}** so that any change can be safely reversed without data loss or broken functionality.

---

## Rollback Principles

1. **Every change is reversible** — no refactoring step should be a one-way door
2. **Git is the primary rollback mechanism** — all changes committed atomically
3. **Verify before removing** — old files stay until new structure is validated
4. **Incremental commits** — each file or logical unit committed separately for granular rollback
5. **Build must pass** — rollback is triggered if `pnpm build` fails after any step

---

## Rollback Triggers

A rollback should be initiated when any of these conditions are met:

| Trigger | Severity | Rollback Scope |
|---|---|---|
| `pnpm build` fails | Critical | Revert last commit |
| `htmlhint .` reports errors not present before | High | Revert last commit |
| axe-core critical/serious violations increase | High | Revert accessibility pass |
| Visual regression detected | High | Revert last pass |
| Screen reader announces incorrectly | Medium | Revert specific element change |
| Broken links detected in production | Critical | Revert URL-changing commits |
| Third-party integration breaks | High | Revert element changes in affected area |
| Lighthouse accessibility score drops | Medium | Investigate before rollback |

---

## Git-Based Rollback Procedures

### Strategy: Atomic Commits per Logical Change

```bash
# Commit structure for refactoring
git commit -m "refactor(html): replace header div with semantic header element"
git commit -m "refactor(html): replace nav div with semantic nav element"
git commit -m "refactor(html): replace main div with semantic main element"
git commit -m "refactor(html): replace footer div with semantic footer element"

# Each commit is independently revertible
```

### Rollback: Single Commit

```bash
# Identify the problematic commit
git log --oneline -10

# Revert a single commit (creates a new commit)
git revert <commit-hash>

# Verify build still passes
pnpm build
htmlhint .
```

### Rollback: Entire Pass

```bash
# If an entire refactoring pass needs reverting,
# revert all commits in the pass (newest first)

git revert <newest-commit-hash>
git revert <second-commit-hash>
git revert <oldest-commit-hash>

# Or revert the entire branch merge
git revert -m 1 <merge-commit-hash>

# Verify
pnpm build
htmlhint .
```

### Rollback: Emergency — Restore to Pre-Refactoring State

```bash
# Tag the pre-refactoring state before starting
git tag pre-refactoring-baseline

# Emergency rollback: reset to baseline
git checkout pre-refactoring-baseline -- .
pnpm build

# If verified, commit the rollback
git add -A
git commit -m "rollback: restore pre-refactoring baseline"
```

---

## Per-Pass Rollback Procedures

### Pass 1-2 Rollback: Semantic Elements

**Risk:** CSS selectors or JavaScript queries break due to element type changes.

```bash
# Rollback semantic element changes
git revert <semantic-commits>

# Or surgically revert a single element change:
```

```html
<!-- Revert: change <header> back to <div class="header"> -->
<!-- This is safe because class-based CSS still works -->

<!-- If reverting navigation semantic change: -->
<!-- Replace <nav aria-label="Main navigation"> -->
<!-- with <div class="nav"> -->
<!-- Remove aria-label, aria-current attributes -->
```

**Verification after rollback:**
- [ ] `pnpm build` passes
- [ ] `htmlhint .` passes
- [ ] CSS renders correctly (visual check)
- [ ] JavaScript interactions work

### Pass 3 Rollback: Heading Hierarchy

**Risk:** Low — heading changes rarely break functionality.

```bash
# Revert heading changes
git revert <heading-commits>
```

```html
<!-- Revert: restore original heading levels -->
<!-- h2 → h3 (restore skipped level) -->
<!-- This affects outline, not visual rendering if CSS targets classes -->
```

### Pass 4 Rollback: Accessibility Attributes

**Risk:** Low — ARIA attributes are additive and do not affect visual rendering.

```bash
# Revert accessibility attribute additions
git revert <accessibility-commits>
```

```html
<!-- Revert: remove added ARIA attributes -->
<!-- Remove aria-label, aria-labelledby, aria-expanded, etc. -->
<!-- Remove skip link if newly added -->
<!-- Remove role attributes -->
```

### Pass 5 Rollback: Form Modernisation

**Risk:** Medium — form changes affect validation behaviour and autocomplete.

```bash
# Revert form changes
git revert <form-commits>
```

```html
<!-- Revert: restore original form markup -->
<!-- Remove: required, autocomplete, aria-describedby, aria-invalid -->
<!-- Restore: original label structure -->
<!-- Remove: error role="alert" patterns -->
<!-- Restore: original input types if changed (e.g. type="email" → type="text") -->
```

**Verification after rollback:**
- [ ] Forms submit correctly
- [ ] Server-side validation still catches errors
- [ ] No broken form functionality

### Pass 6 Rollback: Structured Data

**Risk:** Low — structured data is metadata and does not affect rendering.

```bash
# Revert structured data additions
git revert <structured-data-commits>
```

```html
<!-- Revert: remove added structured data -->
<!-- Remove <script type="application/ld+json"> blocks -->
<!-- Remove itemscope, itemtype, itemprop attributes from elements -->
```

---

## URL Redirect Rollback

If file reorganisation changed URLs:

```bash
# Rollback redirects in server configuration
# Remove 301 redirects from .htaccess, nginx.conf, or _redirects

# Restore original file paths in build configuration
# Verify old URLs resolve correctly
```

| Original URL | Redirect | Rollback Action |
|---|---|---|
| `/about.html` | `/about/` | Remove redirect, restore `about.html` |
| `/blog.html` | `/blog/` | Remove redirect, restore `blog.html` |

---

## Pre-Refactoring Safeguards

### Before Starting Any Refactoring

```bash
# 1. Create a baseline tag
git tag pre-refactoring-baseline

# 2. Create a snapshot of build output
pnpm build
cp -r dist/ dist-baseline/

# 3. Capture visual regression baselines
npx backstopjs reference

# 4. Record accessibility baseline
npx @axe-core/cli {{BASE_URL}} --tags wcag2a,wcag2aa > reports/axe-baseline.json
npx lighthouse {{BASE_URL}} --only-categories=accessibility --output=json > reports/lighthouse-baseline.json

# 5. Record HTMLHint baseline
htmlhint . > reports/htmlhint-baseline.txt
```

### Baseline Artefacts

| Artefact | Location | Purpose |
|---|---|---|
| Git tag | `pre-refactoring-baseline` | Full source rollback point |
| Build snapshot | `dist-baseline/` | Compare build output |
| Visual baselines | BackstopJS reference images | Visual regression detection |
| axe-core report | `reports/axe-baseline.json` | Accessibility comparison |
| Lighthouse report | `reports/lighthouse-baseline.json` | Score comparison |
| HTMLHint report | `reports/htmlhint-baseline.txt` | Validation comparison |

---

## Rollback Communication

When a rollback is executed:

1. **Notify team** — post in the team channel with rollback reason
2. **Document** — add entry to rollback log below
3. **Investigate** — determine root cause before re-attempting
4. **Re-plan** — adjust strategy to avoid the same issue

### Rollback Log

| Date | Pass | Commits Reverted | Reason | Resolution |
|---|---|---|---|---|
| | | | | |
| | | | | |

---

## Rollback Plan Checklist

- [ ] Pre-refactoring baseline tag created
- [ ] Build output snapshot captured
- [ ] Visual regression baselines captured
- [ ] Accessibility baselines recorded
- [ ] Rollback triggers defined and agreed
- [ ] Per-pass rollback procedures documented
- [ ] URL redirect rollback plan ready (if applicable)
- [ ] Emergency rollback procedure tested
- [ ] Team knows how to trigger a rollback
- [ ] Rollback log template ready
