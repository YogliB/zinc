---
id: task-047
title: Integrate Multi-File Logic in Editor Page
status: Done
assignee: []
created_date: '2025-12-25 18:02'
updated_date: '2025-12-25 18:35'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Open src/pages/editor/editor.tsx
2. Import new functions and signals from editor-store: openFiles, activeFilePath, addOpenFile, removeOpenFile, setActiveTab
3. Modify handleSelect function:
    - Check if node.path exists in openFiles.value
    - If yes: call setActiveTab(node.path)
    - If no: call loadFile(node.path), then addOpenFile(path, name, content)
4. Create handleTabSelect function that calls setActiveTab(path)
5. Create handleTabClose function that calls removeOpenFile(path)
6. Update auto-save debouncedSave to use activeFilePath.value instead of selectedFilePath.value
7. Derive activeContent: const activeContent = computed(() => openFiles.value.find(f => f.path === activeFilePath.value)?.content ?? '')
8. Update EditorView props:
    - Remove editorValue
    - Add openFiles={openFiles.value}
    - Add activeFilePath={activeFilePath.value}
    - Add onTabSelect={handleTabSelect}
    - Add onTabClose={handleTabClose}
9. Update onEditorChange to modify openFiles content for active file (not just editorValue)
10. Run typecheck and lint
11. Test manually in dev mode
12. Verify console logs appear correctly
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

- Import openFiles, activeFilePath, addOpenFile, removeOpenFile, setActiveTab from editor-store
- Keep backward compatibility: selectedFilePath should still work via store sync
- Use openFiles.value.find() to check if file already open
- Derive activeContent using computed or inline: openFiles.value.find(f => f.path === activeFilePath.value)?.content ?? ''
- handleTabClose should switch to another tab after closing if tabs remain
- Add console logs for: file opened, file closed, tab switched
  <!-- SECTION:NOTES:END -->
