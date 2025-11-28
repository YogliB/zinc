# DevFlow MCP

**Universal project context management for AI agents** - unifying rules, memory, documentation, and planning in a single MCP server.

🚧 **Status:** In Development (Phase 1 - Foundation)

[![CI](https://github.com/YogliB/dev-toolkit-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/YogliB/dev-toolkit-mcp/actions/workflows/ci.yml)

## What is DevFlow?

DevFlow solves the fundamental problem of **AI agents forgetting context between sessions**. It provides four independent but complementary layers that work with any MCP-compatible AI agent:

- **Rules** - Project coding standards and conventions
- **Memory** - Session continuity and decision tracking
- **Documentation** - AI-optimized knowledge base
- **Planning** - Task management with automatic validation

## Quick Start

```bash
# Install (when available)
npm install -g devflow-mcp

# Initialize in your project
cd your-project
devflow init
```

**📚 [5-Minute Quick Start Guide](./docs/QUICKSTART.md)** - Get started immediately

## Documentation

### For New Users

- **[Quick Start](./docs/QUICKSTART.md)** - 5-minute hello world
- **[Overview](./docs/OVERVIEW.md)** - Vision and architecture
- **[Integration Guide](./docs/INTEGRATION.md)** - Cross-layer workflows

### Layer Documentation

- **[Rules Engine](./docs/RULES.md)** - Define project standards
- **[Memory System](./docs/MEMORY.md)** - Session continuity
- **[Documentation Layer](./docs/DOCS.md)** - AI-optimized docs
- **[Planning Layer](./docs/PLANNING.md)** - Task validation

### Reference

- **[MCP Primitives](./docs/MCP-PRIMITIVES.md)** - Tools, resources, prompts API
- **[Agent Compatibility](./docs/AGENT-COMPATIBILITY.md)** - Platform-specific guides
- **[Implementation Details](./docs/IMPLEMENTATION.md)** - Technical architecture
- **[Examples](./docs/EXAMPLES.md)** - Real-world workflows

**📖 [Full Documentation Index](./docs/README.md)**

## Memory MCP

**Memory tools and resources** for maintaining context across sessions in Cursor and Zed.

### Features

- **memory-save** - Create/update memory files with metadata
- **memory-get** - Retrieve specific memory by name
- **memory-list** - List all memories in the bank
- **memory-delete** - Remove memory files
- **memory-init** - Initialize memory bank with core template files
- **memory-context** - Get combined activeContext + progress for session
- **memory-update** - Review all memory files with guided update workflow
- **devflow://context/memory** (Cursor) - Auto-loaded session context
- **@memory:load** (Cursor/Claude) - Load specific memory via prompt

### Setup

#### Cursor

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

Then use in Cursor Composer or Chat:

```
/memory-save name=activeContext content="Current work..."
/memory-list
/memory-update
```

#### Zed

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

Then use in Zed Assistant:

- Use `/memory-context` to get session context (activeContext + progress)
- Use `/memory-update` to review all files with guided workflow
- Use `/memory-save`, `/memory-get`, `/memory-list`, `/memory-delete` commands
- Use `/memory-init` to create core memory files

**See [Memory Configuration Guide](./docs/MEMORY.md) for details**

## Why DevFlow?

Current AI coding tools suffer from **context fragmentation**:

- ❌ Rules scattered across `.cursorrules`, wikis, READMEs
- ❌ Memory resets between sessions
- ❌ Documentation optimized for humans, not LLMs
- ❌ Planning tools require manual status updates

**DevFlow unifies everything:**

- ✅ One source of truth for project standards
- ✅ Persistent memory across sessions
- ✅ AI-optimized documentation
- ✅ Automatic task validation

## Key Features

- **Cross-Agent Compatible** - Works with Claude Desktop, Cursor, Zed, VSCode
- **Git-Friendly Storage** - Human-readable Markdown and JSON
- **Automatic Validation** - Tasks validated via file changes, tests, commits
- **Bidirectional Linking** - Rules ↔ Memory ↔ Docs ↔ Plans
- **Modular Architecture** - Use one layer or all four

## Agent Integration

### Claude Desktop

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

```bash
devflow generate cursorrules
```

### Zed

```json
{
	"context_servers": {
		"devflow": {
			"command": "devflow serve --stdio"
		}
	}
}
```

**[Platform-Specific Setup Guides](./docs/AGENT-COMPATIBILITY.md)**

## Project Status

**Current Phase:** Phase 1 - Foundation (Weeks 1-2)

- ✅ Project structure and tooling
- ✅ Documentation architecture
- ⏳ File storage infrastructure
- ⏳ Core MCP primitives
- ⏳ Layer implementations

**[Detailed Roadmap](./docs/OVERVIEW.md#implementation-roadmap)**

## Development

### Scripts

```bash
# Linting and formatting
bun run lint           # Run ESLint
bun run lint:fix      # Fix ESLint issues
bun run format        # Format with Prettier
bun run format:check  # Check formatting

# Type checking and testing
bun run type-check    # TypeScript type checking
bun run test          # Run all tests
bun run test:watch    # Run tests in watch mode
bun run test:coverage # Generate coverage report

# Circular dependency checks
bun run check:circular        # Quick check (circular deps only)
bun run check:circular:verbose # Full dependency tree
bun run check:circular:ci      # CI mode (fails on circular deps)
```

### Circular Dependency Checks

The project uses [dpdm-fast](https://github.com/GrinZero/dpdm-fast) to automatically detect circular dependencies in the codebase. This runs both locally and in CI to prevent architectural issues from accumulating.

**Local workflow:**

```bash
# Before committing, check for circular dependencies
bun run check:circular

# For debugging, see the full dependency tree
bun run check:circular:verbose
```

**CI enforcement:**

The `circular-deps` job runs on every push and PR. If circular dependencies are detected, CI will fail and block merging. This ensures code quality stays high as the project evolves.

## Technology Stack

- **TypeScript 5.3+** - Type safety and developer experience
- **MCP SDK** - Standard protocol implementation
- **Bun 1.3.2** - Fast package management and runtime
- **Vitest** - Modern testing framework
- **Markdown/JSON** - Git-friendly storage
- **dpdm-fast** - Circular dependency detection

## Contributing

DevFlow is designed to be modular and extensible. Contributions welcome!

**Focus Areas:**

- Additional agent integrations
- Performance optimizations
- Template libraries (rules, docs, plans)
- Documentation improvements

## License

MIT - Build whatever you want on top of DevFlow.

## Resources

**Project Links:**

- [Documentation](./docs/README.md)
- [Setup Guide](./SETUP.md)
- [Architecture Overview](./docs/OVERVIEW.md)

**MCP Resources:**

- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)

**Inspiration:**

- [Cline Memory Bank](https://docs.cline.bot/prompting/cline-memory-bank)
- [AGENTS.md Standard](https://www.infoq.com/news/2025/08/agents-md/)

---

**Ready to start?** Follow the **[Quick Start Guide](./docs/QUICKSTART.md)** or dive into the **[Documentation](./docs/README.md)**.
