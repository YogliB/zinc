---
id: task-027
title: Update import paths in affected files after moving atomic directories
status: Done
assignee: []
created_date: '2025-12-16 13:05'
updated_date: '2025-12-16 14:06'
labels: []
dependencies:
    - task-024
    - task-025
    - task-026
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Update relative import paths in files that reference the moved atomic directories (atoms, molecules, organisms) to reflect their new locations under src/components.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 All import statements in affected files are updated to the new paths
- [ ] #2 TypeScript compilation succeeds without import errors
- [ ] #3 No runtime errors due to broken imports
  <!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

Edit the following files to update import statements:\n- src/molecules/tree-item/tree-item.tsx: Change 'import { Icon } from '../../atoms';' to 'import { Icon } from '../../components/atoms';'\n- src/pages/welcome/welcome.tsx: Change 'import { Button } from '../../atoms';' to 'import { Button } from '../../components/atoms';'\n- src/organisms/file-tree/file-tree.tsx: Change 'import { TreeItem } from '../../molecules';' to 'import { TreeItem } from '../../components/molecules';'

<!-- SECTION:PLAN:END -->
