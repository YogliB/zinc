# DevFlow MCP - Project Brief

## Scope & Goals

**DevFlow** is a Model Context Protocol (MCP) server that solves AI agent context fragmentation by providing a unified system for managing project knowledge across four complementary layers.

### Core Problem Solved

- AI agents forget context between sessions
- Project knowledge scattered across `.cursorrules`, READMEs, wikis, and documentation
- No persistent memory system for decisions and context
- Documentation optimized for humans, not LLMs
- Manual task status tracking with no automatic validation

### Primary Goals

1. **Context Persistence** - Maintain AI agent memory across sessions
2. **Knowledge Unification** - Single source of truth for rules, memory, docs, plans
3. **Cross-Agent Compatibility** - Work with Claude Desktop, Cursor, Zed, VSCode
4. **Git-Friendly Storage** - Human-readable Markdown and JSON formats
5. **Automatic Validation** - Validate tasks via file changes, tests, commits

## Key Features

- **Rules Engine** - Project coding standards and conventions
- **Memory System** - Session continuity and decision tracking
- **Documentation Layer** - AI-optimized knowledge base
- **Planning Layer** - Task management with automatic validation
- **Bidirectional Linking** - Cross-layer relationship management
- **Modular Architecture** - Use one layer or all four

## Target Users

- AI coding agents (Claude Desktop, Cursor, Zed, VSCode)
- Development teams using AI tools
- Organizations needing standardized context management

## Success Metrics

- All four layers fully functional
- Cross-agent compatibility verified
- Zero configuration required for common use cases
- Git-friendly storage with human-readable formats
- Comprehensive documentation and examples

## Phase Timeline

**Phase 1 - Foundation** (Current)

- Project structure and tooling ✅
- Documentation architecture ✅
- File storage infrastructure ⏳
- Core MCP primitives ⏳
- Layer implementations ⏳

---

**Source of Truth:** README.md, docs/OVERVIEW.md
