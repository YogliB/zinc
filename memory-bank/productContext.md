# DevFlow MCP - Product Context

## Purpose & Problems Solved

**Primary Purpose:** Enable AI agents to maintain context and knowledge across session boundaries by providing a unified, git-friendly system for managing project rules, memory, documentation, and task planning.

### Problems Addressed

1. **Context Fragmentation** - Project knowledge scattered across multiple formats
2. **Memory Loss** - AI agents lose context when sessions end
3. **Format Mismatches** - Documentation optimized for humans, not LLMs
4. **Manual Overhead** - No automatic task validation or status tracking
5. **Integration Complexity** - Multiple proprietary solutions instead of standard protocol

## User Experience Goals

### For AI Agents

- Access unified project context immediately upon connection
- Retrieve rules, memory, documentation seamlessly
- Persist decisions and context for future sessions
- Validate task completion automatically

### For Developers

- Simple initialization process (`devflow init`)
- Human-readable, git-friendly storage
- Optional layer-by-layer adoption
- Clear, actionable documentation

### For Organizations

- Standardized context management across tools
- Open protocol (MCP) instead of proprietary lock-in
- Modular architecture for team customization
- Version control integration for audit trail

## Architecture Philosophy

- **Modular Design** - Four independent layers that work together
- **Storage Agnostic** - Markdown/JSON for human readability
- **Protocol Standard** - Uses MCP for cross-tool compatibility
- **Convention Over Configuration** - Sensible defaults, minimal setup
- **Extensible** - Easy to add custom rules, templates, validations

## Integration Points

- **Rules ↔ Memory** - Rules inform memory usage patterns
- **Memory ↔ Documentation** - Decisions documented in both
- **Documentation ↔ Planning** - Plans reference documented patterns
- **Planning ↔ Rules** - Task validation uses rule definitions

---

**Context Source:** README.md, docs/OVERVIEW.md, docs/INTEGRATION.md
