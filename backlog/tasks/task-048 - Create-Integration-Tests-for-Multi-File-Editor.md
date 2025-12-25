---
id: task-048
title: Create Integration Tests for Multi-File Editor
status: Done
assignee: []
created_date: '2025-12-25 18:02'
updated_date: '2025-12-25 18:36'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Create src/pages/editor/editor.integration.test.tsx
2. Import necessary testing utilities from @testing-library/preact
3. Import EditorPage component
4. Mock @tauri-apps/api/core invoke function
5. Setup beforeEach to reset editor store and mocks
6. Write test: "opens file and creates tab"
    - Mock invoke to return file content
    - Simulate file tree click
    - Assert tab appears with file name
7. Write test: "opens multiple files and shows multiple tabs"
    - Open 3 files sequentially
    - Assert 3 tabs exist
8. Write test: "switches tabs and changes content"
    - Open 2 files
    - Click second tab
    - Assert content changes
9. Write test: "closes tab and switches to another"
    - Open 2 files
    - Close first tab
    - Assert only 1 tab remains, second is active
10. Write test: "closes last tab and shows empty state"
    - Open 1 file
    - Close it
    - Assert empty state message appears
11. Write test: "clicking same file twice doesn't duplicate"
    - Open file once
    - Click same file again
    - Assert only 1 tab exists
12. Write test: "auto-save works for active file"
    - Open file, edit content
    - Wait for debounce
    - Assert write_file invoked with correct path
13. Run tests: bun run test
14. Run checks
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

- Mock Tauri's invoke function using vi.mock
- Mock file system responses (list_directory, read_file, write_file)
- Use @testing-library/preact for rendering and user interactions
- Use userEvent or fireEvent for simulating clicks
- Reset store signals between tests using resetEditorState
- Consider using fake timers for debounce testing
  <!-- SECTION:NOTES:END -->
