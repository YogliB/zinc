---
id: task-043
title: Create EditorTab Atom Component
status: To Do
assignee: []
created_date: '2025-12-25 18:01'
labels:
    - component
    - atom
    - ui
dependencies:
    - task-042
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create an atomic EditorTab component that represents a single file tab with a name display, active state styling, and a close button. This is the foundational building block for the tabbed interface.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 EditorTab component created in src/components/atoms/editor-tab/
- [ ] #2 Component accepts props: name, isActive, onSelect, onClose
- [ ] #3 Displays tab name and close button
- [ ] #4 Active state styling applied correctly
- [ ] #5 Close button triggers onClose callback
- [ ] #6 Tab click triggers onSelect callback
- [ ] #7 editor-tab.test.tsx created with 4+ test cases
- [ ] #8 editor-tab.stories.tsx created with 3 stories (Default, Active, Long Name)
- [ ] #9 index.ts exports EditorTab
- [ ] #10 atoms/index.ts updated to export EditorTab
- [ ] #11 All tests pass
- [ ] #12 ESLint and TypeScript checks pass
  <!-- AC:END -->
