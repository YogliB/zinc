# Memory MCP Fast Track Masterplan

**Overview:** Build memory layer MCP tools and resources to replace Serena/manual memory-bank editing with native MCP integration in Claude Desktop and Cursor.
**Approach:** Wire existing MemoryRepository to fastmcp tools/resources, add auto-loaded context, test end-to-end.
**Est. Time:** 5-7h incl. review
**PRs:** 4 across 1 repo
**Risk:** Low - Storage layer tested, no breaking changes to memory-bank format
**Repos:** dev-toolkit-mcp

## Implementation Status

| PR  | Repo            | Status | Link | Notes                                |
| --- | --------------- | ------ | ---- | ------------------------------------ |
| 1   | dev-toolkit-mcp | 🟢     | -    | Server init + wire MemoryRepository  |
| 2   | dev-toolkit-mcp | 🟢     | -    | MCP memory tools (4 tools, 22 tests) |
| 3   | dev-toolkit-mcp | 🟢     | -    | MCP memory resources                 |
| 4   | dev-toolkit-mcp | ⏸️     | -    | Integration tests + docs             |

Status: 🟢 done · 🟡 in‑progress · 🟠 review · ⏸️ not‑started · 🔴 blocked · ⚫ canceled

---

## PR1: Server Initialization + Wire MemoryRepository — 🟢

**Repo:** dev-toolkit-mcp · **Link:** - · **ETA:** 1-2h dev + 15m review
**Files:** `src/index.ts`, `src/core/config.ts`

**Changes:**

1. **Initialize StorageEngine in MCP server** — File: `src/index.ts`
    - Import `StorageEngine`, `MemoryRepository`
    - Detect project root (look for `.git`, `package.json`, or use cwd)
    - Initialize `StorageEngine({ rootPath, debug: false })`
    - Initialize `MemoryRepository({ storageEngine, memorybankPath: 'memory-bank' })`
    - Add error handling for initialization failures
    - Store repository instance for use in tools/resources

2. **Add project root detection** — File: `src/core/config.ts` (new)
    - Function `detectProjectRoot()`: Search upward for `.git`, `package.json`, `pyproject.toml`
    - Fallback to `process.cwd()` if not found
    - Allow override via `DEVFLOW_ROOT` env var
    - Export config helper

**Acceptance:**

- [ ] Server starts without errors
- [ ] MemoryRepository successfully initialized
- [ ] Project root auto-detected correctly
- [ ] DEVFLOW_ROOT env var override works
- [ ] Error handling logs meaningful messages
- [ ] All existing tests still pass

**Dependencies:** None · Blocks PRs 2, 3

---

## PR2: MCP Memory Tools — 🟢

**Repo:** dev-toolkit-mcp · **Link:** - · **Status:** COMPLETED
**Files:** `src/mcp/tools/memory.ts` (243 lines), `src/mcp/tools/memory.test.ts` (401 lines), `src/index.ts`

**Implementation Summary:**

1. ✅ **Implemented memory:get tool** — Get memory file by name
    - Input: `{ name: z.string() }` (Zod validated)
    - Output: `{ type: 'text', text: JSON.stringify({ frontmatter, content }) }`
    - Error handling: FileNotFoundError, ValidationError, generic errors

2. ✅ **Implemented memory:save tool** — Save/update memory file
    - Input: `{ name: z.string(), frontmatter?: z.record(z.string(), z.any()), content: z.string() }`
    - Output: `{ type: 'text', text: JSON.stringify({ success: true, message, name }) }`
    - Error handling: ValidationError, generic errors

3. ✅ **Implemented memory:list tool** — List all memory files
    - Input: `{}` (optional)
    - Output: `{ type: 'text', text: JSON.stringify({ memories: string[], count: number }) }`
    - Error handling: generic errors

4. ✅ **Implemented memory:delete tool** — Delete memory file
    - Input: `{ name: z.string() }`
    - Output: `{ type: 'text', text: JSON.stringify({ success: true, message, name }) }`
    - Error handling: FileNotFoundError, generic errors

5. ✅ **Registered all tools with fastmcp server** — File: `src/index.ts`
    - Imported 4 tool factories
    - Registered each tool with `server.addTool()`
    - Added error handling and logging for registration
    - All tools callable via MCP protocol

**Completion Metrics:**

- ✅ All 4 tools registered and callable via MCP protocol
- ✅ Input validation works correctly (Zod schemas)
- ✅ Tools call MemoryRepository methods without errors
- ✅ Error handling returns meaningful JSON responses
- ✅ Tools return MCP-compatible TextContent responses
- ✅ 22 unit tests (100% pass rate)
- ✅ TypeScript: 0 errors
- ✅ Linting: 0 warnings
- ✅ Test coverage: ≥90% for memory.ts
- ✅ No regressions (134 total tests passing)

**Dependencies:** Blocked by PR1 ✅ · Blocks PR4

---

## PR3: MCP Memory Resources — 🟢

**Repo:** dev-toolkit-mcp · **Link:** - · **ETA:** 1h dev + 15m review
**Files:** `src/mcp/resources/memory.ts`, `src/index.ts`

**Changes:**

1. **Implement devflow://context/memory resource** — File: `src/mcp/resources/memory.ts`
    - Auto-loaded resource (always available to MCP clients)
    - Fetch `activeContext.md` and `progress.md` via MemoryRepository
    - Combine into unified context summary:
        - Active focus from activeContext
        - Current milestone/tasks from progress
        - Recent changes from activeContext
    - Return as structured markdown
    - Error handling: Gracefully handle missing files

2. **Implement devflow://memory/{name} resource** — File: `src/mcp/resources/memory.ts`
    - Dynamic resource (takes `name` parameter)
    - Call `memoryRepository.getMemory(name)`
    - Return full file content (frontmatter + content)
    - Error handling: FileNotFoundError

3. **Register resources with fastmcp** — File: `src/index.ts`
    - Import memory resources
    - Register with `server.addResource({ uri, name, description, mimeType, text })`
    - Wire to MemoryRepository methods

**Acceptance:**

- [ ] `devflow://context/memory` auto-loads on session start
- [ ] Context resource combines activeContext + progress correctly
- [ ] `devflow://memory/{name}` returns individual files
- [ ] Missing files handled gracefully (no crashes)
- [ ] Resources return proper content and metadata
- [ ] Unit tests for resources
- [ ] All checks pass

**Dependencies:** Blocked by PR1 · Blocks PR4

---

## PR4: Integration Tests + Documentation — ⏸️

**Repo:** dev-toolkit-mcp · **Link:** - · **ETA:** 1-2h dev + 30m review
**Files:** `tests/integration/memory-mcp.test.ts`, `README.md`, `docs/QUICKSTART.md`

**Changes:**

1. **Integration test: End-to-end MCP flow** — File: `tests/integration/memory-mcp.test.ts`
    - Test server initialization
    - Test memory:get tool with real file
    - Test memory:save tool (create new memory)
    - Test memory:list tool
    - Test memory:delete tool
    - Test devflow://context/memory resource
    - Test devflow://memory/{name} resource
    - Verify error handling (missing files, invalid input)
    - Use temp directory for isolation

2. **Update README with memory MCP usage** — File: `README.md`
    - Add "Memory MCP" section
    - Show Claude Desktop configuration
    - Show example tool usage
    - Show example resource usage

3. **Update Quick Start guide** — File: `docs/QUICKSTART.md`
    - Add section: "Using Memory MCP"
    - Step-by-step: Configure Claude Desktop
    - Step-by-step: Use memory tools
    - Step-by-step: View auto-loaded context

**Acceptance:**

- [ ] All integration tests pass
- [ ] Tests cover happy path + error cases
- [ ] README shows complete setup example
- [ ] Quick Start guide is clear and actionable
- [ ] Documentation includes Claude Desktop config
- [ ] All checks pass
- [ ] Coverage >80%

**Dependencies:** Blocked by PRs 2, 3 · Blocks none

---

## Risk Mitigation

**Low Risk - Storage Layer Tested:**

- **Concern:** Storage engine might fail on edge cases
- **Analysis:** Already tested with comprehensive unit tests, handles path traversal, validation
- **Mitigation:** Integration tests will catch any issues
- **Recovery:** Rollback is trivial (just git revert, no data loss)

**Low Risk - No Breaking Changes:**

- **Concern:** Existing memory-bank files might not work
- **Analysis:** Using same Markdown + YAML frontmatter format, tested with real files
- **Mitigation:** Can still edit files manually, backward compatible
- **Recovery:** No migration needed, files unchanged

**Low Risk - MCP Integration:**

- **Concern:** fastmcp might have quirks or bugs
- **Analysis:** fastmcp is stable (v3.23.1), used in production by others
- **Mitigation:** Integration tests will validate, can fallback to direct MCP SDK if needed
- **Recovery:** fastmcp is just a wrapper, can unwrap if necessary

---

## Deployment Strategy

**Single Repo - Sequential PRs**

**Stage 1: Foundation**

- Deploy: PR1 (server initialization)
- Verify: Server starts, repository initialized, no errors
- Rollback: Git revert PR1

**Stage 2: Tools**

- Deploy: PR2 (MCP tools)
- Verify: Tools callable, return expected data
- Rollback: Git revert PR2, server still works from PR1

**Stage 3: Resources**

- Deploy: PR3 (MCP resources)
- Verify: Resources load, auto-context works
- Rollback: Git revert PR3, tools still work from PR2

**Stage 4: Polish**

- Deploy: PR4 (tests + docs)
- Verify: All tests pass, docs accurate
- Rollback: Git revert PR4, functionality still works from PRs 1-3

**Cross-Repo Version Map**
| Stage | PR | dev-toolkit-mcp | Notes |
| ----: | --- | --------------- | -------------------- |
| 1 | 1 | v0.1.0 | Server init |
| 2 | 2 | v0.2.0 | Tools working |
| 3 | 3 | v0.3.0 | Resources working |
| 4 | 4 | v0.4.0 | Fully tested + docs |

---

## Monitoring & Observability

**Metrics:**

- `server_startup_time` → <500ms expected
- `memory_operations_total` → count of get/save/list/delete
- `memory_errors_total` → should be 0 in normal operation

**Logs:**

- Success: `[StorageEngine:DEBUG] File read: memory-bank/activeContext.md`
- Success: `[MemoryRepository:INFO] Memory saved: activeContext`
- Error: `[MemoryRepository:ERROR] Failed to load memory "foo": File not found`

**Alarms:**

- Server fails to start → exit code != 0
- Integration tests fail → CI pipeline fails

---

## Rollback

**Quick (revert commit):**

1. Disable: `git revert <commit-sha>`
2. Verify: Server still runs (previous functionality intact)
3. Fix: Address issue in new branch
4. Re-enable: Merge fix

**Full (catastrophic failure):**

- If PR4 fails → Revert PR4, PRs 1-3 still work
- If PR3 fails → Revert PR3, PRs 1-2 still work (tools only)
- If PR2 fails → Revert PR2, PR1 still works (server runs)
- If PR1 fails → Revert PR1, back to skeleton server

**Order:** Last deployed → first deployed (PR4 → PR3 → PR2 → PR1)

**Artifacts safe to keep:**

- All memory-bank files (unchanged, no migration)
- Test files (no impact on runtime)

---

## Success Criteria

- [ ] All 4 PRs merged to main
- [ ] Memory tools work end-to-end (get, save, list, delete)
- [ ] Memory resources auto-load in Claude Desktop
- [ ] No performance regression (server starts <500ms)
- [ ] Integration tests ≥80% coverage & green
- [ ] 0 production incidents (no data loss)
- [ ] Documentation complete and accurate
- [ ] User can configure Claude Desktop and use memory MCP
- [ ] Can replace Serena for memory operations
- [ ] Existing memory-bank files work without migration

---

## References

- Storage Engine: `src/core/storage/engine.ts` lines 1-200
- Memory Repository: `src/layers/memory/repository.ts` lines 1-150
- Memory Schema: `src/core/schemas/memory.ts` lines 1-50
- fastmcp docs: https://github.com/jlowin/fastmcp

---

## Notes & Assumptions

**Implementation Decisions:**

- Use fastmcp for simplicity (39% less boilerplate vs raw MCP SDK)
- Stick with file-based storage (no SQLite for MVP)
- Auto-detect project root (look for .git, package.json)
- Allow DEVFLOW_ROOT override for flexibility

**Cross-Repo Coordination:**

- N/A (single repo)

**Data Model:**

- Memory files: Markdown with YAML frontmatter
- Same format as current memory-bank (backward compatible)
- No migration required

**Risks:**

- Low risk overall (tested storage layer)
- No breaking changes
- Can rollback easily

**Testing:**

- Unit tests integrated with each PR (no standalone test PR)
- Integration tests in PR4 validate end-to-end flow
- Use temp directories for test isolation

**Assumptions:**

- ✅ fastmcp 3.23.1 is stable and production-ready
- ✅ Existing memory-bank files are valid Markdown + YAML
- ✅ Claude Desktop supports stdio MCP transport
- ❌ Search/recall needs verification (defer to Phase 2)
