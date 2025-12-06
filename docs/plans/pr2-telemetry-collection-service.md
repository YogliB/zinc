devflow/docs/plans/pr2-telemetry-collection-service.md

# PR2-Telemetry-Collection-Service-v1

## Goal

Implement a telemetry collection service to track MCP tool usage with efficient batching, session management, and robust error handling to enable analytics without impacting tool performance.

## Scope

- **In Scope:** TelemetryService class with batching and async writes, session start/end tracking, analytics module exports, comprehensive unit tests.
- **Out of Scope:** Integration into MCP server, API routes for metrics, dashboard UI, cache metrics integration, configuration and cleanup.

## Risks

- Performance Impact: Telemetry adds overhead to tool execution. Mitigation: Use async writes and batching to prevent blocking.
- Database Locking: SQLite concurrent writes may cause contention. Mitigation: Rely on WAL mode from PR1; monitor and adjust batch sizes if needed.

## Dependencies

- PR1: Database Schema & Drizzle Setup (provides AnalyticsDb and schema)

## Priority

High

## Logging / Observability

- Log telemetry recording failures (non-blocking)
- Log batch flushes and session events
- Log initialization and shutdown events

## Implementation Plan (TODOs)

- [x] **Create analytics directory structure**
    - [x] Ensure `packages/core/src/analytics/` directory exists
    - [x] Verify directory permissions and structure

- [x] **Implement TelemetryService class** — File: `packages/core/src/analytics/telemetry.ts`
    - [x] Define constructor accepting `AnalyticsDb` and config object
    - [x] Implement `recordToolCall(metadata)` with batching (default 50 records)
    - [x] Implement `startSession(sessionId)` to track session starts
    - [x] Implement `endSession(sessionId)` to track session ends
    - [x] Add private batch queue and flush timer logic
    - [x] Implement `flush()` method for manual batch flushing
    - [x] Implement `shutdown()` for graceful cleanup and final flush
    - [x] Ensure all writes are async to avoid blocking tool execution
    - [x] Add comprehensive error handling with logging (don't crash on failures)
    - [x] Generate UUIDs for record IDs using crypto.randomUUID()

- [x] **Create analytics module exports** — File: `packages/core/src/analytics/index.ts`
    - [x] Export `createAnalyticsDb` from schema module
    - [x] Export `TelemetryService` class
    - [x] Export all schema types (ToolCall, Session, etc.)
    - [x] Export `ToolCallMetadata` interface

- [x] **Implement unit tests** — File: `packages/core/tests/unit/analytics/telemetry.test.ts`
    - [x] Test single tool call recording stores correctly
    - [x] Test batch flushing triggers at 50 record threshold
    - [x] Test automatic flush on 5-second interval
    - [x] Test session start/end tracking with correct timestamps
    - [x] Test error handling doesn't throw exceptions
    - [x] Test shutdown flushes all pending writes
    - [x] Test concurrent writes don't corrupt data
    - [x] Mock database and timer functions for isolation

## Docs

- [x] No documentation updates required for this PR (handled in PR7)

## Testing

- [x] Unit tests covering all TelemetryService methods
- [x] Tests for batching, flushing, and error scenarios
- [x] Mock dependencies to ensure test isolation
- [x] Run tests with `bun test` to verify ≥85% coverage

## Acceptance

- [x] TelemetryService handles batch writes efficiently without blocking
- [x] Session tracking works correctly with start/end events
- [x] Graceful error handling (telemetry failures don't crash app)
- [x] All async operations properly awaited and non-blocking
- [x] Memory usage remains stable under load
- [x] All tests pass with ≥85% coverage
- [x] No performance impact on tool execution (<1ms overhead)

## Fallback Plan

If telemetry causes performance issues or errors, skip initialization of TelemetryService in server.ts (to be done in PR3). This allows tools to function normally while analytics are disabled.

## References

- Drizzle ORM Docs: https://orm.drizzle.team/
- Masterplan PR2: devflow/docs/masterplans/dashboard-mcp-analytics.md
- SQLite WAL Mode: https://www.sqlite.org/wal.html

## Complexity Check

- TODO Count: 15
- Depth: 2
- Cross-deps: 1
- **Decision:** Proceed (scope is focused, low risk, manageable size)
