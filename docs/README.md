# DevFlow MCP Documentation

**Four-layer architecture for universal project context management across any AI agent.**

---

## Quick Start

**New to DevFlow?** Start here:

1. **[5-Minute Quick Start](./QUICKSTART.md)** - Get running immediately
2. **[Overview](./OVERVIEW.md)** - Understand the architecture
3. **[Integration Guide](./INTEGRATION.md)** - Connect to your AI agent

---

## Documentation by User Type

### 🆕 First-Time Users

1. [Quick Start](./QUICKSTART.md) - Get running in 5 minutes
2. [Overview](./OVERVIEW.md) - Understand the vision and architecture
3. [Integration Guide](./INTEGRATION.md) - See how layers work together

### 👨‍💻 Developers

1. [Implementation Details](./IMPLEMENTATION.md) - Technical architecture
2. [MCP Primitives](./MCP-PRIMITIVES.md) - Complete API reference
3. [Examples](./EXAMPLES.md) - Code samples and patterns

### 🏢 Teams

1. [Rules Engine](./RULES.md) - Enforce team standards
2. [Memory System](./MEMORY.md) - Track decisions and context
3. [Integration Guide](./INTEGRATION.md#common-workflows) - Team workflows

### 🤝 Contributors

1. [Overview](./OVERVIEW.md#implementation-roadmap) - Development roadmap
2. [Implementation Details](./IMPLEMENTATION.md) - Architecture details
3. [Agent Compatibility](./AGENT-COMPATIBILITY.md) - Platform integrations

---

## The Four Layers

### 1. [Rules Engine](./RULES.md)

**Project-specific coding standards, conventions, and constraints enforced across any AI agent.**

- Three activation modes: `always`, `manual`, `context` (file-pattern based)
- Cross-agent compatibility (Cursor, Zed, VSCode, Claude Desktop)
- Priority-based conflict resolution
- Automatic format conversion (`.cursorrules`, `AGENTS.md`)

### 2. [Memory System](./MEMORY.md)

**Session continuity, architectural decisions, and progress tracking that persists across conversations.**

- Four-file architecture: `activeContext`, `progress`, `decisionLog`, `projectContext`
- Git-friendly markdown storage
- Automatic staleness detection
- Optional SQLite indexing for semantic search

### 3. [Documentation Layer](./DOCS.md)

**AI-optimized project documentation with enforced structure, consistency validation, and cross-model compatibility.**

- Three templates: API, Architecture, Guide
- Automated consistency validation
- LLM-specific optimization (Claude, GPT-4, Gemini)
- Cross-reference linking

### 4. [Planning Layer](./PLANNING.md)

**Feature planning with task decomposition, dependency management, and automatic execution validation.**

- Task complexity scoring (1-10)
- Dependency management and milestone grouping
- **Automatic validation** via file monitoring, tests, git commits
- Confidence scoring for completion (0-1)

---

## Topic-Based Navigation

### Getting Started

- Installation → [Quick Start](./QUICKSTART.md#step-1-install-devflow)
- Project Setup → [Quick Start](./QUICKSTART.md#step-2-initialize-in-your-project)
- First Rule → [Quick Start](./QUICKSTART.md#step-3-create-your-first-rule)
- Agent Connection → [Quick Start](./QUICKSTART.md#step-5-connect-to-your-ai-agent)

### Rules Management

- Creating Rules → [Rules Engine](./RULES.md#mcp-primitives)
- Rule Types → [Rules Engine](./RULES.md#file-format-mdc-markdown-component)
- Priority System → [Rules Engine](./RULES.md#conflict-resolution)
- Examples → [Rules Engine](./RULES.md#examples)

### Memory & Context

- Decision Logging → [Memory System](./MEMORY.md#decisionlogmd)
- Active Context → [Memory System](./MEMORY.md#activecontextmd)
- Progress Tracking → [Memory System](./MEMORY.md#progressmd)
- Project Context → [Memory System](./MEMORY.md#projectcontextmd)

### Documentation

- Templates → [Documentation Layer](./DOCS.md#template-specifications)
- API Docs → [Documentation Layer](./DOCS.md#api-template)
- Architecture Docs → [Documentation Layer](./DOCS.md#architecture-template)
- Validation → [Documentation Layer](./DOCS.md#validation-rules)

### Planning

- Creating Plans → [Planning Layer](./PLANNING.md#plan-schema)
- Task Management → [Planning Layer](./PLANNING.md#task-structure)
- Auto-Validation → [Planning Layer](./PLANNING.md#automatic-validation)
- Milestones → [Planning Layer](./PLANNING.md#milestone-grouping)

### Integration

- Unified Context → [Integration Guide](./INTEGRATION.md#unified-context-loading)
- Cross-Layer Linking → [Integration Guide](./INTEGRATION.md#bidirectional-linking)
- Workflows → [Integration Guide](./INTEGRATION.md#common-workflows)
- Consistency Checks → [Integration Guide](./INTEGRATION.md#consistency-validation)

### Agent Platforms

- Claude Desktop → [Agent Compatibility](./AGENT-COMPATIBILITY.md#claude-desktop)
- Cursor → [Agent Compatibility](./AGENT-COMPATIBILITY.md#cursor)
- Zed → [Agent Compatibility](./AGENT-COMPATIBILITY.md#zed)
- VSCode → [Agent Compatibility](./AGENT-COMPATIBILITY.md#vscode)

---

## Common Use Cases

### "I want to enforce TypeScript standards"

1. Read [Rules Engine](./RULES.md#overview)
2. Create rules with [Rules: Create Tool](./RULES.md#rulescreate)
3. See [Rule Examples](./RULES.md#examples)

### "I want to track architectural decisions"

1. Read [Memory System](./MEMORY.md#decisionlogmd)
2. Use [Decision Logging Tool](./MEMORY.md#memorydecisionlog)
3. See [Decision Template](./MEMORY.md#decision_template)

### "I want to plan a new feature"

1. Read [Planning Layer](./PLANNING.md#overview)
2. Use [Plan Create Tool](./PLANNING.md#plancreate)
3. See [Common Workflows](./INTEGRATION.md#workflow-1-starting-a-new-feature)

### "I want to create AI-optimized documentation"

1. Read [Documentation Layer](./DOCS.md#overview)
2. Choose a [Template](./DOCS.md#template-specifications)
3. Use [Doc Create Tool](./DOCS.md#doccreate)

### "I want to onboard a new team member"

1. Follow [Onboarding Workflow](./INTEGRATION.md#workflow-5-onboarding-new-team-member)
2. Share [Project Context](./MEMORY.md#projectcontextmd)
3. Review [Active Rules](./RULES.md#devflowcontextrules)

### "I need to debug an issue"

1. Follow [Debugging Workflow](./INTEGRATION.md#workflow-4-debugging-issue-resolution)
2. Add [Blocker](./MEMORY.md#memoryblockeradd)
3. Log [Resolution](./MEMORY.md#memoryblockerresolve)

### "I need to review code quality"

1. Follow [Code Review Workflow](./INTEGRATION.md#workflow-3-code-review-quality-check)
2. Use [Rules Validate](./RULES.md#rulesvalidate)
3. Check [Consistency](./INTEGRATION.md#consistency-validation)

---

## Reference

### Core Documentation

| Document                           | Purpose                                                  |
| ---------------------------------- | -------------------------------------------------------- |
| [OVERVIEW.md](./OVERVIEW.md)       | Vision, architecture philosophy, differentiation         |
| [RULES.md](./RULES.md)             | Layer 1: Rules engine specification                      |
| [MEMORY.md](./MEMORY.md)           | Layer 2: Memory system architecture                      |
| [DOCS.md](./DOCS.md)               | Layer 3: Documentation management                        |
| [PLANNING.md](./PLANNING.md)       | Layer 4: Planning and validation                         |
| [INTEGRATION.md](./INTEGRATION.md) | Cross-layer workflows and unified context                |
| [SECURITY.md](./SECURITY.md)       | Security policy, best practices, vulnerability reporting |

### API & Technical Reference

| Document                                           | Purpose                                   |
| -------------------------------------------------- | ----------------------------------------- |
| [MCP-PRIMITIVES.md](./MCP-PRIMITIVES.md)           | Complete tools, resources, prompts API    |
| [AGENT-COMPATIBILITY.md](./AGENT-COMPATIBILITY.md) | Platform-specific integration guides      |
| [IMPLEMENTATION.md](./IMPLEMENTATION.md)           | Technical architecture and implementation |
| [EXAMPLES.md](./EXAMPLES.md)                       | Real-world usage patterns and workflows   |

### Additional Resources

| Document                     | Purpose                                 |
| ---------------------------- | --------------------------------------- |
| [SETUP.md](./SETUP.md)       | Project setup and dependency management |
| [SECURITY.md](./SECURITY.md) | Security policy and best practices      |

---

## Troubleshooting

### Installation Issues

- [DevFlow command not found](./QUICKSTART.md#devflow-command-not-found)
- [Permission denied](./QUICKSTART.md#permission-denied)

### Rules Issues

- [Rules not loading](./RULES.md#rules-not-loading)
- [Rule conflicts](./RULES.md#conflicts-between-rules)
- [Agent not respecting rules](./RULES.md#agent-not-respecting-rules)

### Memory Issues

- [Memory not loading](./MEMORY.md#memory-not-loading)
- [Slow search](./MEMORY.md#slow-search-phase-1)
- [SQLite sync issues](./MEMORY.md#sqlite-index-out-of-sync-phase-2)

### Integration Issues

- [Broken cross-references](./INTEGRATION.md#issue-broken-cross-references)
- [Stale context](./INTEGRATION.md#issue-stale-context)
- [Conflicting information](./INTEGRATION.md#issue-conflicting-information)

---

## Quick Command Reference

```bash
# Installation
npm install -g devflow-mcp

# Setup
devflow init

# Rules
devflow rules:create --name "Rule Name" --type always
devflow rules:list
devflow rules:validate src/file.ts

# Memory
devflow memory:decision:log --title "Decision Title"
devflow memory:context:set --focus "Current Task"
devflow memory:recall --query "authentication"

# Documentation
devflow doc:create --type api --title "API Name"
devflow doc:validate docs/api/auth.md

# Planning
devflow plan:create --name "Feature Name" --size medium
devflow plan:task:update --task-id task-123 --status completed

# Integration
devflow sync:validate
devflow status
```

---

## Contributing to Documentation

Found an issue or want to improve the docs?

1. **Typos/Errors** - Open an issue or submit a PR
2. **Missing Examples** - Add to [EXAMPLES.md](./EXAMPLES.md)
3. **New Use Cases** - Update this README with relevant links
4. **Unclear Sections** - Flag for rewriting

**Documentation Standards:**

- Use clear, concise language
- Include examples for all features
- Keep files under 500 lines
- Link related resources
- Use active voice and short sentences

---

## Architecture Overview

DevFlow provides a unified context system across four independent layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Unified Context                          │
│  (Auto-loaded when agent connects to DevFlow MCP server)   │
└─────────────────────────────────────────────────────────────┘
         ↓              ↓              ↓              ↓
    ┌────────┐   ┌──────────┐   ┌──────────────┐   ┌─────────┐
    │ Rules  │   │ Memory   │   │Documentation │   │Planning │
    │ Engine │ ↔ │ System   │ ↔ │   Layer      │ ↔ │ Layer   │
    └────────┘   └──────────┘   └──────────────┘   └─────────┘
       ↓              ↓              ↓              ↓
    Project      Decision       Knowledge      Task
   Standards     Tracking         Base      Validation
```

---

## Project Status

**Current Phase:** Phase 1 - Foundation

- ✅ Project structure and tooling
- ✅ Documentation architecture
- ⏳ Core layer implementations
- ⏳ MCP server implementation

[Full implementation roadmap →](./OVERVIEW.md#implementation-roadmap)

---

## Resources

**External Links:**

- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)

**Inspiration:**

- [Cline Memory Bank](https://docs.cline.bot/prompting/cline-memory-bank)
- [AGENTS.md Standard](https://www.infoq.com/news/2025/08/agents-md/)

---

**Ready to dive in?** Start with the [Quick Start Guide](./QUICKSTART.md) or explore the [Overview](./OVERVIEW.md).
