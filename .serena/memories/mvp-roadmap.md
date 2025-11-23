# DevFlow MVP Implementation Roadmap

## Current State Assessment

### ✅ Already Implemented

- **Storage Engine** (`src/core/storage/engine.ts`) - File I/O with security
- **Markdown Parser** (`src/core/storage/markdown.ts`) - Frontmatter + content
- **JSON Storage** (`src/core/storage/json.ts`) - Structured data
- **Rules Repository** (`src/layers/rules/repository.ts`) - Rules CRUD
- **Memory Repository** (`src/layers/memory/repository.ts`) - Memory CRUD + listing
- **Schemas** (`src/core/schemas/`) - Zod validation for all layers
- **Error Handling** (`src/core/storage/errors.ts`) - Custom error types
- **Testing Infrastructure** - Vitest + CI monitoring
- **fastmcp Setup** - Basic MCP server in `src/index.ts`

### ⏳ MVP Priorities (In Order)

1. **Phase 1: Wire Storage to MCP Server** (2-3 hours)
    - Initialize StorageEngine in MCP server
    - Initialize layer repositories
    - Add error handling middleware

2. **Phase 2: Implement MCP Tools** (3-4 hours)
    - Rules tools: `getRules`, `listRules`, `validateRules`
    - Memory tools: `getMemory`, `listMemories`, `saveMemory`, `deleteMemory`
    - Docs tools (stubs): `getDocs`, `listDocs`
    - Planning tools (stubs): `listPlans`

3. **Phase 3: Implement MCP Resources** (2-3 hours)
    - Rules as resource
    - Memory files as resources
    - All resources include embeddings/search support

4. **Phase 4: Implement CLI Commands** (2-3 hours)
    - `devflow init` - Scaffold project structure
    - `devflow serve` - Start MCP server
    - `devflow validate` - Check project structure

5. **Phase 5: Integration Testing** (2-3 hours)
    - Test tools with real MCP client simulation
    - Test CLI commands end-to-end
    - Test with example project

6. **Phase 6: Documentation & Polish** (2-3 hours)
    - Quick start guide
    - Example integration configs
    - Fix console output, clean up logs

## Implementation Details

### Phase 1: Server Initialization

**File:** `src/index.ts`

Requirements:

- Initialize StorageEngine with project root detection
- Create RulesRepository and MemoryRepository instances
- Add error handling for storage failures
- Expose repositories to tool/resource handlers

Key decisions:

- Auto-detect project root (look for `.git`, `package.json`, `pyproject.toml`)
- Allow override via `DEVFLOW_ROOT` env var
- Default to current working directory

### Phase 2: MCP Tools

**File:** `src/mcp/tools.ts` (new)

Tools to implement:

```
1. get_rules
   - Input: none
   - Output: rules file content + frontmatter
   - Error handling: FileNotFoundError, ValidationError

2. validate_rules
   - Input: none
   - Output: validation report (pass/fail + details)
   - Error handling: ValidationError

3. get_memory
   - Input: memory name
   - Output: memory content
   - Error handling: FileNotFoundError, ValidationError

4. save_memory
   - Input: memory name, content
   - Output: success confirmation
   - Error handling: ValidationError, WriteError

5. list_memories
   - Input: optional search filter
   - Output: array of memory names
   - Error handling: FileNotFoundError

6. delete_memory
   - Input: memory name
   - Output: success confirmation
   - Error handling: FileNotFoundError, ValidationError
```

### Phase 3: MCP Resources

**File:** `src/mcp/resources.ts` (new)

Resources to implement:

```
1. rules (URI: rules://)
   - Content: Full rules file
   - Metadata: version, lastModified
   - Search: Full-text search on content

2. memory/{name} (URI: memory://project-brief)
   - Content: Memory file content
   - Metadata: created, updated, size
   - List: All memories available

3. memory-index (URI: memory://index)
   - Content: All memories listed with summaries
```

### Phase 4: CLI Commands

**File:** `src/cli/commands.ts` (new)

Commands to implement:

```
1. devflow init [--template default]
   - Create .devflow/config.json
   - Create memory-bank/ directory
   - Create zed-rules/AGENTS.md (if not exists)
   - Create docs/ directory structure
   - Print success message

2. devflow serve [--stdio]
   - Start MCP server on stdio (default)
   - Detect project root
   - Initialize storage
   - Print startup message

3. devflow validate
   - Check project structure
   - Validate all files
   - Print report
```

### Phase 5: Integration Testing

**Files:** `tests/integration/*.test.ts`

Test scenarios:

- Load rules from real project
- CRUD operations on memory files
- Tool execution with valid/invalid inputs
- CLI command execution
- Error handling and recovery

### Phase 6: Documentation & Polish

Files:

- Update `docs/QUICKSTART.md` with real examples
- Create `docs/MVP.md` - Feature overview
- Add `CHANGELOG.md`
- Update `README.md` with MVP section

## Success Criteria

✅ Phase 1: Server starts without errors, has access to storage
✅ Phase 2: All 6 tools callable and return correct data types
✅ Phase 3: Resources expose correct content and metadata
✅ Phase 4: CLI scaffolds project and serves MCP correctly
✅ Phase 5: Integration tests pass with >80% coverage
✅ Phase 6: Documentation is clear, README is updated

## File Structure After MVP

```
src/
├── index.ts                    # ✅ Update: Add storage init
├── cli/
│   └── commands.ts             # 🆕 Create: CLI implementation
├── core/
│   ├── storage/
│   │   ├── engine.ts           # ✅ Existing
│   │   ├── markdown.ts         # ✅ Existing
│   │   ├── json.ts             # ✅ Existing
│   │   └── errors.ts           # ✅ Existing
│   └── schemas/
│       └── *.ts                # ✅ Existing
├── layers/
│   ├── memory/
│   │   ├── repository.ts       # ✅ Existing
│   │   └── repository.test.ts  # ✅ Existing
│   ├── rules/
│   │   └── repository.ts       # ✅ Existing
│   ├── docs/
│   │   └── repository.ts       # ✅ Existing (stub)
│   └── planning/
│       └── repository.ts       # ✅ Existing (stub)
└── mcp/
    ├── tools.ts                # 🆕 Create: MCP tools
    ├── resources.ts            # 🆕 Create: MCP resources
    └── prompts.ts              # 🆕 Create: MCP prompts (if time)

tests/
├── unit/
│   └── *.test.ts              # ✅ Existing
└── integration/
    ├── storage.test.ts         # 🆕 Create
    ├── tools.test.ts           # 🆕 Create
    ├── cli.test.ts             # 🆕 Create
    └── server.test.ts          # 🆕 Create
```

## Dependencies - All Available

- `fastmcp@3.23.1` - Already installed
- `zod@3.24.1` - Already installed
- `@modelcontextprotocol/sdk` - Via fastmcp
- `gray-matter@4.0.3` - Already installed
- Built-in Node.js modules - `fs`, `path`, `child_process`

No new dependencies needed!

## Effort Estimate

| Phase     | Task                         | Hours           | Status            |
| --------- | ---------------------------- | --------------- | ----------------- |
| 1         | Server init + storage wiring | 2-3             | ⏳ TODO           |
| 2         | MCP tools implementation     | 3-4             | ⏳ TODO           |
| 3         | MCP resources                | 2-3             | ⏳ TODO           |
| 4         | CLI commands                 | 2-3             | ⏳ TODO           |
| 5         | Integration testing          | 2-3             | ⏳ TODO           |
| 6         | Docs & polish                | 2-3             | ⏳ TODO           |
| **TOTAL** | **MVP Complete**             | **14-19 hours** | **~2-3 days dev** |

## Next Steps

1. Start with Phase 1: Update `src/index.ts` to initialize storage
2. Then Phase 2: Implement `src/mcp/tools.ts`
3. Continue sequentially through phases

Status: Ready to begin MVP implementation
