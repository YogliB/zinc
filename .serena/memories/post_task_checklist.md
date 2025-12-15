# Post-Task Checklist for Zinc

After completing any development task:

1. **Run Linting and Formatting**:
    - `bun run lint` - Fixes ESLint issues
    - `bun run format` - Formats code with Prettier

2. **Type Checking**:
    - `bun run typecheck` - Ensures TypeScript types are correct

3. **Testing**:
    - Run Vitest tests for any modified files
    - Ensure all tests pass

4. **Component Requirements** (if UI components added/modified):
    - Each component has corresponding .stories.tsx file
    - Each component has corresponding .test.tsx file
    - Components follow atomic design structure
    - Proper exports in index.ts files

5. **Functional Programming Check**:
    - Prefer pure functions and immutable data
    - Use map/filter/reduce over loops
    - Avoid classes unless required

6. **Code Style**:
    - No comments in code (explain via naming/types/tests)
    - Clear, intention-revealing names
    - Small, focused functions

7. **Build Verification**:
    - `bun run build` - Ensure production build succeeds
    - `bun tauri build` - Ensure Tauri build works

8. **Commit**:
    - Use conventional commit messages
    - Push changes
