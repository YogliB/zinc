# CI Quick Reference

## Pre-Push Checklist

Run these commands before pushing to catch issues early:

```bash
bun run lint       # Check code quality
bun run format     # Auto-fix formatting
bun run type-check # Validate TypeScript
bun run test       # Run all tests
```

Or run all at once:

```bash
bun run lint && bun run format && bun run type-check && bun run test
```

## Common Issues & Fixes

### ❌ ESLint Failed

```bash
# See which rules are violated
bun run lint

# Auto-fix what can be fixed
bun run lint:fix

# Fix remaining issues manually based on error messages
```

### ❌ Prettier Failed

```bash
# Auto-format all files
bun run format

# Commit and push the formatted changes
git add .
git commit -m "chore: format code"
git push
```

### ❌ TypeScript Failed

```bash
# See what types are wrong
bun run type-check

# Fix type errors in your code
# Common fixes: add missing types, check function signatures
```

### ❌ Tests Failed

```bash
# Run tests and see detailed output
bun run test

# Debug with interactive UI
bun run test:ui

# Fix code or update test expectations
```

## Workflow Triggers

CI automatically runs when:

- You push to `main` or `develop`
- You open a pull request against `main` or `develop`

All jobs must pass before you can merge.

## Check Status

### In GitHub

- Go to your PR and scroll down to see status checks
- Click on failing check to see detailed logs
- Each job (Lint, Format, Type Check, Test) shows status

### Locally

Run the exact commands CI runs:

```bash
bun run lint
bun exec prettier --check .
bun run type-check
bun run test
```

## Jobs Overview

| Job            | Command                       | Purpose                      |
| -------------- | ----------------------------- | ---------------------------- |
| **Lint**       | `bun run lint`                | Code quality checks (ESLint) |
| **Format**     | `bun exec prettier --check .` | Code formatting validation   |
| **Type Check** | `bun run type-check`          | TypeScript compilation       |
| **Test**       | `bun run test`                | Unit & integration tests     |
| **CI Status**  | (aggregator)                  | Final pass/fail decision     |

## Performance

- **With cache:** ~2-3 minutes
- **First run (no cache):** ~3-4 minutes
- **Local runs:** ~30-60 seconds

## Skipping Pre-commit Hooks

If you need to skip local git hooks (not recommended):

```bash
git commit --no-verify
```

Note: CI will still run on GitHub and catch issues.

## Full Documentation

For detailed troubleshooting and setup: see [CI.md](./CI.md)
