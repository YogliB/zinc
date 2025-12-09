# PR3-IDE-Shell-v1

## Goal

Implement the basic IDE shell for Zinc IDE using Tauri + SvelteKit + CodeMirror, including a functional UI with editor, chat sidebar, file operations, and settings handling to enable basic editing and configuration.

## Scope

- **In Scope:**
    - Update Svelte frontend for layout with CodeMirror editor and resizable sidebar.
    - Integrate svelte-codemirror-editor for better Svelte support.
    - Add buttons/menus for open/save file using Tauri dialogs.
    - Add settings panel/modal for OpenRouter API key, model, and AI enable/disable.
    - Implement Tauri commands for loading/saving settings and file operations.
    - Wire frontend to invoke Tauri commands and handle responses.
    - Add settings.json file creation/loading in app data directory.
- **Out of Scope:**
    - Agent message handling and tool calling (PR4).
    - MCP server integration (ignored).
    - Advanced editor features (e.g., syntax highlighting beyond basic, multiple tabs).
    - Testing, linting, or CI setup.

## Risks

- CodeMirror integration with SvelteKit may have compatibility issues: Mitigation - Use svelte-codemirror-editor package and test incrementally.
- Tauri dialog APIs for file operations may not work as expected on all platforms: Mitigation - Refer to Tauri docs and test on macOS.
- Settings persistence in JSON: Mitigation - Use serde for serialization and handle errors gracefully.

## Dependencies

- None (PR1 shared crate is available).

## Priority

High (critical for MVP).

## Logging / Observability

- Log Tauri command invocations and errors in console for debugging.
- No metrics needed.

## Implementation Plan (TODOs)

- [ ] **Update main page layout**
    - [ ] Modify `crates/ide/src/routes/+page.svelte` to use flex layout: editor on left (70%), sidebar on right (30%).
    - [ ] Add resizable divider between editor and sidebar using CSS or a library.
- [ ] **Integrate CodeMirror editor**
    - [ ] Replace direct CodeMirror usage with `svelte-codemirror-editor` component.
    - [ ] Add basic extensions: syntax highlighting for TypeScript/JavaScript, line numbers, themes.
    - [ ] Bind editor content to a Svelte state variable for file loading/saving.
- [ ] **Add file operation buttons**
    - [ ] Add "Open File" and "Save File" buttons in a toolbar above the editor.
    - [ ] Use Tauri's `open` and `save` dialog APIs in frontend invokes.
- [ ] **Implement settings panel**
    - [ ] Add a collapsible settings panel in the sidebar or a modal.
    - [ ] Form fields for API key (text input), model (select dropdown), AI enabled (checkbox).
    - [ ] Save/Load buttons to persist settings.
- [ ] **Add Tauri commands for file operations**
    - [ ] In `crates/ide/src-tauri/src/lib.rs`, add `open_file` command: use Tauri dialog to select file, read content, return string.
    - [ ] Add `save_file` command: use dialog to choose path, write content from param.
- [ ] **Add Tauri commands for settings**
    - [ ] Add `load_settings` command: read settings.json from app data dir, return struct or defaults.
    - [ ] Add `save_settings` command: write settings struct to settings.json.
    - [ ] Define Settings struct with serde in lib.rs.
- [ ] **Wire frontend to commands**
    - [ ] In +page.svelte, import invoke from @tauri-apps/api.
    - [ ] On open button click: invoke open_file, set editor content.
    - [ ] On save button click: invoke save_file with current content.
    - [ ] On settings load/save: invoke commands, update local state.
    - [ ] Handle async responses and display errors in UI.
- [ ] **Add settings.json handling**
    - [ ] Create default settings.json in app data directory if not exists.
    - [ ] Ensure commands handle file I/O errors and return appropriate responses.

## Docs

- [ ] Update `docs/USAGE.md` with basic IDE usage instructions (if needed after implementation).

## Testing

- [ ] Manual testing: Launch with `bun run tauri dev`, verify UI loads, open/save files, edit settings.
- [ ] Test on macOS: File dialogs work, settings persist across restarts.

## Acceptance

- [ ] IDE launches with `tauri dev` without errors.
- [ ] Can open file via dialog, edit in CodeMirror, save via dialog.
- [ ] Settings panel editable, saves/loads from JSON.
- [ ] No breaking changes (existing greet command still works).
- [ ] All checks pass (build, etc.).

## Fallback Plan

If integration issues arise (e.g., CodeMirror not rendering), revert to the basic editor in +page.svelte and simplify sidebar to static text. Reassess dependencies or switch to plain CodeMirror.

## References

- Zinc IDE + MCP MVP Masterplan (docs/masterplans/zinc-ide-mcp-mvp.md)
- Tauri API docs for dialogs and commands
- svelte-codemirror-editor GitHub repo

## Complexity Check

- TODO Count: 12
- Depth: 2 (nested tasks under steps)
- Cross-deps: 0
- **Decision:** Proceed (fits single PR, low risk)
