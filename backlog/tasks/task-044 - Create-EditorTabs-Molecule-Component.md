---
id: task-044
title: Create EditorTabs Molecule Component
status: To Do
assignee: []
created_date: '2025-12-25 18:01'
updated_date: '2025-12-25 18:01'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create directory: src/components/molecules/editor-tabs/
2. Create editor-tabs.tsx with EditorTabsProperties interface
3. Import Shadcn Tabs, TabsList, TabsTrigger from ui/tabs
4. Import EditorTab from atoms
5. Import OpenFile type from lib/types
6. Implement component structure with Tabs wrapper
7. Map openFiles to TabsTrigger components with EditorTab inside
8. Pass isActive based on activeFilePath match
9. Wire up onTabSelect and onTabClose callbacks
10. Handle edge case: empty openFiles (return null or empty state)
11. Create editor-tabs.test.tsx with tests:
    - Renders correct number of tabs from openFiles
    - Highlights active tab correctly
    - Calls onTabSelect with correct path
    - Calls onTabClose with correct path
    - Handles empty openFiles array
12. Create editor-tabs.stories.tsx: SingleTab, MultipleTabs, ManyTabs (5+)
13. Create index.ts exporting EditorTabs
14. Update src/components/molecules/index.ts
15. Run tests and checks
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

- Import Tabs, TabsList, TabsTrigger from @/components/ui/tabs
- Import EditorTab from atoms
- Use file.path as the key for each TabsTrigger
- Handle horizontal scrolling if many tabs (Shadcn tabs should handle this)
- Consider adding TabsContent for semantic correctness (though content rendered separately)
- Map openFiles array to generate TabsTriggers dynamically
  <!-- SECTION:NOTES:END -->
