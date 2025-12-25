---
id: task-049
title: Manual Testing and UI Polish
status: To Do
assignee: []
created_date: '2025-12-25 18:02'
labels:
    - testing
    - manual
    - polish
dependencies:
    - task-048
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Perform comprehensive manual testing of the multi-file editor in development mode with real file system interactions, and polish any rough edges discovered.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Can open project in dev mode
- [ ] #2 Can open multiple files via file tree
- [ ] #3 Tabs appear correctly for each file
- [ ] #4 Clicking tabs switches content
- [ ] #5 Close button (X) closes tabs
- [ ] #6 Auto-save works when editing active file
- [ ] #7 Tab overflow handled gracefully (horizontal scroll or similar)
- [ ] #8 Long file names truncated properly
- [ ] #9 No console errors
- [ ] #10 Accessibility: tab focus works with keyboard
- [ ] #11 Edge case tested: special characters in filenames
  <!-- AC:END -->
