---
id: task-009
title: Create Tree Item Molecule
status: Done
assignee: []
created_date: '2025-12-15 20:48'
updated_date: '2025-12-15 21:11'
labels: []
dependencies: []
ordinal: 4000
---

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

# Plan for Create Tree Item Molecule

## Goal

Create a TreeItem molecule that displays a single tree node with icon, name, and collapsible functionality for folders.

## Scope

- **In Scope:** TreeItem component using icon atoms and shadcn Collapsible
- **Out of Scope:** Recursive rendering, full tree logic

## Risks

- Collapsible component not suitable for tree: Mitigate by testing with shadcn Collapsible or using custom

## Dependencies

- FolderIcon and FileIcon atoms (task-008)

## Priority

Medium

## Logging / Observability

- None

## Implementation Plan (TODOs)

- [ ] **Set up component structure**
    - [ ] Create molecules/tree-item/tree-item.tsx
    - [ ] Define props interface: node (TreeNode), onToggle?, level?
- [ ] **Implement display logic**
    - [ ] Import FolderIcon/FileIcon based on node.type
    - [ ] Display node.name
- [ ] **Add collapsible for folders**
    - [ ] Use shadcn Collapsible for folders with children
    - [ ] Use Signals for expand state
- [ ] **Handle interactions**
    - [ ] Toggle expand on click
    - [ ] Recursive render children if expanded
- [ ] **Create exports**
    - [ ] Create molecules/tree-item/index.ts
    - [ ] Update molecules/index.ts

## Docs

- None

## Testing

- [ ] Render test for file item
- [ ] Render test for folder item
- [ ] Interaction test for expand/collapse

## Acceptance

- [ ] TreeItem molecule created, displays icon and name
- [ ] Collapsible for folders with children
- [ ] Exported from molecules/index.ts

## Fallback Plan

If Collapsible doesn't work, implement custom expand/collapse with CSS.

## References

- shadcn Collapsible docs
- Preact Signals docs

## Complexity Check

- TODO Count: 10
- Depth: 2
- Cross-deps: 1
- **Decision:** Proceed
    <!-- SECTION:PLAN:END -->
