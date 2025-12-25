---
id: task-041
title: Add OpenFile Type Definition
status: To Do
assignee: []
created_date: '2025-12-25 18:00'
updated_date: '2025-12-25 18:00'
labels:
    - types
    - foundation
dependencies:
    - task-040
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Extend the type definitions to support multiple open files by adding an OpenFile interface that represents a single open file with its metadata and content.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 OpenFile interface added to src/lib/types.ts with path, name, and content fields
- [ ] #2 Interface properly exported
- [ ] #3 No TypeScript errors in types.ts
- [ ] #4 Interface follows existing code style
  <!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Open src/lib/types.ts
2. Add OpenFile interface with fields: path (string), name (string), content (string)
3. Export the interface
4. Run `bun run typecheck` to verify no errors
5. Commit changes
 <!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

- Keep the interface simple for MVP (no isDirty field yet)
- path should be the full file path (matches TreeNode.path)
- name is the display name (matches TreeNode.name)
- content is the raw file content string
  <!-- SECTION:NOTES:END -->
