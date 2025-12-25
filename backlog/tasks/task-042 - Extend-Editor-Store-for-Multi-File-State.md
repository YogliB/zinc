---
id: task-042
title: Extend Editor Store for Multi-File State
status: To Do
assignee: []
created_date: '2025-12-25 18:00'
updated_date: '2025-12-25 18:00'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Import OpenFile type from lib/types
2. Add openFiles signal: signal<OpenFile[]>([])
3. Add activeFilePath signal: signal<string | undefined>(undefined)
4. Implement addOpenFile(path, name, content) - adds to array, sets as active, logs
5. Implement removeOpenFile(path) - removes from array, switches to next tab if needed, logs
6. Implement setActiveTab(path) - updates activeFilePath, logs
7. Add computed signal activeFileContent that finds content from openFiles based on activeFilePath
8. Update resetEditorState to clear openFiles and activeFilePath
9. Keep selectedFilePath in sync with activeFilePath (use effect or in setter)
10. Run typecheck and lint
11. Test manually in console
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

- Use computed() from @preact/signals for activeFileContent
- addOpenFile should check for duplicates before adding
- removeOpenFile should handle switching to another tab if closing active file
- selectedFilePath.value should be kept in sync with activeFilePath.value for backward compatibility
- Add console.log statements for debugging (file opened/closed/switched)
  <!-- SECTION:NOTES:END -->
