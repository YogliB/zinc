zinc/docs/plans/shortcut-focus-refactor-v1.md

# shortcut-focus-refactor-v1

## Goal

Refactor keyboard shortcuts in the Zinc IDE to only function when the application window is in focus, preventing global activation when the app is not active.

## Scope

- **In Scope:** Removing global shortcut registration, implementing frontend-based key event handling, updating documentation.
- **Out of Scope:** Adding new shortcuts, modifying other app behaviors, or changing UI components beyond necessary event listeners.

## Risks

- **Browser shortcut conflicts**: Frontend listeners might interfere with browser defaults (e.g., Ctrl+O for open). Mitigation: Use preventDefault() only for exact matches and test thoroughly.
- **OS-specific behavior**: Key combinations may behave differently on macOS vs. Windows/Linux. Mitigation: Test on all target platforms.
- **Performance impact**: Adding event listeners could affect responsiveness if not optimized. Mitigation: Minimal listener code, no heavy operations.

## Dependencies

- None

## Priority

Medium

## Logging / Observability

- Add console.log statements in keydown handler for debugging shortcut triggers during development.

## Implementation Plan (TODOs)

- [x] **Remove global shortcut plugin and code**
    - [x] Remove `tauri-plugin-global-shortcut` dependency from `src-tauri/Cargo.toml`
    - [x] Delete global shortcut plugin initialization and handler from `src-tauri/src/lib.rs`
    - [x] Remove shortcut registration code in the `setup` function
- [x] **Implement frontend key event handling**
    - [x] Add `window.addEventListener('keydown', handleKeydown)` in `onMount` of `src/routes/+page.svelte`
    - [x] Implement `handleKeydown` function to detect Cmd+O/Ctrl+O (open folder) and Cmd+Shift+O/Ctrl+Shift+O (open file)
    - [x] Call `openFolder()` or `openFile()` directly and prevent default behavior
    - [x] Add cleanup: `window.removeEventListener('keydown', handleKeydown)` on component unmount
- [x] **Update documentation**
    - [x] Modify `docs/USAGE.md` to state that shortcuts only work when the app is focused

## Docs

- [x] Update Keyboard Shortcuts section in `docs/USAGE.md` to reflect focus requirement

## Testing

- [x] Manual testing: Verify shortcuts trigger only when app window is focused
- [x] Cross-platform testing: Test on macOS and Windows/Linux for key combinations
- [x] Edge case testing: Ensure no interference with browser shortcuts or other apps

## Acceptance

- [x] Shortcuts (Cmd+O/Ctrl+O and Cmd+Shift+O/Ctrl+Shift+O) only activate when the Zinc IDE window is in focus
- [x] No global activation occurs when the app is minimized or another app is active
- [x] Documentation accurately describes the new behavior

## Fallback Plan

If issues arise (e.g., shortcut conflicts or performance problems), revert all changes: restore the global shortcut plugin and code, and remove frontend listeners. Re-evaluate alternative approaches, such as checking window focus in the global handler.

## References

- Tauri documentation on global shortcuts vs. window events
- Svelte event handling best practices

## Complexity Check

- TODO Count: 8
- Depth: 1
- Cross-deps: 0
- **Decision:** Proceed (small scope, fits single PR)
