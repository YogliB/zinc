# Zinc IDE + MCP MVP Masterplan

**Overview:** Build the absolute minimum working version of a desktop IDE (Zinc IDE) using Tauri + SvelteKit + CodeMirror 6, a Rust MCP server exposing basic tools, and an agent layer usable both inside the IDE and via MCP, sharing the same tool definitions. Focus on end-to-end functionality without tests, linting, or CI.
**Approach:** Implement in a single repo with modular crates and apps, following the 5-step plan: create shared agent core with tools, build MCP server, set up IDE shell, integrate agent in IDE, and wire manually.
**Est. Time:** 20–40h incl. review
**PRs:** 5 across 1 repo
**Risk:** Medium – involves new integrations (Tauri, SvelteKit, CodeMirror, MCP, OpenRouter), potential issues with tool calling and UI responsiveness.
**Repos:** zinc

## Implementation Status

> PRs: whole numbers, start at 1, sequential by dependencies.

| PR  | Repo | Status | Link | Notes                                      |
| --- | ---- | ------ | ---- | ------------------------------------------ |
| 1   | zinc | 🟢     | -    | MCP Tools and Agent Core (Rust)            |
| 2   | zinc | ⏸️     | -    | MCP Server Binary                          |
| 3   | zinc | ⏸️     | -    | IDE Shell (Tauri + SvelteKit + CodeMirror) |
| 4   | zinc | ⏸️     | -    | IDE ↔ Agent Integration (Shared Tools)     |
| 5   | zinc | ⏸️     | -    | Manual Wiring and Final Touches            |

Status: 🟢 done · 🟡 in‑progress · 🟠 review · ⏸️ not‑started · 🔴 blocked · ⚫ canceled

## PR1: MCP Tools and Agent Core (Rust) — 🟢

**Repo:** zinc · **Link:** - · **ETA:** 4–6h dev + 1–2h review
**Files:** `crates/agent-core/src/lib.rs`, `crates/agent-core/Cargo.toml`, new crate structure

**Changes:**

1. Create `agent-core` crate with tool interfaces and implementations — File: `crates/agent-core/src/lib.rs`
    - Define structs: `ReadFileParams`, `WriteFileParams`, `ListFilesParams`, `RunCommandParams`
    - Implement functions: `read_file`, `write_file`, `list_files`, `run_command` using std::fs and std::process
    - deps/imports: standard Rust libs

2. Implement minimal `Agent` struct with OpenRouter integration — File: `crates/agent-core/src/lib.rs`
    - Add Agent struct with config fields
    - Implement `handle_message` with simple tool calling (Option B: use OpenRouter tools API, call Rust functions, return results)
    - deps/imports: reqwest for HTTP, serde for JSON

**Acceptance:**

- [ ] Tool functions work synchronously for read/write/list/run
- [ ] Agent can handle a message, call a tool, and return response
- [ ] No breaking changes
- [ ] All checks pass

**Dependencies:** Blocked by None · Blocks PR2, PR4

## PR2: MCP Server Binary — ⏸️

**Repo:** zinc · **Link:** - · **ETA:** 4–6h dev + 1–2h review
**Files:** `crates/mcp-server/src/main.rs`, `crates/mcp-server/Cargo.toml`

**Changes:**

1. Create `mcp-server` binary crate — File: `crates/mcp-server/src/main.rs`
    - Implement stdio loop for JSON-RPC-like requests
    - Expose tools: read_file, write_file, list_files, run_command
    - Call agent-core functions
    - deps/imports: agent-core, tokio for async, serde_json

**Acceptance:**

- [ ] Binary runs with --exec flag, reads stdin, writes stdout JSON
- [ ] Tools match agent-core semantics
- [ ] No breaking changes
- [ ] All checks pass

**Dependencies:** Blocked by None · Blocks None

## PR3: IDE Shell (Tauri + SvelteKit + CodeMirror) — ⏸️

**Repo:** zinc · **Link:** - · **ETA:** 6–8h dev + 2–3h review
**Files:** `apps/zinc-ide/src-tauri/src/main.rs`, `apps/zinc-ide/src-tauri/tauri.conf.json`, `apps/zinc-ide/src/app.html`, `apps/zinc-ide/src/routes/+page.svelte`, etc.

**Changes:**

1. Set up Tauri + SvelteKit project — File: `apps/zinc-ide/`
    - Create structure with src-tauri and src
    - Configure for desktop app
    - deps/imports: tauri, sveltekit, codemirror6 wrapper

2. Implement basic UI: editor and sidebar — File: `apps/zinc-ide/src/routes/+page.svelte`
    - Main layout with CodeMirror editor and AI chat sidebar
    - Buttons for open/save file
    - deps/imports: svelte components, codemirror

3. Add settings JSON handling — File: `apps/zinc-ide/src-tauri/src/main.rs`
    - Tauri commands for load/save settings
    - Settings struct for OpenRouter config
    - deps/imports: serde, std::fs

**Acceptance:**

- [ ] IDE launches with tauri dev
- [ ] Can open file, edit, save via dialogs
- [ ] Settings panel editable
- [ ] No breaking changes
- [ ] All checks pass

**Dependencies:** Blocked by None · Blocks PR4

## PR4: IDE ↔ Agent Integration (Shared Tools) — ⏸️

**Repo:** zinc · **Link:** - · **ETA:** 4–6h dev + 1–2h review
**Files:** `apps/zinc-ide/src-tauri/src/main.rs`, `apps/zinc-ide/src/routes/+page.svelte`

**Changes:**

1. Integrate agent-core in Tauri backend — File: `apps/zinc-ide/src-tauri/src/main.rs`
    - Add agent-core dependency
    - Expose agent_message Tauri command
    - Load settings, create Agent, call handle_message
    - deps/imports: agent-core

2. Wire frontend to agent — File: `apps/zinc-ide/src/routes/+page.svelte`
    - Chat UI sends messages to Tauri command
    - Display responses
    - Respect AI enabled setting
    - deps/imports: tauri invoke

**Acceptance:**

- [ ] Agent in IDE uses shared tools from agent-core
- [ ] Can send message like “read src/main.rs” and get response
- [ ] Same tools as MCP
- [ ] No breaking changes
- [ ] All checks pass

**Dependencies:** Blocked by PR3 · Blocks PR5

## PR5: Manual Wiring and Final Touches — ⏸️

**Repo:** zinc · **Link:** - · **ETA:** 2–4h dev + 1h review
**Files:** `settings.json`, root Cargo.toml, package.json adjustments

**Changes:**

1. Create project structure and settings — File: `settings.json`
    - Place in project root or config dir
    - Default JSON as specified

2. Wire dependencies and scripts — File: `Cargo.toml`, `package.json`
    - Ensure agent-core shared between crates
    - Scripts for running MCP and IDE
    - deps/imports: adjust as needed

**Acceptance:**

- [ ] Full end-to-end works: IDE launches, edit/save, agent chat with tools
- [ ] MCP server testable separately
- [ ] No tests/linting/CI added
- [ ] All checks pass

**Dependencies:** Blocked by PR2, PR4 · Blocks None

## Risk Mitigation

**Integration Complexity:** New stack (Tauri, SvelteKit, CodeMirror, MCP) may have compatibility issues → Research and use latest compatible versions; test incrementally → If fails, fallback to simpler UI or mock tools.

**Tool Calling:** OpenRouter tools API may not work as expected → Implement simple prompt forwarding first (Option A) → Upgrade to full tool calling later.

**Performance:** Synchronous tools in async context → Profile and optimize if needed → Use async wrappers if blocking.

## Deployment Strategy

**CRITICAL:** Local development only; no prod deployment yet.

**Stage 1:** zinc · PRs: 1-5

1. Implement and test each PR locally
2. Verify IDE launches and agent works
3. Rollback: revert commits if issues

**Cross‑Repo Version Map**
| Stage | PR | zinc | Notes |
| ----: | -- | ---- | ----- |
| 1 | 1-5 | v0.1-mvp | Initial MVP |

## Monitoring & Observability

**Metrics:** Tool call success rate → 100%
**Logs:** Success: ["Tool executed"], Errors: ["Tool failed: ..."]
**Alarms:** If agent doesn't respond → Check API key/settings

## Rollback

**Quick (flag):** Disable AI in settings → Verify UI shows disabled → Fix agent code → Re-enable.
**Full:** If major issue → Delete agent-core integration → Revert to basic editor.
**Order:** Last: agent integration → First: core tools.
**Artifacts safe to keep:** settings.json, basic UI.

## Success Criteria

- [ ] All 5 PRs merged
- [ ] IDE launches and file operations work
- [ ] Agent chat functional with tool calls (read_file, list_files at least)
- [ ] MCP server runs and exposes tools
- [ ] No perf issues in basic use
- [ ] No tests added
- [ ] 0 build failures

## References

- [MVP Requirements] `masterplan-new.md` lines 1–100 (attached description)
- [Template] `templates/masterplan.md` lines 1–50

## Notes & Assumptions

- Impl decisions: Use latest versions of Tauri/SvelteKit; simple JSON for MCP; OpenRouter as sole provider.
- Cross‑repo coord: N/A, single repo.
- Data model: Settings JSON flat structure.
- Risks: API key security (hardcode for MVP, warn user).
- Testing: Manual only, integrated in dev.
- Assumptions: ✅ OpenRouter API stable; ✅ User has Rust/Node installed; ❌ No need for advanced MCP spec yet.
