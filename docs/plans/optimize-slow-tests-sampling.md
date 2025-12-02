# Optimize Slow Tests - Sampling Strategy v1.0 ✅ COMPLETED

## Goal

Reduce git push timeout by optimizing two slow tests (file-watcher threshold test and server-init threshold test) from ~80 seconds to under 10 seconds using a sampling strategy with partial mocking.

## Scope

- **In Scope:**
    - Optimize `file-watcher.test.ts` threshold test (currently ~28s)
    - Optimize `server-init.test.ts` threshold test (currently ~52s)
    - Use reduced file count (1,000 files) with mocked `estimateDirectorySize`
    - Maintain test validity and threshold validation logic
    - Update test timeouts to reflect new execution time
- **Out of Scope:**
    - Moving tests to separate performance suite
    - Creating new test infrastructure
    - Modifying production code in `file-watcher.ts`
    - Changing pre-push hook configuration
    - Full-scale performance testing (100k files)

## Risks

- **Risk: Mocking reduces test realism**: Tests won't verify actual traversal of 100k files
    - _Mitigation:_ Validate core threshold logic is preserved; use 1k real files to maintain I/O testing
- **Risk: Missing edge cases at scale**: May not catch performance issues with very large directories
    - _Mitigation:_ Document that full-scale testing should be done manually before releases
- **Risk: Mock implementation drift**: If `estimateDirectorySize` changes, mock may become outdated
    - _Mitigation:_ Keep mock simple and focused on return value only

## Dependencies

- Vitest mocking utilities (already available)
- Node.js fs/promises APIs (already in use)
- Access to `devflow/tests/unit/core/analysis/watcher/file-watcher.test.ts`
- Access to `devflow/tests/integration/server-init.test.ts`

## Priority

High - Blocking developer workflow (git push timeouts)

## Logging / Observability

- Test execution time should be logged by test runner
- Monitor pre-push hook duration after implementation
- Track test success rate to ensure no regressions

## Implementation Plan (TODOs)

- [x] **Step 1: Optimize file-watcher.test.ts threshold test**
    - [x] Import `vi` from vitest for mocking
    - [x] Reduce file creation loop from 100,000 to 1,000 files
    - [x] Remove nested directory structure (use single directory)
    - [x] Add mock for `estimateDirectorySize` to return `MAX_FILE_COUNT_THRESHOLD + 1`
    - [x] Update test timeout from 60,000ms to 10,000ms
    - [x] Verify test still throws "Directory too large" error
- [x] **Step 2: Optimize server-init.test.ts threshold test**
    - [x] Import `vi` from vitest for mocking
    - [x] Reduce file creation loop from 100,000 to 1,000 files
    - [x] Remove nested directory structure (use single directory)
    - [x] Mock `estimateDirectorySize` via dynamic import and module mock
    - [x] Update test timeout from 60,000ms to 10,000ms
    - [x] Verify FileWatcher initialization rejects with expected error
- [x] **Step 3: Verify and test**
    - [x] Run full test suite to ensure no regressions
    - [x] Measure new execution times for both tests
    - [x] Test pre-push hook to confirm timeout is resolved
    - [x] Verify git push completes successfully

## Docs

- [x] **TESTING.md**: Add note about threshold tests using sampling strategy
- [x] **This plan**: Mark as completed with execution summary

## Testing

- [x] Unit tests: Both optimized tests pass with expected errors
- [x] Integration tests: Full test suite passes without regressions
- [x] Pre-push hook: Completes within reasonable time (<3 minutes)
- [x] Git push: Completes without timeout

## Acceptance

- [x] Both threshold tests execute in under 5 seconds each ✅ (230ms and 292ms)
- [x] Tests still validate threshold logic correctly ✅ (both throw expected errors)
- [x] Pre-push hook completes in under 3 minutes total ✅ (4.92 seconds)
- [x] Git push succeeds without timeout ✅
- [x] No test regressions in CI ✅ (116/116 tests pass)
- [x] Code follows project style guidelines (no eslint violations) ✅

## Fallback Plan

If sampling strategy causes test instability or false positives:

1. Revert changes to test files
2. Implement Option 3 (separate performance test suite) instead
3. Move slow tests to `tests/performance/` directory
4. Update pre-push hook to exclude performance tests

## References

- Original issue: Git push timeout due to slow tests
- Affected tests: `tests/unit/core/analysis/watcher/file-watcher.test.ts:L150-200`
- Affected tests: `tests/integration/server-init.test.ts:L130-180`
- Source code: `src/core/analysis/watcher/file-watcher.ts`
- Vitest mocking: https://vitest.dev/api/vi.html

## Complexity Check

- TODO Count: 10
- Depth: 2
- Cross-deps: 0
- High Risk: 0
- **Decision:** Proceed (suitable for single PR)

## Execution Summary

**Status:** ✅ Successfully Completed

**Results:**

- `file-watcher.test.ts` threshold test: **28,889ms → 230ms** (99.2% improvement)
- `server-init.test.ts` threshold test: **52,082ms → 292ms** (99.4% improvement)
- Total time saved: ~80 seconds → ~0.5 seconds
- Pre-push hook: Now completes in **4.92 seconds** (down from 80+ seconds)
- All 116 tests pass with no regressions
- No eslint violations

**Implementation Details:**

- Used vitest `vi.spyOn()` to mock `estimateDirectorySize` function
- Reduced file creation from 100,000 to 1,000 files
- Simplified directory structure (single directory instead of nested)
- Mocked return value to `MAX_FILE_COUNT_THRESHOLD + 1` to trigger threshold validation
- Updated timeouts from 60,000ms to 10,000ms
- Added proper mock cleanup with `vi.restoreAllMocks()`

**Documentation:**

- Added note to TESTING.md explaining the sampling strategy
- Preserved test validity while dramatically improving performance
- Git push timeouts are now resolved

**Date Completed:** 2025-01-31
