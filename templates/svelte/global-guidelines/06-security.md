# Phase 6: Security

**Dependencies:** Phase 1 (Code Style), Phase 3 (Error Handling)

## Objectives

- Establish security practices for Svelte 5 components
- Prevent XSS and injection vulnerabilities
- Define safe patterns for handling user input

## 6.1 XSS Prevention

### Never Use {@html} with Untrusted Content

```svelte
<!-- WRONG — XSS vulnerability -->
<div>{@html userProvidedContent}</div>

<!-- CORRECT — auto-escaped by default -->
<div>{userProvidedContent}</div>

<!-- CORRECT — sanitise if {@html} is unavoidable -->
<script lang="ts">
  import DOMPurify from 'dompurify';

  let { content }: { content: string } = $props();
  let sanitised = $derived(DOMPurify.sanitize(content));
</script>

<div>{@html sanitised}</div>
```

### Rule: `{@html}` requires review and sanitisation in every instance.

## 6.2 Input Validation

Validate all user input at the component boundary:

```svelte
<script lang="ts">
  type {{COMPONENT_NAME}}Props = {
    onSubmit: (value: string) => void;
  };

  let { onSubmit }: {{COMPONENT_NAME}}Props = $props();

  let inputValue = $state('');
  let error = $state<string | null>(null);

  function handleSubmit() {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) {
      error = 'Value is required';
      return;
    }
    if (trimmed.length > {{MAX_LENGTH}}) {
      error = `Value must be under ${{{MAX_LENGTH}}} characters`;
      return;
    }
    error = null;
    onSubmit(trimmed);
  }
</script>
```

## 6.3 Sensitive Data Handling

Never expose secrets or tokens in component state that could leak to the client:

```svelte
<script lang="ts">
  // WRONG — API key in client component
  const API_KEY = '{{SECRET}}';

  // CORRECT — call a server endpoint that holds the secret
  async function fetchData() {
    const response = await fetch('/api/{{ENDPOINT}}');
    return response.json();
  }
</script>
```

## 6.4 Event Handler Safety

Prevent unintended actions from synthetic events:

```svelte
<script lang="ts">
  function handleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    // Perform action
  }
</script>

<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
  <!-- inputs -->
</form>
```

## 6.5 Third-Party Component Auditing

- [ ] Audit all third-party Svelte components before adoption
- [ ] Check for `{@html}` usage in third-party source
- [ ] Prefer components with TypeScript types
- [ ] Pin dependency versions

## Checklist

- [ ] No `{@html}` used without DOMPurify or equivalent sanitisation
- [ ] All user input validated at the component boundary
- [ ] No secrets or API keys in client-side component code
- [ ] Form submissions use `preventDefault()`
- [ ] Third-party components audited for security
- [ ] Sensitive data handled via server endpoints only

## Verification

```bash
# Search for unsafe {@html} usage
rg '\{@html' {{SRC_DIR}} --type svelte
pnpm check
pnpm lint
```
