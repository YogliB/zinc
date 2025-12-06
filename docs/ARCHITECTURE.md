# DevFlow Architecture

**Technical architecture documentation for DevFlow MCP server.**

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Configuration Architecture](#configuration-architecture)
3. [Core Components](#core-components)
4. [Analysis System](#analysis-system)
5. [MCP Layer](#mcp-layer)
6. [Data Flow](#data-flow)
7. [Design Patterns](#design-patterns)
8. [Extension Points](#extension-points)

---

## Configuration Architecture

**Hierarchical configuration system for the DevFlow monorepo.**

### Overview

DevFlow uses a **workspace-based hierarchical configuration architecture** where the root defines minimal universal rules, and each package extends with specific customizations. This eliminates configuration duplication while maintaining package independence.

### Configuration Hierarchy

```
root/
├── knip.json           # Workspace-aware analysis config
├── .prettierignore     # Workspace-wide formatting ignores
├── package.json        # Shared prettier config, workspace scripts
├── eslint.config.mjs   # Universal linting rules
└── tsconfig.json       # Shared TypeScript compiler options

packages/core/
├── knip.json           # MCP server entry points
├── eslint.config.mjs   # Extends root + Node.js rules
└── tsconfig.json       # Extends root + Node.js config

packages/dashboard/
├── knip.json           # SvelteKit/Storybook entry points
├── .prettierignore     # Dashboard-specific ignores
├── eslint.config.js    # Extends root + Svelte rules
└── tsconfig.json       # Extends root + SvelteKit config
```

### Configuration Guidelines

#### When to Add Config at Root

Add configuration to the **root** when it applies to **all packages**:

- Base ESLint rules (recommended, prettier integration)
- TypeScript compiler options (strict mode, target, module)
- Prettier formatting rules (quotes, tabs, spacing)
- Workspace-wide ignore patterns

#### When to Add Config at Package Level

Add configuration to a **package** when it's **package-specific**:

- Language-specific linting rules (Svelte, Node.js)
- Runtime-specific TypeScript options (browser vs Node.js)
- Package entry points (Knip configuration)
- Build tool configuration (Vite, SvelteKit)

### Knip Workspace Detection

Knip analyzes both packages using workspace configuration:

**Root knip.json** defines workspace entry points:

```json
{
	"workspaces": {
		"packages/core": {
			"entry": ["src/server.ts"],
			"project": ["src/**/*.ts", "tests/**/*.ts", "scripts/**/*.ts"]
		},
		"packages/dashboard": {
			"entry": [
				"src/routes/**/*.svelte",
				".storybook/main.ts",
				"vite.config.ts"
			],
			"project": ["src/**/*.{ts,svelte}", ".storybook/**/*.ts"]
		}
	}
}
```

**Package knip.json** files define package-specific ignore patterns and can override entry points if needed.

### Prettier Consistency

**Root package.json** contains the shared Prettier configuration:

```json
{
	"prettier": {
		"singleQuote": true,
		"useTabs": true,
		"tabWidth": 4
	}
}
```

**Root .prettierignore** uses workspace-aware patterns:

```
**/dist/
**/node_modules/
**/coverage/
**/.svelte-kit/
```

All packages inherit the root Prettier config automatically. Package-specific `.prettierignore` files can supplement the root ignore patterns for package-specific build artifacts.

### ESLint Inheritance

**Root eslint.config.mjs** contains universal rules that apply to all TypeScript/JavaScript files.

**Package eslint configs** extend the root using flat config composition:

```javascript
import rootConfig from '../../eslint.config.mjs';

export default [
	...rootConfig,
	{
		// Package-specific rules
	},
];
```

### TypeScript Inheritance

**Root tsconfig.json** contains shared compiler options.

**Package tsconfig.json** files extend the root:

```json
{
	"extends": "../../tsconfig.json",
	"compilerOptions": {
		// Package-specific overrides
	}
}
```

### Troubleshooting Config Issues

**ESLint not working in package:**

1. Verify package eslint.config extends root correctly
2. Check that root config is valid JavaScript
3. Ensure `...rootConfig` spread is before package-specific rules

**TypeScript errors in package:**

1. Verify `"extends": "../../tsconfig.json"` is first property
2. Check that root tsconfig.json is valid JSON
3. Run `bun run type-check` from root to see all errors

**Prettier not formatting:**

1. Verify root package.json has prettier config
2. Check .prettierignore isn't excluding files
3. Run `bun run format:check` from root, not package directory

**Knip not detecting package:**

1. Verify workspace is defined in root knip.json
2. Check entry points match actual file structure
3. Ensure package knip.json doesn't conflict with root config

### Workspace Scripts

Root package.json provides workspace-wide scripts:

- `bun run lint` - Lint all packages
- `bun run type-check` - Type-check core package
- `bun run format:check` - Check formatting in all packages
- `bun run knip` - Analyze workspace for unused code

Package-scoped scripts use `--filter`:

- `bun run --filter devflow-mcp lint` - Lint core only
- `bun run --filter dashboard lint` - Lint dashboard only

---

## System Overview

DevFlow is a Model Context Protocol (MCP) server designed to maintain persistent context across AI agent sessions. It provides code analysis capabilities, project understanding, and context management through a modular, plugin-based architecture.

### Dashboard Server Integration

**Production Deployment Pattern:**

DevFlow embeds a web dashboard that automatically starts when the MCP server runs in production. The dashboard uses Bun's native HTTP server to serve static files built with SvelteKit's `adapter-static`.

**Key Components:**

- **Dashboard Server Module** (`packages/core/src/dashboard/server.ts`)
    - Implements `startDashboardServer()` using `Bun.serve()`
    - Serves static files from `packages/dashboard/build/`
    - Handles SPA routing with `index.html` fallback
    - Automatic MIME type detection for assets
    - Automatic port detection when port not specified (range: 3000-3100)
    - Optional browser auto-launch on startup

- **Port Finder Module** (`packages/core/src/dashboard/port-finder.ts`)
    - Implements `findAvailablePort()` for automatic port detection
    - Tests port availability using Bun's TCP socket check
    - Retry logic with configurable range (default: 3000-3100)
    - Returns port number and auto-detection status

- **Browser Launcher Module** (`packages/core/src/dashboard/browser-launcher.ts`)
    - Implements `openBrowser()` for cross-platform browser launch
    - Platform-specific commands (macOS: `open`, Linux: `xdg-open`, Windows: `start`)
    - Graceful error handling (logs warning, doesn't crash server)
    - 1-second delay after server start before launching

- **Static Build** (`packages/dashboard/`)
    - SvelteKit app configured with `@sveltejs/adapter-static`
    - Builds to static HTML/JS/CSS files
    - No SSR or server-side routes (client-side only)
    - Backend logic handled by MCP tools, not SvelteKit API routes

**Architecture Decision:**

The dashboard uses static build + native Bun HTTP server (not `adapter-node`) because:

1. Follows project principle: "Prefer native Bun tools"
2. Dashboard is purely visualization (all backend logic in MCP tools)
3. Simpler deployment, smaller bundle size, better performance
4. Static files can be served from any platform

**Build System Change**: The core MCP server uses esbuild for production builds instead of Bun's bundler to ensure better compatibility with native modules like better-sqlite3. Development uses tsx for fast TypeScript execution.

**Startup Sequence:**

1. MCP server initializes (stdio transport for Model Context Protocol)
2. Dashboard port is determined:
    - If `DEVFLOW_DASHBOARD_PORT` is set, use that port
    - Otherwise, auto-detect available port (range: 3000-3100)
3. Dashboard server starts asynchronously on determined port
4. If `DEVFLOW_DASHBOARD_AUTO_OPEN` is true, browser launches automatically
5. Both MCP and dashboard run in same process, non-blocking

**Port Selection Algorithm:**

1. Check if `DEVFLOW_DASHBOARD_PORT` environment variable is set
2. If set and valid, attempt to use that port
3. If not set, call `findAvailablePort()`:
    - Start at port 3000
    - Test port availability using Bun.serve() socket check
    - If busy, try next port in range (3001, 3002, etc.)
    - Continue until port 3100 or available port found
4. If all ports busy, throw error with clear message
5. Log whether port was explicit or auto-detected

**Browser Launch Implementation:**

1. After server starts successfully, check `autoOpen` config
2. If enabled, detect platform (macOS/Linux/Windows)
3. Wait 1 second for server to be fully ready
4. Execute platform-specific command using `Bun.spawn()`
5. Log success/failure without blocking server operation

**Environment Variables:**

- `DEVFLOW_DASHBOARD_ENABLED` - Enable/disable dashboard (default: `true`)
- `DEVFLOW_DASHBOARD_PORT` - Explicit port number (optional, auto-detects if not set)
- `DEVFLOW_DASHBOARD_AUTO_OPEN` - Auto-launch browser on startup (default: `false`)

### Architecture Style

- **Modular**: Clear separation of concerns across core, analysis, and MCP layers
- **Plugin-based**: Extensible language support through plugin architecture
- **Layered**: Core infrastructure → Analysis engine → MCP interface
- **Type-safe**: Full TypeScript with strict typing throughout

### Main Entry Point

The server initializes through `src/server.ts`, which orchestrates component setup and MCP protocol handling:

```18:56:src/server.ts
async function initializeServer(): Promise<void> {
    try {
        const projectRoot = await detectProjectRoot();
        console.error(`[DevFlow:INFO] Project root detected: ${projectRoot}`);

        storageEngine = createStorageEngine({
            rootPath: projectRoot,
            debug: false,
        });
        console.error('[DevFlow:INFO] StorageEngine initialized');

        analysisEngine = new AnalysisEngine(projectRoot);
        const tsPlugin = new TypeScriptPlugin(projectRoot);
        analysisEngine.registerPlugin(tsPlugin);
        console.error('[DevFlow:INFO] AnalysisEngine initialized');

        gitAnalyzer = new GitAnalyzer(projectRoot);
        console.error('[DevFlow:INFO] GitAnalyzer initialized');

        cache = new GitAwareCache();
        console.error('[DevFlow:INFO] Cache initialized');

        fileWatcher = new FileWatcher(100, cache);
        fileWatcher.watchDirectory(projectRoot);
        console.error('[DevFlow:INFO] FileWatcher initialized');
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Unknown error during initialization';
        console.error(
            `[DevFlow:ERROR] Failed to initialize server: ${errorMessage}`,
        );
        if (error instanceof Error && error.stack) {
            console.error(`[DevFlow:ERROR] Stack trace: ${error.stack}`);
        }
        throw error;
    }
}
```

### Communication Protocol

DevFlow communicates via the MCP protocol over stdio, making it compatible with any MCP client (Claude Desktop, Cursor, Zed, etc.). The server uses FastMCP for protocol handling:

```58:73:src/server.ts
async function main(): Promise<void> {
    await initializeServer();

    const server = new FastMCP({
        name: 'devflow-mcp',
        version: '0.1.0',
    });

    registerAllTools(server, analysisEngine, storageEngine, gitAnalyzer);
    console.error('[DevFlow:INFO] All MCP tools registered');

    await server.start({
        transportType: 'stdio',
    });
    console.error('DevFlow MCP Server running on stdio');
}
```

---

## Core Components

### Config Module

**Location**: `src/core/config.ts`

The config module handles project root detection with intelligent fallback logic. It searches for project indicators (`.git`, `package.json`, `pyproject.toml`) by traversing up the directory tree, starting from both the current working directory and the server script's directory:

**Detection Strategy**:

1. **Environment Variable Override**: If `DEVFLOW_ROOT` is set, it takes precedence
2. **Primary Search**: Starts from current working directory (CWD)
3. **Fallback Search**: If CWD doesn't yield a validated result, searches from server script directory
4. **Validation**: Prefers roots that contain a `package.json` with `devflow` in the name
5. **Warning**: Logs warnings when detected root doesn't appear to be a devflow project

**Features**:

- Environment variable override support (`DEVFLOW_ROOT`)
- Multiple indicator detection (`.git`, `package.json`, `pyproject.toml`)
- Server script directory detection using `import.meta.url` for reliable MCP context detection
- Project validation to prefer devflow projects over generic git repositories
- Graceful fallback to current working directory
- Path resolution with `realpath` to handle symlinks
- Optional `startFrom` parameter for custom search starting points

### Storage Engine

**Location**: `src/core/storage/engine.ts`

The storage engine provides a secure file I/O abstraction layer with comprehensive path validation to prevent directory traversal attacks:

```21:242:src/core/storage/engine.ts
export function createStorageEngine(
    options: StorageEngineOptions,
): StorageEngine {
    const rootPath = path.resolve(options.rootPath);
    const debug = options.debug ?? false;

    const log = (level: 'debug' | 'warn' | 'error', message: string): void => {
        if (debug || level !== 'debug') {
            console.log(`[StorageEngine:${level.toUpperCase()}] ${message}`);
        }
    };

    const validatePath = (filePath: string): string => {
        if (!filePath || typeof filePath !== 'string') {
            throw new PathValidationError(
                'File path must be a non-empty string',
            );
        }

        const normalized = path.normalize(filePath);

        if (normalized.startsWith('..')) {
            throw new PathValidationError(
                'Path traversal detected: path cannot start with ..',
            );
        }

        const fullPath = path.resolve(rootPath, normalized);

        const relative = path.relative(rootPath, fullPath);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
            throw new PathValidationError(
                `Path is outside root directory: ${filePath}`,
            );
        }

        return fullPath;
    };

    const readFile = async (filePath: string): Promise<string> => {
        try {
            const validatedPath = validatePath(filePath);
            log('debug', `Reading file: ${filePath}`);

            const { readFile: fsReadFile } = await import('node:fs/promises');
            const content = await fsReadFile(validatedPath, 'utf8');
            log(
                'debug',
                `Successfully read file: ${filePath} (${content.length} bytes)`,
            );
            return content;
        } catch (error) {
            if (error instanceof PathValidationError) {
                throw error;
            }

            if (
                error instanceof Error &&
                'code' in error &&
                error.code === 'ENOENT'
            ) {
                throw new FileNotFoundError(filePath);
            }

            throw error;
        }
    };

    const writeFile = async (
        filePath: string,
        content: string,
    ): Promise<void> => {
        try {
            const validatedPath = validatePath(filePath);
            log('debug', `Writing file: ${filePath}`);

            const directory = path.dirname(validatedPath);

            try {
                const { mkdir } = await import('node:fs/promises');
                await mkdir(directory, { recursive: true });
            } catch (mkdirError) {
                throw new WriteError(
                    filePath,
                    `Failed to create directory: ${mkdirError instanceof Error ? mkdirError.message : 'Unknown error'}`,
                );
            }

            const { writeFile: fsWriteFile } = await import('node:fs/promises');
            await fsWriteFile(validatedPath, content, 'utf8');
            log(
                'debug',
                `Successfully wrote file: ${filePath} (${content.length} bytes)`,
            );
        } catch (error) {
            if (
                error instanceof PathValidationError ||
                error instanceof WriteError
            ) {
                throw error;
            }

            throw new WriteError(
                filePath,
                error instanceof Error ? error.message : 'Unknown error',
            );
        }
    };

    const exists = async (filePath: string): Promise<boolean> => {
        try {
            const validatedPath = validatePath(filePath);
            const { access } = await import('node:fs/promises');
            await access(validatedPath);
            return true;
        } catch (error) {
            if (error instanceof PathValidationError) {
                throw error;
            }
            return false;
        }
    };

    const deleteFile = async (filePath: string): Promise<void> => {
        try {
            const validatedPath = validatePath(filePath);
            log('debug', `Deleting file: ${filePath}`);
            const { unlink } = await import('node:fs/promises');
            await unlink(validatedPath);
            log('debug', `Successfully deleted file: ${filePath}`);
        } catch (error) {
            if (error instanceof PathValidationError) {
                throw error;
            }

            if (
                error instanceof Error &&
                'code' in error &&
                error.code === 'ENOENT'
            ) {
                throw new FileNotFoundError(filePath);
            }

            throw error;
        }
    };

    const listFiles = async (
        directoryPath: string = '',
        options: { recursive?: boolean } = {},
    ): Promise<string[]> => {
        try {
            const safeDirectory = directoryPath || '.';
            const validatedPath = validatePath(safeDirectory);
            log('debug', `Listing files in: ${safeDirectory}`);

            const files: string[] = [];

            const readDirectory = async (
                currentValidatedPath: string,
            ): Promise<void> => {
                try {
                    const { readdir } = await import('node:fs/promises');
                    const entries = await readdir(currentValidatedPath, {
                        withFileTypes: true,
                    });

                    for (const entry of entries) {
                        const fullPath = path.join(
                            currentValidatedPath,
                            entry.name,
                        );
                        const relativePath = path
                            .relative(rootPath, fullPath)
                            .replaceAll('\\', '/');

                        if (entry.isFile()) {
                            files.push(relativePath);
                        } else if (entry.isDirectory() && options.recursive) {
                            await readDirectory(fullPath);
                        }
                    }
                } catch (error) {
                    if (
                        error instanceof Error &&
                        'code' in error &&
                        error.code === 'ENOENT'
                    ) {
                        log(
                            'debug',
                            `Directory not found: ${currentValidatedPath}`,
                        );
                    } else {
                        throw error;
                    }
                }
            };

            await readDirectory(validatedPath);
            return files;
        } catch (error) {
            if (error instanceof PathValidationError) {
                throw error;
            }

            throw error;
        }
    };

    const getRootPath = (): string => {
        return rootPath;
    };

    return {
        readFile,
        writeFile,
        exists,
        delete: deleteFile,
        listFiles,
        getRootPath,
    };
}
```

**Security Features**:

- Path normalization and validation
- Directory traversal prevention
- Root path enforcement
- Custom error types for clear error handling

**API**:

- `readFile(filePath)`: Read file content with validation
- `writeFile(filePath, content)`: Write file with directory creation
- `exists(filePath)`: Check file existence
- `delete(filePath)`: Delete file safely
- `listFiles(directoryPath, options)`: List files recursively
- `getRootPath()`: Get configured root path

### Logger Utility

**Location**: `src/core/utils/logger.ts`

The logger utility provides centralized, consistent logging across the entire codebase with namespace-based organization and configurable log levels.

**Console.log Prevention**: A pre-commit hook automatically prevents `console.*` calls from being committed to `src/` files, ensuring all logging uses this utility. See `scripts/check-console.sh` and [CONTRIBUTING.md](./CONTRIBUTING.md#consolelog-prevention) for details.

**Features**:

- Namespace-based logging for component identification
- Four log levels: `debug`, `info`, `warn`, `error`
- Configurable debug flag to control debug log visibility
- Consistent format: `[Namespace:LEVEL] message`
- All output to stderr to avoid interfering with MCP stdio protocol

**Usage**:

```typescript
import { createLogger } from './core/utils/logger';

const logger = createLogger('MyModule', { debug: true });

logger.debug('Detailed debugging information');
logger.info('Informational message');
logger.warn('Warning message');
logger.error('Error message');
```

**Implementation**:

```typescript
export interface Logger {
	debug: (message: string) => void;
	info: (message: string) => void;
	warn: (message: string) => void;
	error: (message: string) => void;
}

export function createLogger(
	namespace: string,
	options: { debug?: boolean } = {},
): Logger {
	const debugEnabled = options.debug ?? false;

	const log = (level: string, message: string): void => {
		if (level === 'debug' && !debugEnabled) {
			return;
		}
		console.error(`[${namespace}:${level.toUpperCase()}] ${message}`);
	};

	return {
		debug: (message: string) => log('debug', message),
		info: (message: string) => log('info', message),
		warn: (message: string) => log('warn', message),
		error: (message: string) => log('error', message),
	};
}
```

**Logger Instances**:

- `DevFlow`: Server initialization and lifecycle
- `StorageEngine`: File I/O operations
- `Config`: Project root detection
- `FileWatcher`: File watching events
- `ArchitectureTools`: Architecture analysis tools
- `ProjectTools`: Project metadata tools

### Analysis Engine

**Location**: `src/core/analysis/engine.ts`

The analysis engine orchestrates code analysis through a plugin-based architecture. It delegates language-specific operations to registered plugins:

```6:58:src/core/analysis/engine.ts
export class AnalysisEngine {
    private plugins: PluginRegistry;
    private projectRoot: string;

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
        this.plugins = new PluginRegistry();
    }

    registerPlugin(plugin: LanguagePlugin): void {
        this.plugins.register(plugin);
    }

    async analyzeFile(filePath: string): Promise<FileAnalysis> {
        const language = detectLanguage(filePath);
        const plugin = this.plugins.get(language);

        if (!plugin) {
            throw new Error(
                `No plugin available for language: ${language} (file: ${filePath})`,
            );
        }

        const ast = await plugin.parse(filePath);
        const symbols = await plugin.extractSymbols(ast, filePath);
        const relationships = await plugin.buildRelationships(
            symbols,
            ast,
            filePath,
        );
        const patterns = await plugin.detectPatterns(ast, symbols, filePath);

        return {
            path: filePath,
            symbols,
            relationships,
            patterns,
            ast,
        };
    }

    async analyzeFiles(filePaths: string[]): Promise<FileAnalysis[]> {
        return Promise.all(filePaths.map((path) => this.analyzeFile(path)));
    }

    getPlugin(language: string): LanguagePlugin | undefined {
        return this.plugins.get(language);
    }

    getProjectRoot(): string {
        return this.projectRoot;
    }
}
```

**Analysis Pipeline**:

1. Language detection from file extension
2. Plugin selection based on language
3. AST parsing
4. Symbol extraction
5. Relationship building
6. Pattern detection

**Output Structure**:

- `FileAnalysis` contains symbols, relationships, patterns, and AST
- All analysis results are typed and immutable

### Analytics Database

**Location**: `src/analytics/`

The analytics database provides persistent storage for MCP tool call metrics and session data using SQLite with Drizzle ORM.

**SQLite Implementation**: Uses `better-sqlite3` for cross-runtime compatibility:

- **Library Choice**: `better-sqlite3` instead of `bun:sqlite` to ensure analytics works in both Bun and Node.js environments
- **Cross-Runtime**: Enables vitest (Node.js) to run all analytics tests alongside the MCP server (Bun runtime)
- **Performance**: Comparable performance to `bun:sqlite` - no significant regression in benchmarks
- **Native Bindings**: Requires native module compilation (automatic with `bun install`)
- **Drizzle Integration**: Full support via `drizzle-orm/better-sqlite3` adapter

#### Database Location

- **Path**: `~/.devflow/analytics.db` (user's home directory)
- **Journal Mode**: WAL (Write-Ahead Logging) for concurrent access
- **Directory Creation**: Automatically creates `~/.devflow/` if needed

#### Schema Design

**Sessions Table** (`sessions`):

- `id` (text, primary key, auto-generated UUID)
- `startedAt` (timestamp, not null)
- `endedAt` (timestamp, nullable)
- `toolCount` (integer, default 0)

**Tool Calls Table** (`tool_calls`):

- `id` (text, primary key, auto-generated UUID)
- `toolName` (text, not null, indexed)
- `durationMs` (integer, not null)
- `status` (enum: 'success', 'error', 'timeout')
- `errorType` (text, nullable)
- `timestamp` (timestamp, not null, indexed)
- `sessionId` (text, foreign key to sessions.id)

**Indexes**:

- `tool_name_idx` on `toolName` for fast tool-specific queries
- `timestamp_idx` on `timestamp` for time-based filtering
- `timestamp_tool_name_idx` composite index for combined queries

#### Database Initialization

The database uses a **lazy initialization pattern** with a singleton to eliminate overhead in code paths that don't require analytics:

```typescript
import { getAnalyticsDatabase } from './analytics/database.js';

// Database is NOT created on module import
// Database is created lazily on first access
const database = getAnalyticsDatabase();
// Database is created at ~/.devflow/analytics.db with WAL mode enabled
// Migrations run automatically on first initialization
```

**Key Design Decisions**:

- **Lazy Loading**: Database is created only when `getAnalyticsDatabase()` is first called, not on module import
- **Singleton Pattern**: Multiple calls to `getAnalyticsDatabase()` return the same instance
- **Zero Overhead**: Performance tests and non-analytics code paths have no database initialization cost
- **Runtime Agnostic**: Works in both Bun and Node.js environments

**Testing Support**:

```typescript
import {
	getAnalyticsDatabase,
	closeAnalyticsDatabase,
} from './analytics/database.js';

afterEach(() => {
	// Reset singleton state between tests
	closeAnalyticsDatabase();
});
```

#### Type Safety

Drizzle ORM provides full TypeScript type inference:

- `Session` and `NewSession` types for select/insert operations
- `ToolCall` and `NewToolCall` types for select/insert operations
- Compile-time validation of queries and schema changes

#### Migration Management

Migrations are stored in `src/analytics/migrations/` and run automatically when `createAnalyticsDatabase()` is called. The migration system:

- Tracks applied migrations in `__drizzle_migrations` table
- Ensures migrations run only once
- Maintains schema version consistency

#### Usage Pattern

```typescript
import { getAnalyticsDatabase } from './analytics/database.js';
import { sessions, toolCalls } from './analytics/schema.js';
import { eq } from 'drizzle-orm';

const database = getAnalyticsDatabase();

// Insert session
const session = database
	.insert(sessions)
	.values({
		startedAt: new Date(),
		toolCount: 0,
	})
	.returning()
	.get();

// Insert tool call
database
	.insert(toolCalls)
	.values({
		toolName: 'grep',
		durationMs: 123,
		status: 'success',
		timestamp: new Date(),
		sessionId: session.id,
	})
	.run();

// Query tool calls
const calls = database
	.select()
	.from(toolCalls)
	.where(eq(toolCalls.sessionId, session.id))
	.all();
```

---

## Analysis System

### Plugin Architecture

**Base Interface**: `src/core/analysis/plugins/base.ts`

Plugins implement the `LanguagePlugin` interface to provide language-specific analysis:

```3:22:src/core/analysis/plugins/base.ts
export interface LanguagePlugin {
    readonly name: string;
    readonly languages: string[];

    parse(path: string): Promise<AST>;
    extractSymbols(ast: AST, path: string): Promise<Symbol[]>;
    buildRelationships(
        symbols: Symbol[],
        ast: AST,
        path: string,
    ): Promise<Relationship[]>;
    detectPatterns(
        ast: AST,
        symbols: Symbol[],
        path: string,
    ): Promise<Pattern[]>;

    canIncrementallyUpdate?(oldAST: AST, changes: FileChange): boolean;
    incrementallyUpdate?(oldAST: AST, changes: FileChange): Promise<AST>;
}
```

**TypeScript Plugin**: `src/core/analysis/plugins/typescript.ts`

The TypeScript plugin uses `ts-morph` for AST manipulation and symbol extraction. It handles:

- TypeScript and JavaScript files
- Class, function, interface, type, enum extraction
- Import/export relationship tracking
- Inheritance and implementation relationships
- Pattern detection (singletons, factories, etc.)

**Plugin Registry**: `src/core/analysis/plugins/registry.ts`

The registry manages plugin registration and lookup by language:

- Plugins are registered by language identifier
- Multiple plugins can support the same language
- First registered plugin for a language is used by default

### Git Analyzer

**Location**: `src/core/analysis/git/git-analyzer.ts`

The Git analyzer provides git repository insights for decision tracking and change analysis:

```18:114:src/core/analysis/git/git-analyzer.ts
export class GitAnalyzer {
    private git: SimpleGit;
    private projectRoot: string;

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
        this.git = simpleGit(projectRoot);
    }

    async getFileHash(filePath: string): Promise<string> {
        try {
            const log = await this.git.log({
                file: filePath,
                maxCount: 1,
            });
            return log.latest?.hash || '';
        } catch {
            return '';
        }
    }

    async getCurrentCommitSHA(): Promise<string> {
        try {
            return await this.git.revparse(['HEAD']);
        } catch {
            return '';
        }
    }

    async getRecentDecisions(
        since: string,
        workspace?: string,
    ): Promise<GitDecision[]> {
        try {
            const log = workspace
                ? await this.git.log({ since, '--': workspace })
                : await this.git.log({ since });

            return log.all.map((commit) => ({
                commitSHA: commit.hash,
                message: commit.message,
                author: commit.author_name,
                date: commit.date,
                files: Array.isArray(commit.diff?.changed)
                    ? commit.diff.changed
                    : [],
            }));
        } catch {
            return [];
        }
    }

    async analyzeChangeVelocity(
        filePath: string,
        since: string,
    ): Promise<ChangeVelocity> {
        try {
            const log = await this.git.log({
                since,
                file: filePath,
            });

            const authors = new Set<string>();
            let lastModified = '';

            for (const commit of log.all) {
                authors.add(commit.author_name);
                if (!lastModified) {
                    lastModified = commit.date;
                }
            }

            return {
                path: filePath,
                commitCount: log.total,
                lastModified,
                authors: [...authors],
            };
        } catch {
            return {
                path: filePath,
                commitCount: 0,
                lastModified: '',
                authors: [],
            };
        }
    }

    async getCommitMessages(since: string): Promise<string[]> {
        try {
            const log = await this.git.log({ since });
            return log.all.map((commit) => commit.message);
        } catch {
            return [];
        }
    }
}
```

**Capabilities**:

- File commit hash tracking
- Recent decision extraction from commit messages
- Change velocity analysis (commits, authors, frequency)
- Commit message retrieval for context

### Cache System

**Location**: `src/core/analysis/cache/git-aware.ts`

The cache system provides git-aware caching with file hash validation to ensure cache consistency:

```12:118:src/core/analysis/cache/git-aware.ts
export class GitAwareCache {
    private cache: Map<string, CacheEntry> = new Map();
    private maxSize: number;

    constructor(maxSize = 1000) {
        this.maxSize = maxSize;
    }

    private async getFileHash(filePath: string): Promise<string> {
        try {
            const resolvedPath = path.resolve(filePath);
            const { readFile } = await import('node:fs/promises');
            const content = await readFile(resolvedPath, 'utf8');
            return createHash('sha256').update(content).digest('hex');
        } catch {
            return '';
        }
    }

    private getCacheKey(filePath: string, commitSHA?: string): string {
        if (commitSHA) {
            return `${filePath}:${commitSHA}`;
        }
        return filePath;
    }

    async get(
        filePath: string,
        commitSHA?: string,
    ): Promise<FileAnalysis | undefined> {
        const key = this.getCacheKey(filePath, commitSHA);
        const entry = this.cache.get(key);

        if (!entry) {
            return undefined;
        }

        const currentHash = await this.getFileHash(filePath);
        if (entry.fileHash !== currentHash) {
            this.cache.delete(key);
            return undefined;
        }

        return entry.analysis;
    }

    async set(
        filePath: string,
        analysis: FileAnalysis,
        commitSHA?: string,
    ): Promise<void> {
        if (this.cache.size >= this.maxSize) {
            this.evictOldest();
        }

        const fileHash = await this.getFileHash(filePath);
        const key = this.getCacheKey(filePath, commitSHA);

        this.cache.set(key, {
            analysis,
            fileHash,
            commitSHA,
            timestamp: Date.now(),
        });
    }

    async isStale(filePath: string, commitSHA?: string): Promise<boolean> {
        const key = this.getCacheKey(filePath, commitSHA);
        const entry = this.cache.get(key);

        if (!entry) {
            return true;
        }

        const currentHash = await this.getFileHash(filePath);
        return entry.fileHash !== currentHash;
    }

    invalidate(filePath: string, commitSHA?: string): void {
        const key = this.getCacheKey(filePath, commitSHA);
        this.cache.delete(key);
    }

    invalidateAll(): void {
        this.cache.clear();
    }

    private evictOldest(): void {
        let oldestKey: string | undefined;
        let oldestTimestamp = Infinity;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTimestamp) {
                oldestTimestamp = entry.timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }

    getSize(): number {
        return this.cache.size;
    }
}
```

**Features**:

- SHA-256 file hash validation
- Git commit-aware caching (optional commit SHA in key)
- LRU eviction when max size reached
- Automatic staleness detection
- Manual invalidation support

### File Watcher

**Location**: `src/core/analysis/watcher/file-watcher.ts`

The file watcher monitors the project directory for changes and invalidates cache entries. It includes safeguards to prevent memory exhaustion when watching large directory trees.

**Features**:

- **Directory Size Validation**: Estimates directory size before watching (samples up to 10k files)
- **Size Threshold**: Rejects directories with >100k files to prevent memory exhaustion
- **Exclusion Patterns**: Automatically excludes common large directories:
    - `node_modules`, `.git`, `.cache`, `.npm`
    - `dist`, `build`, `.next`, `.turbo`, `coverage`
- **Event Filtering**: Filters out file change events for excluded paths
- **Debounced Changes**: Configurable debounce time (default 100ms) to batch rapid changes
- **Warning Logs**: Warns when watching large directories (>10k files)

**API**:

- `watchDirectory(directoryPath)`: Start watching a directory (async, validates size)
- `onChange(callback)`: Register callback for file changes
- `offChange(callback)`: Unregister callback
- `stop()`: Stop all watchers and clear timers

**Memory Safety**:

The watcher prevents watching excessively large directories by:

1.  Estimating file count before watching (lightweight, stops at 10k sample)
2.  Throwing descriptive errors for directories exceeding 100k files
3.  Filtering events from excluded paths to reduce memory usage
4.  Logging warnings for large but acceptable directories

        stop(): void {
            for (const watcher of this.watchers.values()) {
                watcher.close();
            }
            this.watchers.clear();

            for (const timer of this.debounceTimers.values()) {
                clearTimeout(timer);
            }
            this.debounceTimers.clear();
        }

    }

````

**Features**:

- Recursive directory watching
- Debounced change handling (default 100ms)
- Automatic cache invalidation on file changes
- Callback system for custom change handlers
- Graceful error handling in callbacks

---

## MCP Layer

### Tool Registration

**Location**: `src/mcp/tools/register.ts`

All MCP tools are registered through a centralized registration function:

```13:26:src/mcp/tools/register.ts
export function registerAllTools(
    server: FastMCP,
    engine: AnalysisEngine,
    storage: StorageEngine,
    gitAnalyzer: GitAnalyzer,
): void {
    registerProjectTools(server, engine, storage);
    registerArchitectureTools(server, engine);
    registerSymbolTools(server, engine);
    registerPatternTools(server, engine);
    registerGraphTools(server, engine);
    registerGitTools(server, gitAnalyzer);
    registerContextTools(server, engine);
}
````

### Available Tools

DevFlow provides seven tool categories:

1. **Project Tools** (`src/mcp/tools/project.ts`)
    - `getProjectOnboarding`: Extract project metadata from package.json, README, tsconfig.json

2. **Architecture Tools** (`src/mcp/tools/architecture.ts`)
    - Architecture analysis and layer detection

3. **Symbol Tools** (`src/mcp/tools/symbols.ts`)
    - Symbol search and extraction

4. **Pattern Tools** (`src/mcp/tools/patterns.ts`)
    - Design pattern detection

5. **Graph Tools** (`src/mcp/tools/graph.ts`)
    - Dependency graph construction

6. **Git Tools** (`src/mcp/tools/git.ts`)
    - Git history and change analysis

7. **Context Tools** (`src/mcp/tools/context.ts`)
    - Context management and retrieval

### Server Lifecycle

**Initialization Sequence**:

1. **Project Root Detection**: Find project root via config module
2. **Storage Engine Creation**: Initialize file I/O with path validation
3. **Analysis Engine Setup**: Create engine and register TypeScript plugin
4. **Git Analyzer Initialization**: Set up git repository access
5. **Cache Creation**: Initialize git-aware cache
6. **File Watcher Setup**: Start watching project directory
7. **Tool Registration**: Register all MCP tools
8. **MCP Server Start**: Begin listening on stdio

**Error Handling**:

- All initialization errors are caught and logged with stack traces
- Server exits with code 1 on fatal errors
- Component initialization failures prevent server startup

---

## Data Flow

### Server Initialization Flow

```
Start → detectProjectRoot() → createStorageEngine()
  → new AnalysisEngine() → registerPlugin(TypeScriptPlugin)
  → new GitAnalyzer() → new GitAwareCache()
  → new FileWatcher() → watchDirectory()
  → registerAllTools() → server.start()
```

### Analysis Request Flow

```
MCP Tool Request
  → AnalysisEngine.analyzeFile(filePath)
    → detectLanguage(filePath)
    → PluginRegistry.get(language)
    → Plugin.parse(filePath) → AST
    → Plugin.extractSymbols(ast) → Symbol[]
    → Plugin.buildRelationships(symbols, ast) → Relationship[]
    → Plugin.detectPatterns(ast, symbols) → Pattern[]
  → FileAnalysis { symbols, relationships, patterns, ast }
```

### Cache Flow

```
Analysis Request
  → GitAwareCache.get(filePath, commitSHA?)
    → Check cache entry
    → Validate file hash
    → Return cached analysis OR
  → Perform analysis
  → GitAwareCache.set(filePath, analysis, commitSHA?)
```

### File Change Flow

```
File System Event
  → FileWatcher (debounced)
    → GitAwareCache.invalidate(filePath)
    → Callback execution (if registered)
  → Next analysis request triggers re-analysis
```

---

## Design Patterns

### Plugin Pattern

The plugin pattern enables extensible language support. Each language plugin implements the `LanguagePlugin` interface, allowing the analysis engine to work with multiple languages without modification.

**Benefits**:

- Open/Closed Principle: Open for extension, closed for modification
- Single Responsibility: Each plugin handles one language
- Easy to add new languages without changing core code

### Repository Pattern

The storage engine abstracts file operations behind a clean interface, hiding filesystem implementation details.

**Benefits**:

- Testability: Easy to mock for testing
- Security: Centralized path validation
- Flexibility: Can swap implementations (e.g., in-memory for tests)

### Factory Pattern

Engine creation uses factory functions (`createStorageEngine`) that encapsulate initialization logic.

**Benefits**:

- Encapsulation: Complex setup hidden from callers
- Configuration: Options object for flexible configuration
- Consistency: Standardized creation process

### Observer Pattern

The file watcher uses callbacks to notify interested parties of file changes.

**Benefits**:

- Decoupling: Watcher doesn't need to know about cache
- Extensibility: Multiple callbacks can be registered
- Flexibility: Callbacks can be added/removed at runtime

---

## Extension Points

### Adding a Language Plugin

To add support for a new language:

1. **Create Plugin Class**:
    - Implement `LanguagePlugin` interface
    - Define supported languages
    - Implement parse, extractSymbols, buildRelationships, detectPatterns

2. **Register Plugin**:

    ```typescript
    const plugin = new MyLanguagePlugin(projectRoot);
    analysisEngine.registerPlugin(plugin);
    ```

3. **Language Detection**:
    - Update `language-detector.ts` if needed for custom extensions

**Example Structure**:

```typescript
export class PythonPlugin implements LanguagePlugin {
    readonly name = 'python';
    readonly languages = ['python'];

    async parse(path: string): Promise<AST> { /* ... */ }
    async extractSymbols(ast: AST, path: string): Promise<Symbol[]> { /* ... */ }
    async buildRelationships(...): Promise<Relationship[]> { /* ... */ }
    async detectPatterns(...): Promise<Pattern[]> { /* ... */ }
}
```

### Adding an MCP Tool

To add a new MCP tool:

1. **Create Tool File** (`src/mcp/tools/my-tool.ts`):

    ```typescript
    export function registerMyTools(
    	server: FastMCP,
    	engine: AnalysisEngine,
    	storage: StorageEngine,
    ): void {
    	server.addTool({
    		name: 'myTool',
    		description: 'Tool description',
    		execute: async () => {
    			// Tool implementation
    		},
    	});
    }
    ```

2. **Register in `register.ts`**:

    ```typescript
    import { registerMyTools } from './my-tool';

    export function registerAllTools(...) {
      // ... existing registrations
      registerMyTools(server, engine, storage);
    }
    ```

### Extending Analysis Capabilities

To add new analysis features:

1. **Extend Plugin Interface** (if needed):
    - Add optional methods to `LanguagePlugin`
    - Implement in plugins that support it

2. **Add Analysis Types** (`src/core/analysis/types.ts`):
    - Define new types for analysis results
    - Update `FileAnalysis` interface if needed

3. **Update Tools**:
    - Modify or create tools that use new analysis capabilities

---

## Security Considerations

### Path Validation

All file operations go through the storage engine's path validation:

- Normalization prevents `../` traversal
- Root path enforcement prevents access outside project
- Relative path validation ensures paths stay within bounds

### Error Handling

- Custom error types (`PathValidationError`, `FileNotFoundError`, `WriteError`)
- Errors don't leak internal paths or system details
- Graceful degradation when git operations fail

### Input Validation

- MCP tool inputs validated through FastMCP schemas
- File paths validated before filesystem access
- Type safety enforced through TypeScript

---

## Performance Considerations

### Lazy Loading Strategy

DevFlow uses lazy loading for TypeScript file parsing to minimize initialization time:

- **On-Demand File Loading**: Files are only parsed when first accessed by analysis tools
- **File Caching**: Loaded files are cached in memory using a `Set` to track loaded paths
- **Background Preloading (Optional)**: Files can be preloaded in the background without blocking server startup
- **Environment Variables**:
    - `DEVFLOW_PRELOAD_FILES=true` - Enable background file preloading
    - `DEVFLOW_PRELOAD_PATTERNS=src/**/*.ts,lib/**/*.tsx` - Custom glob patterns for preloading

**Performance Impact**:

- Server initialization: ~13.5s → ~50-200ms (65-270x faster)
- First file analysis: ~200-500ms (acceptable latency)
- Subsequent analyses: <1ms (fully cached)

**File Loading Lifecycle**:

1. Plugin initialized with project root (no files loaded)
2. On first `analyzeFile()` call, file is loaded via `getOrLoadSourceFile()`
3. File path added to `loadedFiles` Set for cache tracking
4. Subsequent calls to same file use cached AST from ts-morph Project

### Caching Strategy

- Git-aware caching reduces redundant analysis
- File hash validation ensures cache consistency
- LRU eviction prevents unbounded memory growth

### File Watching

- Debounced events reduce unnecessary processing
- Recursive watching monitors entire project tree
- Cache invalidation happens automatically on changes

### Analysis Optimization

- Parallel file analysis via `Promise.all`
- Plugin-based architecture allows language-specific optimizations
- AST reuse across analysis phases

### Performance Benchmarks

**Initialization Times** (typical development project):

| Files      | Initialization | First Analysis | Memory Usage |
| ---------- | -------------- | -------------- | ------------ |
| 100 files  | ~50-100ms      | ~200ms         | ~10MB        |
| 500 files  | ~150-200ms     | ~250ms         | ~25MB        |
| 1000 files | ~180-250ms     | ~300ms         | ~40MB        |
| 5000 files | ~200-300ms     | ~400ms         | ~100MB       |

**Tool Performance**:

| Tool                   | Typical Time | Notes                      |
| ---------------------- | ------------ | -------------------------- |
| `getProjectOnboarding` | 5-20ms       | Reads package.json, README |
| `getArchitecture`      | 100-500ms    | Depends on project size    |
| `findSymbol`           | 50-200ms     | First call, cached after   |
| `getContextForFile`    | 150-400ms    | First call per file        |
| `getDependencyGraph`   | 200-1000ms   | Depends on scope size      |

**Cache Performance**:

- First call: 200-500ms (file loading + parsing)
- Second call: <1ms (99%+ cache hit ratio)
- Third+ calls: <1ms (fully cached)

### Performance Tuning

**Configuration Recommendations**:

| Project Size             | Recommendation            | Configuration                            |
| ------------------------ | ------------------------- | ---------------------------------------- |
| Small (<100 files)       | Lazy loading              | Default (no env vars)                    |
| Medium (100-1000 files)  | Lazy or selective preload | `DEVFLOW_PRELOAD_PATTERNS`               |
| Large (1000-5000 files)  | Selective preload         | `DEVFLOW_PRELOAD_PATTERNS="src/**/*.ts"` |
| Very Large (>5000 files) | Lazy + scoped analysis    | Default + use `scope` parameters         |

**Memory Optimization**:

| Configuration     | 100 Files | 500 Files | 1000 Files |
| ----------------- | --------- | --------- | ---------- |
| Lazy (no preload) | ~10MB     | ~25MB     | ~40MB      |
| Full preload      | ~50MB     | ~150MB    | ~250MB     |
| Selective preload | ~20MB     | ~75MB     | ~120MB     |

**Optimization Strategies**:

1. **Use Scoped Analysis**: Analyze specific directories instead of entire project
2. **Leverage Caching**: Subsequent analyses are nearly instant
3. **Selective Preloading**: Preload only frequently-used files
4. **Batch Operations**: Use batch tools instead of multiple sequential calls
5. **Set Explicit Root**: Use `DEVFLOW_ROOT` for consistent project detection

---

## Related Documentation

- **[Setup Guide](./SETUP.md)** - Installation and development setup
- **[Testing Guide](./TESTING.md)** - Testing strategies and practices
- **[Security Policy](./SECURITY.md)** - Security best practices
- **[Usage Guide](./USAGE.md)** - Usage examples and workflows

---

**Last Updated**: Architecture reflects current codebase state as of implementation.
