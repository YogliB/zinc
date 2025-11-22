# DevFlow MCP - System Patterns & Architecture

## Core Architecture

### Four-Layer System

```
┌─────────────────────────────────────────────────┐
│         MCP Protocol Interface                  │
├─────────────────────────────────────────────────┤
│  Rules   │  Memory  │  Documentation  │  Planning │
├─────────────────────────────────────────────────┤
│      Git-Friendly Storage Layer                 │
│   (Markdown & JSON files)                       │
└─────────────────────────────────────────────────┘
```

### Layer Responsibilities

**Rules Layer**

- Define project coding standards and conventions
- Enforce consistency across the codebase
- Communicate norms to AI agents
- Enable static analysis integration

**Memory Layer**

- Persist decisions and context between sessions
- Track project evolution and decisions
- Reference implementation: Cline Memory Bank
- Session continuity for AI agents

**Documentation Layer**

- Provide AI-optimized knowledge base
- Link related concepts bidirectionally
- Maintain architecture and design decisions
- Enable semantic search and retrieval

**Planning Layer**

- Manage tasks with automatic validation
- Track progress and status
- Reference completed work
- Validate task completion via:
    - File changes
    - Test results
    - Git commits

## Design Patterns Applied

### Separation of Concerns

- Each layer has single responsibility
- Independent operation possible
- Clean interfaces between layers

### Convention Over Configuration

- Sensible defaults for file locations
- Predictable naming patterns
- Minimal required setup

### Bidirectional Linking

- Rules reference memory entries
- Plans reference documentation
- Memory references decisions
- Documentation links to examples

### Git Integration

- All storage in markdown/JSON
- Human-readable format
- Version control friendly
- Audit trail automatic

## Storage Structure

```
project-root/
├── rules/
│   ├── AGENTS.md
│   ├── style-guide.md
│   └── patterns/
├── memory-bank/
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   ├── activeContext.md
│   └── progress.md
├── docs/
│   ├── README.md
│   ├── architecture/
│   ├── guides/
│   └── examples/
└── plans/
    ├── active/
    ├── completed/
    └── templates/
```

## Key Design Decisions

1. **Markdown/JSON Storage** - Human-readable, version-control friendly
2. **MCP Protocol** - Standard interface for cross-tool compatibility
3. **File-Based Memory** - No external database dependency
4. **Modular Layers** - Use one or all four as needed
5. **Bidirectional References** - Connect layers automatically

---

**Source:** docs/OVERVIEW.md, docs/IMPLEMENTATION.md
