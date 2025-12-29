---
id: task-060
title: Define Command Registry and Actions
status: Done
assignee: []
created_date: '2025-12-29 10:27'
updated_date: '2025-12-29 10:32'
labels:
    - enhancement
    - architecture
    - commands
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create a centralized command registry that defines all available commands in the application. Each command should include metadata (id, title, category, shortcut hint) and an action function. Commands should integrate with existing app functionality like opening files, closing tabs, navigating between pages, and future AI/chat features.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Command registry contains at least 5-10 useful commands
- [ ] #2 Commands are properly categorized (File, Editor, Navigation, etc.)
- [ ] #3 Each command has a unique ID, title, and action function
- [ ] #4 Commands can be context-aware (show/hide based on app mode)
- [ ] #5 Command actions properly interact with existing stores (editor, files)
- [ ] #6 Commands include keyboard shortcut hints where applicable
  <!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create `src/lib/commands/registry.ts` to hold the command registry
2. Define TypeScript interface for Command structure (id, title, category, action, keywords, shortcut)
3. Implement initial commands:
    - File operations: Open Folder
    - Editor operations: Close Active Tab, Close All Tabs, Format Code
    - Navigation: Go to Welcome Page, Go to Editor
    - Future: Chat/AI placeholders
4. Create helper functions to filter commands by context (mode, active file, etc.)
5. Export commands array and utility functions
6. Add unit tests for command registry and filtering logic
 <!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

- Keep commands functional and side-effect free where possible
- Consider commands like: Open File, Close Tab, Close All Tabs, Go to Welcome, Format Code, Toggle Sidebar, etc.
- Some commands may only be relevant in certain modes (e.g., Close Tab only in editor mode)
- Future commands could include AI-related actions like 'Ask AI', 'Explain Code', etc.
  <!-- SECTION:NOTES:END -->
