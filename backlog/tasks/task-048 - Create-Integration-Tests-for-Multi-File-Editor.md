---
id: task-048
title: Create Integration Tests for Multi-File Editor
status: To Do
assignee: []
created_date: '2025-12-25 18:02'
labels:
    - testing
    - integration
dependencies:
    - task-047
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Create comprehensive integration tests for the full multi-file editor flow, from opening files through the file tree to switching and closing tabs.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Integration test file created: src/pages/editor/editor.integration.test.tsx
- [ ] #2 Test: open file creates tab
- [ ] #3 Test: open multiple files creates multiple tabs
- [ ] #4 Test: switch tabs changes active content
- [ ] #5 Test: close tab removes it and switches to another
- [ ] #6 Test: close last tab shows empty state
- [ ] #7 Test: clicking same file twice doesn't duplicate
- [ ] #8 Test: auto-save works for active file
- [ ] #9 All 7+ test cases pass
- [ ] #10 Tests use proper mocking for Tauri invoke
- [ ] #11 ESLint and TypeScript checks pass
  <!-- AC:END -->
