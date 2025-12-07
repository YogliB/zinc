# Zinc IDE Masterplan

**Overview:** Build Zinc IDE, a modular, AI-native code editor with MCP integration, starting from a clean slate in the zinc repo. The MVP delivers single-file editing, basic AI chat via OpenRouter, and MCP tools for file/command operations, prioritizing clean architecture for future extensions.

**Approach:** Phased implementation with sequential PRs, each adding incremental functionality, starting with repo cleanup and scaffolding, then core IDE features, AI integration, and polish. Follow functional programming principles and strict tooling rules.

**Est. Time:** 50-70h including review and testing

**PRs:** 8 across 1 repo

**Risk:** High - new project involving Rust/Tauri, TypeScript/SvelteKit, MCP protocol, and AI APIs with potential integration issues

**Repos:** zinc

## Implementation Status

> PRs: whole numbers, start at 1, sequential by dependencies.

| PR  | Repo | Status | Link | Notes |
| --- | ---- | ------ | ---- | ----- |
| 1   | zinc | ⏸️     | -    | Clean slate and AGENTS.md alignment |
| 2   | zinc | ⏸️     | -    | Scaffold monorepo structure |
| 3   | zinc | ⏸️     | -    | Implement basic MCP server |
| 4   | zinc | ⏸️     | -    | Build IDE shell with editor |
| 5   | zinc | ⏸️     | -    | Add OpenRouter AI integration |
| 6   | zinc | ⏸️     | -    | Connect IDE, MCP, and agent loop |
| 7   | zinc | ⏸️     | -    | Implement settings and AI kill switch |
| 8   | zinc | ⏸️     | -    | Add testing, error handling, and polish |

Status: 🟢 done · 🟡 in‑progress · 🟠 review · ⏸️ not‑started · 🔴 blocked · ⚫ canceled

## PR1: Clean Slate and AGENTS.md Update — ⏸️

**Repo:** zinc · **Link:** - · **ETA:** 2-4h dev + 1h review

**Files:** `AGENTS.md`, `docs/*` (all files in docs/)

**Changes:**

1. Remove all files and directories except `docs/` and update `AGENTS.md` to align with new Zinc IDE project — File: `AGENTS.md`
    - Replace Bun-specific rules with Rust/TypeScript/Tauri rules: prefer npm, Vitest, esbuild, Node.js; update forbidden files to include Tauri config if needed; adjust documentation structure to allow new files in appropriate places.
    - Before: Bun-focused dependencies and tooling
    - After: Rust/TS focused, with npm workspaces, Vitest, etc.

2. Blank all existing files in `docs/` — Files: `docs/ARCHITECTURE.md`, `docs/CONTRIBUTING.md`, etc.
    - Replace content with empty strings or minimal placeholders.

**Acceptance:**

- [ ] Repo contains only `docs/` directory with blank files
- [ ] `AGENTS.md` updated to reflect Rust/TypeScript/Tauri project rules
- [ ] No other files or directories remain
- [ ] Tests updated/added (integrated) - N/A for cleanup
- [ ] No breaking changes - repo reset
- [ ] All checks pass

**Dependencies:** Blocked by None · Blocks PR2

## PR2: Scaffold Monorepo — ⏸️

**Repo:** zinc · **Link:** - · **ETA:** 4-6h dev + 2h review

**Files:** `Cargo.toml`, `justfile`, `package.json`, `crates/core/Cargo.toml`, `crates/mcp-binary/Cargo.toml`, `crates/ide-backend/Cargo.toml`, `apps/zinc-ide/package.json`, `apps/zinc-ide/src-tauri/Cargo.toml`, `apps/zinc-ide/vite.config.ts`, `apps/zinc-ide/tailwind.config.js`, `apps/zinc-ide/vitest.config.ts`, `apps/zinc-ide/playwright.config.ts`, `packages/ui/package.json`

**Changes:**

1. Create Cargo workspace with core, mcp-binary, ide-backend crates — File: `Cargo.toml`
    - Define workspace members: crates/*

2. Set up npm workspace with apps and packages — File: `package.json`
    - Workspaces: ["apps/*", "packages/*"]

3. Configure justfile with dev, build, test commands — File: `justfile`
    - Commands: dev (Tauri + MCP), build, test (all), test:unit, test:e2e, test:rust, lint

4. Scaffold SvelteKit app in apps/zinc-ide with Tailwind, Flowbite-Svelte, Vitest, Playwright — Files: `apps/zinc-ide/package.json`, `vite.config.ts`, etc.
    - Install dependencies: sveltekit, tailwindcss, flowbite-svelte, vitest, playwright

5. Create Tauri config in apps/zinc-ide/src-tauri — File: `apps/zinc-ide/src-tauri/tauri.conf.json`
    - Basic config for desktop app

6. Create shared UI package placeholder — File: `packages/ui/package.json`
    - Empty for now

**Acceptance:**

- [ ] `just build` succeeds
- [ ] `just dev` starts Tauri dev mode
- [ ] All tooling configured (ESLint, Prettier, Clippy)
- [ ] Tests updated/added (integrated) - basic scaffold tests if applicable
- [ ] No breaking changes
- [ ] All checks pass

**Dependencies:** Blocked by PR1 · Blocks PR3

## PR3: Basic MCP Server — ⏸️

**Repo:** zinc · **Link:** - · **ETA:** 6-8h dev + 2h review

**Files:** `crates/mcp-binary/src/main.rs`, `crates/mcp-binary/src/tools/mod.rs`, `crates/mcp-binary/src/tools/filesystem.rs`, `crates/mcp-binary/src/tools/executor.rs`, `crates/core/src/lib.rs` (shared types)

**Changes:**

1. Implement MCP server with rmcp and stdio transport — File: `crates/mcp-binary/src/main.rs`
    - Parse --exec flag, set up server

2. Add filesystem tools: read_file, write_file, list_files — File: `crates/mcp-binary/src/tools/filesystem.rs`
    - Use serde for schemas, return Result

3. Add executor tool: run_command — File: `crates/mcp-binary/src/tools/executor.rs`
    - Execute commands with cwd, return stdout/stderr/exit_code

4. Define shared types in crates/core — File: `crates/core/src/lib.rs`
    - Common structs for tools

**Acceptance:**

- [ ] MCP server runs with --exec flag
- [ ] Tools return correct results via stdio
- [ ] Error handling for invalid paths/commands
- [ ] Tests updated/added (integrated) - Rust unit tests for tools
- [ ] No breaking changes
- [ ] All checks pass

**Dependencies:** Blocked by PR2 · Blocks PR4

## PR4: IDE Shell — ⏸️

**Repo:** zinc · **Link:** - · **ETA:** 8-10h dev + 3h review

**Files:** `apps/zinc-ide/src/routes/+page.svelte`, `apps/zinc-ide/src/lib/components/Editor.svelte`, `apps/zinc-ide/src/lib/stores/editor.ts`, `apps/zinc-ide/src-tauri/src/main.rs`, `apps/zinc-ide/src-tauri/src/commands.rs`

**Changes:**

1. Build minimal UI with menu bar, CodeMirror editor, empty sidebar — File: `apps/zinc-ide/src/routes/+page.svelte`
    - Use Flowbite-Svelte components, svelte-codemirror-editor

2. Implement Tauri commands for file ops — File: `apps/zinc-ide/src-tauri/src/commands.rs`
    - open_file, save_file, load_settings, save_settings

3. Wire menu actions to commands — File: `apps/zinc-ide/src/lib/stores/editor.ts`
    - Svelte store for editor state

4. Add basic settings schema in core — File: `crates/core/src/settings.rs`
    - JSON schema for settings

**Acceptance:**

- [ ] Open, edit, save single file works
- [ ] CodeMirror with syntax highlighting
- [ ] Menu bar functional
- [ ] Tests updated/added (integrated) - Vitest for components
- [ ] No breaking changes
- [ ] All checks pass

**Dependencies:** Blocked by PR3 · Blocks PR5

## PR5: OpenRouter Integration — ⏸️

**Repo:** zinc · **Link:** - · **ETA:** 6-8h dev + 2h review

**Files:** `crates/core/src/agent.rs`, `crates/core/src/openrouter.rs`, `apps/zinc-ide/src/lib/components/Chat.svelte`

**Changes:**

1. Implement OpenRouter client with reqwest — File: `crates/core/src/openrouter.rs`
    - send_message with tools, stream responses

2. Create agent loop in core — File: `crates/core/src/agent.rs`
    - Orchestrate user message, tool calls, MCP execution

3. Add chat UI in sidebar — File: `apps/zinc-ide/src/lib/components/Chat.svelte`
    - Message input, history

**Acceptance:**

- [ ] OpenRouter API calls work with API key
- [ ] Agent loop processes messages and tools
- [ ] Chat UI displays messages
- [ ] Tests updated/added (integrated) - unit tests for client
- [ ] No breaking changes
- [ ] All checks pass

**Dependencies:** Blocked by PR4 · Blocks PR6

## PR6: Connect IDE ↔ MCP ↔ Agent — ⏸️

**Repo:** zinc · **Link:** - · **ETA:** 8-10h dev + 3h review

**Files:** `apps/zinc-ide/src-tauri/src/mcp.rs`, `apps/zinc-ide/src/lib/components/ToolApproval.svelte`

**Changes:**

1. Spawn MCP binary from Tauri on startup — File: `apps/zinc-ide/src-tauri/src/mcp.rs`
    - Stdio communication

2. Connect agent to MCP tools — File: `crates/core/src/agent.rs`
    - Execute tools via MCP

3. Add tool approval UI — File: `apps/zinc-ide/src/lib/components/ToolApproval.svelte`
    - Modal for approve/reject tool calls

4. Wire chat to agent command — File: `apps/zinc-ide/src-tauri/src/commands.rs`
    - send_agent_message

**Acceptance:**

- [ ] MCP binary spawns and communicates
- [ ] Agent calls tools with approval
- [ ] End-to-end chat flow works
- [ ] Tests updated/added (integrated) - integration tests
- [ ] No breaking changes
- [ ] All checks pass

**Dependencies:** Blocked by PR5 · Blocks PR7

## PR7: Settings & Kill Switch — ⏸️

**Repo:** zinc · **Link:** - · **ETA:** 4-6h dev + 2h review

**Files:** `crates/core/src/settings.rs`, `apps/zinc-ide/src/lib/components/Settings.svelte`, `apps/zinc-ide/src/lib/stores/settings.ts`

**Changes:**

1. Implement settings persistence — File: `crates/core/src/settings.rs`
    - Load/save to user config dir, validate schema

2. Add settings UI — File: `apps/zinc-ide/src/lib/components/Settings.svelte`
    - API key input, model selector, AI toggle

3. Respect kill switch — File: `apps/zinc-ide/src/lib/stores/settings.ts`
    - Disable chat when off

**Acceptance:**

- [ ] Settings persist between sessions
- [ ] AI kill switch disables features
- [ ] UI for config
- [ ] Tests updated/added (integrated) - settings tests
- [ ] No breaking changes
- [ ] All checks pass

**Dependencies:** Blocked by PR6 · Blocks PR8

## PR8: Testing & Polish — ⏸️

**Repo:** zinc · **Link:** - · **ETA:** 6-8h dev + 2h review

**Files:** `apps/zinc-ide/tests/e2e/basic-editing.spec.ts`, `apps/zinc-ide/tests/e2e/ai-chat.spec.ts`, `crates/mcp-binary/src/tools/filesystem_tests.rs`, `README.md`

**Changes:**

1. Write unit and E2E tests — Files: various test files
    - Vitest for TS, cargo test for Rust, Playwright for E2E

2. Add error handling and UX polish — Files: UI components
    - Loading states, error toasts, shortcuts

3. Write README with setup instructions — File: `README.md`
    - Getting started, config, features

**Acceptance:**

- [ ] All tests pass (Vitest, Playwright, cargo)
- [ ] Error handling for API/file errors
- [ ] README complete
- [ ] Tests updated/added (integrated) - comprehensive coverage
- [ ] No breaking changes
- [ ] All checks pass

**Dependencies:** Blocked by PR7 · Blocks None

## Risk Mitigation

**Integration Complexity:** Complex Rust/TS/MCP/AI stack may have compatibility issues → Thorough testing in each PR, incremental builds → Recovery: Isolate failing component, revert PR, debug with logs.

**API Dependencies:** OpenRouter API changes or outages → Use latest SDK, handle errors gracefully → Recovery: Fallback to mock responses in tests, notify user of API issues.

**Security:** API keys exposed in settings → Never log keys, user encrypts if needed → Recovery: Clear keys on error, advise secure storage.

## Deployment Strategy

**CRITICAL:** Build and distribute binaries via GitHub releases after all PRs merged.

**Stage 1:** zinc repo · PRs: 1-8

1. Build release binaries with `just build`
2. Upload to GitHub releases
3. Verify on macOS/Linux
4. Rollback: Delete release, fix issues

**Cross-Repo Version Map**

| Stage | PR | zinc | Notes |
| ----: | -- | ---- | ----- |
| 1     | 8  | v1.0 | MVP release |

## Monitoring & Observability

**Metrics:** Build time <5min, test coverage >80%
**Logs:** Success: "MCP server started", Errors: "API key invalid", "File read failed"
**Alarms:** Build fails, tests <80% coverage

## Rollback

**Quick (flag):** Disable AI features via kill switch → verify app runs without AI → fix issues → re-enable.
**Full:** If critical bug in PR8 → uninstall app → revert to previous version if available → steps: delete binaries, reinstall fixed version.
**Order:** First: highest-risk (AI integration) → last: lowest-risk (UI polish).
**Artifacts safe to keep:** User settings, logs.

## Success Criteria

- [ ] All 8 PRs merged
- [ ] MVP features: file editing, AI chat with tools, settings
- [ ] No perf regression (editor handles 10MB files)
- [ ] Tests ≥80% & green
- [ ] 0 prod incidents (desktop, so user reports)
- [ ] Monitoring meets SLOs
- [ ] User-facing: open/edit/save, chat with AI, approve tools

## References

- [MVP Scope] `masterplan-new.md` lines 1-50 (user's message)
- [Technical Requirements] `masterplan-new.md` lines 51-100

## Notes & Assumptions

- Impl decisions: Use rmcp v0.1, OpenRouter latest API; defer LSP/Tree-sitter to Phase 2
- Cross-repo coord: N/A, single repo
- Data model: Settings as JSON, immutable in stores
- Risks: API rate limits handled with retries; file ops validate paths
- Testing: Integrated with each PR, no standalone test PRs
- Assumptions: ✅ OpenRouter API stable; ✅ rmcp SDK mature; ❌ Need to verify Tauri v2 compatibility (check during PR2)