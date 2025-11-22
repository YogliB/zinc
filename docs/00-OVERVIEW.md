# DevFlow: Four-Layer MCP Architecture

**A comprehensive MCP server for universal project context management across any AI agent or platform.**

## Vision Statement

DevFlow is a modular, extensible MCP server that provides AI agents with complete project context through four independent but complementary layers: **Rules**, **Memory**, **Documentation**, and **Planning**. Each layer is standalone yet enhanced when combined, exposing functionality through MCP primitives (tools, resources, prompts) for universal compatibility.

## Why DevFlow?

Current AI coding tools suffer from **context fragmentation**:
- Rules scattered across `.cursorrules`, `AGENTS.md`, wikis
- Memory resets between sessions (Cline's limitation)
- Documentation optimized for humans, not LLMs
- Planning tools lack execution validation

**DevFlow solves this** by unifying context in a single, git-friendly, agent-agnostic system.

## Architecture Philosophy

### Modularity First
Each layer is **completely independent**:
- Use Rules without Memory
- Use Documentation without Planning
- Mix and match based on needs
- No forced dependencies

### MCP Native
Everything exposed through standard MCP primitives:
- **Tools**: Actionable operations (create, update, validate)
- **Resources**: Auto-loaded context (rules, memory, docs)
- **Prompts**: Workflow templates and initialization

### Universal Compatibility
Works with any MCP-compatible agent:
- Claude Desktop (Anthropic's reference client)
- Cursor (auto-generates `.cursorrules`)
- Zed (stdio transport)
- VSCode Copilot (generates `AGENTS.md`)
- Any custom MCP client

### Git-Friendly Storage
All data stored in human-readable formats:
- Markdown for memory and documentation
- `.mdc` (Markdown Component) for rules
- JSON for planning structures
- Optional SQLite for performance (secondary index)

## The Four Layers

### 1. Rules: Project Standards Engine

**Purpose:** Define and enforce project-specific coding standards, conventions, and constraints.

**Key Features:**
- Three activation modes: `always`, `manual`, `context` (file-pattern)
- Priority system for conflict resolution
- Cross-agent format generation (`.cursorrules`, `AGENTS.md`)
- Validation tools for code compliance

**Storage:** `.devflow/rules/*.mdc`

**MCP Exposure:**
- Resource: `devflow://context/rules` (auto-loaded)
- Tools: `rules:create`, `rules:update`, `rules:validate`
- Prompts: `init_session` with rule summaries

### 2. Memory: Session Continuity (Cline-Inspired)

**Purpose:** Maintain conversation context, architectural decisions, and progress across sessions.

**Key Features:**
- Four-file structure: `activeContext`, `progress`, `decisionLog`, `projectContext`
- Semantic search via optional SQLite indexing
- Decision logging with rationale and alternatives
- Blocker tracking and resolution

**Storage:** `.devflow/memory/*.md`

**MCP Exposure:**
- Resource: `devflow://context/memory` (active context summary)
- Tools: `memory:context:set`, `memory:decision:log`, `memory:recall`
- Prompts: Memory-enhanced workflow templates

### 3. Documentation: AI-Optimized Knowledge Base

**Purpose:** Maintain structured, validated, LLM-friendly project documentation.

**Key Features:**
- Three template types: API, Architecture, Guide
- Consistency validation (headings, terminology, code blocks)
- LLM optimization (model-specific views)
- Cross-reference linking (docs ↔ memory ↔ rules)

**Storage:** `docs/**/*.md`

**MCP Exposure:**
- Resources: `devflow://docs/*` (individual files)
- Tools: `doc:create`, `doc:validate`, `doc:optimize:llm`
- Prompts: Documentation templates

### 4. Planning: Validated Task Management

**Purpose:** Feature planning with automatic execution validation and dependency tracking.

**Key Features:**
- Task decomposition with complexity scoring (1-10)
- Dependency management and milestone grouping
- **Automatic validation** via file monitoring, tests, git commits
- Confidence scoring for completion (0-1)

**Storage:** `.devflow/plans/{active,completed}/*.json`

**MCP Exposure:**
- Resources: `devflow://plans/active` (current plans)
- Tools: `plan:create`, `plan:task:validate`, `plan:milestone:create`
- Prompts: Planning templates by feature size

## Cross-Layer Integration

### Unified Context Loading

At conversation start, agents receive consolidated context:

```markdown
# DevFlow Project Context (Auto-Loaded)

## Active Rules (3)
- TypeScript Standards: Explicit types, no `any`
- Architecture: REST over GraphQL (see decision #47)

## Current Focus
Working on OAuth authentication (Plan: feature-123, Task: session-middleware)
Blocked: Waiting for Redis setup

## Recent Decisions
- #47: REST over GraphQL (team familiarity, simpler debugging)

## Key Documentation
- Architecture: docs/architecture/auth.md

## Active Plan
Feature: OAuth authentication (Progress: 3/7 tasks)
Next: Implement session middleware
```

### Bidirectional Linking

**Rules reference Memory decisions:**
```typescript
rules:create({
  name: "auth-session-pattern",
  linkedDecision: "decision-47"
})
```

**Memory updates Documentation:**
```typescript
memory:decision:log({
  decision: "Use REST over GraphQL",
  docUpdates: ["docs/architecture/api.md#L42"]
})
```

**Planning validates against Rules:**
```typescript
plan:task:update({
  taskId: "task-456",
  status: "done"
})
// Automatically validates against active rules
// Updates memory progress
// Checks doc freshness
```

### Consistency Validation

The `sync:validate` tool ensures integrity:
- Memory decisions reference valid rules
- Plans link to documented features
- Rules cite existing documentation
- Orphaned content detection

## Differentiation

| Feature | Cline Memory | Software Planning MCP | Project KG | **DevFlow** |
|---------|--------------|----------------------|-----------|-------------|
| Memory System | ✅ 4-file | ❌ None | ❌ None | ✅ Cline-inspired |
| Task Planning | ❌ None | ✅ Basic | ✅ Advanced | ✅ **Auto-validation** |
| Documentation | ❌ None | ❌ None | ❌ None | ✅ **AI-optimized** |
| Rules Engine | ❌ None | ❌ None | ❌ None | ✅ **Cross-agent** |
| Execution Tracking | ❌ Manual | ❌ Manual | ⚠️ Manual | ✅ **Automatic** |
| Cross-Layer Linking | N/A | N/A | N/A | ✅ **Bidirectional** |
| Consistency Validation | N/A | ❌ None | ❌ None | ✅ **Multi-layer** |

**DevFlow is the first MCP server to unify memory, rules, documentation, and planning with automatic validation and cross-layer consistency.**

## Technology Stack

**Core Server:**
- TypeScript (type safety, developer experience)
- MCP SDK (tools, resources, prompts)
- File-based storage (git-friendly, human-readable)
- Optional SQLite (performance indexing)

**Transports:**
- Stdio (local: Zed, VSCode, Cursor)
- HTTP + SSE (remote/cloud deployments)
- Auto-detection for format optimization

**Future UI (Optional):**
- Tauri (native performance, single binary)
- Svelte (reactive, minimal overhead)
- Monaco Editor (code/rule editing)
- IPC to MCP server

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- File storage infrastructure
- Core MCP primitives (tools, resources)
- Basic CRUD for all layers
- Auto-loading resources

### Phase 2: Integration (Weeks 3-4)
- Cross-layer linking system
- Unified context resource
- Consistency validation
- Agent format detection

### Phase 3: Intelligence (Weeks 5-6)
- Automatic task validation
- SQLite semantic search
- LLM-specific doc optimization
- Rule conflict detection

### Phase 4: Polish (Weeks 7-8)
- Management UI (Tauri + Svelte)
- Visual editors and dashboards
- Analytics and metrics
- Performance optimization

## Getting Started

**Quick Start:**
```bash
npm install -g devflow-mcp
devflow init
# Configures .devflow/ structure in current project
```

**Add to Claude Desktop:**
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

**Add to Cursor:**
```bash
devflow generate cursorrules
# Creates/updates .cursorrules from DevFlow rules
```

**Add to Zed:**
```json
{
  "context_servers": {
    "devflow": {
      "command": "devflow serve --stdio"
    }
  }
}
```

## Documentation Structure

- **00-OVERVIEW.md** ← You are here
- **01-RULES-LAYER.md** - Rules engine specification
- **02-MEMORY-LAYER.md** - Memory system architecture
- **03-DOCS-LAYER.md** - Documentation management
- **04-PLANNING-LAYER.md** - Planning and validation
- **05-INTEGRATION.md** - Cross-layer workflows
- **06-MCP-PRIMITIVES.md** - Tools, resources, prompts reference
- **07-AGENT-COMPATIBILITY.md** - Platform-specific guides
- **08-IMPLEMENTATION.md** - Technical architecture
- **09-EXAMPLES.md** - Real-world usage patterns

## License

MIT - Build whatever you want on top of DevFlow.

## Contributing

We welcome contributions! Focus areas:
- Additional agent integrations
- Performance optimizations
- Template libraries (rules, docs, plans)
- UI improvements

---

**Next Steps:** Read [01-RULES-LAYER.md](./01-RULES-LAYER.md) to understand the Rules engine in detail.