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

- Use **npm as package manager** for dependency management and script execution.
- Use **Vitest** for testing UI components.
- Use **esbuild** for production bundling.
- Use **Node.js** for production runtime.
- Only use external dependencies when necessary alternatives are insufficient or unavailable.

## File Editing

- **NEVER** edit config files unless specifically requested to. Forbidden files:
    - `eslint.config.mjs`
    - `knip.json`
    - `tsconfig.json`
    - `tauri.conf.json`
    - `Cargo.toml`
- **NEVER** disable eslint rules unless given a direct and clear instruction to do so

## Git Operations

- **NEVER** use `--no-verify` flag when committing or pushing to git
- Pre-commit and pre-push hooks exist for a reason and must not be bypassed
- If hooks fail, fix the underlying issues rather than skipping validation

## Documentation Structure

- **NEVER** create new documentation files in the project root or `docs/` folder.
- The following documentation files are **sacred** and must be preserved:
    - **Root**: `AGENTS.md`, `README.md`
    - **docs/**: `ARCHITECTURE.md`, `CONTRIBUTING.md`, `README.md`, `SECURITY.md`, `SETUP.md`, `USAGE.md`
- All documentation must be added to existing files only.
- If you are 99% certain a new documentation file must be created:
    - **STOP** and alert the user about the need
    - **DO NOT** create the file unless explicitly approved by the user
    - Explain why existing files cannot accommodate the content

## Test Structure

- Test directories in packages must have only `unit/`, `integration/`, and `e2e/` subdirs (excluding `helpers/`).
- Each package must have one `test` script per subdir in addition to a general `test` script.
- CI must have separate test steps per package.
