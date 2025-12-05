# Testing Guide

## Overview

This project uses **Vitest** as the sole test framework for all testing needs.

Testing strategy includes:

1. **Concurrent Execution** - Tests run concurrently within files (configurable)
2. **Test Segmentation** - Tests organized by tier (unit/integration/e2e)
3. **CI Performance Monitoring** - Track regressions with baseline comparison
4. **AI Agent Mode** - Quiet output optimized for AI coding assistants
5. **Unified Testing** - Vitest handles both test execution and coverage reporting

All tests use Vitest directly, ensuring consistent test execution across both Bun and Node.js environments.

## Test Structure

```
tests/
├── unit/              # Fast, mocked tests (<10ms each)
│   └── examples.test.ts
├── integration/       # Real dependencies (<100ms each)
│   └── examples.test.ts
└── e2e/              # Full system tests (CI-only)
```

Original tests remain in `src/` for backward compatibility during migration.

## Running Tests

### Development

```bash
# Run all tests (with concurrent execution)
bun test

# Watch mode (re-runs on file changes)
bun test --watch

# Unit tests only (fastest, mocked)
bun run test:unit

# Integration tests only
bun run test:integration

# Analytics tests only (uses Bun's native SQLite)
bun run test:analytics

# AI agent mode (quiet output, only failures shown)
bun run test:ai
```

### CI / Performance Checking

```bash
# Run tests with coverage (uses Vitest)
bun run test:coverage

# Performance report with baseline comparison
bun run test:perf
```

**Note:** All test scripts use Vitest for both test execution and coverage reporting, ensuring consistency across environments.

## Performance Test Standards

### Baseline-Driven Testing

**All performance assertions MUST use the baseline system** to account for CI environment variability.

#### Why Baselines?

- CI runners are 2-3x slower than local development machines
- Hardcoded thresholds (e.g., `expect(duration).toBeLessThan(500)`) cause false failures
- Baselines provide environment-aware regression detection

#### Usage

```typescript
import { expectDurationWithinBaseline } from '../helpers/performance-baseline';

it('should complete operation efficiently', async () => {
	const startTime = performance.now();
	await performOperation();
	const duration = performance.now() - startTime;

	// Use baseline system instead of hardcoded threshold
	expectDurationWithinBaseline(
		duration,
		'my-test.operation-name', // Unique test identifier
		0.5, // 50% max regression tolerance
	);
});
```

#### Setting Up Baselines

1. **Add fallback threshold** in `tests/helpers/performance-baseline.ts`:

    ```typescript
    const ABSOLUTE_FALLBACKS: Record<string, number> = {
    	'my-test.operation-name': 1000, // Conservative fallback (ms)
    };
    ```

2. **Run tests in CI** to capture actual performance

3. **Update `.performance-baseline.json`** with CI-validated values:

    ```json
    "testSpecificBaselines": {
        "my-test.operation-name": {
            "name": "my-test.operation-name",
            "duration": 850,  // Actual CI value
            "timestamp": "2025-12-03T09:00:00.000Z"
        }
    }
    ```

4. **Verify** tests pass in CI using real baselines (no fallback warnings)

#### Best Practices

- ✅ Always use `expectDurationWithinBaseline()` for performance assertions
- ✅ Set fallback thresholds 50-100% higher than expected local values
- ✅ Validate baselines in CI before merging
- ✅ Use descriptive test identifiers (format: `file-name.test-description`)
- ✅ Allow 50% regression tolerance for CI variance
- ❌ Never use hardcoded `toBeLessThan()` for duration checks
- ❌ Don't set baselines based on local performance only

#### CI Environment Notes

- GitHub Actions runners exhibit 2-3x slower performance than local machines
- File I/O and CPU-bound operations are most affected
- Baseline system automatically accounts for this variance
- Global suite performance tracked separately in `.performance-baseline.json` baseline section

## Performance Tiers

### Unit Tests (`tests/unit/`)

**Goal:** Sub-10ms per test, fully mocked, isolated

```typescript
import { describe, it, expect } from 'vitest';

describe('Fast Unit Tests', () => {
	it('should calculate correctly', () => {
		expect(1 + 1).toBe(2);
	});

	it('should validate input', () => {
		expect(validate('data')).toBe(true);
	});
});
```

**Characteristics:**

- Mocked dependencies
- No I/O operations
- Deterministic
- Tests run in parallel by default with Vitest
- Fast feedback in watch mode

### Integration Tests (`tests/integration/`)

**Goal:** <100ms per test, real dependencies, realistic scenarios

```typescript
describe('Real System Integration', () => {
	it('should handle database operations', async () => {
		const result = await database.query();
		expect(result).toBeDefined();
	});
});
```

**Characteristics:**

- Real dependencies
- File I/O allowed
- Database operations
- Network calls mocked or real test servers
- Sequential by default

### E2E Tests (`tests/e2e/`)

**Goal:** Full system validation, CI-only

**Note:** Currently not in use but reserved for future end-to-end testing.

## Concurrent Tests

Vitest supports concurrent test execution within each test file.

### Concurrent Execution

By default, tests in this project run concurrently within each file:

```typescript
import { describe, it, expect } from 'vitest';

describe('Math Operations', () => {
	it('adds numbers', () => {
		expect(2 + 2).toBe(4);
	});

	it('multiplies numbers', () => {
		expect(3 * 4).toBe(12);
	});

	// Both tests run concurrently!
});
```

### Serial Tests

If you need tests to run sequentially (e.g., they share state), use `test.serial`:

```typescript
import { test, expect } from 'bun:test';

let sharedState = 0;

test.serial('first test', () => {
	sharedState = 1;
	expect(sharedState).toBe(1);
});

test.serial('second test', () => {
	// Depends on previous test
	expect(sharedState).toBe(1);
	sharedState = 2;
});
```

### Explicit Concurrent Tests

Mark specific tests to run concurrently even if not globally enabled:

```typescript
import { test, expect } from 'bun:test';

test.concurrent('concurrent test 1', async () => {
	await fetch('/api/endpoint1');
	expect(true).toBe(true);
});

test.concurrent('concurrent test 2', async () => {
	await fetch('/api/endpoint2');
	expect(true).toBe(true);
});
```

## AI Agent Mode

When working with AI coding assistants (Claude, Cursor, Replit, etc.), use the `test:ai` script for quieter output:

```bash
bun run test:ai
```

**Features:**

- Only test failures are displayed in detail
- Passing test indicators are hidden
- Summary statistics remain intact
- Reduces context noise for AI agents

**Environment Variables:**

The script sets `AGENT=1` for AI agent detection. You can also use:

- `CLAUDECODE=1` - For Claude Code
- `REPL_ID=1` - For Replit
- `AGENT=1` - Generic AI agent flag

**Example output:**

Instead of verbose `(pass)` indicators, you only see:

- Test failures (if any)
- Final summary with pass/fail counts
- Coverage reports (if enabled)

This improves readability and reduces token usage when AI agents analyze test output.

## Performance Testing

### Baseline-Driven Performance Assertions

Performance tests use baseline-driven comparisons instead of hard-coded timing assertions to account for CI environment variability.

**Why Baseline-Driven?**

- CI environments have variable performance characteristics
- Hard-coded thresholds (e.g., "must complete in 200ms") are flaky
- Baseline approach detects regressions while tolerating environment variance

### Writing Performance Tests

Use `expectDurationWithinBaseline()` from `tests/helpers/performance-baseline.ts`:

```typescript
import { expectDurationWithinBaseline } from '../helpers/performance-baseline';

it('should process files efficiently', async () => {
	const startTime = performance.now();
	await processFiles(files);
	const duration = performance.now() - startTime;

	// Compare against baseline with 50% regression tolerance
	expectDurationWithinBaseline(
		duration,
		'my-test.process-files', // Unique test identifier
		0.5, // 50% max regression (default)
	);
});
```

### Test Output

Performance checks log detailed metrics:

```
📊 Performance Check: my-test.process-files
   Actual:    220.00ms
   Baseline:  200.00ms
   Threshold: 300.00ms (50% max regression)
   Change:    +10.0%
```

### Fallback Behavior

When no baseline exists:

1. **With fallback defined**: Uses absolute threshold with warning
2. **Without fallback**: Skips check with warning

This ensures tests don't fail during initial development.

### Performance Monitoring

#### Baseline Storage

Performance baseline is stored in `.performance-baseline.json`:

```json
{
	"baseline": {
		"totalDuration": 7226.009132,
		"testCount": 160,
		"fileCount": 22,
		"avgPerTest": 45.16,
		"files": {},
		"timestamp": "2025-12-02T21:45:54.777Z"
	},
	"thresholds": {
		"maxRegression": 0.2,
		"maxDuration": 10000
	},
	"testSpecificBaselines": {
		"my-test.process-files": {
			"name": "my-test.process-files",
			"duration": 200,
			"timestamp": "2025-12-03T08:00:00.000Z"
		}
	}
}
```

#### Updating Baseline

When intentional performance changes occur (optimizations or acceptable regressions):

```bash
# Preview new baseline
bun run scripts/update-baseline.ts

# Update baseline (commit the changes)
bun run scripts/update-baseline.ts --update-baseline
git add .performance-baseline.json
git commit -m "chore: update performance baseline after optimization"
```

#### Adding Test-Specific Baselines

To add a baseline for a new performance test:

1. **Run the test multiple times locally** to get average duration
2. **Edit `.performance-baseline.json`** manually
3. **Add entry** to `testSpecificBaselines`:

```json
"testSpecificBaselines": {
	"my-new-test.operation-name": {
		"name": "my-new-test.operation-name",
		"duration": 250.5,
		"timestamp": "2025-12-03T10:00:00.000Z"
	}
}
```

4. **CRITICAL: Validate baseline in CI before committing**
    - Push to a branch and verify CI passes
    - CI environments are typically 2-3x slower than local machines
    - Set baselines to CI-representative values, not best-case local performance
    - If CI fails, increase baseline duration to accommodate environment variance
5. **Commit the baseline** with your test after CI validation

#### Performance Reports

CI generates performance reports automatically. Check:

1. **CI Artifacts** - `performance-report` contains `results.xml`
2. **Console Output** - Performance summary printed to logs
3. **Git History** - Baseline tracked in `.performance-baseline.json`

#### Interpreting Failures

When a performance test fails:

```
AssertionError: expected 450.5 to be less than 300

📊 Performance Check: my-test.process-files
   Actual:    450.50ms
   Baseline:  200.00ms
   Threshold: 300.00ms (50% max regression)
   Change:    +125.2%
```

**Action Steps:**

1. **Verify the regression** - Is it real or environment-related?
2. **Check recent changes** - What code changed?
3. **Profile if needed** - Add logging to identify bottlenecks
4. **Decide:**
    - Fix the performance issue, OR
    - Update baseline if regression is acceptable

### Best Practices

**DO:**

- ✅ Use unique, descriptive test identifiers
- ✅ Set realistic regression thresholds (50% for CI tolerance)
- ✅ Update baselines when making intentional performance changes
- ✅ Document why baselines changed in commit messages

**DON'T:**

- ❌ Use hard-coded timing assertions (e.g., `expect(duration).toBeLessThan(200)`)
- ❌ Update baselines to "fix" failing tests without investigating
- ❌ Set regression thresholds too tight (<30%)
- ❌ Reuse test identifiers across different tests

## Configuration

### Vitest Configuration

This project uses Vitest for all testing needs.

### `vitest.config.ts`

Vitest configuration for test execution and coverage:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov'],
			reportsDirectory: './coverage',
			exclude: [
				'node_modules/**',
				'dist/**',
				'scripts/**',
				'**/*.spec.ts',
				'**/*.test.ts',
				'tests/**',
			],
			thresholds: {
				lines: 0.75,
				functions: 0.8,
				statements: 0.75,
			},
		},
	},
});
```

### Test Execution

All tests use Vitest directly:

- **Use `bun test`** for:
    - Regular test runs during development
    - Fast test execution with Bun runtime
    - Watch mode
    - Unit/integration/e2e test execution
    - Coverage reports
    - All testing scenarios

## Writing Performant Tests

### ✅ Do

- Isolate tests - no shared state
- Mock external dependencies
- Keep tests focused on one behavior
- Use descriptive names
- Import from `vitest` for test utilities
- Pass explicit paths to functions instead of using `process.chdir()`

```typescript
import { describe, it, expect } from 'vitest';

describe('User Validation', () => {
	it('should reject invalid email', () => {
		expect(isValidEmail('invalid')).toBe(false);
	});

	it('should accept valid email', () => {
		expect(isValidEmail('user@example.com')).toBe(true);
	});

	// Tests run in parallel automatically
});
```

### ❌ Don't

- Share state between tests
- Create real database connections per test
- Make real HTTP requests
- Use slow libraries without mocking
- Create tests that depend on execution order
- Use `process.chdir()` in tests (breaks worker threads)

```typescript
// Bad: Shared state
let counter = 0;
describe('Counter', () => {
	it('increments', () => {
		counter++; // ❌ Unreliable with parallel execution
	});
});

// Good: Isolated state
describe('Counter', () => {
	it('increments', () => {
		let counter = 0;
		counter++; // ✅ Isolated
		expect(counter).toBe(1);
	});
});
```

## Testing Analytics Database

### Overview

The analytics database uses Bun's native SQLite (`bun:sqlite`) which is not compatible with Node.js-based test runners like Vitest. Therefore, analytics tests must be run with Bun's test runner.

### Running Analytics Tests

```bash
# Run analytics tests in isolation
bun run test:analytics

# Or directly with Bun
bun test tests/unit/analytics
```

### Test Isolation

Analytics tests use temporary directories to ensure complete isolation:

```typescript
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('Analytics Database', () => {
	let tempDir: string;
	let originalHome: string | undefined;

	beforeEach(() => {
		// Create isolated test directory
		tempDir = mkdtempSync(join(tmpdir(), 'devflow-test-'));
		originalHome = process.env.HOME;
		process.env.HOME = tempDir;
	});

	afterEach(() => {
		// Restore and cleanup
		process.env.HOME = originalHome;
		if (tempDir) {
			rmSync(tempDir, { recursive: true, force: true });
		}
	});

	test('creates database in home directory', () => {
		const database = createAnalyticsDatabase();
		// Database will be created at temporaryDirectory/.devflow/analytics.db
		expect(database).toBeDefined();
	});
});
```

### Key Testing Principles

1. **Mock Home Directory**: Always override `process.env.HOME` to point to a temporary directory
2. **Complete Cleanup**: Use `afterEach` to remove test databases and directories
3. **Verify WAL Mode**: Test that Write-Ahead Logging is enabled via `PRAGMA journal_mode`
4. **Schema Validation**: Query `sqlite_master` and `PRAGMA` statements to verify schema structure
5. **Foreign Key Testing**: Ensure constraints are properly enforced between tables
6. **Index Verification**: Confirm indexes exist and are used for queries

### Coverage Expectations

Analytics module tests should achieve ≥90% code coverage:

- Database initialization and directory creation
- WAL mode enablement
- Migration execution
- Schema validation (tables, columns, indexes, foreign keys)
- CRUD operations with type safety
- Error handling for filesystem and database operations

### CI Integration

Analytics tests are excluded from the main Vitest test suite (see `vitest.config.ts`):

```typescript
export default defineConfig({
	test: {
		exclude: ['tests/unit/analytics/**/*.test.ts'],
	},
});
```

Run analytics tests separately in CI:

```bash
bun run test:analytics
```

## Worker Thread Compatibility

### Why Avoid `process.chdir()`?

Vitest runs tests in worker threads by default (`pool: 'threads'`), which provides:

- Better performance than forked processes
- Lower memory overhead
- Faster test execution

However, **`process.chdir()` does not work in worker threads** - the main process directory remains unchanged, breaking tests that depend on the current working directory.

### Best Practice: Use Explicit Paths

Instead of changing the working directory, pass explicit paths to functions:

```typescript
// ❌ Bad: Using process.chdir()
import { detectProjectRoot } from '../src/core/config';

it('should detect project root', async () => {
	const testDir = '/tmp/test-project';
	process.chdir(testDir); // ❌ Doesn't work in worker threads!
	const result = await detectProjectRoot();
	expect(result).toBe(testDir);
});
```

```typescript
// ✅ Good: Using explicit startFrom parameter
import { detectProjectRoot } from '../src/core/config';

it('should detect project root', async () => {
	const testDir = '/tmp/test-project';
	const result = await detectProjectRoot(testDir); // ✅ Works in worker threads
	expect(result).toBe(testDir);
});
```

### Function Design Guidelines

When designing functions that need path context:

1. **Accept optional path parameters** instead of relying on `process.cwd()`
2. **Default to `process.cwd()`** only when no path is provided
3. **Document the parameter** clearly in JSDoc/TypeScript

```typescript
// ✅ Good: Supports both explicit paths and CWD fallback
export async function detectProjectRoot(startFrom?: string): Promise<string> {
	const searchPath = startFrom ?? process.cwd();
	// ... search logic
}
```

### Migration Strategy

If you find tests using `process.chdir()`:

1. **Identify the function** being tested
2. **Check if it accepts** a path parameter (like `startFrom`, `cwd`, `rootPath`)
3. **Pass the test directory explicitly** instead of using `chdir`
4. **If no path parameter exists**, refactor the function to accept one

### Testing Directory Operations

For tests that create temporary directories:

```typescript
import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

describe('File Operations', () => {
	let testDir: string;

	beforeEach(async () => {
		testDir = path.resolve('.test-temp', `test-${Date.now()}`);
		await mkdir(testDir, { recursive: true });
	});

	afterEach(async () => {
		await rm(testDir, { recursive: true, force: true });
	});

	it('should process files in directory', async () => {
		await writeFile(path.join(testDir, 'file.txt'), 'content');

		// ✅ Pass testDir explicitly, don't use process.chdir()
		const result = await processDirectory(testDir);

		expect(result).toBeDefined();
	});
});
```

### Cleanup Best Practices

- Always clean up test directories in `afterEach`
- Use unique directory names (timestamps, random IDs) to avoid conflicts
- Use `{ recursive: true, force: true }` for robust cleanup
- Wrap cleanup in try-catch to prevent afterEach failures

```typescript
afterEach(async () => {
	try {
		await rm(testDir, { recursive: true, force: true });
	} catch {
		// Cleanup might fail on some systems, but that's acceptable
	}
});
```

## CI Pipeline

The CI workflow runs:

1. **Lint** - ESLint
2. **Format** - Prettier
3. **Type Check** - TypeScript
4. **Test** - Full suite with coverage and performance tracking

Performance check:

- ✅ Pass if within 20% of baseline
- ⚠️ Warn if close to limits
- ❌ Fail if regression > 20%

## Troubleshooting

### Tests are slow

1. Check for I/O operations - move to integration tests
2. Verify mocks are working - add `console.log` to verify
3. Look for synchronous operations - use async/await
4. Check test isolation - ensure no shared state

**Note on Directory Threshold Tests:**
The FileWatcher threshold tests (`file-watcher.test.ts` and `server-init.test.ts`) use a sampling strategy to validate large directory handling. They create 1,000 files and mock `estimateDirectorySize()` to return values exceeding the threshold. This maintains test validity while reducing execution time from ~80s to under 1s. For full-scale performance testing with 100k+ files, run manual tests before releases.

### Performance regression detected

1. Check what changed - `git diff`
2. Profile the test - add timing logs
3. Consider if change is worth regression
4. Update baseline if intentional: `bun run update-baseline.ts --update-baseline`

### Tests fail randomly (flaky)

1. Check for timing issues - increase timeouts
2. Remove test interdependencies
3. Ensure mocks are deterministic
4. Check for concurrent test conflicts

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Vitest Coverage Guide](https://vitest.dev/guide/coverage.html)
- [Bun Runtime with Vitest](https://bun.sh/docs/test-runner/vitest)

## Scripts Reference

| Script                     | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `bun test`                 | Run all tests (with concurrent execution)   |
| `bun run test:unit`        | Unit tests only                             |
| `bun run test:integration` | Integration tests only                      |
| `bun test --watch`         | Watch mode (re-runs on file changes)        |
| `bun run test:coverage`    | Run tests with coverage                     |
| `bun run test:ai`          | AI agent mode (quiet output, only failures) |
| `bun run test:perf`        | Performance tracking with baseline          |
| `bun run update-baseline`  | Update performance baseline                 |
