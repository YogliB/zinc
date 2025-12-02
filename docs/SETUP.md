# Project Setup Guide

**DevFlow MCP** - A code analysis MCP server for understanding project structure and code relationships.

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
| `bun test`              | Run tests (Bun test runner)               |
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
│   ├── storage/      # File I/O engine
│   └── analysis/     # Analysis engine and plugins
├── mcp/              # MCP server
│   └── tools/        # Analysis tools
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

- **Bun test runner** configured for Node environment
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

## Configuration

### Environment Variables

DevFlow supports the following environment variables for configuration:

#### Performance & Lazy Loading

- **`DEVFLOW_PRELOAD_FILES`** (boolean, default: `false`)
    - Enable background file preloading during server initialization
    - When enabled, TypeScript files are loaded in the background without blocking server startup
    - Useful for large projects where you want instant first-tool-call performance

    ```bash
    export DEVFLOW_PRELOAD_FILES=true
    ```

- **`DEVFLOW_PRELOAD_PATTERNS`** (comma-separated glob patterns)
    - Custom file patterns for background preloading
    - Only used when `DEVFLOW_PRELOAD_FILES=true`
    - Defaults to: `**/*.ts,**/*.tsx,**/*.js,**/*.jsx` (relative to project root)

    ```bash
    export DEVFLOW_PRELOAD_PATTERNS="src/**/*.ts,lib/**/*.tsx"
    ```

**Performance Notes**:

- **Default (lazy loading)**: Server starts in ~50-200ms, first file analysis ~200-500ms
- **With preloading**: Server starts in ~50-200ms, preload continues in background, subsequent analyses are instant
- Lazy loading provides 65-270x faster initialization compared to eager loading (13.5s → 200ms)

#### Project Root Configuration

### Project Root Detection

DevFlow automatically detects the project root by searching for indicators (`.git`, `package.json`, `pyproject.toml`) starting from:

1. Current working directory (CWD)
2. Server script directory (as fallback)

**Setting Custom Project Root**

If automatic detection fails or selects the wrong directory (e.g., when running as MCP server), set the `DEVFLOW_ROOT` environment variable:

```bash
export DEVFLOW_ROOT=/path/to/your/project
```

In MCP configuration (e.g., Cursor's `mcp.json`):

```json
{
	"devflow": {
		"command": "node",
		"args": ["/path/to/devflow/dist/server.js"],
		"env": {
			"DEVFLOW_ROOT": "/path/to/your/project"
		}
	}
}
```

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

**Memory exhaustion / Server crashes on startup**

If the server crashes with "JavaScript heap out of memory" errors, the detected project root is likely too large (>100k files). Solutions:

1. **Set DEVFLOW_ROOT** to a more specific directory:

    ```bash
    export DEVFLOW_ROOT=/path/to/specific/project/subdirectory
    ```

2. **Check detected root**: Look for log messages like:

    ```
    [DevFlow:INFO] Project root detected: /path/to/root
    ```

    If this points to your home directory or a very large repository, set `DEVFLOW_ROOT` explicitly.

3. **Verify project structure**: Ensure your project has a `package.json` with `"name": "devflow-mcp"` or contains "devflow" in the name for better detection.

**Server detects wrong project root**

When running as an MCP server, the current working directory may not be your project directory. The server will:

- Try CWD first
- Fall back to server script directory
- Prefer roots with devflow project indicators

If detection fails, set `DEVFLOW_ROOT` explicitly in your MCP configuration.

**Example MCP Configuration with Environment Variables**:

```json
{
	"devflow": {
		"command": "node",
		"args": ["/path/to/devflow/dist/server.js"],
		"env": {
			"DEVFLOW_ROOT": "/path/to/your/project",
			"DEVFLOW_PRELOAD_FILES": "true",
			"DEVFLOW_PRELOAD_PATTERNS": "src/**/*.ts,src/**/*.tsx"
		}
	}
}
```

## Continuous Integration

All code is validated by GitHub Actions CI before merge:

- **Linting** — ESLint code quality checks
- **Formatting** — Prettier consistency validation
- **Type Checking** — TypeScript validation
- **Build** — Executable compilation test
- **Testing** — Bun test suite with coverage

The CI workflow runs on every push to `main` and all pull requests. All checks must pass before code can be merged.

### Before Pushing

Run these locally to catch issues early:

```bash
bun run lint       # Check code quality
bun run format     # Auto-fix formatting
bun run type-check # Validate types
bun test           # Run tests
```

See the [Testing Guide](./TESTING.md) for testing strategies and CI integration details.

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

1. Review the [Usage Guide](./USAGE.md) for examples and workflows
2. Review the [Architecture Documentation](./ARCHITECTURE.md) for technical details
3. Review the [Testing Guide](./TESTING.md) for testing strategies
4. Start using DevFlow analysis tools in your AI agent

---

**Last updated:** 2024-12-28  
**For security considerations:** See [Security Policy](./SECURITY.md)  
**For testing details:** See [Testing Guide](./TESTING.md)

```

Now let me create a new simplified `README.md` for the docs folder:
```
