# DevFlow MCP

**Code analysis MCP server for understanding project structure, symbols, patterns, and dependencies.**

✅ **Status:** Production Ready

[![CI](https://github.com/YogliB/dev-toolkit-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/YogliB/dev-toolkit-mcp/actions/workflows/ci.yml)

## What is DevFlow?

DevFlow provides **comprehensive code analysis** through AST parsing and pattern detection. It helps AI agents understand codebases by analyzing structure, relationships, and patterns:

- **Project Analysis** - Extract metadata, dependencies, and structure
- **Architecture Analysis** - Understand project organization and layers
- **Symbol Analysis** - Find and track symbols across the codebase
- **Pattern Detection** - Identify design patterns and anti-patterns
- **Dependency Graphs** - Visualize relationships between modules
- **Git Analysis** - Extract decisions and track change velocity

## Quick Start

```bash
# Install
npm install -g devflow-mcp

# Configure your AI agent (see Setup Guide)
# Then use tools like:
# - getProjectOnboarding
# - getArchitecture
# - findSymbol
# - detectPatterns
```

**🌐 Dashboard:** When the MCP server runs, access the web dashboard at `http://localhost:3000`

**📚 [Documentation Index](./docs/README.md)** - Complete documentation

## Analysis Tools

DevFlow provides seven categories of analysis tools:

### Project Tools

- `getProjectOnboarding` - Extract project metadata and dependencies

### Architecture Tools

- `getArchitecture` - Get architectural overview with symbols and patterns

### Symbol Tools

- `findSymbol` - Search for symbols by name and type
- `findReferences` - Find all references to a symbol

### Pattern Tools

- `detectPatterns` - Detect design patterns in code
- `detectAntiPatterns` - Identify code smells and anti-patterns

### Graph Tools

- `getDependencyGraph` - Build dependency graph between files

### Git Tools

- `getRecentDecisions` - Extract decisions from git commits
- `analyzeChangeVelocity` - Analyze file change frequency

### Context Tools

- `getContextForFile` - Get comprehensive file context
- `summarizeFile` - Generate file summary

See [Usage Guide](./docs/USAGE.md) for detailed examples.

## Setup by Agent

### Claude Desktop

Create `mcp.json` in your project root:

```json
{
	"mcpServers": {
		"devflow": {
			"command": "devflow",
			"args": ["serve"]
		}
	}
}
```

Then use analysis tools like:

- `getProjectOnboarding` - Get project overview
- `getArchitecture` - Understand project structure
- `findSymbol` - Locate code symbols

### Cursor

Create `mcp.json` in your project root:

```json
{
	"mcpServers": {
		"devflow": {
			"command": "devflow",
			"args": ["serve", "--stdio"]
		}
	}
}
```

Use in Composer or Chat:

- `getProjectOnboarding` - Get project metadata
- `getArchitecture` - Analyze project structure
- `findSymbol` - Search for symbols
- `detectPatterns` - Find design patterns
- `getContextForFile` - Get file context

### Zed

Add to your `settings.json`:

```json
{
	"context_servers": {
		"devflow": {
			"command": "devflow",
			"args": ["serve", "--stdio"]
		}
	}
}
```

Use in Assistant:

- `getProjectOnboarding` - Project overview
- `getArchitecture` - Architecture analysis
- `findSymbol` - Symbol search
- `detectPatterns` - Pattern detection
- `getContextForFile` - File context

**[Setup Guide](./docs/SETUP.md)** - Detailed configuration instructions

## Documentation

### Getting Started

- **[Setup Guide](./docs/SETUP.md)** - Installation and configuration
- **[Usage Guide](./docs/USAGE.md)** - Usage examples and workflows
- **[Testing Guide](./docs/TESTING.md)** - Running and writing tests

### Reference

- **[Architecture](./docs/ARCHITECTURE.md)** - Technical architecture
- **[Security Policy](./docs/SECURITY.md)** - Best practices
- **[Contributing](./docs/CONTRIBUTING.md)** - Contribution guidelines

**📖 [Full Documentation Index](./docs/README.md)**

## Key Features

- **AST-Based Analysis** - Deep code understanding through AST parsing
- **Plugin Architecture** - Extensible language support
- **Pattern Detection** - Identify design patterns and code smells
- **Dependency Analysis** - Visualize relationships and dependencies
- **Git Integration** - Extract decisions and track change velocity
- **Type-Safe** - Full TypeScript with Zod validation
- **Cross-Platform** - Works with Claude Desktop, Cursor, Zed
- **Fast & Efficient** - Caching and incremental analysis support

## Why DevFlow?

Understanding large codebases is challenging:

- ❌ Manual code exploration is time-consuming
- ❌ Hard to track symbol relationships
- ❌ Pattern detection requires deep knowledge
- ❌ Dependency analysis is complex

**DevFlow provides:**

- ✅ Automated code analysis
- ✅ Symbol search and reference tracking
- ✅ Pattern and anti-pattern detection
- ✅ Dependency graph visualization
- ✅ Git history insights

## Project Status

**Analysis Engine:** ✅ Production Ready

- ✅ Project and architecture analysis tools
- ✅ Symbol search and reference finding
- ✅ Pattern detection (design patterns and anti-patterns)
- ✅ Dependency graph generation
- ✅ Git analysis tools
- ✅ File context and summarization
- ✅ TypeScript/JavaScript support
- ✅ Comprehensive integration tests
- ✅ Full type safety with Zod schemas
- ✅ Cross-platform MCP compatibility

## Technology Stack

- **TypeScript 5.3+** - Type safety and developer experience
- **MCP SDK** - Standard protocol implementation
- **Bun 1.3.2** - Fast runtime, package management, and testing
- **ts-morph** - TypeScript AST manipulation
- **simple-git** - Git repository analysis
- **Zod** - Schema validation

## Development

### Quick Commands

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
bun run type-check

# Build standalone executable
bun run build

# The build creates a single executable at dist/devflow
# with embedded Bun runtime and bytecode compilation

# Lint & format
bun run lint:fix
bun run format
```

### Testing

```bash
# All tests
bun test

# Watch mode
bun test --watch

# Coverage
bun test --coverage

# AI agent mode (quiet output, only failures)
bun run test:ai

# Unit tests only
bun test tests/unit

# Integration tests only
bun test tests/integration
```

**[Testing Guide](./docs/TESTING.md)** - Detailed testing documentation

## Contributing

DevFlow is actively maintained and welcomes contributions!

**Focus Areas:**

- Language plugin implementations (Python, Go, Rust)
- AST analysis improvements
- Performance optimizations
- Pattern detection enhancements
- Testing improvements

**Getting Started:**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `bun test`
5. Submit a pull request

**Before Pushing:**

```bash
bun run lint:fix    # Fix linting
bun run format      # Format code
bun run type-check  # Check types
bun test            # Run tests
```

See [Setup Guide](./docs/SETUP.md) for detailed development instructions.

## Architecture

DevFlow uses a clean, modular architecture focused on code analysis:

```
src/
├── core/
│   ├── config.ts          # Project root detection
│   ├── storage/           # File I/O abstraction
│   └── analysis/          # Analysis engine and plugins
│       ├── engine.ts      # Analysis orchestrator
│       ├── plugins/       # Language plugins
│       ├── cache/         # Caching system
│       └── git/           # Git analyzer
├── mcp/
│   └── tools/             # Analysis tools
│       ├── project.ts    # Project tools
│       ├── architecture.ts # Architecture tools
│       ├── symbols.ts     # Symbol tools
│       ├── patterns.ts    # Pattern tools
│       ├── graph.ts       # Graph tools
│       ├── git.ts         # Git tools
│       └── context.ts     # Context tools
├── server.ts              # Main MCP server
└── index.ts              # Public API
```

**[Architecture Documentation](./docs/ARCHITECTURE.md)** - Technical deep dive

## Security

- **Path Validation** - All file operations validated to prevent traversal attacks
- **Type Safety** - Full TypeScript with Zod schema validation
- **No External Calls** - Everything local to your project
- **Git-Friendly** - Easy to audit changes in version control

**[Security Policy](./docs/SECURITY.md)** - Full details

## License

MIT - Build whatever you want with DevFlow.

## Resources

**External:**

- [Model Context Protocol](https://modelcontextprotocol.io) - MCP specification
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) - TypeScript SDK

**Documentation:**

- [Documentation Index](./docs/README.md) - Complete documentation overview
- [Setup Guide](./docs/SETUP.md) - Installation guide
- [Usage Guide](./docs/USAGE.md) - Usage examples and workflows
- [Architecture](./docs/ARCHITECTURE.md) - Technical reference
- [Testing Guide](./docs/TESTING.md) - Testing strategies

---

**Ready to start?** Follow the [Setup Guide](./docs/SETUP.md) or check out the [Usage Guide](./docs/USAGE.md).

For issues, questions, or suggestions, please open an issue on GitHub.
