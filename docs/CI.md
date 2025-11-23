# CI Workflow Documentation

## Overview

This project uses GitHub Actions to automatically run linting, formatting checks, type checking, and tests on every push and pull request. The CI pipeline ensures code quality and prevents regressions before code is merged.

## Workflow Triggers

The CI workflow (`ci.yml`) runs on:

- **Push events** to `main` and `develop` branches
- **Pull requests** against `main` and `develop` branches

## Jobs

The CI pipeline consists of 5 jobs that run in parallel (with a final status check):

### 1. Lint

**Purpose:** Validates code quality with ESLint.

**Command:** `bun run lint`

**Fails if:**

- ESLint violations are found
- Code violates configured ESLint rules

**Duration:** ~30-45 seconds

### 2. Format

**Purpose:** Ensures code formatting consistency with Prettier.

**Command:** `bun exec prettier --check .`

**Fails if:**

- Files do not match Prettier formatting standards
- Formatting would differ from the configured style

**Duration:** ~20-30 seconds

### 3. Type Check

**Purpose:** Validates TypeScript compilation and type safety.

**Command:** `bun run type-check`

**Fails if:**

- TypeScript compilation errors exist
- Type mismatches are detected

**Duration:** ~40-60 seconds

### 4. Test

**Purpose:** Runs the test suite with Vitest and generates coverage reports.

**Commands:**

- `bun run test` — Runs all unit and integration tests
- `bun run test:coverage` — Generates coverage report (non-blocking)

**Fails if:**

- Any test fails
- Test suite encounters runtime errors

**Artifacts:** Coverage reports are uploaded as artifacts (optional, non-blocking)

**Duration:** ~60-90 seconds

### 5. CI Status

**Purpose:** Aggregates results from all jobs and provides a final pass/fail decision.

**Fails if:**

- Any of the four main jobs (lint, format, type-check, test) failed

**Duration:** ~5 seconds

## Caching

The workflow implements Bun dependency caching to speed up subsequent runs:

- **Cache key:** `${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}`
- **Cache path:** `~/.bun/install/cache`
- **Invalidation:** Triggered when `bun.lock` changes

First run: ~3-5 minutes (cache miss)
Subsequent runs: ~2-3 minutes (cache hit)

## Local Development

Before pushing, run these commands locally to catch issues early:

```bash
# Lint code
bun run lint

# Fix linting issues
bun run lint:fix

# Check formatting
bun exec prettier --check .

# Fix formatting
bun run format

# Type check
bun run type-check

# Run tests
bun run test

# Run tests with UI
bun run test:ui

# Generate coverage report
bun run test:coverage
```

## Troubleshooting

### Linting Failures

**Error:** `ESLint: [error] Line X: Rule violation`

**Solution:**

1. Run `bun run lint:fix` to auto-fix violations
2. For unfixable violations, update code manually per ESLint message
3. If rule is too strict, discuss with team about updating `.eslintrc` config

### Formatting Failures

**Error:** `Prettier check failed`

**Solution:**

1. Run `bun run format` to auto-format all files
2. Review changes to ensure intent is preserved
3. Commit the formatted changes

### Type Check Failures

**Error:** `TS2322: Type 'X' is not assignable to type 'Y'`

**Solution:**

1. Review the type error message carefully
2. Adjust types or implementation to match type contract
3. Ensure generic types are properly constrained
4. Run `bun run type-check` locally to verify fix

### Test Failures

**Error:** `Test suite failed with X failures`

**Solution:**

1. Run `bun run test` locally to see detailed error output
2. Use `bun run test:ui` for interactive debugging
3. Check if tests are flaky or environment-dependent
4. Fix implementation or update test expectations
5. For network-dependent tests, consider mocking

### Workflow Not Triggering

**Issue:** CI workflow doesn't run on push/PR

**Solutions:**

1. Verify workflow file exists at `.github/workflows/ci.yml`
2. Check branch name matches trigger conditions (main/develop)
3. Verify `push` or `pull_request` event isn't disabled
4. Check repository has Actions enabled in settings

### Cache Not Being Used

**Issue:** Every run is slow, cache not hitting

**Solutions:**

1. Check if `bun.lock` is in version control
2. Verify `bun.lock` hash is stable between runs
3. Clear cache manually in Actions settings if corrupted
4. Check runner OS matches cache key

## Branch Protection

To enforce CI passing before merge, configure branch protection rules:

1. Go to repo Settings → Branches
2. Add protection rule for `main`
3. Require status checks to pass:
    - `Lint`
    - `Format`
    - `Type Check`
    - `Test`
    - `CI Status`
4. Enable "Dismiss stale PR approvals on push"
5. Require branches to be up to date before merging

## Viewing Results

### In Pull Requests

- Status checks appear at the bottom of PR
- Click "Show all checks" to expand details
- Click on failing check to see logs
- Annotations point to specific issues

### In Actions Tab

- Navigate to Actions tab to view workflow runs
- Click on specific run for detailed logs
- Download artifacts (coverage reports, etc.)
- Re-run failed jobs or entire workflow

### Coverage Reports

Coverage reports are uploaded as artifacts after test runs:

1. Go to Actions → specific workflow run
2. Scroll to "Artifacts" section
3. Download `coverage-report` artifact
4. Open `index.html` in browser for interactive report

## Performance Optimization

Average workflow runtime: **2-3 minutes** (with cache)

To maintain or improve performance:

- Keep test suite focused and fast
- Avoid heavy dependencies in dev tools
- Use parallel job execution (already enabled)
- Monitor cache hit rates in Actions analytics

## Related Files

- Workflow definition: `.github/workflows/ci.yml`
- ESLint config: `.eslintrc.config.mjs`
- Prettier config: `package.json` (prettier section)
- TypeScript config: `tsconfig.json`
- Test config: `vitest.config.ts`

## Questions?

For issues or improvements to the CI workflow:

1. Check this documentation first
2. Review workflow logs in Actions tab
3. Run commands locally to reproduce
4. Open an issue with logs and reproduction steps
