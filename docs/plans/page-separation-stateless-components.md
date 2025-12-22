# Page Separation and Stateless Components Plan v1.0

## Goal

Restructure the application to have separate WelcomePage and EditorPage components with clear separation of concerns, ensuring only pages contain state while all lower-level components (atoms, molecules, organisms, templates) remain pure and stateless.

## Scope

- **In Scope:**
    - Create new EditorPage component
    - Modify WelcomePage to be welcome-only
    - Update app.tsx routing
    - Move editor logic from WelcomePage to EditorPage
    - Ensure all components below pages are pure (receive props, emit events)
- **Out of Scope:**
    - UI design changes
    - Adding new features
    - Modifying existing component APIs
    - Changing styling or theming

## Risks

- **Navigation breakage**: App fails to route between pages correctly
    - Mitigation: Test navigation thoroughly, implement fallback redirects
- **State loss during transition**: Project data not properly passed between pages
    - Mitigation: Use URL params for initial data, validate state initialization
- **Component purity violations**: Lower-level components accidentally retain state
    - Mitigation: Code review for side effects, ensure all data comes via props

## Dependencies

- Existing wouter-preact routing setup in app.tsx
- Current editor-store signals for state management
- Tauri invoke API for file operations

## Priority

High - This is an architectural improvement that aligns with Atomic Design and functional programming principles

## Logging / Observability

- Console logs for navigation events (page transitions)
- Error logging for failed file operations
- State initialization logs in EditorPage

## Implementation Plan (TODOs)

- [ ] **Step 1: Create EditorPage structure**
    - [ ] Create `src/pages/editor/` directory with component, stories, test, and index files
    - [ ] Extract editor-related logic from WelcomePage into EditorPage
    - [ ] Implement URL param reading for project path
    - [ ] Set up EditorPage to render EditorView template

- [ ] **Step 2: Modify WelcomePage**
    - [ ] Remove conditional rendering (EditorView vs WelcomeScreen)
    - [ ] Simplify to only render WelcomeScreen
    - [ ] Add navigation to `/editor` on successful project open
    - [ ] Pass project path as URL search param

- [ ] **Step 3: Update app.tsx routing**
    - [ ] Add `/editor` route for EditorPage
    - [ ] Ensure os prop is passed to both pages
    - [ ] Test route transitions

- [ ] **Step 4: Ensure component purity**
    - [ ] Review all atoms, molecules, organisms, templates for state/statelessness
    - [ ] Remove any direct state access from components
    - [ ] Verify all data flows through props and event callbacks
    - [ ] Update component interfaces if needed for purity

- [ ] **Step 5: Update state management**
    - [ ] Scope editor-store usage to EditorPage only
    - [ ] Initialize store from URL params in EditorPage
    - [ ] Remove editor state from WelcomePage

## Docs

- [ ] Update `docs/ARCHITECTURE.md` to reflect new page separation
- [ ] Add comments in code explaining the stateless component principle

## Testing

- [ ] Unit tests for pure components (props in, events out)
- [ ] Integration tests for page navigation
- [ ] E2E tests for full welcome → editor flow
- [ ] Test state persistence across page transitions

## Acceptance

- [ ] WelcomePage only shows welcome screen and handles project opening
- [ ] EditorPage handles all editor functionality independently
- [ ] Navigation between pages works via URL changes
- [ ] All components below pages are pure (no internal state)
- [ ] App maintains existing functionality without regressions

## Fallback Plan

If issues arise during implementation:

- Revert WelcomePage to original conditional rendering
- Keep EditorPage as separate component but route to it conditionally
- Gradually migrate state instead of big-bang change
- Roll back to previous commit if navigation breaks

## References

- Atomic Design methodology (https://atomicdesign.bradfrost.com/)
- Project AGENTS.md rules for functional programming and component structure
- Wouter routing documentation

## Complexity Check

- TODO Count: 18
- Depth: 2 (main steps with subtasks)
- Cross-deps: 2 (routing affects both pages, state affects components)
- **Decision:** Proceed - manageable scope for single PR, focused on architecture
