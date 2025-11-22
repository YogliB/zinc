# DevFlow MCP - Technical Context

## Tech Stack

- **Language:** TypeScript 5.3+
- **Runtime:** Bun 1.3.2+ (with Node.js compatibility)
- **Protocol:** Model Context Protocol (MCP) SDK
- **Testing:** Vitest
- **Linting:** ESLint 9 with flat config, SonarJS
- **Code Quality:** Prettier, TypeScript strict mode
- **Storage:** Markdown (.md) and JSON (.json) files
- **Package Manager:** Bun (npm compatible)

## Development Setup

### Prerequisites

- Bun 1.3.2+
- Node.js 18+ (for MCP compatibility)
- Git for version control

### Installation

```bash
cd dev-toolkit-mcp
bun install
```

### Key Commands

```bash
bun run lint          # ESLint (0 violations required)
bun run lint:fix      # Auto-fix linting issues
bun test              # Run Vitest
bun run build         # Compile TypeScript
```

## Project Structure

```
src/
├── index.ts              # MCP server entry point
├── types/                # TypeScript type definitions
├── layers/               # Core layer implementations
│   ├── rules.ts
│   ├── memory.ts
│   ├── documentation.ts
│   └── planning.ts
├── storage/              # File storage abstraction
├── validation/           # Task validation engine
└── utils/                # Helper utilities

docs/
├── README.md             # Documentation index
├── QUICKSTART.md         # 5-minute hello world
├── OVERVIEW.md           # Vision & architecture
├── RULES.md              # Rules engine guide
├── MEMORY.md             # Memory system guide
├── DOCS.md               # Documentation layer
├── PLANNING.md           # Planning layer
└── ...more guides

memory-bank/             # Project context (THIS LOCATION)
├── projectbrief.md       # Scope and goals
├── productContext.md     # Purpose and UX
├── systemPatterns.md     # Architecture decisions
├── techContext.md        # Tech stack and setup
├── activeContext.md      # Current work
└── progress.md           # Status and issues
```

## Code Quality Standards

### Naming Conventions

- Functions use verbs: `fetchProjectContext()`, `validateTask()`
- Types use nouns: `MemoeryBank`, `RuleSet`, `TaskPlan`
- Constants use SCREAMING_SNAKE_CASE: `MAX_MEMORY_SIZE`
- Include units/context: `timeoutMs`, `fileSizeBytes`

### Code Principles

- **SRP:** One purpose per unit
- **DRY:** No duplication
- **KISS:** Simple over complex
- **Pure:** Avoid side effects
- **Readable > Optimal**
- **No inline comments** (code explains itself)

### Testing

- Unit tests for core logic
- Integration tests for layer interactions
- Vitest configuration in `vitest.config.ts`
- All tests must pass before commit

### Linting Status

- ✅ ESLint: 0 violations
- ✅ SonarJS: 15 bug rules + 20 code smell rules active
- ✅ Prettier: Auto-format on save
- ✅ TypeScript: Strict mode enabled

## Integration Points

### MCP Server

- TypeScript SDK for protocol implementation
- Stdio communication for cross-platform support
- Tools, resources, prompts API

### File Storage

- Read/write Markdown files for memory and docs
- JSON for structured data (config, plans)
- File system operations abstraction

### External Agents

- Claude Desktop via MCP
- Cursor AI editor
- Zed editor
- VSCode extensions

## Current Status

**Phase 1 - Foundation**

- ✅ Project structure and tooling set up
- ✅ Documentation architecture defined
- ✅ TypeScript + ESLint + Vitest configured
- ✅ SonarJS quality checks integrated
- ⏳ File storage infrastructure (in progress)
- ⏳ MCP primitives implementation
- ⏳ Layer implementations

## Build & Deployment

- Local development: `bun run dev` (when available)
- Production build: TypeScript compilation to JavaScript
- Publishing: npm package (when ready)
- Distribution: npm registry + git clones

---

**Documentation:** docs/OVERVIEW.md, SETUP.md, docs/IMPLEMENTATION.md
