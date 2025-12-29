## Code Style

- Prefer **functional programming**:
    - Use **pure functions**, **composition**, and **immutable data**.
    - Favor `map`, `filter`, `reduce` over loops.
    - Avoid `class` unless required by external APIs.
    - Use **closures** for encapsulation.
    - Always return new data structures.
- Prefer **native tooling**; use third-party libraries only if well-maintained and adds clear value.

## UI Design

- Apply **Atomic Design**: atoms → molecules → organisms → templates → pages.  
  [Reference](https://bradfrost.com/blog/post/atomic-web-design/)
- Use **Preact** for building UI components.
- Use **Signals** for reactive state management.
- Use **TailwindCSS** for utility-first styling.
- Use **Shadcn** for pre-built UI components.
- NEVER modify Shadcn components in the `ui/` directory or suggest to do so, unless given specific instructions.
- Shadcn components in the `ui/` directory do not require corresponding stories files, test files, or the subdirectory structure.
- Every component file must have a corresponding stories file.
- Each component should have its own subdirectory containing the component file, test file, and stories file (e.g., `atoms/button/button.tsx`, `atoms/button/button.stories.tsx`, `atoms/button/button.test.tsx`).
- Each component subdirectory must include an `index.ts` or `index.tsx` file that exports the component.
- The main directories (`atoms`, `molecules`, etc.) must have an `index.ts` or `index.tsx` file that exports all components within them.

### Signal Guidelines

- **Component state**: Use `useSignal()` inside components, NEVER module-level `signal()`.
- **Global state**: Only use module-level `signal()` for truly global app state (e.g., `isCommandPaletteOpen`, `appMode`).
- **Controlled inputs**: Avoid controlling third-party component inputs with signals unless necessary; prefer uncontrolled when possible.
- **Memoization**: Always memoize computed values derived from props using `useMemo()`.
- **Callbacks**: Memoize callbacks that depend on signals or props using `useCallback()`.
- **Dependency arrays**: Signals don't need to be in useEffect dependency arrays; add `// eslint-disable-next-line react-hooks/exhaustive-deps` when needed.
- **Event handling**: Prevent event propagation with `event.stopPropagation()` when global listeners might conflict with component handlers.

## Tooling

- Use **bun** as the package manager.
- Do **not** modify ESLint or Vite configs without explicit permission.
- NEVER suppress ESLint rules unless given explicit permission from the user.

## Testing

- Use **Vitest** for all tests.
- Run tests using `bun run test` (not `bun test`).
- Each `.ts`/`.tsx` file must have a corresponding test file.
- After implementation:
    - Run ESLint and TypeScript checks.
    - Execute tests.

## Documentation

- Do **not** add new docs without explicit permission.
- Existing docs:
    - `.github/PULL_REQUEST_TEMPLATE.md`
    - `AGENTS.md`
    - `LICENSE.md`
    - `README.md`
    - `docs/ARCHITECTURE.md`
    - `docs/README.md`
    - `docs/SECURITY.md`
    - `docs/SETUP.md`
    - `docs/USAGE.md`
