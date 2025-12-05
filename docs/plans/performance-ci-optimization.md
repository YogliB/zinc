# Performance: CI Test Optimization & Database Lazy Loading

## Goal

Eliminate database initialization overhead from performance tests through lazy loading and test suite isolation, reducing CI test execution time by ~600ms and improving reliability to 100% pass rate.

## Scope

- **In Scope:**
  - **Phase 1: Lazy Database Initialization**
    - Convert eager database initialization to lazy singleton pattern
    - Add `getAnalyticsDatabase()` function for on-demand access
    - Update all database consumers to use lazy getter
    - Add tests for lazy initialization behavior
  - **Phase 2: Test Suite Isolation**
    - Split performance benchmarks into separate database-free test file
    - Create database-specific performance suite
    - Update test configuration to run suites independently
    - Extract shared test helpers
  - **Phase 3: CI Configuration**
    - Update CI workflow to run test suites separately
    - Configure appropriate thresholds and timeouts per suite
  - Documentation updates across all phases
  
- **Out of Scope:**
  - Database schema changes
  - Migration system modifications
  - Telemetry collection service (future PR)
  - Non-performance related test modifications

## Risks

- **Breaking Change**: Existing code importing `createAnalyticsDatabase` must migrate
  - **Mitigation**: No external consumers yet (feature unreleased), only test code
- **State Management**: Singleton pattern introduces shared mutable state
  - **Mitigation**: Database is read-only for most operations, proper cleanup in tests
- **Reduced Integration Coverage**: Performance tests won't catch database-related slowdowns
  - **Mitigation**: Dedicated database performance suite validates real behavior
- **Test Duplication**: Some setup code may be duplicated across suites
  - **Mitigation**: Extract shared helpers to `tests/helpers/` directory
- **Maintenance Overhead**: More test suites to maintain
  - **Mitigation**: Clear separation of concerns, well-documented structure
- **First-Call Latency**: Initial database access will be slower
  - **Mitigation**: Acceptable tradeoff - only affects first telemetry write

## Dependencies

- PR1 (Database Schema & Drizzle Setup) must be merged
- No external dependencies

## Priority

**Medium** - Improves CI reliability and developer experience, unblocks future analytics work

## Logging / Observability

- Log database initialization on first access: `"Analytics database initialized at {path}"`
- Track initialization time in debug mode
- Log performance suite execution times separately
- No new metrics required (database operations already tracked)

## Implementation Plan (TODOs)

### Phase 1: Lazy Database Initialization

- [ ] **Step 1: Implement Lazy Initialization Pattern**
  - [ ] Add `let dbInstance: AnalyticsDatabase | undefined` module-level variable
  - [ ] Create `getAnalyticsDatabase()` function with singleton logic
  - [ ] Keep `createAnalyticsDatabase()` as private implementation detail
  - [ ] Export `closeAnalyticsDatabase()` for cleanup (testing)
  - [ ] Add JSDoc comments explaining lazy initialization

- [ ] **Step 2: Update Database Module**
  - [ ] Modify `src/analytics/database.ts` exports
  - [ ] Add initialization guard to prevent double-init
  - [ ] Add optional logging for first initialization
  - [ ] Ensure thread-safety (Bun is single-threaded, but document assumption)

- [ ] **Step 3: Update Analytics Tests**
  - [ ] Update `tests/unit/analytics/database.test.ts` to use `getAnalyticsDatabase()`
  - [ ] Add test for lazy initialization behavior (no DB on import)
  - [ ] Add test for singleton pattern (multiple calls return same instance)
  - [ ] Add test for cleanup function
  - [ ] Update `afterEach` hooks to call `closeAnalyticsDatabase()`

- [ ] **Step 4: Verify Phase 1 Impact**
  - [ ] Run all tests locally (verify 17 analytics tests pass)
  - [ ] Verify no database initialization during module import
  - [ ] Run performance benchmarks locally (5 iterations)
  - [ ] Document baseline improvements

### Phase 2: Test Suite Isolation

- [ ] **Step 5: Analyze Current Test Structure**
  - [ ] List all imports in `performance-benchmarks.test.ts`
  - [ ] Identify any database-dependent imports
  - [ ] Document current test execution flow
  - [ ] Verify which tests actually need database access

- [ ] **Step 6: Create Isolated Performance Test Suite**
  - [ ] Create `tests/performance/` directory
  - [ ] Create `tests/performance/analysis-engine.test.ts` (database-free)
  - [ ] Move TypeScript Plugin Initialization tests
  - [ ] Move First Tool Call Latency tests
  - [ ] Move Preload Performance tests
  - [ ] Move Large File Handling tests
  - [ ] Move End-to-End Initialization tests
  - [ ] Ensure NO imports from `src/analytics/` directory

- [ ] **Step 7: Create Database Performance Suite**
  - [ ] Create `tests/integration/database-performance.test.ts`
  - [ ] Add test for database write performance
  - [ ] Add test for database query performance
  - [ ] Add test for migration performance
  - [ ] Set appropriate baselines (separate from analysis engine)

- [ ] **Step 8: Extract Shared Test Helpers**
  - [ ] Create `tests/helpers/performance-setup.ts`
  - [ ] Move common benchmark project setup utilities
  - [ ] Move file generation utilities
  - [ ] Add helper for creating isolated test environments
  - [ ] Update both test suites to use shared helpers

- [ ] **Step 9: Update Test Configuration**
  - [ ] Update `vitest.config.ts` to support multiple test patterns
  - [ ] Add `test:performance` script in `package.json` (runs analysis benchmarks only)
  - [ ] Add `test:integration:perf` script for database performance tests
  - [ ] Keep `test` script running all suites
  - [ ] Update `.performance-baseline.json` with new test names

### Phase 3: CI Configuration

- [ ] **Step 10: Update CI Workflow**
  - [ ] Modify `.github/workflows/ci.yml` to run suites separately
  - [ ] Add `test:performance` step (fast, blocking, strict thresholds)
  - [ ] Add `test:integration:perf` step (slower, informational)
  - [ ] Configure appropriate timeouts for each suite (2min vs 5min)
  - [ ] Ensure failure in performance suite blocks merge

- [ ] **Step 11: Clean Up Old Test Files**
  - [ ] Delete `tests/integration/performance-benchmarks.test.ts`
  - [ ] Remove old test names from `.performance-baseline.json`
  - [ ] Update any references in documentation

- [ ] **Step 12: Final Verification**
  - [ ] Run full test suite locally (all tests pass)
  - [ ] Push to CI and verify all suites pass
  - [ ] Verify performance suite completes in < 5 seconds
  - [ ] Verify total CI test time reduction
  - [ ] Confirm 5 consecutive CI runs pass (100% reliability)

## Docs

- [ ] **ARCHITECTURE.md**: 
  - [ ] Update analytics section with lazy initialization pattern
  - [ ] Document test suite organization strategy
- [ ] **TESTING.md**: 
  - [ ] Add section on database cleanup in tests
  - [ ] Add section on performance vs integration test separation
  - [ ] Document when to add tests to each suite
- [ ] **README.md**: Update test commands in usage section
- [ ] **Code comments**: JSDoc for `getAnalyticsDatabase()` explaining singleton behavior

## Testing

- [ ] **Phase 1 Unit Tests**:
  - [ ] Test lazy initialization (no DB on module load)
  - [ ] Test singleton pattern (same instance returned)
  - [ ] Test cleanup/reset functionality
  - [ ] Test thread-safety assumptions
  
- [ ] **Phase 1 Integration Tests**:
  - [ ] Verify existing 17 analytics tests still pass
  - [ ] Verify performance tests pass locally
  - [ ] Verify performance tests pass in CI

- [ ] **Phase 2 Performance Suite**:
  - [ ] All 10 analysis engine tests pass in isolation
  - [ ] No database imports detected
  - [ ] Execution time < 5 seconds locally
  - [ ] All tests pass in CI within thresholds

- [ ] **Phase 2 Database Performance Suite**:
  - [ ] Database write performance tests pass
  - [ ] Database query performance tests pass
  - [ ] Migration performance tests pass

- [ ] **Phase 3 Combined Execution**:
  - [ ] `bun test` runs all suites successfully
  - [ ] Total execution time acceptable
  - [ ] No test interference between suites
  - [ ] CI runs suites independently and successfully

## Acceptance

- [ ] **Phase 1 Complete**: Database is NOT created on module import
- [ ] **Phase 1 Complete**: Database IS created on first `getAnalyticsDatabase()` call
- [ ] **Phase 1 Complete**: Multiple calls return same instance
- [ ] **Phase 1 Complete**: All 17 analytics tests pass
- [ ] **Phase 2 Complete**: Performance tests run with ZERO database initialization overhead
- [ ] **Phase 2 Complete**: Performance suite completes in < 5 seconds locally
- [ ] **Phase 2 Complete**: Database performance suite exists with ≥3 tests
- [ ] **Phase 3 Complete**: Performance tests pass in CI (100% success over 5 runs)
- [ ] **Phase 3 Complete**: CI executes suites independently
- [ ] **Overall**: No functional regressions detected
- [ ] **Overall**: Documentation updated across all files
- [ ] **Overall**: CI test execution time reduced by ≥500ms

## Fallback Plan

**Phase 1 Failure**:
1. Revert lazy initialization changes
2. Increase CI performance thresholds by 100% instead
3. Document decision in `ARCHITECTURE.md`
4. Proceed with Phase 2 if desired

**Phase 2 Failure**:
1. Keep Phase 1 (lazy init provides value independently)
2. Revert test suite split
3. Restore `performance-benchmarks.test.ts`
4. Keep new `database-performance.test.ts` as additional coverage

**Phase 3 Failure**:
1. Keep Phases 1 and 2 (provide local dev benefits)
2. Revert CI configuration changes
3. Run all tests in single CI step as before

All phases are independently valuable and can be partially reverted without losing progress.

## References

- Investigation Report: Performance Test Failures in CI
- PR1: Database Schema & Drizzle Setup (#10)
- Performance baseline: `.performance-baseline.json`
- Vitest documentation: https://vitest.dev/guide/
- Options 2 & 3 from investigation report

## Complexity Check

- **TODO Count**: 50
- **Depth**: 3 (Phases → Steps → Tasks)
- **Cross-deps**: 3 (Phase 2 depends on Phase 1, Phase 3 depends on Phase 2, all depend on PR1)
- **High Risk**: 0
- **Decision**: ⚠️ **ALERT: Exceeds 30 TODO threshold**

**Recommendation**: This could be split into a masterplan with 3 separate PRs:
- PR1: Lazy Database Initialization (19 TODOs)
- PR2: Test Suite Isolation (24 TODOs)
- PR3: CI Configuration Updates (7 TODOs)

**Alternative**: Execute as single plan with phased approach, where each phase can be committed separately, allowing early feedback and incremental delivery within one PR.

**Decision**: Proceed as **single plan with phased commits** because:
1. All phases address same root problem (CI test reliability)
2. Phases are sequential dependencies (not parallel work)
3. Total effort is ~1-2 days for experienced developer
4. Early phases provide immediate value
5. Each phase has clear rollback path
6. Single PR simplifies review context