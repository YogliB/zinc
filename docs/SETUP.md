# Project Setup Guide

**DevFlow MCP** uses Bun as the package manager with strict, pinned dependency versions for reproducibility.

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

| Command                 | Purpose                       |
| ----------------------- | ----------------------------- |
| `bun run dev`           | Development mode              |
| `bun run build`         | Compile TypeScript to `dist/` |
| `bun test`              | Run tests (Vitest)            |
| `bun run test:ui`       | Interactive test dashboard    |
| `bun run test:coverage` | Coverage report               |
| `bun run lint`          | Check code with ESLint        |
| `bun run lint:fix`      | Auto-fix linting issues       |
| `bun run format`        | Format with Prettier          |
| `bun run type-check`    | TypeScript validation         |

## Project Structure

```
src/
├── core/              # Core infrastructure
├── layers/            # The 4 layers
│   ├── rules/        # Rules engine
│   ├── memory/       # Memory system
│   ├── docs/         # Documentation layer
│   └── planning/     # Planning layer
├── mcp/              # MCP server
├── cli/              # CLI interface
├── utils/            # Utilities
├── index.ts          # Entry point
└── index.test.ts     # Test baseline
```

## Configuration

### TypeScript (`tsconfig.json`)

- Strict mode enabled
- Path aliases: `@/*` maps to `src/*`
- ES2020 target, ESNext modules
- Source maps and declarations enabled

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

**All dependencies are pinned to exact versions** (no `^` or `~` ranges) for reproducibility:

### Pinned Dependencies

All 12 direct dependencies are pinned to exact versions in `package.json`. See `package.json` for the current versions.

**Total:** 232 transitive dependencies locked in `bun.lock`

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

1. Read the [Quick Start Guide](./QUICKSTART.md)
2. Review the [Architecture Overview](./OVERVIEW.md)
3. Start implementing features following the [layer documentation](./README.md)

---

**Last updated:** 2024-03-20  
**For security considerations:** See `docs/SECURITY.md`
