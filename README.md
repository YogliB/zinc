# DevFlow MCP

**Memory-only MCP server for maintaining context across sessions with any AI agent.**

✅ **Status:** Production Ready

[![CI](https://github.com/YogliB/dev-toolkit-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/YogliB/dev-toolkit-mcp/actions/workflows/ci.yml)

## What is DevFlow?

DevFlow solves the fundamental problem of **AI agents forgetting context between sessions**. It provides a persistent memory system that works with any MCP-compatible AI agent:

- **Persistent Memory** - Session continuity across conversations
- **Decision Tracking** - Log and recall architectural decisions
- **Progress Management** - Track accomplishments and blockers
- **Project Context** - Maintain project-wide metadata

## Quick Start

```bash
# Install
npm install -g devflow-mcp

# Initialize in your project
cd your-project
devflow memory-init
```

**📚 [Memory System Documentation](./docs/MEMORY.md)** - Complete guide

## Memory System

DevFlow provides four core memory files for comprehensive context management:

### Core Memory Files

- **activeContext.md** - Current work and immediate focus
- **progress.md** - Session progress and accomplishments
- **decisionLog.md** - Architectural decisions and reasoning
- **projectContext.md** - Project metadata and setup information

### Memory Tools

All tools available via MCP protocol:

- `memory-save` - Create/update memory files with optional frontmatter
- `memory-get` - Retrieve specific memory by name
- `memory-list` - List all memories in the bank
- `memory-delete` - Remove memory files
- `memory-init` - Initialize memory bank with core template files
- `memory-context` - Get combined activeContext + progress for quick session refresh
- `memory-update` - Review all memory files with guided update workflow

### Memory Resources

- `devflow://context/memory` - Combined context resource (Cursor)
- `devflow://memory/{name}` - Individual memory file resource

### Memory Prompts

- `memory:load` - Load and format specific memory (Zed workaround)
- `memory:context` - Get session context summary

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

Then use tools like `/memory-save name=activeContext content="..."`

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

- `/memory-save` - Save memory
- `/memory-list` - List memories
- `/memory-context` - Get session context
- `/memory-update` - Review and update

Access auto-loaded context via `devflow://context/memory` resource.

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

- `/memory-context` - Get combined context
- `/memory-update` - Review all files
- `/memory-save`, `/memory-get`, `/memory-list`, `/memory-delete`
- `/memory-init` - Initialize

**[Setup Guide](./docs/SETUP.md)** - Detailed configuration instructions

## Documentation

### Getting Started

- **[Memory System](./docs/MEMORY.md)** - Complete memory documentation
- **[Setup Guide](./docs/SETUP.md)** - Installation and configuration
- **[Testing Guide](./docs/TESTING.md)** - Running and writing tests

### Reference

- **[Storage Architecture](./docs/STORAGE-ARCHITECTURE.md)** - Technical details
- **[Security Policy](./docs/SECURITY.md)** - Best practices
- **[CI Workflow](./docs/CI.md)** - Continuous integration

**📖 [Full Documentation Index](./docs/README.md)**

## Key Features

- **Persistent Across Sessions** - Memory survives between conversations
- **Git-Friendly Storage** - Plain Markdown files, human-readable
- **Type-Safe** - Full TypeScript with Zod validation
- **Cross-Platform** - Works with Claude, Cursor, Zed, VSCode
- **Simple API** - Easy-to-use tools and resources
- **Zero Config** - Works immediately after `memory-init`
- **Optional Metadata** - Frontmatter for organization
- **Large File Support** - Handles files up to 2MB+

## Why DevFlow?

Current AI coding tools suffer from **context loss**:

- ❌ Memory resets between conversations
- ❌ Decisions get forgotten and re-debated
- ❌ Progress tracking scattered across multiple places
- ❌ Context loading manual and tedious

**DevFlow fixes this:**

- ✅ Persistent memory across all sessions
- ✅ Automatic context availability
- ✅ Centralized decision tracking
- ✅ Works with any MCP-compatible agent

## Project Status

**Memory Module:** ✅ Production Ready

- ✅ Memory save/get/list/delete tools
- ✅ Memory init tool with template generation
- ✅ Memory context and update tools
- ✅ Dynamic memory resources
- ✅ Comprehensive integration tests (26/26 passing)
- ✅ Full type safety with Zod schemas
- ✅ Cross-platform MCP compatibility

## Technology Stack

- **TypeScript 5.3+** - Type safety and developer experience
- **MCP SDK** - Standard protocol implementation
- **Bun 1.3.2** - Fast package management and runtime
- **Vitest** - Modern testing framework
- **Markdown/JSON** - Git-friendly storage
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
bun test:watch

# Coverage
bun test:coverage

# Interactive UI
bun test:ui
```

**[Testing Guide](./docs/TESTING.md)** - Detailed testing documentation

## Contributing

DevFlow is actively maintained and welcomes contributions!

**Focus Areas:**

- Bug fixes and stability improvements
- Documentation enhancements
- Performance optimizations
- Additional agent integration examples
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

DevFlow uses a clean, modular architecture focused on memory:

```
src/
├── core/
│   ├── config.ts          # Project root detection
│   ├── schemas/           # Zod validation (memory only)
│   └── storage/           # File I/O abstraction
├── layers/
│   └── memory/            # Memory repository
├── mcp/
│   ├── tools/memory.ts    # 7 memory tools
│   ├── resources/memory.ts # 2 memory resources
│   └── prompts/memory.ts  # 2 memory prompts
├── cli/                   # CLI entry point
├── index.ts              # Main MCP server
└── index.test.ts         # Integration tests
```

**[Storage Architecture](./docs/STORAGE-ARCHITECTURE.md)** - Technical deep dive

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

- [Memory System](./docs/MEMORY.md) - Complete documentation
- [Storage Architecture](./docs/STORAGE-ARCHITECTURE.md) - Technical reference
- [Setup Guide](./docs/SETUP.md) - Installation guide
- [Testing Guide](./docs/TESTING.md) - Testing strategies

---

**Ready to start?** Read the [Memory System Documentation](./docs/MEMORY.md) or follow the [Setup Guide](./docs/SETUP.md).

For issues, questions, or suggestions, please open an issue on GitHub.
