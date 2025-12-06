# Project Setup Guide

**DevFlow MCP** - A code analysis MCP server for understanding project structure and code relationships.

Uses Bun as the package manager with strict, pinned dependency versions for reproducibility. Production builds use esbuild for better native module compatibility.

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
bun run dev:core
```

## Available Commands

| Command                 | Purpose                     |
| ----------------------- | --------------------------- |
| `bun run dev:core`      | Development mode (tsx)      |
| `bun run build`         | Build with esbuild          |
| `bun test`              | Run tests (Bun test runner) |
| `bun run test:ui`       | Interactive test dashboard  |
| `bun run test:coverage` | Coverage report             |
| `bun run lint`          | Check code with ESLint      |
| `bun run lint:fix`      | Auto-fix linting issues     |
| `bun run format`        | Format with Prettier        |
| `bun run type-check`    | TypeScript validation       |

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

- **esbuild** for production builds with native module support
- ESM output format for modern JavaScript environments
- External dependencies properly handled for better-sqlite3 compatibility
- Development server uses tsx for fast TypeScript execution

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

#### Dashboard Server

- **`DEVFLOW_DASHBOARD_ENABLED`** (boolean, default: `true`)
    - Enable or disable the embedded dashboard web server
    - When enabled, the dashboard starts automatically with the MCP server
    - Access the dashboard at http://localhost:3000 (or configured port)

    ```bash
    export DEVFLOW_DASHBOARD_ENABLED=true
    ```

- **`DEVFLOW_DASHBOARD_PORT`** (number, optional)
    - Set a specific port for the dashboard HTTP server
    - Valid range: 1-65535
    - If not specified, automatically finds an available port (range: 3000-3100)
    - Useful when you need a predictable port number

    ```bash
    export DEVFLOW_DASHBOARD_PORT=8080
    ```

- **`DEVFLOW_DASHBOARD_AUTO_OPEN`** (boolean, default: `false`)
    - Automatically open the dashboard in your default browser when server starts
    - Useful for development workflow
    - Browser launch is platform-specific (macOS, Linux, Windows)

    ```bash
    export DEVFLOW_DASHBOARD_AUTO_OPEN=true
    ```

**Example: Auto Port Detection**

When no port is specified, the dashboard automatically finds an available port:

```bash
# Start MCP server (dashboard auto-detects available port)
bun run dev:core
# Output: [Dashboard:INFO] Auto-detected available port: 3001

# The actual port is logged in the output
```

**Example: Explicit Port**

```bash
# Use a specific port
DEVFLOW_DASHBOARD_PORT=8080 bun run dev:core
# Output: [Dashboard:INFO] Using configured port: 8080

# Access dashboard on configured port
open http://localhost:8080
```

**Example: Auto-Open Browser**

```bash
# Start server and automatically open browser
DEVFLOW_DASHBOARD_AUTO_OPEN=true bun run dev:core
# Browser opens automatically at http://localhost:<detected-port>

# Combine with specific port
DEVFLOW_DASHBOARD_PORT=3000 DEVFLOW_DASHBOARD_AUTO_OPEN=true bun run dev:core
```

**Example: Disable Dashboard**

```bash
# Run MCP server without dashboard
DEVFLOW_DASHBOARD_ENABLED=false bun run dev:core
```

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

## Working with Monorepos

DevFlow supports monorepos and workspaces through two complementary approaches:

### Option 1: Runtime `projectRoot` Parameter (Recommended)

All DevFlow tools accept an optional `projectRoot` parameter that overrides `DEVFLOW_ROOT` for that specific tool call. This allows agents to dynamically work with different packages in a monorepo without reconfiguring the server.

**Example:**

```json
{
	"tool": "getProjectOnboarding",
	"input": {
		"projectRoot": "/path/to/monorepo/packages/app"
	}
}
```

**Benefits:**

- No server restart needed to switch between packages
- Agent can analyze multiple workspaces in a single session
- Ideal for tools that support monorepo workflows

**Usage in different tools:**

```json
// Analyze a specific package
{
	"tool": "getArchitecture",
	"input": {
		"projectRoot": "/path/to/monorepo/packages/api",
		"scope": "src"
	}
}

// Get context from another workspace
{
	"tool": "getContextForFile",
	"input": {
		"projectRoot": "/path/to/monorepo/packages/shared",
		"filePath": "src/utils/validation.ts"
	}
}
```

**Notes:**

- `projectRoot` must be an absolute path
- Path must exist and be accessible
- Scoped engines are cached for performance

### Option 2: Set `DEVFLOW_ROOT` to Monorepo Root

For monorepos with a root-level `package.json`, you can point `DEVFLOW_ROOT` to the monorepo root:

```json
{
	"devflow": {
		"command": "node",
		"args": ["/path/to/devflow/dist/server.js"],
		"env": {
			"DEVFLOW_ROOT": "/path/to/monorepo"
		}
	}
}
```

This works if your monorepo has:

```json
{
	"name": "my-monorepo",
	"private": true,
	"workspaces": ["packages/*"]
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
- Check for `console.*` calls in source code (use logger instead)

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
