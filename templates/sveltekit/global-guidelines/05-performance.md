# Phase 5: Performance

Performance guidelines and optimisation patterns for {{PROJECT_NAME}}.

## Objectives

- Define SSR vs CSR decision criteria
- Establish streaming patterns with `{#await}`
- Set conventions for lazy loading and code splitting
- Document image optimisation and preloading strategies
- Establish bundle size monitoring

## SSR vs CSR Decision Matrix

| Scenario | Rendering | Reason |
|----------|-----------|--------|
| Public pages (landing, docs) | SSR | SEO, fast first paint |
| Dashboard with auth data | SSR | Data available at request time |
| Interactive widgets | CSR | No server data needed |
| Heavy client-only libraries | CSR | Avoid SSR hydration cost |
| Form results | SSR | Progressive enhancement |

### Disabling SSR for Specific Routes

```typescript
// src/routes/dashboard/analytics/+page.ts
export const ssr = false; // Only render on client
export const prerender = false;
```

### Enabling Prerendering for Static Content

```typescript
// src/routes/docs/[slug]/+page.ts
export const prerender = true;
```

## Streaming with Deferred Data

Use streaming to show content as data arrives:

```typescript
// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Fast data - blocks rendering
  const user = await getUser(locals.userId);

  // Slow data - streamed in after initial render
  const analyticsPromise = getAnalytics(locals.userId);
  const recentActivityPromise = getRecentActivity(locals.userId);

  return {
    user,
    analytics: analyticsPromise,       // NOT awaited - streams
    recentActivity: recentActivityPromise, // NOT awaited - streams
  };
};
```

```svelte
<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  type Props = { data: PageData };
  let { data }: Props = $props();
</script>

<h1>Welcome, {data.user.name}</h1>

<!-- Streamed data with loading states -->
{#await data.analytics}
  <div class="skeleton">Loading analytics...</div>
{:then analytics}
  <AnalyticsChart data={analytics} />
{:catch error}
  <p class="error">Failed to load analytics</p>
{/await}

{#await data.recentActivity}
  <div class="skeleton">Loading activity...</div>
{:then activity}
  <ActivityFeed items={activity} />
{:catch}
  <p class="error">Failed to load activity</p>
{/await}
```

## Lazy Loading Components

### Dynamic Imports for Heavy Components

```svelte
<script lang="ts">
  let showEditor = $state(false);

  // Lazy load the editor only when needed
  async function loadEditor() {
    const module = await import('$lib/client/components/RichEditor.svelte');
    return module.default;
  }
</script>

{#if showEditor}
  {#await loadEditor() then Editor}
    <Editor onchange={handleChange} />
  {/await}
{:else}
  <button onclick={() => (showEditor = true)}>Open Editor</button>
{/if}
```

### Intersection Observer for Viewport-Based Loading

```svelte
<script lang="ts">
  let visible = $state(false);
  let container: HTMLDivElement;

  $effect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visible = true;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  });
</script>

<div bind:this={container}>
  {#if visible}
    <HeavyComponent />
  {:else}
    <div class="placeholder" style="height: 400px;" />
  {/if}
</div>
```

## Image Optimisation

### Using Enhanced Images

```svelte
<script lang="ts">
  import heroImage from '$lib/assets/hero.jpg?enhanced';
</script>

<enhanced:img src={heroImage} alt="Hero banner" />
```

### Responsive Images with Explicit Sizes

```svelte
<img
  src="/images/product.jpg"
  srcset="/images/product-400.jpg 400w, /images/product-800.jpg 800w, /images/product-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="Product photo"
  loading="lazy"
  decoding="async"
  width="800"
  height="600"
/>
```

## Preloading and Prefetching

### Link Preloading

```svelte
<!-- SvelteKit automatically preloads on hover by default -->
<a href="/items" data-sveltekit-preload-data="hover">Items</a>

<!-- Eager preload for critical navigation -->
<a href="/dashboard" data-sveltekit-preload-data="eager">Dashboard</a>

<!-- Disable preloading for expensive pages -->
<a href="/reports" data-sveltekit-preload-data="off">Reports</a>
```

### Programmatic Preloading

```typescript
import { preloadData, goto } from '$app/navigation';

// Preload data for a route before navigating
async function navigateToItem(id: string) {
  await preloadData(`/items/${id}`);
  await goto(`/items/${id}`);
}
```

## Bundle Size Monitoring

### Analysing Bundle Size

```bash
# Build with analysis
pnpm build

# Check output sizes
du -sh .svelte-kit/output/client/_app/immutable/chunks/* | sort -hr | head -20
```

### Avoiding Large Dependencies in Client Code

```typescript
// WRONG - imports entire library into client bundle
import { format } from 'date-fns';

// CORRECT - import only what you need
import { format } from 'date-fns/format';

// BEST for server-only - keep off client entirely
// In +page.server.ts (never shipped to client)
import { format } from 'date-fns';
```

### Tree-Shaking Verification

```typescript
// Ensure exports are tree-shakeable
// GOOD - named exports
export function formatDate(d: Date): string { /* ... */ }
export function formatTime(d: Date): string { /* ... */ }

// BAD - default export of object (not tree-shakeable)
export default {
  formatDate(d: Date) { /* ... */ },
  formatTime(d: Date) { /* ... */ },
};
```

## Performance Checklist

- [ ] SSR/CSR decision documented for each route group
- [ ] Streaming used for slow data in load functions
- [ ] Heavy components lazy-loaded where appropriate
- [ ] Images use responsive `srcset` and `loading="lazy"`
- [ ] Critical navigation paths use preloading
- [ ] Bundle size monitored after each build
- [ ] No large client-side-only libraries imported in SSR routes
- [ ] Tree-shaking verified for shared utility modules
- [ ] `pnpm build` output sizes are within budget
