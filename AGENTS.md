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
- Every component file must have a corresponding stories file.
- Each component should have its own subdirectory containing the component file, test file, and stories file (e.g., `atoms/button/button.tsx`, `atoms/button/button.stories.tsx`, `atoms/button/button.test.tsx`).
- Each component subdirectory must include an `index.ts` or `index.tsx` file that exports the component.
- The main directories (`atoms`, `molecules`, etc.) must have an `index.ts` or `index.tsx` file that exports all components within them.

## Tooling

- Do **not** modify ESLint or Vite configs without explicit permission.

## Testing

- Use **Vitest** for all tests.
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
