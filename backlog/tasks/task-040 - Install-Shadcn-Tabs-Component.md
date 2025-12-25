---
id: task-040
title: Install Shadcn Tabs Component
status: To Do
assignee: []
created_date: '2025-12-25 18:00'
updated_date: '2025-12-25 18:00'
labels:
    - setup
    - dependency
    - ui
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->

Add the Shadcn UI Tabs component to the project to enable tab-based navigation for multiple open files in the editor. This is a prerequisite for the multi-file editor feature.

<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 Shadcn tabs component installed via CLI
- [ ] #2 Tabs component exists at src/components/ui/tabs.tsx
- [ ] #3 Can successfully import and use Tabs in test component
- [ ] #4 No build or TypeScript errors
  <!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

1. Navigate to zinc project directory
2. Run `npx shadcn@latest add tabs` command
3. Verify tabs.tsx created in src/components/ui/
4. Create simple test component importing Tabs to verify compatibility
5. Run `bun run typecheck` to ensure no TypeScript errors
6. Run `bun run build` to ensure build succeeds
7. Clean up test component
 <!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->

- Shadcn uses Radix UI primitives which should be compatible with Preact
- Test immediately after installation to catch any compatibility issues early
- The tabs component follows the ui/ directory exception (no stories/tests required per AGENTS.md)
  <!-- SECTION:NOTES:END -->
