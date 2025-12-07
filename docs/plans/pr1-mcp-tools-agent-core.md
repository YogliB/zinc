# PR1-MCP-Tools-Agent-Core-v1

## Goal

Implement the MCP Tools and Agent Core in Rust, providing shared tool interfaces and implementations, along with a minimal Agent struct integrated with OpenRouter for handling messages and tool calls.

## Scope

- **In Scope:** Create `agent-core` crate with tool structs and functions (read_file, write_file, list_files, run_command), Agent struct with OpenRouter integration for simple tool calling.
- **Out of Scope:** MCP server binary, IDE UI components, agent integration in IDE, project wiring, tests, linting, CI.

## Risks

- OpenRouter tools API may not integrate smoothly: Mitigation - Start with simple prompt forwarding (Option A from masterplan), upgrade to full tool calling if successful.
- Tool functions may have performance or security issues in synchronous execution: Mitigation - Keep simple, profile later if needed.

## Dependencies

- None (first PR in sequence).

## Priority

High

## Logging / Observability

- Log tool execution start/end with params/results.
- Log OpenRouter API requests/responses for debugging.

## Implementation Plan (TODOs)

- [ ] **Step 1: Set up agent-core crate structure**
    - [ ] Create `crates/agent-core/` directory
    - [ ] Create `crates/agent-core/Cargo.toml` with basic dependencies (serde, reqwest)
    - [ ] Create `crates/agent-core/src/lib.rs` with module declarations

- [ ] **Step 2: Define tool interfaces and structs**
    - [ ] Define `ReadFileParams` struct with path field
    - [ ] Define `WriteFileParams` struct with path and content fields
    - [ ] Define `ListFilesParams` struct with path field
    - [ ] Define `RunCommandParams` struct with command and args fields

- [ ] **Step 3: Implement tool functions**
    - [ ] Implement `read_file` function using std::fs::read_to_string, return Result<String>
    - [ ] Implement `write_file` function using std::fs::write, return Result<()>
    - [ ] Implement `list_files` function using std::fs::read_dir, return Result<Vec<String>>
    - [ ] Implement `run_command` function using std::process::Command, return Result<String> for stdout

- [ ] **Step 4: Implement Agent struct**
    - [ ] Define `Agent` struct with config fields (openrouter_api_key, model)
    - [ ] Add constructor `new` for Agent
    - [ ] Implement `handle_message` method that takes a message string, calls OpenRouter with tools, parses response, calls appropriate tool function, returns result

- [ ] **Step 5: Add dependencies and exports**
    - [ ] Update Cargo.toml with reqwest, serde, tokio if needed
    - [ ] Export tool functions and Agent from lib.rs

## Docs

- [ ] Update docs if needed (none anticipated for MVP)

## Testing

- [ ] Manual testing: Call tool functions directly, test Agent.handle_message with sample inputs

## Acceptance

- [ ] Tool functions work synchronously for read/write/list/run
- [ ] Agent can handle a message, call a tool, and return response
- [ ] No breaking changes
- [ ] All checks pass (cargo check, build)

## Fallback Plan

If OpenRouter integration fails, implement a mock Agent that echoes messages or uses hardcoded responses. Revert to simple prompt forwarding without tool calling.

## References

- [Masterplan] `docs/masterplans/zinc-ide-mcp-mvp.md` PR1 section

## Complexity Check

- TODO Count: 18
- Depth: 2
- Cross-deps: 0
- **Decision:** Proceed (within limits for single PR)