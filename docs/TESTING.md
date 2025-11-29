# Testing Guide

## Overview

This project uses Bun's native test runner for fast, reliable testing with built-in coverage support.

Testing strategy includes:

1. **Concurrent Execution** - Tests run concurrently within files (configurable)
2. **Test Segmentation** - Tests organized by tier (unit/integration/e2e)
3. **CI Performance Monitoring** - Track regressions with baseline comparison
4. **AI Agent Mode** - Quiet output optimized for AI coding assistants

All powered by Bun's native test runner - no external test framework needed.

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

# AI agent mode (quiet output, only failures shown)
bun run test:ai
```

### CI / Performance Checking

```bash
# Run tests with coverage
bun run test:coverage

# Performance report with baseline comparison
bun run test:perf
```

## Performance Tiers

### Unit Tests (`tests/unit/`)

**Goal:** Sub-10ms per test, fully mocked, isolated

```typescript
import { describe, it, expect } from 'bun:test';

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
- Tests run in parallel by default with Bun
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

Bun supports concurrent test execution within each test file. This is configured in `bunfig.toml`:

```toml
[test]
# Run tests concurrently for better performance
concurrent = true

# Maximum number of tests to run in parallel (default: 20)
maxConcurrency = 20
```

### Concurrent Execution

By default, tests in this project run concurrently within each file:

```typescript
import { describe, it, expect } from 'bun:test';

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

The script sets `AGENT=1`, which Bun recognizes. You can also use:

- `CLAUDECODE=1` - For Claude Code
- `REPL_ID=1` - For Replit
- `AGENT=1` - Generic AI agent flag

**Example output:**

Instead of verbose `(pass)` indicators, you only see:

- Test failures (if any)
- Final summary with pass/fail counts
- Coverage reports (if enabled)

This improves readability and reduces token usage when AI agents analyze test output.

## Performance Monitoring

### Baseline

Performance baseline is stored in `.bun-performance.json`:

```json
{
	"baseline": {
		"totalDuration": 150,
		"testCount": 89,
		"fileCount": 8,
		"avgPerTest": 1.69,
		"files": {},
		"timestamp": "2024-01-15T10:30:00Z"
	},
	"thresholds": {
		"maxRegression": 0.2,
		"maxDuration": 5000
	}
}
```

### Updating Baseline

When performance improvements are intentional, update the baseline:

```bash
# Preview new baseline
bun run scripts/update-baseline.ts

# Actually update (use with caution)
bun run scripts/update-baseline.ts --update-baseline
```

### Performance Reports

CI generates performance reports automatically. Check:

1. **CI Artifacts** - `performance-report` contains `results.json`
2. **Console Output** - Performance summary printed to logs
3. **Git History** - Baseline tracked in `.vitest-performance.json`

## Configuration

### `bunfig.toml`

Key settings for testing and coverage:

```toml
[test]
# Enable coverage by default
coverage = true

# Coverage reporters (text for console, lcov for tools)
coverageReporter = ["text", "lcov"]

# Coverage output directory
coverageDir = "coverage"

# Exclude test files from coverage
coverageSkipTestFiles = true

# Coverage exclusions
coverageExclude = [
  "node_modules/**",
  "dist/**",
  "scripts/**",
  "**/*.spec.ts",
  "**/*.test.ts",
  "tests/**"
]
```

## Writing Performant Tests

### ✅ Do

- Isolate tests - no shared state
- Mock external dependencies
- Keep tests focused on one behavior
- Use descriptive names
- Import from `bun:test` for test utilities

```typescript
import { describe, it, expect } from 'bun:test';

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

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [Bun Coverage](https://bun.sh/docs/cli/test#coverage)
- [Bun Test API](https://bun.sh/docs/test/writing)
- [Migrating from Jest/Vitest](https://bun.sh/guides/test/migrate-from-jest)

## Scripts Reference

| Script                     | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `bun test`                 | Run all tests (with concurrent execution)   |
| `bun run test:unit`        | Unit tests only                             |
| `bun run test:integration` | Integration tests only                      |
| `bun run test:watch`       | Watch mode                                  |
| `bun run test:coverage`    | Run tests with coverage                     |
| `bun run test:ai`          | AI agent mode (quiet output, only failures) |
| `bun run test:perf`        | Performance tracking with baseline          |
| `bun run update-baseline`  | Update performance baseline                 |
