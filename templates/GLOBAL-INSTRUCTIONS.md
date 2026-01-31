# Global Planning Instructions

**CRITICAL: These instructions are MANDATORY for ALL planning sessions.**

## Plan Output Structure

### IMPORTANT: Service Name is a DIRECTORY, Not a Filename Prefix

**The service/feature name MUST be a directory. DO NOT use it as a filename prefix.**

```text
✓ CORRECT: ./plans/user-auth/00-overview.md    (user-auth is a DIRECTORY)
✗ WRONG:   ./plans/user-auth-00-overview.md    (user-auth is a filename PREFIX)
```

### Directory Structure

All plans MUST be created in a nested directory structure:

```text
{plans_directory}/
└── {service_name}/                 <-- CREATE THIS DIRECTORY
    ├── 00-overview.md              <-- files go INSIDE the directory
    ├── {phase files from template}
    └── checklist.md
```

Where:

- `{plans_directory}` - A directory YOU have write access to (see workflow below)
- `{service_name}` - A kebab-case DIRECTORY name (e.g., `user-auth`, `payment-service`)

## Workflow: Handling Write Permissions

**IMPORTANT: Check your permissions BEFORE asking the user where to write.**

### Step 1: Check Your Write Permissions

Before asking the user anything, determine:

- What mode are you in? (plan mode, full access, etc.)
- What directories can you write to?
- Common writable locations: `./plans`, project root, temp directories

### Step 2: Inform the User

Tell the user what you CAN do:

```text
"I can write plans to the following locations:
- ./plans/
- [other accessible directories]

I'll create plans in: ./plans/{service-name}/

If you need plans in a different location that I cannot access,
please switch to a mode with appropriate permissions first."
```

### Step 3: Get Confirmation

Wait for user confirmation before creating any files.
Do NOT proceed without explicit approval.

### Step 4: Create Files

Only after confirmation, create the directory structure and files.

### If User Wants Inaccessible Location

If the user specifies a directory you cannot write to:

```text
"I don't have write access to [requested location] in my current mode.
Options:
1. I can write to [accessible location] instead
2. You can switch to [appropriate mode] and try again

Which would you prefer?"
```

**NEVER attempt to write to a location, fail, then silently write elsewhere.**

### CRITICAL: File Names MUST Match Template Phases

When you load a template via `get_template`, it returns a list of phases with exact file names.
You MUST create plan files with those EXACT names. DO NOT make up your own file names.

**Example for `endpoint-planning` template:**

Template returns phases:

- 01-environment-setup.md
- 02-type-definitions.md
- 03-storage-layer.md
- 04-handler.md
- 05-router.md
- 06-api-documentation.md

Your plan directory MUST be:

```text
./plans/user-auth-endpoint/
├── 00-overview.md              (ALWAYS required)
├── 01-environment-setup.md     (from template)
├── 02-type-definitions.md      (from template)
├── 03-storage-layer.md         (from template)
├── 04-handler.md               (from template)
├── 05-router.md                (from template)
├── 06-api-documentation.md     (from template)
└── checklist.md                (ALWAYS required)
```

**Example for `service-creation` template:**

Template returns phases:

- 01-types.md
- 02-storage.md
- 03-helpers.md
- 04-handlers.md
- 05-router.md
- 06-middleware.md
- 07-remote.md
- 08-scheduler.md
- 09-integration.md
- 10-database.md

Your plan directory MUST be:

```text
./plans/payment-service/
├── 00-overview.md      (ALWAYS required)
├── 01-types.md         (from template)
├── 02-storage.md       (from template)
├── 03-helpers.md       (from template)
├── 04-handlers.md      (from template)
├── 05-router.md        (from template)
├── 06-middleware.md    (from template)
├── 07-remote.md        (from template)
├── 08-scheduler.md     (from template)
├── 09-integration.md   (from template)
├── 10-database.md      (from template)
└── checklist.md        (ALWAYS required)
```

## Mandatory Files

| File | Source | Required |
|------|--------|----------|
| `00-overview.md` | Always create this | YES |
| Phase files (01-xx.md, 02-xx.md, ...) | Names from template phases | YES |
| `checklist.md` | Always create this | YES |

## File Content Standards

### 00-overview.md

MUST include:

- **Goal**: What is being built/changed
- **Scope**: What is and isn't included
- **Success Criteria**: How to measure completion
- **Dependencies**: Prerequisites and blockers

### Phase Files

Each phase file MUST include:

- **Objective**: What this phase accomplishes
- **Tasks**: Specific, actionable items based on template guidance
- **Outputs**: What artifacts this phase produces
- **Validation**: How to verify phase completion

### checklist.md

MUST be a trackable checklist covering all phases:

```markdown
## Implementation Checklist

### Phase 1: {name from template}

- [ ] Task from phase guidance
- [ ] Task from phase guidance

### Phase 2: {name from template}

- [ ] Task from phase guidance
- [ ] Task from phase guidance

... (continue for all phases)

### Verification

- [ ] {verification command from template}
- [ ] {verification command from template}
```

## Rules

1. **NEVER** create a single monolithic plan file
2. **NEVER** make up your own phase file names - use EXACT names from template
3. **NEVER** skip creating a phase file - create ALL files listed in the template
4. **ALWAYS** create 00-overview.md
5. **ALWAYS** create one file per phase using the template's file names
6. **ALWAYS** create checklist.md with trackable items
7. **ASK** the user for the plans directory path if not specified

## Handling Unused/Skipped Phases

If a phase is not applicable to your specific implementation, you MUST still create the file.
Mark it as skipped with a clear explanation:

```markdown
# {Phase Name}

## Status: SKIPPED

### Reason

{Explain why this phase is not applicable}

### Notes

- This phase was evaluated and intentionally skipped
- {Any relevant context for future reference}
```

**Example:** If `07-remote.md` (Remote Calls) is not needed:

```markdown
# Remote Calls

## Status: SKIPPED

### Reason

This service does not make any external API calls. All data is sourced locally from the database.

### Notes

- This phase was evaluated and intentionally skipped
- If external integrations are added later, revisit this phase
```

This ensures:

- All phases are documented and accounted for
- Reviewers can see what was considered
- Future developers understand why phases were skipped
