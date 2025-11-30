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

## Dependencies

- Prefer **native Bun tools and libraries** when possible (e.g., `bun:test`, `bun:sqlite`, built-in APIs).
- Only use external dependencies when Bun's native alternatives are insufficient or unavailable.

## File Editing

- **NEVER** edit config files unless specifically requested to.

## Documentation Structure

- **NEVER** create new documentation files in the project root or `docs/` folder.
- The following documentation files are **sacred** and must be preserved:
    - **Root**: `LICENCE.md`, `AGENTS.md`, `README.md`
    - **docs/**: `ARCHITECTURE.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `README.md`, `ROADMAP.md`, `SECURITY.md`, `SETUP.md`, `TESTING.md`, `USAGE.md`
- All documentation must be added to existing files only.
- If you are 99% certain a new documentation file must be created:
    - **STOP** and alert the user about the need
    - **DO NOT** create the file unless explicitly approved by the user
    - Explain why existing files cannot accommodate the content

## Testing

- Run tests using the `test:ai` script: `bun run test:ai`
