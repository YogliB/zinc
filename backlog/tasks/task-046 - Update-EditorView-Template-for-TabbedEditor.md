---
id: task-046
title: Update EditorView Template for TabbedEditor
status: Done
assignee: []
created_date: '2025-12-25 18:01'
updated_date: '2025-12-25 18:34'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Open src/components/templates/editor-view/editor-view.tsx
2. Replace CodeEditor import with TabbedEditor from organisms
3. Update EditorViewProperties interface:
    - Remove editorValue: string
    - Add openFiles: OpenFile[]
    - Add activeFilePath: string | undefined
    - Add onTabSelect: (path: string) => void
    - Add onTabClose: (path: string) => void
4. Inside component, derive activeContent from openFiles/activeFilePath
5. Replace CodeEditor component with TabbedEditor
6. Pass correct props to TabbedEditor
7. Update editor-view.test.tsx:
    - Update mock props
    - Add tests for tab interactions
    - Update existing tests
8. Update editor-view.stories.tsx:
    - Add multi-file story with 2-3 open files
    - Update Default story
9. Run tests: bun run test
10. Run checks: bun run lint && bun run typecheck
11. View in Storybook
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

- Remove CodeEditor import, add TabbedEditor import
- Update EditorViewProperties interface
- Keep the ResizablePanel structure unchanged
- activeContent should be derived from openFiles + activeFilePath before passing to TabbedEditor
- Consider making new props optional initially for gradual migration
- Update the div wrapper inside code-editor panel to pass full height to TabbedEditor
  <!-- SECTION:NOTES:END -->
