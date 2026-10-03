# Phase 1: Assessment

Audit the {{PROJECT_NAME}} codebase to identify all refactoring targets in {{REFACTOR_SCOPE}}.

## Objectives

- Catalogue legacy Svelte 4 patterns that need migration to Svelte 5
- Find all `interface` usage that should be `type`
- Identify `any` types that reduce type safety
- Map missing load function types and inconsistent error handling
- Produce a prioritised list of refactoring targets

## Legacy Pattern Detection

Run these commands from the project root to identify refactoring targets:

### Find `interface` Usage (Replace with `type`)

```bash
# All interface declarations - every one needs migration
grep -rn "^export interface\|^interface " src/ --include="*.ts" --include="*.svelte"

# Count total interfaces
grep -rcn "^export interface\|^interface " src/ --include="*.ts" --include="*.svelte" | grep -v ":0$"
```

### Find Legacy Svelte 4 Reactive Declarations

```bash
# Reactive statements ($:) - replace with $derived or $effect
grep -rn "^\s*\$:" src/ --include="*.svelte"

# Reactive assignments specifically
grep -rn "^\s*\$:\s*[a-zA-Z].*=" src/ --include="*.svelte"
```

### Find Store Usage

```bash
# Svelte store imports
grep -rn "from 'svelte/store'" src/ --include="*.ts" --include="*.svelte"

# writable/readable/derived store creation
grep -rn "writable\|readable\|derived" src/ --include="*.ts" --include="*.svelte"

# Store subscriptions ($storeName)
grep -rn "\$[a-zA-Z]" src/ --include="*.svelte" | grep -v "\$state\|\$derived\|\$effect\|\$props\|\$env\|\$app\|\$lib"
```

### Find Legacy Event Patterns

```bash
# createEventDispatcher usage
grep -rn "createEventDispatcher" src/ --include="*.svelte"

# on:event directives (replace with onevent props)
grep -rn "on:" src/ --include="*.svelte" | grep -v "onclick\|onsubmit\|onchange\|oninput"
```

### Find Slot Usage (Replace with Snippets)

```bash
# Named and default slots
grep -rn "<slot" src/ --include="*.svelte"

# slot forwarding
grep -rn "let:" src/ --include="*.svelte"
```

### Find `any` Types

```bash
# Explicit any annotations
grep -rn ": any\b" src/ --include="*.ts" --include="*.svelte"

# Type assertions to any
grep -rn "as any" src/ --include="*.ts" --include="*.svelte"
```

### Find `export let` Props (Replace with $props)

```bash
# Legacy prop declarations
grep -rn "export let " src/ --include="*.svelte"
```

### Find Missing Load Function Types

```bash
# Load functions without explicit return types
grep -rn "export const load" src/ --include="*.ts" | grep -v "satisfies"

# Check for untyped PageServerLoad/LayoutServerLoad
grep -rn "export const load" src/routes/ --include="+page.server.ts" --include="+layout.server.ts"
```

### Find Inconsistent Error Handling

```bash
# Raw throw instead of error() or fail()
grep -rn "throw new Error\|throw new Response" src/routes/ --include="*.ts"

# Missing fail() in form actions
grep -rn "return {" src/routes/ --include="+page.server.ts" | grep -v "fail\|redirect"
```

## Assessment Output Template

Document findings in this format:

```markdown
## {{REFACTOR_SCOPE}} Assessment Results

| Category | Count | Priority | Effort |
|----------|-------|----------|--------|
| `interface` → `type` | ___ | High | Low |
| `$:` → `$derived/$effect` | ___ | High | Medium |
| Stores → Runes | ___ | High | High |
| `export let` → `$props` | ___ | High | Medium |
| Slots → Snippets | ___ | Medium | Medium |
| `createEventDispatcher` → Callbacks | ___ | Medium | Low |
| `any` types → Proper types | ___ | Medium | Medium |
| Missing load types | ___ | Low | Low |
| Inconsistent error handling | ___ | Low | Low |
```

## File-Level Audit

For each file with findings, record:

```typescript
type RefactoringTargetType = {
  file: string;
  patterns: (
    | 'interface'
    | 'reactive-declaration'
    | 'store'
    | 'event-dispatcher'
    | 'slot'
    | 'any-type'
    | 'export-let'
    | 'missing-load-type'
    | 'error-handling'
  )[];
  priority: 'high' | 'medium' | 'low';
  estimatedEffort: 'trivial' | 'small' | 'medium' | 'large';
  dependencies: string[];
  notes: string;
};
```

## Checklist

- [ ] Ran all detection commands against {{PROJECT_NAME}}
- [ ] Counted and categorised all legacy patterns
- [ ] Identified all `interface` declarations
- [ ] Mapped all `any` type usages
- [ ] Checked all load functions for proper typing
- [ ] Documented inconsistent error handling patterns
- [ ] Prioritised targets by risk and effort
- [ ] Created file-level audit records
- [ ] Results reviewed and ready for goal-setting
- [ ] Ran `pnpm check` to establish baseline error count
