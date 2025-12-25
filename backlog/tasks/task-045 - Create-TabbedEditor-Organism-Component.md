---
id: task-045
title: Create TabbedEditor Organism Component
status: To Do
assignee: []
created_date: '2025-12-25 18:01'
updated_date: '2025-12-25 18:01'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create directory: src/components/organisms/tabbed-editor/
2. Create tabbed-editor.tsx with TabbedEditorProperties interface
3. Import EditorTabs from molecules, CodeEditor from organisms
4. Import OpenFile type from lib/types
5. Implement layout container (flex column, full height)
6. Add conditional rendering: if openFiles.length === 0, show empty state
7. Otherwise render EditorTabs at top and CodeEditor below
8. Pass openFiles, activeFilePath, onTabSelect, onTabClose to EditorTabs
9. Pass activeContent (or '') and onEditorChange to CodeEditor
10. Style for proper height distribution
11. Create tabbed-editor.test.tsx with tests:
    - Renders empty state when no files
    - Renders EditorTabs when files exist
    - Renders CodeEditor with correct content
    - Passes callbacks correctly
    - Handles tab selection
    - Handles tab close
12. Create tabbed-editor.stories.tsx: EmptyState, SingleFile, MultipleFiles
13. Create index.ts exporting TabbedEditor
14. Update src/components/organisms/index.ts
15. Run tests and checks
16. View in Storybook
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

- Use flexbox for layout: flex flex-col h-full
- EditorTabs should not grow, CodeEditor should flex-1 or grow
- Empty state should be user-friendly (e.g., "No files open. Select a file from the tree to begin.")
- activeContent should default to empty string if undefined
- This organism orchestrates but doesn't manage state (pure presentation)
  <!-- SECTION:NOTES:END -->
