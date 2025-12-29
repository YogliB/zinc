---
id: task-059
title: Add Global Keyboard Shortcut Handler
status: To Do
assignee: []
created_date: '2025-12-29 10:27'
updated_date: '2025-12-29 10:27'
labels:
    - enhancement
    - ux
    - keyboard-shortcuts
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Implement a global keyboard shortcut handler that listens for Cmd+K (Mac) or Ctrl+K (Windows/Linux) to trigger the command palette. The handler should detect the user's OS and use the appropriate modifier key, work across all pages, and manage the open/close state of the command palette using Preact signals.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Pressing Cmd+K on Mac opens the command palette
- [ ] #2 Pressing Ctrl+K on Windows/Linux opens the command palette
- [ ] #3 Pressing the shortcut again closes the palette
- [ ] #4 Shortcut works on both welcome and editor pages
- [ ] #5 Browser's default Cmd+K behavior is prevented
- [ ] #6 No memory leaks from event listeners
  <!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create a signal in `src/lib/stores/command-palette.ts` to track open/close state (`isCommandPaletteOpen`)
2. Create a custom hook `useKeyboardShortcuts` in `src/lib/hooks/` to listen for keyboard events
3. Implement OS detection logic to use Cmd (Mac) vs Ctrl (Windows/Linux)
4. Add event listener for `Cmd+K` or `Ctrl+K` that toggles the palette state
5. Prevent default browser behavior when the shortcut is pressed
6. Test shortcut works on all pages (welcome, editor)
7. Add cleanup logic to remove event listeners on unmount
 <!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

- Use the existing `osSignal` from app.tsx to determine OS
- Consider creating a reusable keyboard shortcut system for future shortcuts
- The handler should be attached at the App level to work globally
- Use `event.preventDefault()` to stop browser's search bar from opening
  <!-- SECTION:NOTES:END -->
