# Phase 3: Error Handling

Establish patterns for handling errors in Svelte 5 components, including error
boundaries, async error handling, and user-facing error states.

## Objectives

- Define error handling patterns for components and state
- Establish async error management with runes
- Create reusable error boundary components
- Set conventions for error display and recovery

## Error State Pattern

Use `$state` for tracking errors alongside data:

```svelte
<script lang="ts" module>
  export type DataViewProps = {
    endpoint: string;
    children: import('svelte').Snippet<[data: unknown[]]>;
    fallback?: import('svelte').Snippet<[error: string]>;
  };
</script>

<script lang="ts">
  let { endpoint, children, fallback }: DataViewProps = $props();

  let data = $state<unknown[]>([]);
  let error = $state<string | null>(null);
  let isLoading = $state(false);

  async function loadData(): Promise<void> {
    isLoading = true;
    error = null;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      data = await response.json();
    } catch (e) {
      error = e instanceof Error ? e.message : 'An unexpected error occurred';
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    loadData();
  });
</script>

{#if isLoading}
  <div class="loading" role="status" aria-label="Loading">
    <span>Loading...</span>
  </div>
{:else if error}
  {#if fallback}
    {@render fallback(error)}
  {:else}
    <div class="error" role="alert">
      <p>{error}</p>
      <button onclick={loadData}>Retry</button>
    </div>
  {/if}
{:else}
  {@render children(data)}
{/if}
```

## Typed Error States

Use discriminated unions for comprehensive error handling:

```typescript
// types/errors.ts
type ValidationError = {
  kind: 'validation';
  field: string;
  message: string;
};

type NetworkError = {
  kind: 'network';
  status: number;
  message: string;
  retryable: boolean;
};

type AuthError = {
  kind: 'auth';
  message: string;
  action: 'login' | 'refresh' | 'logout';
};

type AppError = ValidationError | NetworkError | AuthError;
```

```svelte
<script lang="ts">
  let error = $state<AppError | null>(null);

  function handleError(e: AppError): void {
    error = e;
  }

  function clearError(): void {
    error = null;
  }
</script>

{#if error}
  {#if error.kind === 'validation'}
    <div class="error validation" role="alert">
      <p>Invalid {error.field}: {error.message}</p>
    </div>
  {:else if error.kind === 'network'}
    <div class="error network" role="alert">
      <p>{error.message}</p>
      {#if error.retryable}
        <button onclick={retry}>Retry</button>
      {/if}
    </div>
  {:else if error.kind === 'auth'}
    <div class="error auth" role="alert">
      <p>{error.message}</p>
      <a href="/login">Sign in again</a>
    </div>
  {/if}
{/if}
```

## Error Boundary Component

Create a reusable error boundary:

```svelte
<!-- ErrorBoundary.svelte -->
<script lang="ts" module>
  import type { Snippet } from 'svelte';

  export type ErrorBoundaryProps = {
    children: Snippet;
    fallback?: Snippet<[error: Error, reset: () => void]>;
    onerror?: (error: Error) => void;
  };
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  let { children, fallback, onerror }: ErrorBoundaryProps = $props();

  let caughtError = $state<Error | null>(null);

  function reset(): void {
    caughtError = null;
  }

  onMount(() => {
    function handleError(event: ErrorEvent): void {
      caughtError = event.error ?? new Error(event.message);
      onerror?.(caughtError!);
      event.preventDefault();
    }

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  });
</script>

{#if caughtError}
  {#if fallback}
    {@render fallback(caughtError, reset)}
  {:else}
    <div class="error-boundary" role="alert">
      <h3>Something went wrong</h3>
      <p>{caughtError.message}</p>
      <button onclick={reset}>Try again</button>
    </div>
  {/if}
{:else}
  {@render children()}
{/if}
```

Usage:

```svelte
<ErrorBoundary onerror={(e) => reportError(e)}>
  {#snippet fallback(error, reset)}
    <div class="custom-error">
      <p>Failed: {error.message}</p>
      <button onclick={reset}>Reset</button>
    </div>
  {/snippet}
  <RiskyComponent />
</ErrorBoundary>
```

## Async State Management

Centralise async error handling in state files:

```typescript
// state/asyncState.svelte.ts
type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

function createAsyncState<T>(initialData: T | null = null) {
  let state = $state<AsyncState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  });

  async function execute(fn: () => Promise<T>): Promise<void> {
    state.isLoading = true;
    state.error = null;
    try {
      state.data = await fn();
    } catch (e) {
      state.error = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      state.isLoading = false;
    }
  }

  function reset(): void {
    state.data = initialData;
    state.isLoading = false;
    state.error = null;
  }

  return {
    get data() { return state.data; },
    get isLoading() { return state.isLoading; },
    get error() { return state.error; },
    execute,
    reset,
  };
}

export { createAsyncState };
export type { AsyncState };
```

Usage in components:

```svelte
<script lang="ts">
  import { createAsyncState } from '$lib/state/asyncState.svelte';

  type User = { id: string; name: string };

  const users = createAsyncState<User[]>();

  $effect(() => {
    users.execute(() => fetch('/api/users').then(r => r.json()));
  });
</script>

{#if users.isLoading}
  <Spinner />
{:else if users.error}
  <p role="alert">{users.error}</p>
  <button onclick={() => users.execute(() => fetch('/api/users').then(r => r.json()))}>
    Retry
  </button>
{:else if users.data}
  {#each users.data as user (user.id)}
    <p>{user.name}</p>
  {/each}
{/if}
```

## Form Validation Errors

```svelte
<script lang="ts" module>
  export type FormFieldProps = {
    name: string;
    label: string;
    value: string;
    error?: string;
    required?: boolean;
    onchange?: (value: string) => void;
  };
</script>

<script lang="ts">
  let {
    name,
    label,
    value = $bindable(''),
    error,
    required = false,
    onchange,
  }: FormFieldProps = $props();

  let touched = $state(false);
  let showError = $derived(touched && !!error);
</script>

<div class="form-field" class:has-error={showError}>
  <label for={name}>
    {label}
    {#if required}<span class="required" aria-label="required">*</span>{/if}
  </label>
  <input
    id={name}
    bind:value
    onblur={() => { touched = true; }}
    oninput={() => onchange?.(value)}
    aria-invalid={showError}
    aria-describedby={showError ? `${name}-error` : undefined}
  />
  {#if showError}
    <p id="{name}-error" class="error-message" role="alert">{error}</p>
  {/if}
</div>
```

## Verification

Before moving to the next phase:

- [ ] Error state pattern established ($state for error tracking)
- [ ] Typed error discriminated unions defined
- [ ] Error boundary component created
- [ ] Async state helper with error handling available
- [ ] Form validation error pattern documented
- [ ] All errors use `role="alert"` for accessibility
- [ ] Retry mechanisms available for recoverable errors
- [ ] Error types use `type` keyword (not `interface`)
- [ ] `pnpm check` passes
- [ ] `pnpm lint` passes
