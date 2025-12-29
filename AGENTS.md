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

- **Local state**: Use `useSignal()` and `useComputed()` hooks inside components.
- **Global state**: Use `signal()` and `computed()` outside components for shared app state.
- **Passing signals**: Pass signals as props/context—components re-render only when accessing `.value`.
- **JSX optimization**: Use signals directly in JSX (e.g., `{count}`) instead of accessing `.value`.
- **Memoization**: Memoize callbacks with `useCallback()` when they depend on props.
- **Derived state**: Use `computed()` to derive state; maintain single source of truth.
- **Effects**: Use `effect()` for side effects outside components; return cleanup function when needed.

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
