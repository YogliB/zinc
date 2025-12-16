---
id: task-026
title: Move organisms directory from src/organisms to src/components/organisms
status: To Do
assignee: []
created_date: '2025-12-16 13:05'
updated_date: '2025-12-16 13:07'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Move the organisms directory from src/organisms to src/components/organisms to consolidate all atomic component directories under the src/components folder, aligning with the project's UI design rules.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Organisms directory exists at src/components/organisms
- [ ] #2 Organisms directory no longer exists at src/organisms
- [ ] #3 All files and subdirectories are preserved in the move
  <!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

Use the move_path tool to relocate the entire organisms directory and its contents to src/components/organisms.

<!-- SECTION:PLAN:END -->
