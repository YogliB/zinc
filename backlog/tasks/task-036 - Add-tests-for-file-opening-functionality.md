---
id: task-036
title: Add tests for file opening functionality
status: Done
assignee: []
created_date: '2025-12-21 07:57'
updated_date: '2025-12-21 08:14'
labels: []
dependencies: []
---

## Description

Added tests for file opening functionality in EditorView:

- Extended existing EditorView test suite
- Added test case to verify onSelect callback is triggered when a file is clicked
- Test simulates user clicking on a file in the file tree
- Ensures file selection mechanism works correctly

## Implementation

- Updated editor-view.test.tsx with new test case
- Used fireEvent to simulate file click interactions
- Verified that onSelect prop receives the correct TreeNode
- Maintained existing test structure and patterns
