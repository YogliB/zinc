## Code Style

- Prefer **functional programming**:
    - Use **pure functions**, **composition**, and **immutable data**.
    - Favor `map`, `filter`, `reduce` over loops.
    - Avoid `class` syntax unless required by external APIs.
    - Use **closures** for encapsulation.
    - Always return new data structures.
- Prefer native tooling over third-party libraries unless already installed. If a well-maintained library provides high value and simplifies code meaningfully, suggest it.

## UI Design

- Follow **Atomic Design** principles: atoms → molecules → organisms → templates → pages.  
  [Reference](https://bradfrost.com/blog/post/atomic-web-design/)

## Tooling

- Do not touch ESLint and Vite configs unless given explicit permission.

## Documentation

- Never add new documentation unless given explicit permission.
- Existing documentation files:
  - .github/PULL_REQUEST_TEMPLATE.md
  - AGENTS.md
  - LICENSE.md
  - README.md
  - docs/ARCHITECTURE.md
  - docs/README.md
  - docs/SECURITY.md
  - docs/SETUP.md
  - docs/USAGE.md
