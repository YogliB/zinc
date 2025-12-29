---
id: task-053
title: Implement seamless integration styling for editor tabs
status: Done
assignee: []
created_date: '2025-12-27 19:55'
updated_date: '2025-12-29 09:57'
labels:
    - ui
    - styling
    - design
    - editor
dependencies: []
priority: medium
ordinal: 14000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Update the EditorTabs component to use seamless integration styling where the active tab adopts the editor's background color and inactive tabs use a muted background. This creates a "folder" look that makes the active tab feel like a physical extension of the workspace below it, replacing the current heavy blue block design.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Active tab uses `bg-background` color matching the editor area
- [ ] #2 Inactive tabs use `bg-muted/40` with reduced opacity
- [ ] #3 Inactive tab text uses `text-muted-foreground` for lower visual weight
- [ ] #4 Vertical separators (`border-r border-border`) appear between tabs
- [ ] #5 No rounded corners on any tab state
- [ ] #6 No blue background or bottom border on active tabs
- [ ] #7 Design looks cohesive in both light and dark themes
- [ ] #8 Active tab visually integrates with the editor content below it
  <!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Remove the rounded corners from TabsTrigger by adding `rounded-none` class
2. Replace the blue background (`bg-blue-50`/`bg-blue-900/20`) with `bg-background` for active state
3. Add `bg-muted/40` background for inactive tabs
4. Add `text-muted-foreground` for inactive tab text to reduce visual weight
5. Add `border-r border-border` to create subtle vertical separators between tabs
6. Remove the `border-b-2 border-transparent` and `data-[state=active]:border-blue-500` classes since we're no longer using the bottom border indicator
7. Test in both light and dark modes to ensure proper contrast
8. Verify the active tab visually "connects" with the editor content area below
 <!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

This design follows the 'Seamless Integration' pattern where the active tab becomes a visual extension of the workspace

The key is to use Tailwind's design tokens (`background`, `muted`, `border`) rather than hardcoded colors to maintain theme consistency

The muted background for inactive tabs creates depth without the 'heavy' feel of the previous blue block design

Consider adjusting the opacity value of `muted/40` if the contrast feels too subtle or too strong after implementation

<!-- SECTION:NOTES:END -->
