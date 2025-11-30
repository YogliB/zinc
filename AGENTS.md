# Agent Guidelines

## Code Style

### Prefer Functional Programming

- Use **pure functions** over classes and methods.
- Favor **composition** over inheritance.
- Use **immutable data** — avoid mutating state.
- Prefer **higher-order functions** (`map`, `filter`, `reduce`) over loops.
- Avoid `class` syntax unless interfacing with APIs that require it.
- Use **closures** for encapsulation instead of private class members.
- Return new data structures rather than modifying existing ones.

## Testing

- Run tests using the `test:ai` script: `bun run test:ai`
