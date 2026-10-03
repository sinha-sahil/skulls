# Phase 2: Refactoring Goals

**Dependencies:** Phase 1 (Assessment)

**Can be implemented in parallel with:** Phase 1 (can start early if pain points are obvious)

## Overview

Define measurable, prioritised refactoring objectives for `{{PROJECT_NAME}}` based on the assessment findings. Each goal must have a clear metric, a target value, and a rationale. Goals guide all subsequent decisions about strategy and execution order.

---

## 2.1 Goal Definition Template

For each refactoring goal, define:

```text
Goal: [Short descriptive title]
Category: [specificity | tokens | @layer | duplication | responsive | cleanup]
Metric: [What to measure]
Current: [Baseline value from assessment]
Target: [Desired value after refactoring]
Rationale: [Why this matters]
Priority: [P0 | P1 | P2 | P3]
Effort: [Low | Medium | High]
```

## 2.2 Example Goals

### Goal 1: Eliminate !important Declarations

```text
Goal: Remove all !important declarations
Category: specificity
Metric: Count of !important in stylesheets
Current: XX occurrences (from Phase 1)
Target: 0 (zero tolerance, use @layer for cascade control)
Rationale: !important creates unmaintainable specificity escalation
Priority: P0
Effort: Medium (requires @layer adoption first)
```

### Goal 2: Remove ID Selectors for Styling

```text
Goal: Replace all #id selectors with class selectors
Category: specificity
Metric: Count of ID selectors used for styling
Current: XX occurrences
Target: 0 (IDs only for anchors and JS hooks)
Rationale: ID specificity (1-0-0) is too high, impossible to override cleanly
Priority: P0
Effort: Low (find and replace, update HTML)
```

### Goal 3: Adopt @layer for Cascade Control

```text
Goal: Wrap all styles in @layer declarations
Category: @layer
Metric: Percentage of rules inside @layer
Current: 0% (no @layer usage)
Target: 100%
Rationale: @layer provides explicit cascade ordering without specificity wars
Priority: P1
Effort: High (requires restructuring all stylesheets)
```

### Goal 4: Migrate Hard-coded Values to Custom Properties

```text
Goal: Replace hard-coded colours, spacing, and typography with design tokens
Category: tokens
Metric: Custom property coverage percentage
Current: Colours XX%, Spacing XX%, Typography XX%
Target: Colours 95%+, Spacing 90%+, Typography 90%+
Rationale: Tokens enable theming, consistency, and single-source-of-truth updates
Priority: P1
Effort: Medium
```

### Goal 5: Reduce Selector Specificity

```text
Goal: Flatten selectors to a maximum of 0-2-0 specificity
Category: specificity
Metric: Count of selectors with specificity > 0-2-0
Current: XX selectors
Target: 0 selectors exceeding 0-2-0
Rationale: Low specificity makes styles composable and overridable
Priority: P1
Effort: Medium (requires BEM adoption or selector flattening)
```

### Goal 6: Remove Duplicate Declarations

```text
Goal: Consolidate duplicate property-value pairs into shared components or tokens
Category: duplication
Metric: Count of duplicated style patterns
Current: XX duplicate patterns identified
Target: <5 remaining duplicates
Rationale: Duplicates increase file size and create inconsistency risk
Priority: P2
Effort: Medium
```

### Goal 7: Standardise Responsive Approach

```text
Goal: Adopt consistent mobile-first breakpoints or container queries
Category: responsive
Metric: Consistency of breakpoint values and approach
Current: Mixed min-width/max-width, XX different breakpoint values
Target: Consistent mobile-first OR container queries, ≤5 standard breakpoints
Rationale: Inconsistent breakpoints cause responsive bugs and maintenance pain
Priority: P2
Effort: Medium
```

### Goal 8: Remove Outdated Vendor Prefixes

```text
Goal: Remove vendor prefixes that are no longer needed for {{BROWSER_TARGETS}}
Category: cleanup
Metric: Count of vendor prefixes
Current: XX vendor prefixes
Target: 0 unnecessary prefixes (autoprefixer handles needed ones)
Rationale: Dead prefixes add noise and file size
Priority: P3
Effort: Low
```

## 2.3 Priority Definitions

```text
P0 - Critical: Must be done. Actively causing bugs or blocking other work.
P1 - High:     Should be done. Significant maintenance or quality impact.
P2 - Medium:   Nice to have. Improves quality but not urgent.
P3 - Low:      When time permits. Minor cleanup or cosmetic.
```

## 2.4 Goal Prioritisation Matrix

```text
| Goal | Priority | Effort | Dependencies | Order |
|------|----------|--------|--------------|-------|
| Remove !important | P0 | Medium | @layer adoption | 3rd |
| Remove ID selectors | P0 | Low | None | 1st |
| Adopt @layer | P1 | High | None | 2nd |
| Migrate to tokens | P1 | Medium | Token files exist | 4th |
| Reduce specificity | P1 | Medium | ID removal, @layer | 5th |
| Remove duplicates | P2 | Medium | Tokens, naming | 6th |
| Standardise responsive | P2 | Medium | None | 7th |
| Remove vendor prefixes | P3 | Low | None | 8th |
```

## 2.5 Success Criteria

Define what "done" looks like for the entire refactoring effort:

```text
The refactoring is complete when:
  - [ ] Zero !important declarations remain
  - [ ] Zero ID selectors are used for styling
  - [ ] 100% of rules are inside @layer declarations
  - [ ] 90%+ of values use custom property tokens
  - [ ] No selector exceeds 0-2-0 specificity
  - [ ] Consistent responsive approach (mobile-first or container queries)
  - [ ] stylelint . passes with zero warnings
  - [ ] pnpm build succeeds
  - [ ] No visual regressions compared to baseline
  - [ ] Total CSS size reduced by at least XX%
```

---

## Checklist

- [ ] All goals have measurable metrics with current and target values
- [ ] Goals are prioritised (P0-P3) based on impact
- [ ] Dependencies between goals are documented
- [ ] Execution order accounts for dependencies
- [ ] Success criteria are defined and agreed upon
- [ ] Effort estimates are realistic
- [ ] Goals are achievable incrementally (no big-bang required)

## Verification

```bash
stylelint .
pnpm build
```

Goals should be reviewed and agreed upon before proceeding to Phase 3 (Impact Analysis).
