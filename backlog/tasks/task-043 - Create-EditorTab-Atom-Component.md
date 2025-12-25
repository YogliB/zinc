---
id: task-043
title: Create EditorTab Atom Component
status: To Do
assignee: []
created_date: '2025-12-25 18:01'
updated_date: '2025-12-25 18:01'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create directory: src/components/atoms/editor-tab/
2. Create editor-tab.tsx with EditorTabProperties interface
3. Implement component with name display and close button (X icon from lucide-react)
4. Add conditional styling based on isActive prop
5. Implement click handler for tab (calls onSelect)
6. Implement click handler for close button (calls onClose, stops propagation)
7. Apply TailwindCSS classes for layout and styling
8. Create editor-tab.test.tsx with tests:
    - Renders tab name correctly
    - Calls onSelect when tab clicked
    - Calls onClose when X clicked
    - Shows active styling when isActive=true
9. Create editor-tab.stories.tsx with stories: Default, Active, LongName
10. Create index.ts exporting EditorTab
11. Update src/components/atoms/index.ts to export EditorTab
12. Run tests: bun run test
13. Run checks: bun run lint && bun run typecheck
14. View in Storybook: bun run storybook
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

- Use TailwindCSS for styling following existing patterns
- Close button should use lucide-react X icon
- Consider text truncation for long file names (max-w-\* class)
- Active state should have distinct visual (border, background, or text color)
- Follow atomic design: this is a pure presentational component with no internal state
- Ensure close button stops propagation so clicking X doesn't trigger onSelect
  <!-- SECTION:NOTES:END -->
