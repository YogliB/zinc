---
id: task-044
title: Create EditorTabs Molecule Component
status: To Do
assignee: []
created_date: '2025-12-25 18:01'
labels:
    - component
    - molecule
    - ui
dependencies:
    - task-043
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create an EditorTabs molecule component that orchestrates multiple EditorTab atoms using Shadcn's Tabs component to provide tab navigation for open files.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 EditorTabs component created in src/components/molecules/editor-tabs/
- [ ] #2 Uses Shadcn Tabs component (TabsList, TabsTrigger)
- [ ] #3 Accepts props: openFiles, activeFilePath, onTabSelect, onTabClose
- [ ] #4 Renders TabsTrigger for each file in openFiles
- [ ] #5 Integrates EditorTab atoms within TabsTriggers
- [ ] #6 Highlights active tab based on activeFilePath
- [ ] #7 Handles empty openFiles array gracefully
- [ ] #8 editor-tabs.test.tsx created with 5+ test cases
- [ ] #9 editor-tabs.stories.tsx created with 3 stories
- [ ] #10 index.ts exports EditorTabs
- [ ] #11 molecules/index.ts updated to export EditorTabs
- [ ] #12 All tests pass
- [ ] #13 ESLint and TypeScript checks pass
  <!-- AC:END -->
