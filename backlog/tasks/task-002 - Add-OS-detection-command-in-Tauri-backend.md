---
id: task-002
title: Add OS detection command in Tauri backend
status: Done
assignee: []
created_date: '2025-12-15 19:59'
updated_date: '2025-12-15 21:11'
labels: []
dependencies: []
ordinal: 10000
---

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->

# Plan for OS Detection Command

## Goal

Add a Tauri command to detect the operating system for platform-specific features in the Zinc IDE.

## Scope

- **In Scope:** Implement OS detection using Rust standard library, expose as Tauri command, handle Windows/Mac/Linux
- **Out of Scope:** Advanced OS information, version detection, hardware specs

## Risks

- Platform detection inaccuracies: Mitigation - use std::env::consts::OS
- Tauri command registration issues: Mitigation - follow Tauri documentation

## Dependencies

- Tauri backend setup
- Rust standard library

## Priority

Medium

## Logging / Observability

- Log detected OS on command invocation

## Implementation Plan (TODOs)

- [ ] **Step 1: Implement OS Detection Function**
    - [ ] Create function using std::env::consts::OS
    - [ ] Return OS as string (windows, macos, linux)
- [ ] **Step 2: Expose as Tauri Command**
    - [ ] Register command in main.rs
    - [ ] Add to invoke handler
- [ ] **Step 3: Test Command**
    - [ ] Invoke from frontend
    - [ ] Verify correct OS detection

## Docs

- [ ] Document command in backend docs if needed

## Testing

- [ ] Unit test for OS detection function
- [ ] Integration test for Tauri command

## Acceptance

- [ ] Command returns correct OS string
- [ ] No errors on different platforms

## Fallback Plan

Use hardcoded OS if detection fails

## References

- Tauri commands documentation
- Rust std::env documentation

## Complexity Check

- TODO Count: 5
- Depth: 1
- Cross-deps: 0
- **Decision:** Proceed
    <!-- SECTION:PLAN:END -->
