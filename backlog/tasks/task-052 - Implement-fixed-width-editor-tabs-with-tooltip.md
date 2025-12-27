---
id: task-052
title: Implement fixed-width editor tabs with tooltip
status: To Do
assignee: []
created_date: '2025-12-27 19:32'
labels:
    - ui
    - enhancement
    - editor
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Refactor the EditorTabs component to use fixed-width tabs instead of dynamic sizing. This will provide a consistent, predictable layout similar to VS Code and other modern code editors. Long filenames will be truncated with ellipsis, and hovering over a tab will show a tooltip with the full file path.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 All tabs have a fixed width (e.g., 10rem/160px)
- [ ] #2 Long filenames are truncated with ellipsis
- [ ] #3 Hovering over a tab displays a tooltip with the full file path
- [ ] #4 Active tab styling is preserved
- [ ] #5 Close button remains functional
- [ ] #6 Tooltip component from Shadcn is properly integrated
- [ ] #7 Component maintains responsive behavior
- [ ] #8 All existing tests pass
- [ ] #9 New tests added for tooltip functionality
  <!-- AC:END -->
