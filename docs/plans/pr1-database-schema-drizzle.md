# PR1: Database Schema & Drizzle Setup

## Goal

Establish SQLite database foundation with Drizzle ORM for DevFlow MCP analytics, enabling persistent storage of tool call metrics and session data.

## Scope

- **In Scope:**
    - Install Drizzle ORM and Drizzle Kit dependencies
    - Define schema for `toolCalls` and `sessions` tables
    - Configure Drizzle migrations with SQLite
    - Create database initialization module with WAL mode
    - Implement comprehensive unit tests for database operations
    - Store database at `~/.devflow/analytics.db` (home directory)

- **Out of Scope:**
    - Telemetry collection logic (PR2)
    - API endpoints for querying metrics (PR4)
    - UI dashboard components (PR5)
    - Data retention policies (PR7)
    - Production deployment configuration

## Risks

- **SQLite file locking:** WAL mode mitigates concurrent access issues
- **Migration failures:** Test migrations in isolated environment before applying
- **Schema changes breaking compatibility:** Version schema and use proper migration strategy
- **Type safety gaps:** Leverage Drizzle's TypeScript inference for compile-time safety

## Dependencies

- Bun runtime (already available)
- SQLite support (native to Bun)
- No external service dependencies
- **Blocks:** PR2 (Telemetry Collection Service)

## Priority

High — Foundation for entire analytics system

## Logging / Observability

- Database initialization success/failure
- Migration execution status
- WAL mode enablement confirmation
- Schema validation results
- Directory creation for `~/.devflow/`

## Implementation Plan (TODOs)

- [ ] **Step 1: Install Dependencies**
    - [ ] Add `drizzle-orm@^0.36.0` to dependencies in `packages/core/package.json`
    - [ ] Add `drizzle-kit@^0.28.0` to devDependencies
    - [ ] Run `bun install` to update lockfile
    - [ ] Verify no dependency conflicts with existing packages

- [ ] **Step 2: Define Database Schema**
    - [ ] Create directory `packages/core/src/analytics/`
    - [ ] Create file `packages/core/src/analytics/schema.ts`
    - [ ] Define `toolCalls` table with columns:
        - [ ] `id` (text, primary key, generated UUID)
        - [ ] `toolName` (text, not null, indexed)
        - [ ] `durationMs` (integer, not null)
        - [ ] `status` (text enum: 'success', 'error', 'timeout', not null)
        - [ ] `errorType` (text, nullable)
        - [ ] `timestamp` (integer, not null, indexed, Unix timestamp)
        - [ ] `sessionId` (text, not null, foreign key to sessions.id)
    - [ ] Define `sessions` table with columns:
        - [ ] `id` (text, primary key, generated UUID)
        - [ ] `startedAt` (integer, not null, Unix timestamp)
        - [ ] `endedAt` (integer, nullable, Unix timestamp)
        - [ ] `toolCount` (integer, not null, default 0)
    - [ ] Add composite index on `(timestamp, toolName)` for query optimization
    - [ ] Export TypeScript types using Drizzle's `InferSelectModel` and `InferInsertModel`
    - [ ] Add JSDoc comments explaining table relationships

- [ ] **Step 3: Configure Drizzle Migrations**
    - [ ] Create file `packages/core/drizzle.config.ts` at package root
    - [ ] Set `schema` path to `./src/analytics/schema.ts`
    - [ ] Set `out` directory to `./src/analytics/migrations`
    - [ ] Configure SQLite dialect
    - [ ] Set database path to `~/.devflow/analytics.db` (home directory)
    - [ ] Export default configuration object
    - [ ] Generate initial migration with `bunx drizzle-kit generate`

- [ ] **Step 4: Create Database Initialization Module**
    - [ ] Create file `packages/core/src/analytics/db.ts`
    - [ ] Import Bun's SQLite database from `bun:sqlite`
    - [ ] Import Drizzle's `drizzle` wrapper and `migrate` function
    - [ ] Create `createAnalyticsDb()` pure function that:
        - [ ] Gets home directory using `process.env.HOME` or `os.homedir()`
        - [ ] Constructs database path as `${homeDir}/.devflow/analytics.db`
        - [ ] Creates `~/.devflow` directory if not exists using `fs.mkdirSync` with `recursive: true`
        - [ ] Initializes Bun SQLite instance
        - [ ] Enables WAL mode via `db.exec('PRAGMA journal_mode = WAL;')`
        - [ ] Wraps SQLite instance with Drizzle ORM
        - [ ] Runs migrations from `./src/analytics/migrations`
        - [ ] Returns typed Drizzle database instance
    - [ ] Export function with proper TypeScript return type
    - [ ] Add error handling for filesystem and database operations

- [ ] **Step 5: Write Comprehensive Tests**
    - [ ] Create directory `packages/core/tests/unit/analytics/`
    - [ ] Create file `packages/core/tests/unit/analytics/db.test.ts`
    - [ ] Test: Database creation in temporary directory
        - [ ] Use Bun's test framework
        - [ ] Create temp directory for isolated test
        - [ ] Mock home directory to point to temp path
        - [ ] Call `createAnalyticsDb()`
        - [ ] Assert database file exists at correct location
        - [ ] Cleanup temp directory after test
    - [ ] Test: WAL mode verification
        - [ ] Query `PRAGMA journal_mode`
        - [ ] Assert result equals 'wal'
    - [ ] Test: Migrations run successfully
        - [ ] Verify migrations directory exists
        - [ ] Confirm no migration errors thrown
        - [ ] Check migration metadata table created
    - [ ] Test: Schema validation
        - [ ] Query SQLite master table for `toolCalls` and `sessions`
        - [ ] Verify columns match schema definitions
        - [ ] Confirm indexes exist on timestamp and toolName
        - [ ] Validate foreign key constraint on sessionId
    - [ ] Test: CRUD operations on both tables
        - [ ] Insert sample session record
        - [ ] Insert sample toolCall record with foreign key
        - [ ] Select records with type-safe queries
        - [ ] Update session endedAt timestamp
        - [ ] Delete records and verify cascade behavior
    - [ ] Achieve ≥90% code coverage for analytics module
    - [ ] Add cleanup in `afterEach` to remove test databases

- [ ] **Step 6: Integration Validation**
    - [ ] Run full test suite with `bun test`
    - [ ] Verify no breaking changes to existing code
    - [ ] Check type-checking passes with `bun run type-check`
    - [ ] Run linting with `bun run lint`
    - [ ] Verify build succeeds with `bun run build`
    - [ ] Test database creation from CLI context
    - [ ] Verify `~/.devflow/analytics.db` is created in home directory
    - [ ] Confirm home directory location is user-specific and isolated

## Docs

- [ ] Update `ARCHITECTURE.md`: Add Analytics Database section under Data Storage
- [ ] Update `TESTING.md`: Document how to test analytics database in isolation
- [ ] Add inline schema documentation in `schema.ts` explaining table relationships
- [ ] Document migration workflow in schema file comments

## Testing

- [ ] Unit tests for `createAnalyticsDb` function (isolation, error cases)
- [ ] Unit tests for schema type inference (compile-time)
- [ ] Unit tests for WAL mode enablement
- [ ] Unit tests for migration execution
- [ ] Unit tests for CRUD operations with foreign key constraints
- [ ] Test coverage ≥90% for `src/analytics/` directory
- [ ] No integration tests needed (external dependency-free)

## Acceptance

- [ ] Dependencies installed: `drizzle-orm@^0.36.0`, `drizzle-kit@^0.28.0`
- [ ] Schema defined with proper TypeScript types exported
- [ ] Database created at `~/.devflow/analytics.db` in home directory with correct permissions
- [ ] WAL mode enabled (verified via PRAGMA query)
- [ ] Migrations run automatically on `createAnalyticsDb` call
- [ ] Foreign key constraints enforced between toolCalls and sessions
- [ ] Indexes created on timestamp and toolName columns
- [ ] All unit tests pass with ≥90% coverage
- [ ] Type-checking passes without errors
- [ ] Linting passes with zero warnings
- [ ] Build completes successfully
- [ ] No breaking changes to existing MCP server functionality
- [ ] Database location verified in home directory (not project root)

## Fallback Plan

If Drizzle ORM causes issues:

1. Roll back to vanilla Bun SQLite with manual query building
2. Use SQL template literals for type safety
3. Manually write migration scripts
4. Keep schema definitions as TypeScript types only

If WAL mode causes file system conflicts:

1. Revert to DELETE journal mode
2. Add explicit locking mechanisms
3. Document concurrent access limitations

If schema needs major changes:

1. Create new migration to alter tables
2. Preserve backward compatibility with version checks
3. Add migration rollback scripts

## References

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Bun SQLite Documentation](https://bun.sh/docs/api/sqlite)
- [SQLite WAL Mode](https://www.sqlite.org/wal.html)
- [Node.js os.homedir()](https://nodejs.org/api/os.html#os_os_homedir)
- Masterplan: `docs/masterplans/dashboard-mcp-analytics.md`

## Complexity Check

- **TODO Count:** 42
- **Depth:** 2 (steps → tasks)
- **Cross-deps:** 1 (blocks PR2)
- **High Risks:** 0
- **Decision:** ⚠️ **At complexity threshold** — Well-scoped for single PR, but monitor execution time. If exceeds 8h dev time, consider splitting migration setup from testing.

---

**Status:** ⏸️ Ready for implementation
**Estimated Time:** 4-6h dev + 1h review
**Next PR:** PR2 (Telemetry Collection Service)
