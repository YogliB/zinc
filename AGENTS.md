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
