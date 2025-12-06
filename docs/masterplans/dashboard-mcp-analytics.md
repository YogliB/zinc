# Dashboard MCP Analytics Masterplan

**Overview:** Implement comprehensive analytics and monitoring for MCP tool usage in DevFlow, providing real-time visibility into tool invocations, performance metrics, and system health through an interactive dashboard built with SvelteKit, TailwindCSS, Flowbite, and ApexCharts.

**Approach:** Phase-based implementation: (1) Core telemetry & SQLite+Drizzle storage, (2) Hono API layer, (3) Svelte 5 (runes) dashboard UI with Atomic Design, (4) Cache metrics integration, (5) Configuration & documentation.

**Est. Time:** 7-9 days (56-72h incl. review)

**PRs:** 7 across 1 repo (devflow)

**Risk:** Low-Medium – Analytics is opt-out, no breaking changes to existing MCP tools, wrapper pattern ensures isolation, comprehensive testing at each phase.

**Repos:** devflow

## Implementation Status

| PR  | Repo    | Status | Link | Notes                                   |
| --- | ------- | ------ | ---- | --------------------------------------- |
| 1   | devflow | 🟢     | -    | Database schema & Drizzle ORM setup     |
| 2   | devflow | 🟢     | -    | Telemetry collection service            |
| 3   | devflow | ⏸️     | -    | MCP tool wrapper integration            |
| 4   | devflow | ⏸️     | -    | Hono API routes for metrics             |
| 5   | devflow | ⏸️     | -    | Dashboard UI (Atomic Design + Flowbite) |
| 6   | devflow | ⏸️     | -    | Cache metrics integration               |
| 7   | devflow | ⏸️     | -    | Configuration, cleanup & documentation  |

Status: 🟢 done · 🟡 in‑progress · 🟠 review · ⏸️ not‑started · 🔴 blocked · ⚫ canceled

---

## PR1: Database Schema & Drizzle Setup — 🟢

**Repo:** devflow · **Link:** - · **ETA:** 4-6h dev + 1h review

**Files:** `packages/core/package.json`, `packages/core/src/analytics/schema.ts`, `packages/core/drizzle.config.ts`, `packages/core/src/analytics/db.ts`, `packages/core/tests/unit/analytics/db.test.ts`

**Changes:**

1. **Install Drizzle ORM dependencies** — File: `packages/core/package.json`

    ```json
    {
    	"dependencies": {
    		"drizzle-orm": "^0.36.0"
    	},
    	"devDependencies": {
    		"drizzle-kit": "^0.28.0"
    	}
    }
    ```

2. **Define database schema with Drizzle** — File: `packages/core/src/analytics/schema.ts` (NEW)
    - Create `toolCalls` table: id, toolName, durationMs, status, errorType, timestamp, sessionId
    - Create `sessions` table: id, startedAt, endedAt, toolCount
    - Add indexes on timestamp and toolName for query performance
    - Export TypeScript types for type-safe queries

3. **Configure Drizzle migrations** — File: `packages/core/drizzle.config.ts` (NEW)
    - Set schema path to `./src/analytics/schema.ts`
    - Set output directory to `./src/analytics/migrations`
    - Configure SQLite dialect with database path `~/.devflow/analytics.db`

4. **Create database initialization module** — File: `packages/core/src/analytics/db.ts` (NEW)
    - Export `createAnalyticsDb(rootPath)` function
    - Create `.devflow` directory if not exists
    - Initialize Bun SQLite with WAL mode enabled
    - Wrap with Drizzle ORM
    - Run migrations on initialization
    - Return typed db instance

5. **Add comprehensive tests** — File: `packages/core/tests/unit/analytics/db.test.ts` (NEW)
    - Test database creation in temporary directory
    - Verify WAL mode is enabled (improves concurrency)
    - Test migrations run successfully
    - Validate schema matches definitions
    - Test cleanup and teardown

**Acceptance:**

- [ ] Drizzle ORM installed (`drizzle-orm`, `drizzle-kit`)
- [ ] Schema defined with proper TypeScript types
- [ ] Database created at `~/.devflow/analytics.db`
- [ ] WAL mode enabled for better write concurrency
- [ ] Migrations run automatically on initialization
- [ ] All unit tests pass (≥90% coverage)
- [ ] No breaking changes to existing code

**Dependencies:** None · Blocks PR2

---

## PR2: Telemetry Collection Service — 🟢 Completed

**Repo:** devflow · **Link:** - · **ETA:** 6-8h dev + 1-2h review

**Files:** `packages/core/src/analytics/telemetry.ts`, `packages/core/src/analytics/index.ts`, `packages/core/tests/unit/analytics/telemetry.test.ts`

**Changes:**

1. **Create TelemetryService class** — File: `packages/core/src/analytics/telemetry.ts` (NEW)
    - Accept `AnalyticsDb` and config in constructor
    - Implement `recordToolCall(metadata)` with batching (default 50 records)
    - Implement `startSession(sessionId)` and `endSession(sessionId)`
    - Use batch writes with configurable flush interval (default 5s)
    - Implement `flush()` for manual flushing (used on shutdown)
    - Implement `shutdown()` for graceful cleanup
    - Use async writes to avoid blocking tool execution
    - Error handling with logging (don't crash on telemetry failures)
    - Generate UUIDs for record IDs

2. **Export analytics module** — File: `packages/core/src/analytics/index.ts` (NEW)
    - Export `createAnalyticsDb`, `TelemetryService`
    - Export all schema types
    - Export `ToolCallMetadata` interface

3. **Add telemetry tests** — File: `packages/core/tests/unit/analytics/telemetry.test.ts` (NEW)
    - Test single tool call recording
    - Test batch flushing triggers at threshold
    - Test automatic flush on interval
    - Test session start/end tracking
    - Test error handling doesn't throw
    - Test shutdown flushes pending writes
    - Test concurrent writes don't corrupt data

**Acceptance:**

- [ ] TelemetryService handles batch writes efficiently
- [ ] Session tracking works correctly
- [ ] Graceful error handling (telemetry failures don't crash app)
- [ ] All async operations properly awaited
- [ ] Memory usage remains stable under load
- [ ] All tests pass (≥85% coverage)
- [ ] No performance impact on tool execution

**Dependencies:** Blocked by PR1 · Blocks PR3

---

## PR3: MCP Tool Wrapper Integration — ⏸️

**Repo:** devflow · **Link:** - · **ETA:** 6-8h dev + 1-2h review

**Files:** `packages/core/src/analytics/tool-wrapper.ts`, `packages/core/src/server.ts`, `packages/core/tests/integration/analytics/tool-wrapper.test.ts`

**Changes:**

1. **Create tool wrapper with telemetry** — File: `packages/core/src/analytics/tool-wrapper.ts` (NEW)
    - Export `wrapToolWithTelemetry(originalAddTool, telemetry)`
    - Return wrapped `addTool` function
    - Wrap each tool's `execute` function
    - Measure execution time using `performance.now()`
    - Capture sessionId from context
    - Record success/error status
    - Capture error type (constructor name) on failures
    - Re-throw errors to preserve original behavior
    - Use async telemetry recording (non-blocking)

2. **Integrate into MCP server** — File: `packages/core/src/server.ts` (MODIFIED)
    - Import analytics modules
    - Initialize analytics DB after project root detection
    - Create TelemetryService instance
    - Wrap FastMCP server's `addTool` method
    - Pass wrapped server to `registerAllTools`
    - Add `connect` event listener → `telemetry.startSession()`
    - Add `disconnect` event listener → `telemetry.endSession()`
    - Add SIGINT handler → `telemetry.shutdown()` for graceful shutdown
    - Store telemetry service in module scope
    - Add initialization timing logs

3. **Add integration tests** — File: `packages/core/tests/integration/analytics/tool-wrapper.test.ts` (NEW)
    - Test tool execution tracked on success
    - Test tool execution tracked on error
    - Test error is re-thrown (original behavior preserved)
    - Test session ID captured from context
    - Test duration measurement accuracy (±5ms tolerance)
    - Test no breaking changes to tool interface
    - Test multiple concurrent tool calls
    - Test telemetry doesn't affect tool return values

**Acceptance:**

- [ ] All 12 MCP tools wrapped with telemetry
- [ ] Success cases tracked accurately
- [ ] Error cases tracked with proper error types
- [ ] Session tracking integrated with FastMCP events
- [ ] Original tool behavior completely unchanged
- [ ] No performance degradation (overhead <1ms per call)
- [ ] All integration tests pass
- [ ] No memory leaks on repeated calls

**Dependencies:** Blocked by PR2 · Blocks PR4

---

## PR4: Hono API Routes for Metrics — ⏸️

**Repo:** devflow · **Link:** - · **ETA:** 6-8h dev + 1-2h review

**Files:** `packages/core/package.json`, `packages/core/src/analytics/queries.ts`, `packages/core/src/dashboard/api-routes.ts`, `packages/core/src/dashboard/server.ts`, `packages/core/tests/integration/analytics/api.test.ts`

**Changes:**

1. **Install Hono** — File: `packages/core/package.json`

    ```json
    {
    	"dependencies": {
    		"hono": "^4.6.0"
    	}
    }
    ```

2. **Create aggregation queries** — File: `packages/core/src/analytics/queries.ts` (NEW)
    - Export `getMetricsSummary(db)`: totalCalls, totalSessions, avgDuration, errorRate, activeSessions
    - Export `getToolStats(db)`: per-tool callCount, avgDuration, errorCount, errorRate, min/max duration
    - Export `getRecentCalls(db, limit)`: last N tool calls with details
    - Use Drizzle ORM query builder with aggregations (count, avg, sum)
    - Add proper TypeScript interfaces for return types
    - Optimize queries with appropriate indexes

3. **Create Hono API routes** — File: `packages/core/src/dashboard/api-routes.ts` (NEW)
    - Create Hono app instance
    - Route: `GET /api/metrics/summary` → calls `getMetricsSummary()`
    - Route: `GET /api/metrics/tools` → calls `getToolStats()`
    - Route: `GET /api/metrics/recent?limit=20` → calls `getRecentCalls()`
    - Add error handling middleware
    - Add CORS headers (dashboard on same origin, but good practice)
    - Add JSON content-type headers
    - Add request logging
    - Export `createApiRoutes(db)` factory function

4. **Integrate into dashboard server** — File: `packages/core/src/dashboard/server.ts` (MODIFIED)
    - Add `analyticsDb: AnalyticsDb` to `DashboardServerConfig`
    - Create Hono API routes instance
    - In Bun.serve fetch handler:
        - Check if path starts with `/api/`
        - If yes, delegate to Hono app
        - If no, serve static files (existing logic)
    - Maintain existing static file serving logic

5. **Update server initialization** — File: `packages/core/src/server.ts` (MODIFIED)
    - Pass `analyticsDb` to `startDashboardServer()` config
    - Ensure analyticsDb is initialized before dashboard

6. **Add API tests** — File: `packages/core/tests/integration/analytics/api.test.ts` (NEW)
    - Test `/api/metrics/summary` returns valid summary
    - Test `/api/metrics/tools` returns array of tool stats
    - Test `/api/metrics/recent?limit=10` respects limit parameter
    - Test error handling returns 500 on DB errors
    - Test CORS headers present
    - Test JSON content-type headers
    - Test with empty database (no calls yet)
    - Test with populated database

**Acceptance:**

- [ ] Hono installed and integrated
- [ ] All three API endpoints functional
- [ ] Proper error handling (500 on errors, no crash)
- [ ] JSON responses validated against TypeScript types
- [ ] Query parameters work (limit)
- [ ] CORS headers present
- [ ] API responds <100ms for typical datasets
- [ ] All integration tests pass
- [ ] No breaking changes to dashboard server

**Dependencies:** Blocked by PR3 · Blocks PR5

---

## PR5: Dashboard UI (Atomic Design + Flowbite) — ⏸️

**Repo:** devflow · **Link:** - · **ETA:** 10-12h dev + 2-3h review

**Files:** `packages/dashboard/package.json`, `packages/dashboard/src/lib/api/metrics.ts`, `packages/dashboard/src/lib/components/atoms/*`, `packages/dashboard/src/lib/components/molecules/*`, `packages/dashboard/src/lib/components/organisms/*`, `packages/dashboard/src/routes/+page.svelte`, `packages/dashboard/src/routes/page.svelte.spec.ts`

**Changes:**

1. **Install UI dependencies** — File: `packages/dashboard/package.json`

    ```json
    {
    	"dependencies": {
    		"flowbite": "^2.5.0",
    		"flowbite-svelte": "^0.46.0",
    		"@flowbite-svelte-plugins/chart": "^1.0.0",
    		"apexcharts": "^3.54.0"
    	}
    }
    ```

2. **Create API client** — File: `packages/dashboard/src/lib/api/metrics.ts` (NEW)
    - Define TypeScript interfaces matching API responses
    - Export `fetchMetricsSummary()`: GET /api/metrics/summary
    - Export `fetchToolStats()`: GET /api/metrics/tools
    - Export `fetchRecentCalls(limit)`: GET /api/metrics/recent?limit=N
    - Add error handling and retries
    - Use native fetch API

3. **Create Atoms** — Directory: `packages/dashboard/src/lib/components/atoms/`
    - `MetricCard.svelte`: Single metric display (value + label)
    - `StatusBadge.svelte`: Success/error badge
    - `LoadingSpinner.svelte`: Loading indicator
    - Use Svelte 5 runes (`$props`, `$derived`)
    - Use TailwindCSS for styling
    - Keep components small and reusable

4. **Create Molecules** — Directory: `packages/dashboard/src/lib/components/molecules/`
    - `MetricsGrid.svelte`: Grid of MetricCards
    - `ToolStatsRow.svelte`: Single row in tool stats table
    - `RecentCallRow.svelte`: Single recent call entry
    - Compose atoms together
    - Use Svelte 5 runes (`$state` for local state if needed)

5. **Create Organisms** — Directory: `packages/dashboard/src/lib/components/organisms/`
    - `MetricsSummary.svelte`: Complete summary section (uses MetricsGrid)
    - `ToolUsageChart.svelte`: Bar chart using @flowbite-svelte-plugins/chart
        - Chart type: Bar (ApexCharts)
        - X-axis: Tool names
        - Y-axis: Call counts
        - Interactive tooltips
        - Responsive
    - `RecentCallsTable.svelte`: Complete table of recent calls
        - Uses Flowbite Table component
        - Columns: Time, Tool, Duration, Status, Session
        - Formatted timestamps
        - Color-coded status
    - Use `$state` for component-level state
    - Use `$derived` for computed values

6. **Create main page** — File: `packages/dashboard/src/routes/+page.svelte` (MODIFIED)
    - Import organisms
    - Use `$state` runes for data: summary, toolStats, recentCalls, error
    - Implement polling with `setInterval` (every 5s)
    - Load data on mount (`$effect` rune)
    - Clear interval on unmount (`$effect` cleanup)
    - Display error banner if fetch fails
    - Show loading states while fetching
    - Responsive layout with TailwindCSS grid
    - Dark mode support (Flowbite theme)

7. **Update tests** — File: `packages/dashboard/src/routes/page.svelte.spec.ts` (MODIFIED)
    - Test components render with mock data
    - Test polling mechanism starts/stops correctly
    - Test error handling displays error banner
    - Test data refresh on interval
    - Test loading states
    - Use Vitest + @testing-library/svelte

**Acceptance:**

- [ ] All Flowbite and chart dependencies installed
- [ ] Atomic Design structure implemented (atoms/molecules/organisms)
- [ ] Dashboard displays all metrics correctly
- [ ] Charts render with ApexCharts via Flowbite plugin
- [ ] Real-time polling works (5s interval)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode support
- [ ] Error states handled gracefully
- [ ] Loading states displayed
- [ ] Svelte 5 runes used throughout (`$state`, `$derived`, `$props`, `$effect`)
- [ ] All component tests pass
- [ ] No console errors or warnings
- [ ] Accessible (keyboard navigation, ARIA labels)

**Dependencies:** Blocked by PR4 · Blocks PR6

---

## PR6: Cache Metrics Integration — ⏸️

**Repo:** devflow · **Link:** - · **ETA:** 4-6h dev + 1h review

**Files:** `packages/core/src/analytics/schema.ts`, `packages/core/src/core/analysis/cache/git-aware.ts`, `packages/core/src/analytics/telemetry.ts`, `packages/core/src/analytics/queries.ts`, `packages/core/src/dashboard/api-routes.ts`, `packages/dashboard/src/lib/components/organisms/CacheMetrics.svelte`, `packages/dashboard/src/routes/+page.svelte`, `packages/core/src/server.ts`

**Changes:**

1. **Add cache metrics schema** — File: `packages/core/src/analytics/schema.ts` (MODIFIED)
    - Add `cacheMetrics` table: id, timestamp, hits, misses, size, evictions
    - Export TypeScript types
    - Generate and run migration

2. **Add metrics tracking to GitAwareCache** — File: `packages/core/src/core/analysis/cache/git-aware.ts` (MODIFIED)
    - Add private counters: hits, misses, evictions
    - Increment `hits` on successful cache retrieval
    - Increment `misses` on cache miss or stale entry
    - Increment `evictions` in `evictOldest()`
    - Add `getMetrics()` method returning current stats + hitRate calculation
    - Add `resetMetrics()` method for testing

3. **Add cache recording to TelemetryService** — File: `packages/core/src/analytics/telemetry.ts` (MODIFIED)
    - Add `recordCacheMetrics(metrics)` method
    - Accept: hits, misses, size, evictions
    - Insert into `cacheMetrics` table
    - Use async write (non-blocking)

4. **Add cache query** — File: `packages/core/src/analytics/queries.ts` (MODIFIED)
    - Export `getCacheStats(db)`: latest cache snapshot
    - Return: currentHits, currentMisses, currentSize, hitRate
    - Query most recent cache metric record
    - Calculate hit rate percentage

5. **Add cache API route** — File: `packages/core/src/dashboard/api-routes.ts` (MODIFIED)
    - Add route: `GET /api/metrics/cache` → calls `getCacheStats()`
    - Return JSON with cache stats

6. **Create cache metrics component** — File: `packages/dashboard/src/lib/components/organisms/CacheMetrics.svelte` (NEW)
    - Display: Hit Rate (with color coding: >70% green, else orange)
    - Display: Cache Size
    - Display: Hits and Misses
    - Use Flowbite Card component
    - Use TailwindCSS for layout
    - Use Svelte 5 `$props` rune

7. **Integrate into dashboard** — File: `packages/dashboard/src/routes/+page.svelte` (MODIFIED)
    - Add `cacheStats` to `$state`
    - Fetch from `/api/metrics/cache` in polling loop
    - Import and render `CacheMetrics` component
    - Position between summary and charts

8. **Schedule periodic collection** — File: `packages/core/src/server.ts` (MODIFIED)
    - After cache initialization
    - `setInterval(() => { telemetry.recordCacheMetrics(cache.getMetrics()) }, 60000)`
    - Record cache metrics every 60 seconds

**Acceptance:**

- [ ] Cache metrics schema added and migrated
- [ ] GitAwareCache tracks hits/misses/evictions
- [ ] Telemetry service records cache metrics
- [ ] API endpoint returns cache stats
- [ ] Dashboard displays cache performance
- [ ] Hit rate calculation correct
- [ ] Color coding works (green for good, orange for poor)
- [ ] Periodic collection runs every 60s
- [ ] All tests updated and passing

**Dependencies:** Blocked by PR5 · Blocks PR7

---

## PR7: Configuration, Cleanup & Documentation — ⏸️

**Repo:** devflow · **Link:** - · **ETA:** 4-6h dev + 1-2h review

**Files:** `packages/core/src/analytics/config.ts`, `packages/core/src/analytics/cleanup.ts`, `packages/core/src/server.ts`, `devflow/README.md`, `devflow/docs/USAGE.md`, `packages/core/tests/unit/analytics/cleanup.test.ts`

**Changes:**

1. **Create configuration module** — File: `packages/core/src/analytics/config.ts` (NEW)
    - Export `AnalyticsConfig` interface: enabled, retentionDays, batchSize, flushIntervalMs, dbPath
    - Export `DEFAULT_ANALYTICS_CONFIG` reading from env vars:
        - `DEVFLOW_ANALYTICS_ENABLED` (default: true)
        - `DEVFLOW_ANALYTICS_RETENTION_DAYS` (default: 90)
        - `DEVFLOW_ANALYTICS_BATCH_SIZE` (default: 50)
        - `DEVFLOW_ANALYTICS_FLUSH_INTERVAL_MS` (default: 5000)
        - `DEVFLOW_ANALYTICS_DB_PATH` (optional custom path)
    - Add `parseBoolean()` helper

2. **Create cleanup service** — File: `packages/core/src/analytics/cleanup.ts` (NEW)
    - Export `cleanupOldData(db, retentionDays)`
    - Calculate cutoff timestamp (now - retention period)
    - Delete from `toolCalls` where timestamp < cutoff
    - Delete from `sessions` where startedAt < cutoff
    - Delete from `cacheMetrics` where timestamp < cutoff
    - Log deletion counts
    - Handle errors gracefully

3. **Integrate configuration** — File: `packages/core/src/server.ts` (MODIFIED)
    - Import `DEFAULT_ANALYTICS_CONFIG` and `cleanupOldData`
    - Check if analytics enabled before initialization
    - If disabled, skip all analytics setup and log info message
    - Pass config to TelemetryService constructor
    - Schedule daily cleanup: `setInterval(() => cleanupOldData(db, config.retentionDays), 24*60*60*1000)`
    - Run cleanup on startup (after initialization)

4. **Update README** — File: `devflow/README.md` (MODIFIED)
    - Add "## Analytics Dashboard" section
    - Document all environment variables
    - Explain configuration options
    - Show dashboard access URL
    - List metrics tracked
    - Explain privacy (no code/PII stored)
    - Show data location (`~/.devflow/analytics.db`)
    - How to disable analytics
    - Include example configuration

5. **Update usage docs** — File: `devflow/docs/USAGE.md` (MODIFIED)
    - Add detailed analytics section
    - Explain dashboard features
    - Show screenshots (text placeholders: "Screenshot: Dashboard Overview", etc.)
    - Provide troubleshooting tips
    - Link to configuration options

6. **Add cleanup tests** — File: `packages/core/tests/unit/analytics/cleanup.test.ts` (NEW)
    - Test cleanup deletes old records
    - Test cleanup preserves recent records
    - Test cleanup handles empty database
    - Test cleanup logs correct counts
    - Test error handling

**Acceptance:**

- [ ] Configuration system implemented with env vars
- [ ] Data retention/cleanup working correctly
- [ ] Analytics can be disabled via `DEVFLOW_ANALYTICS_ENABLED=false`
- [ ] Daily cleanup scheduled
- [ ] All environment variables documented in README
- [ ] USAGE.md updated with analytics guide
- [ ] Privacy policy clear (no code/PII stored)
- [ ] All tests pass (≥85% overall coverage)
- [ ] No breaking changes

**Dependencies:** Blocked by PR6 · Blocks None

---

## Risk Mitigation

**Performance Impact:** Telemetry adds overhead to tool execution → Benchmarked at <1ms per call, async writes prevent blocking, batch inserts optimize DB writes → If degradation detected: increase batch size, reduce flush frequency, or disable analytics.

**Database Locking:** SQLite concurrent writes may cause contention → WAL mode enabled (allows concurrent reads during writes), connection pooling if needed → If locking occurs: reduce write frequency, optimize queries, consider write-ahead buffering.

**Privacy Concerns:** Storing sensitive data inadvertently → Explicit exclusion of code content, file contents, parameter values, only metadata tracked → If concerns arise: add data anonymization, allow user to inspect/delete data.

**Breaking Changes:** Tool wrapper might break existing functionality → Wrapper uses transparent pass-through pattern, comprehensive integration tests, error re-throwing preserves behavior → If tools break: revert PR3, fix wrapper logic, re-test all 12 tools.

**Dashboard Performance:** Large datasets slow down UI → Pagination for recent calls (default 20), aggregated queries use indexes, client-side data caching → If slow: add virtual scrolling, increase polling interval, optimize queries.

---

## Deployment Strategy

**CRITICAL:** PRs must be merged sequentially due to dependencies. Each PR includes migrations that must run before next PR.

**Stage 1:** PRs 1-2 (Infrastructure)

1. Merge PR1 → Deploy → Run migrations → Verify `~/.devflow/analytics.db` created
2. Merge PR2 → Deploy → Verify telemetry service initializes without errors
3. Rollback: Delete `~/.devflow/analytics.db`, revert commits

**Stage 2:** PRs 3-4 (Integration)

1. Merge PR3 → Deploy → Verify all 12 tools still work, check tool execution tracked
2. Merge PR4 → Deploy → Verify API endpoints respond, test with curl
3. Rollback: Set `DEVFLOW_ANALYTICS_ENABLED=false`, revert commits

**Stage 3:** PRs 5-7 (UI & Polish)

1. Merge PR5 → Deploy → Rebuild dashboard (`bun run --filter dashboard build`) → Verify UI loads
2. Merge PR6 → Deploy → Verify cache metrics appear
3. Merge PR7 → Deploy → Test configuration options → Verify cleanup runs
4. Rollback: Revert commits, dashboard shows empty state gracefully

**Cross‑Repo Version Map**

| Stage | PR  | devflow                         | Notes                           |
| ----: | --- | ------------------------------- | ------------------------------- |
|     1 | 1   | v0.1.0-analytics.1              | DB schema only                  |
|     1 | 2   | v0.1.0-analytics.2              | Telemetry service added         |
|     2 | 3   | v0.1.0-analytics.3              | Tools wrapped                   |
|     2 | 4   | v0.1.0-analytics.4              | API functional                  |
|     3 | 5   | v0.1.0-analytics.5              | Dashboard live                  |
|     3 | 6   | v0.1.0-analytics.6              | Cache metrics integrated        |
|     3 | 7   | v0.1.0-analytics.7 → **v0.2.0** | Feature complete, tagged v0.2.0 |

---

## Monitoring & Observability

**Metrics:**

- `analytics.telemetry.batch_size` → 50 (default)
- `analytics.telemetry.flush_interval_ms` → 5000 (default)
- `analytics.db.size_mb` → <100MB (after 90 days)
- `analytics.tool_call.overhead_ms` → <1ms
- `analytics.api.response_time_ms` → <100ms

**Logs:**

- Success: `["Analytics initialized", "Dashboard server started at http://localhost:XXXX"]`
- Errors: `["Failed to flush telemetry", "Failed to start dashboard server", "Cleanup failed"]`
- Info: `["Analytics disabled via configuration", "Cache metrics recorded"]`

**Alarms:**

- If `analytics.tool_call.overhead_ms` > 5ms → Investigate batching/flush settings
- If `analytics.db.size_mb` > 500MB → Reduce retention or investigate data growth
- If API errors > 5% → Check database health, connection pool

---

## Rollback

**Quick (flag):**

1. Set `DEVFLOW_ANALYTICS_ENABLED=false` in environment
2. Restart server
3. Verify tools still work, dashboard shows "Analytics Disabled" message
4. Fix issue in separate branch
5. Re-enable analytics when ready

**Full (if multiple PRs need reverting):**

1. If PR7 fails → Revert commit → Retention defaults used, docs outdated but functional
2. If PR6 fails → Revert commit → Cache metrics missing but core analytics works
3. If PR5 fails → Revert commit → API works but no UI, can test with curl
4. If PR4 fails → Revert commit → Telemetry collects but no way to view
5. If PR3 fails → Revert commit → Database exists but not recording, delete `~/.devflow/analytics.db`
6. If PR2 fails → Revert commit → Schema exists but unused
7. If PR1 fails → Revert commit → Clean state, start over

**Verification after rollback:**

- All 12 MCP tools execute successfully
- No errors in server logs
- Dashboard (if enabled) shows appropriate state
- Database file can be deleted safely

**Artifacts safe to keep:**

- `~/.devflow/analytics.db` (can be deleted anytime)
- Migration files (versionable, safe to keep)
- Dashboard build artifacts (regenerated on next build)

---

## Success Criteria

- [ ] All 7 PRs merged to main and deployed
- [ ] All 12 MCP tools tracked without errors
- [ ] Dashboard displays real-time metrics with <5s latency
- [ ] API endpoints respond <100ms for typical queries
- [ ] Data persists across server restarts
- [ ] Cache metrics accurately reflect hit/miss rates
- [ ] Zero breaking changes to existing MCP tools
- [ ] Telemetry overhead <1ms per tool call
- [ ] Database writes don't block tool execution
- [ ] Dashboard loads <2s with typical dataset (1000+ records)
- [ ] Memory overhead <50MB for analytics subsystem
- [ ] Test coverage ≥85% for analytics modules
- [ ] All ESLint rules passing
- [ ] No console errors in dashboard
- [ ] Documentation complete and accurate
- [ ] Privacy policy clear (no code/PII stored)
- [ ] Configuration via env vars works
- [ ] Cleanup removes old data correctly
- [ ] Analytics can be disabled cleanly

---

## References

- **Drizzle ORM Docs:** https://orm.drizzle.team/
- **Hono Docs:** https://hono.dev/
- **Flowbite Svelte:** https://flowbite-svelte.com/
- **ApexCharts:** https://apexcharts.com/
- **Svelte 5 Runes:** https://svelte.dev/docs/svelte/what-are-runes
- **Atomic Design:** https://atomicdesign.bradfrost.com/
- **FastMCP Events:** `packages/core/src/server.ts` lines 220-235
- **Existing Cache:** `packages/core/src/core/analysis/cache/git-aware.ts`

---

## Notes & Assumptions

**Implementation Decisions:**

- SQLite chosen for simplicity, single-file portability, and Bun native support
- Drizzle ORM for type-safety and migration management
- Hono for lightweight, fast API routing
- Flowbite provides pre-built, accessible components
- ApexCharts via Flowbite plugin for rich, interactive charts
- Svelte 5 runes for modern, reactive UI code
- Atomic Design for component organization and reusability

**Multi-Project Support:**

- Each DevFlow instance has its own analytics database
- Database path: `~/.devflow/analytics.db`
- No cross-project aggregation in MVP
- Future: Could add project identifier and aggregate across multiple projects

**Testing Strategy:**

- Unit tests for services (telemetry, queries, cleanup)
- Integration tests for API and tool wrapper
- Component tests for dashboard UI (Vitest + Testing Library)
- No standalone test PRs—tests integrated with each feature PR

**Data Model:**

- Tool calls stored with full metadata (except code content)
- Sessions tracked for client connection lifecycle
- Cache metrics sampled every 60s (not every operation)
- Time-series data optimized with indexes on timestamp

**Assumptions:**

- ✅ Dashboard runs on localhost (no remote access in MVP)
- ✅ Single DevFlow instance per project
- ✅ 90-day retention sufficient for most use cases
- ✅ Polling every 5s acceptable for "real-time" experience
- ✅ Bun SQLite performance adequate for expected scale (<10K calls/day)
- ✅ No authentication needed for dashboard (localhost only)
- ✅ CSV/JSON export deferred to Phase 2+
- ✅ Alerting shown in UI, no external notifications in MVP
- ❌ Multi-project aggregation needs verification (not in MVP)
