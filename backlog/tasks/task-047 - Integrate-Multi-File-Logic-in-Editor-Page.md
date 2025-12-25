---
id: task-047
title: Integrate Multi-File Logic in Editor Page
status: To Do
assignee: []
created_date: '2025-12-25 18:02'
labels:
    - integration
    - page
    - state
dependencies:
    - task-046
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Update the editor page to integrate with the new multi-file store and pass the correct props to EditorView, enabling full multi-file functionality.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 editor.tsx imports new store functions (addOpenFile, removeOpenFile, setActiveTab)
- [ ] #2 handleSelect checks if file already open before loading
- [ ] #3 New file opens → calls loadFile then addOpenFile
- [ ] #4 Already open file → calls setActiveTab only
- [ ] #5 handleTabSelect function created and wired to EditorView
- [ ] #6 handleTabClose function created and wired to EditorView
- [ ] #7 Auto-save logic uses activeFilePath instead of selectedFilePath
- [ ] #8 EditorView receives openFiles, activeFilePath, activeContent, onTabSelect, onTabClose props
- [ ] #9 Console logging added for debugging
- [ ] #10 No TypeScript or ESLint errors
- [ ] #11 Manual test: opening files works
- [ ] #12 Manual test: switching tabs works
- [ ] #13 Manual test: auto-save works on active file
  <!-- AC:END -->
