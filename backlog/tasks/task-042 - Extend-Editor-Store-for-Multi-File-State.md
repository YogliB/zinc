---
id: task-042
title: Extend Editor Store for Multi-File State
status: To Do
assignee: []
created_date: '2025-12-25 18:00'
labels:
    - state
    - signals
    - foundation
dependencies:
    - task-041
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Extend the editor store to support multiple open files by adding new signals and helper functions for managing the array of open files and tracking which file is currently active.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 openFiles signal added with OpenFile[] type
- [ ] #2 activeFilePath signal added with string | undefined type
- [ ] #3 addOpenFile function implemented and exported
- [ ] #4 removeOpenFile function implemented and exported
- [ ] #5 setActiveTab function implemented and exported
- [ ] #6 activeFileContent computed signal implemented
- [ ] #7 resetEditorState updated to reset new signals
- [ ] #8 selectedFilePath maintains backward compatibility
- [ ] #9 All functions have proper TypeScript types
- [ ] #10 No TypeScript or ESLint errors
  <!-- AC:END -->
