# DevFlow MCP Documentation

**Memory-only MCP server for maintaining context across sessions with any AI agent.**

---

## Quick Start

**New to DevFlow?** Start here:

1. **[Memory System](./MEMORY.md)** - Complete memory documentation
2. **[Setup Guide](./SETUP.md)** - Installation and configuration
3. **[Testing Guide](./TESTING.md)** - Running and writing tests

---

## Documentation Index

### Core Documentation

| Document                             | Purpose                                        |
| ------------------------------------ | ---------------------------------------------- |
| [MEMORY.md](./MEMORY.md)             | Complete memory system documentation           |
| [SETUP.md](./SETUP.md)               | Installation, configuration, and project setup |
| [TESTING.md](./TESTING.md)           | Testing guide and strategies                   |
| [SECURITY.md](./SECURITY.md)         | Security policy and best practices             |
| [CI.md](./CI.md)                     | CI/CD workflow documentation                   |
| [CI-QUICK-REF.md](./CI-QUICK-REF.md) | Quick CI reference guide                       |

### Technical Reference

| Document                                             | Purpose                              |
| ---------------------------------------------------- | ------------------------------------ |
| [STORAGE-ARCHITECTURE.md](./STORAGE-ARCHITECTURE.md) | Storage engine and repository design |

---

## Memory System Overview

DevFlow provides persistent context management across sessions through the memory system:

- **activeContext.md** - Current work and focus area
- **progress.md** - Session progress and accomplishments
- **decisionLog.md** - Architectural decisions and reasoning
- **projectContext.md** - Project-wide metadata and setup

### Memory Tools

- `memory-save` - Create or update memory files
- `memory-get` - Retrieve specific memory by name
- `memory-list` - List all memories in the bank
- `memory-delete` - Remove memory files
- `memory-init` - Initialize memory bank with core files
- `memory-context` - Get combined context (activeContext + progress)
- `memory-update` - Review and update all memory files

### Memory Resources

- `devflow://context/memory` - Combined context resource (Cursor)
- `devflow://memory/{name}` - Individual memory file resource

### Memory Prompts

- `memory:load` - Load and format specific memory (Zed workaround)

---

## Common Workflows

### Initialize Memory System

```bash
devflow memory-init
```

This creates the four core memory files with templates ready for your project.

### Save Current Context

```bash
devflow memory-save name=activeContext content="Working on authentication module..."
```

### Get Session Progress

```bash
devflow memory-context
```

Returns combined activeContext + progress for quick session refresh.

### List All Memories

```bash
devflow memory-list
```

### Update Memory

```bash
devflow memory-update
```

Opens guided review workflow for all memory files.

---

## Agent Integration

### Claude Desktop

Add to your `mcp.json`:

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

### Cursor

Add to your `mcp.json`:

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

---

## Quick Command Reference

```bash
# Initialize memory bank
bun run serve

# Run tests
bun test

# Type check
bun run type-check

# Lint code
bun run lint

# Format code
bun run format

# Check circular dependencies
bun run check:circular

# Build distribution
bun run build
```

---

## Development

### Running Tests

```bash
bun test                    # Run all tests
bun test:watch             # Watch mode
bun test:coverage          # Coverage report
bun test:ui                # Interactive UI
```

### Code Quality

```bash
bun run lint               # Check for issues
bun run lint:fix           # Auto-fix issues
bun run format             # Format code
bun run type-check         # TypeScript validation
bun run check:circular     # Check dependencies
```

### Building

```bash
bun run build              # Compile TypeScript
```

---

## Project Status

**Memory Module Status:** ✅ Fully Implemented

- ✅ Memory save/get/list/delete tools
- ✅ Memory init tool with template generation
- ✅ Memory context and update prompts
- ✅ Dynamic memory resources
- ✅ Comprehensive integration tests
- ✅ Full type safety with Zod schemas

---

## Architecture

DevFlow uses a modular architecture:

```
src/
├── core/
│   ├── config.ts          # Project root detection
│   ├── schemas/           # Zod validation schemas
│   └── storage/           # File I/O abstraction
├── layers/
│   └── memory/            # Memory repository
├── mcp/
│   ├── tools/memory.ts    # Memory tools
│   ├── resources/memory.ts # Memory resources
│   └── prompts/memory.ts  # Memory prompts
├── cli/                   # CLI entry point
└── index.ts              # Main server
```

---

## Key Features

- **Persistent Context** - Session continuity across conversations
- **Git-Friendly** - Plain Markdown files, human-readable
- **Type-Safe** - Full TypeScript with Zod validation
- **Cross-Platform** - Works with Claude, Cursor, Zed, VSCode
- **Simple API** - Easy-to-use tools and resources
- **Zero Config** - Works out of the box after `memory-init`

---

## Troubleshooting

### Memory not loading

Check that `.devflow/memory/` directory exists:

```bash
ls -la .devflow/memory/
```

Run `memory-init` if missing.

### Server won't start

Check the error logs:

```bash
bun run dev 2>&1
```

Ensure all dependencies are installed:

```bash
bun install
```

### Tests failing

Run with verbose output:

```bash
bun test --reporter=verbose
```

Check the [Testing Guide](./TESTING.md) for more help.

---

## Resources

**External:**

- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)

**Documentation:**

- [Memory System](./MEMORY.md) - Complete memory documentation
- [Storage Architecture](./STORAGE-ARCHITECTURE.md) - Technical details
- [Setup Guide](./SETUP.md) - Installation and configuration
- [Testing Guide](./TESTING.md) - Testing strategies

---

**Ready to start?** Read the [Memory System](./MEMORY.md) documentation or follow [Setup Guide](./SETUP.md).
