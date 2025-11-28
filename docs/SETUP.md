# Project Setup Guide

**DevFlow MCP** - A memory-only MCP server for maintaining context across sessions.

Uses Bun as the package manager with strict, pinned dependency versions for reproducibility.

## Prerequisites

- Bun 1.3.2+
- Node.js 20+ (for compatibility)
- Git

## Quick Start

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
bun run type-check

# Start development
bun run dev
```

## Available Commands

| Command                 | Purpose                                   |
| ----------------------- | ----------------------------------------- |
| `bun run dev`           | Development mode                          |
| `bun run build`         | Build standalone executable with bytecode |
| `bun test`              | Run tests (Vitest)                        |
| `bun run test:ui`       | Interactive test dashboard                |
| `bun run test:coverage` | Coverage report                           |
| `bun run lint`          | Check code with ESLint                    |
| `bun run lint:fix`      | Auto-fix linting issues                   |
| `bun run format`        | Format with Prettier                      |
| `bun run type-check`    | TypeScript validation                     |

## Project Structure

```
src/
├── core/              # Core infrastructure
│   ├── config.ts     # Project root detection
│   ├── schemas/      # Memory file validation
│   └── storage/      # File I/O engine
├── layers/
│   └── memory/       # Memory system
├── mcp/              # MCP server
│   ├── tools/        # Memory tools
│   ├── resources/    # Memory resources
│   └── prompts/      # Memory prompts
├── cli/              # CLI interface
├── utils/            # Utilities
├── index.ts          # Entry point
└── index.test.ts     # Test baseline
```

## Configuration

### Build System

- **Bun Compiler** with bytecode compilation for ~2x faster startup
- Standalone executable includes embedded Bun runtime (~72MB)
- Template files embedded directly in executable
- No external dependencies needed at runtime

### TypeScript (`tsconfig.json`)

- Strict mode enabled
- Path aliases: `@/*` maps to `src/*`
- ES2020 target, ESNext modules
- TypeScript used for type-checking only (not compilation)

### Linting & Formatting

- **ESLint** + TypeScript-ESLint with strict rules
- **Prettier** for code formatting
- **Husky** + **lint-staged** for pre-commit automation
- Run `bun run lint:fix` to auto-fix issues

### Testing

- **Vitest** configured for Node environment
- V8 coverage reporting
- Global test APIs enabled
- UI mode available: `bun run test:ui`

## Dependency Management

**All dependencies are pinned to exact versions** (no `^` or `~` ranges) for reproducibility.

### Adding Dependencies

Always use exact versions:

```bash
bun add --exact package@X.Y.Z --save-dev
```

### Verifying Reproducibility

```bash
bun install --frozen-lockfile
```

## First-Time Setup Checklist

- [ ] Run `bun install` to install dependencies
- [ ] Run `bun test` to verify tests pass
- [ ] Run `bun run type-check` to verify TypeScript is correct
- [ ] Run `bun run lint` to check code quality
- [ ] Create a feature branch and start coding

## Troubleshooting

**Command not found: bun**

```bash
npm install -g bun
```

**Node modules out of sync**

```bash
rm -rf node_modules bun.lock
bun install
```

**Pre-commit hook failing**

```bash
# Run manually to diagnose
bun run lint
bun run format
```

**Type errors**

```bash
bun run type-check
```

**Tests failing**

```bash
bun test --reporter=verbose
bun run test:ui  # Interactive debugging
```

## Continuous Integration

All code is validated by GitHub Actions CI before merge:

- **Linting** — ESLint code quality checks
- **Formatting** — Prettier consistency validation
- **Type Checking** — TypeScript validation
- **Build** — Executable compilation test
- **Testing** — Vitest test suite with coverage

The CI workflow runs on every push to `main` and all pull requests. All checks must pass before code can be merged.

### Before Pushing

Run these locally to catch issues early:

```bash
bun run lint       # Check code quality
bun run format     # Auto-fix formatting
bun run type-check # Validate types
bun test           # Run tests
```

See [CI Workflow Documentation](./CI.md) for detailed troubleshooting and branch protection setup.

## Git Hooks

Pre-commit hooks automatically:

- Run ESLint on staged files
- Format code with Prettier
- Prevent commits with linting errors

To skip hooks (not recommended):

```bash
git commit --no-verify
```

## Security & Version Strategy

- **No auto-updates** - All versions controlled, locked in `bun.lock`
- **Reproducible builds** - Every developer gets identical node_modules
- **CI/CD ready** - Use `--frozen-lockfile` in pipelines
- **Supply chain safety** - Exact pinning prevents surprise breakage

See `docs/SECURITY.md` for security best practices and version management strategy.

## Next Steps

1. Review the [Memory System Documentation](./MEMORY.md)
2. Review the [CI Workflow Documentation](./CI.md)
3. Review the [Testing Guide](./TESTING.md)
4. Start working with the memory tools and integration

---

**Last updated:** 2024-12-28  
**For security considerations:** See `docs/SECURITY.md`  
**For CI/CD details:** See `docs/CI.md`

```

Now let me create a new simplified `README.md` for the docs folder:
```
