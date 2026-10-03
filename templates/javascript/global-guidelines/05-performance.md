# Phase 5: Performance

**Dependencies:** Phase 1 (Code Style), Phase 3 (Error Handling)

**Can be implemented in parallel with:** Phase 6 (Security), Phase 7 (Documentation)

## 5.1 Event Loop Awareness

Understand and protect the Node.js event loop.

```javascript
// The event loop is SINGLE-THREADED. Blocking it blocks ALL requests.

// BAD: Synchronous operations that block the event loop
import { readFileSync } from 'node:fs';
const data = readFileSync('large-file.json', 'utf8'); // BLOCKS

const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512'); // BLOCKS

// CPU-intensive loop blocking the event loop
function processLargeArray(items) {
  return items.map((item) => expensiveTransform(item)); // BLOCKS if items is large
}

// GOOD: Use async/await for I/O
import { readFile } from 'node:fs/promises';
const data = await readFile('large-file.json', 'utf8');

const hash = await new Promise((resolve, reject) => {
  crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, key) => {
    if (err) reject(err);
    else resolve(key);
  });
});

// GOOD: Break up CPU-intensive work with setImmediate
async function processLargeArray(items) {
  const results = [];
  const BATCH_SIZE = 1000;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    results.push(...batch.map((item) => expensiveTransform(item)));

    // Yield to the event loop between batches
    await new Promise((resolve) => setImmediate(resolve));
  }

  return results;
}
```

**Checklist:**

- [ ] Never use `*Sync` functions (readFileSync, execSync) in request handlers
- [ ] Use `node:fs/promises` instead of callback-based `node:fs`
- [ ] Break CPU-intensive loops with `setImmediate` yielding
- [ ] Profile event loop lag with `perf_hooks.monitorEventLoopDelay()`
- [ ] Set up event loop monitoring in production
- [ ] Consider Worker Threads for CPU-bound operations (see 5.5)

## 5.2 Memory Leak Prevention

Avoid common memory leak patterns in JavaScript.

```javascript
// LEAK: Unbounded caches
const cache = new Map();
function getCached(key) {
  if (!cache.has(key)) {
    cache.set(key, expensiveLookup(key)); // Grows forever!
  }
  return cache.get(key);
}

// FIX: Use bounded cache with LRU eviction
class LRUCache {
  /** @param {number} maxSize */
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.maxSize) {
      // Delete oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
}


// LEAK: Forgotten event listeners
class DataProcessor {
  constructor(emitter) {
    this.handler = (data) => this.process(data);
    emitter.on('data', this.handler); // Listener holds reference to `this`
  }

  // FIX: Always provide a cleanup method
  destroy(emitter) {
    emitter.off('data', this.handler);
  }
}

// BETTER: Use AbortController for cleanup
function subscribe(emitter, signal) {
  const handler = (data) => processData(data);
  emitter.on('data', handler);

  signal.addEventListener('abort', () => {
    emitter.off('data', handler);
  });
}


// LEAK: Closures holding large objects
function processFile(filePath) {
  const largeBuffer = readFileSync(filePath); // 500MB buffer
  const summary = extractSummary(largeBuffer);

  // This closure retains `largeBuffer` even though it only needs `summary`
  return () => console.log(summary);
}

// FIX: Extract only what the closure needs
function processFile(filePath) {
  const summary = extractSummary(readFileSync(filePath));
  return () => console.log(summary); // Only `summary` is retained
}
```

**Checklist:**

- [ ] Use bounded caches (LRU) instead of unbounded Maps
- [ ] Remove event listeners when objects are destroyed
- [ ] Use `AbortController` for cleanup coordination
- [ ] Avoid closures that capture large objects
- [ ] Use `WeakMap` / `WeakRef` for object metadata caching
- [ ] Monitor heap size in production with `process.memoryUsage()`

## 5.3 Lazy Loading and Code Splitting

Load modules and data only when needed.

```javascript
// Dynamic imports for conditional dependencies
export async function generatePdf(data) {
  // Only load the PDF library when actually needed
  const { default: PDFDocument } = await import('pdfkit');
  const doc = new PDFDocument();
  // ...
}

// Lazy-initialised singletons
let _db = null;

/**
 * @returns {Promise<Database>}
 */
export async function getDatabase() {
  if (!_db) {
    _db = await connectToDatabase(config.databaseUrl);
  }
  return _db;
}

// Stream large datasets instead of loading into memory
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

/**
 * Process a large file line by line without loading it all into memory.
 *
 * @param {string} filePath
 * @param {(line: string) => void} handler
 */
export async function processLargeFile(filePath, handler) {
  const stream = createReadStream(filePath, { encoding: 'utf8' });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    handler(line);
  }
}

// Paginate database queries
/**
 * @param {Object} query
 * @param {number} [query.page=1]
 * @param {number} [query.pageSize=25]
 * @returns {Promise<PaginatedResult<User>>}
 */
export async function listUsers({ page = 1, pageSize = 25 } = {}) {
  const offset = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    db.query('SELECT * FROM users LIMIT ? OFFSET ?', [pageSize, offset]),
    db.query('SELECT COUNT(*) as count FROM users'),
  ]);
  return { items, total: total[0].count, page, pageSize, hasMore: offset + pageSize < total[0].count };
}
```

**Checklist:**

- [ ] Use dynamic `import()` for optional or conditional dependencies
- [ ] Use lazy initialisation for expensive singletons
- [ ] Stream large files instead of loading into memory
- [ ] Paginate database queries — never `SELECT *` without LIMIT
- [ ] Use async iterators (`for await...of`) for streaming data
- [ ] Profile memory usage with `--inspect` and Chrome DevTools

## 5.4 Debouncing and Throttling

Control the rate of expensive operations.

```javascript
/**
 * Debounce: Execute after a pause in calls.
 * Use for: search input, window resize, form validation.
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn
 * @param {number} delayMs
 * @returns {T & { cancel: () => void }}
 */
export function debounce(fn, delayMs) {
  let timerId = null;

  const debounced = (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delayMs);
  };

  debounced.cancel = () => clearTimeout(timerId);
  return /** @type {T & { cancel: () => void }} */ (debounced);
}

/**
 * Throttle: Execute at most once per interval.
 * Use for: scroll handlers, rate-limited API calls, logging.
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn
 * @param {number} intervalMs
 * @returns {T}
 */
export function throttle(fn, intervalMs) {
  let lastRun = 0;

  return /** @type {T} */ ((...args) => {
    const now = Date.now();
    if (now - lastRun >= intervalMs) {
      lastRun = now;
      return fn(...args);
    }
  });
}

// Usage:
const debouncedSearch = debounce(searchApi, 300);
const throttledLog = throttle(logMetrics, 5000);
```

**Checklist:**

- [ ] Debounce user input handlers (search, validation, resize)
- [ ] Throttle high-frequency events (scroll, mousemove, metrics)
- [ ] Provide `cancel` method on debounced functions
- [ ] Use appropriate delays (100-300ms for UI, 1-5s for API)
- [ ] Test debounce/throttle behaviour with `vi.useFakeTimers()`

## 5.5 Web Workers and Worker Threads

Offload CPU-intensive work to background threads.

```javascript
// Node.js Worker Threads for CPU-bound operations
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

// Main thread
/**
 * @param {Object[]} data
 * @returns {Promise<Object[]>}
 */
export function processInBackground(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./processor.worker.js', import.meta.url), {
      workerData: data,
    });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker exited with code ${code}`));
      }
    });
  });
}

// processor.worker.js — runs in separate thread
import { parentPort, workerData } from 'node:worker_threads';

const result = workerData.map((item) => {
  // CPU-intensive processing that won't block the main event loop
  return expensiveTransform(item);
});

parentPort.postMessage(result);
```

```javascript
// Worker pool for reusing threads (avoid thread creation overhead)
import { Worker } from 'node:worker_threads';

class WorkerPool {
  /**
   * @param {string | URL} workerScript
   * @param {number} size
   */
  constructor(workerScript, size) {
    this.workers = Array.from({ length: size }, () => ({
      worker: new Worker(workerScript),
      busy: false,
    }));
    this.queue = [];
  }

  /**
   * @param {unknown} data
   * @returns {Promise<unknown>}
   */
  async execute(data) {
    const available = this.workers.find((w) => !w.busy);
    if (available) {
      return this.#run(available, data);
    }
    return new Promise((resolve) => this.queue.push({ data, resolve }));
  }

  /** @param {{ worker: Worker, busy: boolean }} entry */
  async #run(entry, data) {
    entry.busy = true;
    return new Promise((resolve) => {
      entry.worker.once('message', (result) => {
        entry.busy = false;
        const next = this.queue.shift();
        if (next) this.#run(entry, next.data).then(next.resolve);
        resolve(result);
      });
      entry.worker.postMessage(data);
    });
  }
}
```

**Checklist:**

- [ ] Use Worker Threads for CPU-bound tasks (crypto, parsing, compression)
- [ ] Keep the main thread free for I/O and request handling
- [ ] Use a Worker Pool to avoid thread creation overhead
- [ ] Limit pool size to `os.availableParallelism()` or fewer
- [ ] Handle worker errors and exits gracefully
- [ ] Profile to confirm the work justifies thread overhead
