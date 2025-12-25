---
id: task-045
title: Create TabbedEditor Organism Component
status: To Do
assignee: []
created_date: '2025-12-25 18:01'
labels:
    - component
    - organism
    - ui
dependencies:
    - task-044
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create the TabbedEditor organism component that combines the EditorTabs molecule and CodeEditor organism into a complete tabbed editing interface.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 TabbedEditor component created in src/components/organisms/tabbed-editor/
- [ ] #2 Combines EditorTabs and CodeEditor components
- [ ] #3 Accepts props: openFiles, activeFilePath, activeContent, onTabSelect, onTabClose, onEditorChange
- [ ] #4 EditorTabs displayed at top with correct props
- [ ] #5 CodeEditor displayed below with full remaining height
- [ ] #6 Shows empty state when openFiles is empty
- [ ] #7 Passes activeContent to CodeEditor
- [ ] #8 All callbacks properly wired
- [ ] #9 tabbed-editor.test.tsx created with 6+ test cases
- [ ] #10 tabbed-editor.stories.tsx created with 3 stories
- [ ] #11 index.ts exports TabbedEditor
- [ ] #12 organisms/index.ts updated to export TabbedEditor
- [ ] #13 All tests pass
- [ ] #14 ESLint and TypeScript checks pass
  <!-- AC:END -->
