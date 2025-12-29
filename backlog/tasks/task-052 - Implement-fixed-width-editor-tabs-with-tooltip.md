---
id: task-052
title: Implement fixed-width editor tabs with tooltip
status: Done
assignee: []
created_date: '2025-12-27 19:32'
updated_date: '2025-12-29 09:57'
labels:
    - ui
    - enhancement
    - editor
dependencies: []
priority: medium
ordinal: 15000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Refactor the EditorTabs component to use fixed-width tabs instead of dynamic sizing. This will provide a consistent, predictable layout similar to VS Code and other modern code editors. Long filenames will be truncated with ellipsis, and hovering over a tab will show a tooltip with the full file path.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 All tabs have a fixed width (e.g., 10rem/160px)
- [ ] #2 Long filenames are truncated with ellipsis
- [ ] #3 Hovering over a tab displays a tooltip with the full file path
- [ ] #4 Active tab styling is preserved
- [ ] #5 Close button remains functional
- [ ] #6 Tooltip component from Shadcn is properly integrated
- [ ] #7 Component maintains responsive behavior
- [ ] #8 All existing tests pass
- [ ] #9 New tests added for tooltip functionality
  <!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. **Install/verify Tooltip component**: Check if `@/components/ui/tooltip` exists from Shadcn. If not, install it using the Shadcn CLI.

2. **Update TabsTrigger styling**: Add fixed width class (`w-40` or `max-w-[10rem]`) to the TabsTrigger component in `editor-tabs.tsx`. Ensure the container div also receives `w-full` to fill the trigger.

3. **Add truncation to EditorTab**: Update the `EditorTab` component in `atoms/editor-tab/` to include `truncate` and `max-w-[8rem]` classes on the filename span to enable ellipsis for overflow text.

4. **Integrate Tooltip wrapper**: Wrap each TabsTrigger with TooltipProvider, Tooltip, TooltipTrigger, and TooltipContent components. Display the full `file.path` in the tooltip content.

5. **Test visual consistency**: Open multiple files with varying filename lengths and verify all tabs have uniform width and proper truncation.

6. **Update tests**: Add Vitest tests for:
    - Tooltip rendering on hover
    - Truncation behavior with long filenames
    - Fixed width application
7. **Run validation**: Execute `bun run lint`, `bun run type-check`, and `bun run test` to ensure no regressions.
 <!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

**Design Considerations:**

- Standard fixed width of 160px (10rem) balances readability with space efficiency
- Showing full file path in tooltip (not just filename) provides better context when multiple files have similar names
- Pattern follows industry standards (VS Code, Chrome DevTools, IntelliJ)

**Technical Notes:**

- Shadcn Tooltip component should already be available in the project's `ui/` directory
- If tooltip component is missing, install with: `bunx shadcn@latest add tooltip`
- Consider adding a small delay to tooltip appearance to avoid flickering on quick mouse movements
- The `min-w-0` class may be needed on parent containers to ensure truncation works correctly in flex layouts

**Potential Edge Cases:**

- Very short filenames in wide tabs (centered text might look odd)
- Many tabs open (consider horizontal scrolling in future iteration)
- Tooltip positioning at viewport edges
  <!-- SECTION:NOTES:END -->
