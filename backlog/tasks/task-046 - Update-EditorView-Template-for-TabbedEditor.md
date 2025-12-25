---
id: task-046
title: Update EditorView Template for TabbedEditor
status: To Do
assignee: []
created_date: '2025-12-25 18:01'
labels:
    - component
    - template
    - refactor
dependencies:
    - task-045
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Update the EditorView template to integrate the new TabbedEditor organism, replacing the single-file CodeEditor with the multi-file tabbed interface.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 EditorView template updated to use TabbedEditor instead of CodeEditor
- [ ] #2 New props added: openFiles, activeFilePath, onTabSelect, onTabClose
- [ ] #3 editorValue prop removed or deprecated
- [ ] #4 Props properly passed to TabbedEditor
- [ ] #5 ResizablePanel layout maintained
- [ ] #6 Backward compatibility considered
- [ ] #7 editor-view.test.tsx updated for new props
- [ ] #8 editor-view.stories.tsx updated with multi-file examples
- [ ] #9 All tests pass
- [ ] #10 ESLint and TypeScript checks pass
  <!-- AC:END -->
