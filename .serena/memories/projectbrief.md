# DevFlow MCP - Project Brief

## Project Identity

**Name:** DevFlow MCP  
**Type:** Open-source MCP server  
**Goal:** Universal project context management for AI agents  
**Status:** Foundation Phase Complete → **MVP Readiness Phase**

## The Problem

AI agents suffer from **context fragmentation** when working with projects:

- Rules scattered across `.cursorrules`, wikis, READMEs
- Memory resets between sessions
- Documentation optimized for humans, not LLMs
- Planning tools require manual status updates
- No unified interface across different AI coding tools

## The Solution

DevFlow provides **four independent but complementary layers**:

1. **Rules** - Project coding standards and conventions
2. **Memory** - Session continuity and decision tracking
3. **Documentation** - AI-optimized knowledge base
4. **Planning** - Task management with automatic validation

## MVP Scope

**Goal:** Demonstrate core value with minimal viable features

### In MVP Scope

- File storage infrastructure (Markdown + JSON, git-friendly)
- Rules Layer: Load/validate project rules, expose via MCP
- Memory Layer: Basic persistence, CRUD operations
- Core MCP primitives: tools, resources, prompts
- Claude Desktop + Cursor integration examples
- CLI scaffolding (`devflow init`)

### Out of MVP Scope

- Full Documentation Layer optimization algorithms
- Advanced Planning validation logic
- Agent-specific integrations (Zed, VSCode, etc.)
- Web dashboard or UI
- Multi-user/team collaboration features
- Database backend (file-based only)

## Tech Stack

- **TypeScript 5.7+** - Type safety
- **fastmcp 3.23.1** - Simplified MCP SDK wrapper
- **Bun 1.3.2** - Runtime and package manager
- **Vitest 2.1.8** - Testing
- **Markdown/JSON** - Storage format

## Key Success Metrics

1. **Functional** - Can load rules, manage memory, expose via MCP
2. **Usable** - Works with Claude Desktop and Cursor out of the box
3. **Extensible** - Layers can be implemented independently
4. **Documented** - Clear integration examples and API docs
5. **Tested** - >80% code coverage, all core paths tested
6. **Production-Ready** - No console errors, clean CLI output

## Current State

✅ **Completed:**

- Project structure and tooling setup
- fastmcp migration (39% boilerplate reduction)
- Test infrastructure with CI monitoring
- Documentation architecture
- ESLint + Prettier configured

⏳ **Next (MVP Phase):**

- File storage layer implementation
- Rules Layer endpoints
- Memory Layer endpoints
- Core MCP primitives (tools, resources, prompts)
- CLI `devflow init` and `devflow serve`
- Integration tests with real MCP clients
- README + quick start guide

## Architecture Overview

```
src/
├── index.ts           # Main MCP server entry point (fastmcp)
├── cli/
│   └── commands.ts    # devflow CLI commands
├── core/
│   ├── storage.ts     # File I/O, directory management
│   └── validation.ts  # Schema validation
├── layers/
│   ├── rules.ts       # Rules Layer implementation
│   ├── memory.ts      # Memory Layer implementation
│   ├── docs.ts        # Docs Layer implementation (MVP: stub)
│   └── planning.ts    # Planning Layer implementation (MVP: stub)
├── mcp/
│   ├── tools.ts       # MCP tool definitions
│   ├── resources.ts   # MCP resource definitions
│   └── prompts.ts     # MCP prompt definitions
└── utils/
    └── logger.ts      # Structured logging
```

## MVP Timeline

- **Week 1**: Storage layer + Rules/Memory endpoints
- **Week 2**: MCP primitives + CLI commands
- **Week 3**: Integration testing + Polish
- **Week 4**: Documentation + Release prep

## Success Definition

MVP is **done** when:

1. ✅ File storage works reliably with no data loss
2. ✅ Rules can be loaded, queried, validated
3. ✅ Memory can be created, read, updated, deleted
4. ✅ MCP server starts and serves tools/resources
5. ✅ Claude Desktop and Cursor can connect
6. ✅ `devflow init` scaffolds a working project
7. ✅ All core features covered in integration tests
8. ✅ No console errors or warnings
9. ✅ Documentation is clear and complete
