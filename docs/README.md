# DevFlow MCP Documentation

**Four-layer architecture for universal project context management across any AI agent.**

---

## Quick Navigation

### 📚 Core Documentation

1. **[00-OVERVIEW.md](./00-OVERVIEW.md)** - Start here! Architecture philosophy, vision, and getting started
2. **[01-RULES-LAYER.md](./01-RULES-LAYER.md)** - Project coding standards and conventions
3. **[02-MEMORY-LAYER.md](./02-MEMORY-LAYER.md)** - Session continuity and decision tracking
4. **[03-DOCS-LAYER.md](./03-DOCS-LAYER.md)** - AI-optimized documentation management
5. **[04-PLANNING-LAYER.md](./04-PLANNING-LAYER.md)** - Task planning with automatic validation
6. **[05-INTEGRATION.md](./05-INTEGRATION.md)** - Cross-layer workflows and unified context

### 🔧 Reference Documentation

- **[06-MCP-PRIMITIVES.md](./06-MCP-PRIMITIVES.md)** - Complete tools, resources, prompts reference
- **[07-AGENT-COMPATIBILITY.md](./07-AGENT-COMPATIBILITY.md)** - Platform-specific integration guides
- **[08-IMPLEMENTATION.md](./08-IMPLEMENTATION.md)** - Technical architecture and implementation details
- **[09-EXAMPLES.md](./09-EXAMPLES.md)** - Real-world usage patterns and workflows

---

## What is DevFlow?

DevFlow is a comprehensive MCP (Model Context Protocol) server that solves the fundamental problem of **AI agents forgetting context between sessions**. It provides four independent but complementary layers:

### 🎯 The Four Layers

#### 1. **Rules** - Project Standards Engine
Define and enforce project-specific coding standards, conventions, and constraints across any AI agent.

**Key Features:**
- Three activation modes: `always`, `manual`, `context` (file-pattern based)
- Cross-agent compatibility (Cursor, Zed, VSCode, Claude Desktop)
- Priority-based conflict resolution
- Automatic format conversion (`.cursorrules`, `AGENTS.md`)

**Example:**
```markdown
---
id: typescript-standards
type: always
priority: 8
---

# TypeScript Standards

- Use explicit types for all function signatures
- Never use `any` - prefer `unknown`
- Enable `strict` mode in tsconfig.json
```

#### 2. **Memory** - Session Continuity (Cline-Inspired)
Maintain conversation context, architectural decisions, and progress across sessions.

**Key Features:**
- Four-file architecture: `activeContext`, `progress`, `decisionLog`, `projectContext`
- Git-friendly markdown storage
- Automatic staleness detection
- Optional SQLite indexing for semantic search

**Example:**
```markdown
# Active Context

**Current Focus:** Implementing OAuth authentication
**Blocker:** Waiting on Redis setup (High severity)

## Recent Decisions
- #47: Session-based auth over JWT (2024-03-18)
```

#### 3. **Documentation** - AI-Optimized Knowledge Base
Structured, validated, LLM-friendly project documentation.

**Key Features:**
- Three templates: API, Architecture, Guide
- Automated consistency validation
- LLM-specific optimization (Claude, GPT-4, Gemini)
- Cross-reference linking

**Example:**
```markdown
---
type: api
stability: stable
related:
  architecture: [architecture/authentication.md]
  decisions: [decision-47]
---

# Authentication API

**Purpose:** Authenticate users and create sessions.
```

#### 4. **Planning** - Validated Task Management
Feature planning with automatic execution validation and dependency tracking.

**Key Features:**
- Task complexity scoring (1-10)
- Dependency management
- **Automatic validation** via file monitoring, tests, git commits
- Confidence scoring for completion (0-1)

**Example:**
```json
{
  "task": "Implement SessionManager class",
  "complexity": 7,
  "validation": {
    "confidence": 0.85,
    "evidence": {
      "filesChanged": ["src/auth/session.ts"],
      "testsPassed": true,
      "lintPassed": true
    }
  }
}
```

---

## Why DevFlow?

### The Problem

Current AI coding tools suffer from **context fragmentation**:
- ❌ Rules scattered across multiple formats (`.cursorrules`, wikis, READMEs)
- ❌ Memory resets between sessions (agents forget previous work)
- ❌ Documentation optimized for humans, not LLMs
- ❌ Planning tools require manual status updates

### The Solution

DevFlow **unifies all context** in a single, git-friendly, agent-agnostic system:
- ✅ **One source of truth** for project standards
- ✅ **Persistent memory** that survives session resets
- ✅ **AI-optimized docs** with enforced structure
- ✅ **Automatic validation** of task completion

### Unique Differentiators

| Feature | Existing Tools | **DevFlow** |
|---------|---------------|-------------|
| Memory System | Manual updates | ✅ **Cline-inspired 4-file structure** |
| Task Validation | Manual status | ✅ **Automatic via file/test/git monitoring** |
| Documentation | Human-centric | ✅ **AI-optimized with templates** |
| Rules Engine | Platform-specific | ✅ **Cross-agent compatible** |
| Integration | Siloed layers | ✅ **Bidirectional cross-layer linking** |
| Consistency | No validation | ✅ **Multi-layer consistency checks** |

**DevFlow is the first MCP server to unify memory, rules, documentation, and planning with automatic validation and cross-layer consistency.**

---

## Getting Started

### Installation (When Implemented)

```bash
npm install -g devflow-mcp
```

### Initialize DevFlow in Your Project

```bash
cd your-project
devflow init
```

This creates:
```
.devflow/
├── rules/
│   ├── global/
│   ├── contextual/
│   └── manual/
├── memory/
│   ├── activeContext.md
│   ├── progress.md
│   ├── decisionLog.md
│   └── projectContext.md
└── plans/
    ├── active/
    ├── completed/
    └── templates/
```

### Add to Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

### Add to Cursor

```bash
devflow generate cursorrules
# Creates/updates .cursorrules from DevFlow rules
```

### Add to Zed

Edit `~/.config/zed/settings.json`:

```json
{
  "context_servers": {
    "devflow": {
      "command": "devflow serve --stdio"
    }
  }
}
```

---

## Quick Start Workflows

### Workflow 1: Define Project Rules

```typescript
// In your AI conversation
await callTool("rules:create", {
  name: "TypeScript Standards",
  type: "always",
  priority: 8,
  content: `# TypeScript Standards
  
- Use explicit types for all functions
- Never use \`any\` - prefer \`unknown\`
- Enable \`strict\` mode`,
  tags: ["typescript", "code-quality"]
});
```

### Workflow 2: Log an Architectural Decision

```typescript
await callTool("memory:decision:log", {
  title: "Session-based Authentication over JWT",
  context: "Need authentication with instant revocation",
  decision: "Use sessions with Redis",
  rationale: "Security requirement for instant token revocation",
  alternatives: [
    {
      name: "JWT",
      pros: ["Stateless", "Easier scaling"],
      cons: ["Cannot instantly revoke"],
      whyRejected: "Instant revocation is non-negotiable"
    }
  ],
  impact: "high",
  tags: ["authentication", "security"]
});
```

### Workflow 3: Plan a Feature

```typescript
await callTool("plan:create", {
  name: "OAuth Authentication",
  description: "Implement OAuth with Google and GitHub",
  size: "medium",
  milestones: [
    {
      name: "Research & Design",
      tasks: [
        "Research OAuth providers",
        "Design session architecture"
      ]
    },
    {
      name: "Implementation",
      tasks: [
        "Implement SessionManager",
        "Integrate Passport.js",
        "Add OAuth callbacks"
      ]
    },
    {
      name: "Testing",
      tasks: [
        "Write integration tests",
        "Deploy to staging"
      ]
    }
  ]
});
```

### Workflow 4: Complete a Task (with Auto-Validation)

```typescript
// Work on the task, then mark complete
await callTool("plan:task:update", {
  planId: "feature-123",
  taskId: "task-458",
  status: "completed"
});

// DevFlow automatically:
// - Detects file changes since task started
// - Runs tests and checks results
// - Validates against project rules
// - Updates memory progress
// - Returns confidence score (0-1)
```

---

## Documentation Structure

### For New Users

**Start Here:**
1. [00-OVERVIEW.md](./00-OVERVIEW.md) - Understand the vision and architecture
2. [01-RULES-LAYER.md](./01-RULES-LAYER.md) - Learn how to define project standards
3. [05-INTEGRATION.md](./05-INTEGRATION.md) - See how layers work together

### For Deep Dives

**Layer-Specific Details:**
- [02-MEMORY-LAYER.md](./02-MEMORY-LAYER.md) - Memory system internals
- [03-DOCS-LAYER.md](./03-DOCS-LAYER.md) - Documentation templates and validation
- [04-PLANNING-LAYER.md](./04-PLANNING-LAYER.md) - Automatic validation engine

### For Implementation

**Technical References:**
- [06-MCP-PRIMITIVES.md](./06-MCP-PRIMITIVES.md) - Complete API reference
- [07-AGENT-COMPATIBILITY.md](./07-AGENT-COMPATIBILITY.md) - Platform integration guides
- [08-IMPLEMENTATION.md](./08-IMPLEMENTATION.md) - Architecture and tech stack

### For Examples

**Real-World Usage:**
- [09-EXAMPLES.md](./09-EXAMPLES.md) - Common workflows and patterns

---

## Core Concepts

### MCP Primitives

DevFlow exposes functionality through three MCP primitives:

#### **Resources** (Auto-Loaded Context)
```typescript
devflow://context/unified     // All layers summary
devflow://context/rules       // Active rules
devflow://context/memory      // Current focus and decisions
devflow://plans/active        // Active plans
devflow://docs/*              // Documentation files
```

#### **Tools** (Actionable Operations)
```typescript
rules:create, rules:validate
memory:decision:log, memory:context:set
doc:create, doc:validate
plan:create, plan:task:update, plan:task:validate
```

#### **Prompts** (Workflow Templates)
```typescript
init_session                  // Session initialization
plan_feature                  // Guided feature planning
decision_template             // Decision logging guide
create_documentation          // Doc creation wizard
```

### Cross-Layer Integration

Every layer can reference others:

```typescript
// Rule references Decision
{
  ruleId: "auth-token-handling",
  linkedDecisions: ["decision-47"]
}

// Decision references Rule and Documentation
{
  decisionId: "decision-47",
  relatedRules: ["auth-token-handling"],
  relatedDocs: ["docs/architecture/authentication.md"]
}

// Plan references all three
{
  planId: "feature-123",
  relatedRules: ["auth-token-handling"],
  relatedDecisions: ["decision-47"],
  relatedDocs: ["docs/architecture/authentication.md"]
}
```

**Consistency Validation:**
```typescript
await callTool("sync:validate");
// Checks all cross-references, detects orphaned links,
// suggests fixes for stale documentation
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- ✅ File storage infrastructure
- ✅ Core MCP primitives (tools, resources)
- ✅ Basic CRUD for all layers
- ✅ Auto-loading resources

### Phase 2: Integration (Weeks 3-4)
- ⏳ Cross-layer linking system
- ⏳ Unified context resource
- ⏳ Consistency validation
- ⏳ Agent format detection

### Phase 3: Intelligence (Weeks 5-6)
- ⏳ Automatic task validation
- ⏳ SQLite semantic search
- ⏳ LLM-specific doc optimization
- ⏳ Rule conflict detection

### Phase 4: Polish (Weeks 7-8)
- ⏳ Management UI (Tauri + Svelte)
- ⏳ Visual editors and dashboards
- ⏳ Analytics and metrics
- ⏳ Performance optimization

---

## Technology Stack

**Core Server:**
- TypeScript 5.3+ (type safety, developer experience)
- MCP SDK (@modelcontextprotocol/sdk)
- Node.js 20+

**Storage:**
- Markdown files (primary, git-friendly)
- `.mdc` format for rules (Markdown Component)
- JSON for plans
- SQLite (optional, Phase 2 for semantic search)

**Transports:**
- Stdio (local tools: Zed, VSCode, Cursor)
- HTTP + SSE (remote/cloud deployments)

**Future UI:**
- Tauri (native performance)
- Svelte (reactive, lightweight)
- Monaco Editor (code/rule editing)

---

## Contributing

DevFlow is designed to be **modular and extensible**.

**Focus Areas:**
- Additional agent integrations
- Performance optimizations
- Template libraries (rules, docs, plans)
- UI improvements
- Documentation examples

**Repository:** `https://github.com/yogevbd/dev-toolkit-mcp` (when published)

---

## License

MIT - Build whatever you want on top of DevFlow.

---

## Resources

**MCP Documentation:**
- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)

**Inspiration:**
- [Cline Memory Bank](https://docs.cline.bot/prompting/cline-memory-bank)
- [Software Planning MCP](https://github.com/NightTrek/Software-planning-mcp)
- [Cursor Rules](https://cursor.com/docs/context/rules)
- [AGENTS.md Standard](https://www.infoq.com/news/2025/08/agents-md/)

---

## Questions?

**Documentation Issues:** If you find gaps or errors in these docs, please open an issue.

**Feature Requests:** Suggestions for new capabilities are welcome.

**Integration Help:** Need help integrating with a specific agent? Check [07-AGENT-COMPATIBILITY.md](./07-AGENT-COMPATIBILITY.md).

---

**Ready to dive in?** Start with [00-OVERVIEW.md](./00-OVERVIEW.md) for the full vision and architecture.