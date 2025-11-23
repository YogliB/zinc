# DevFlow MCP

**Universal project context management for AI agents** - unifying rules, memory, documentation, and planning in a single MCP server.

🚧 **Status:** In Development (Phase 1 - Foundation)

[![CI](https://github.com/yogev-boaron-ben-har/dev-toolkit-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/yogev-boaron-ben-har/dev-toolkit-mcp/actions/workflows/ci.yml)

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

## Technology Stack

- **TypeScript 5.3+** - Type safety and developer experience
- **MCP SDK** - Standard protocol implementation
- **Bun 1.3.2** - Fast package management and runtime
- **Vitest** - Modern testing framework
- **Markdown/JSON** - Git-friendly storage

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
