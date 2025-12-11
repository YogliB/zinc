## Code Style

- Prefer **functional programming**:
    - Use **pure functions**, **composition**, and **immutable data**.
    - Favor `map`, `filter`, `reduce` over loops.
    - Avoid `class` syntax unless required by external APIs.
    - Use **closures** for encapsulation.
    - Always return new data structures.

## UI Design

- Follow **Atomic Design** principles: atoms → molecules → organisms → templates → pages.  
  [Reference](https://bradfrost.com/blog/post/atomic-web-design/)

## Technologies

- **IDE App**: SvelteKit, Tauri, TailwindCSS, Flowbite, Vitest, Storybook.
- Every component must include **stories** (Storybook) and **tests** (Vitest).

## Package Manager

- Use **bun** for IDE app (`create/ide`).

## File Editing

- **Do NOT edit** config files unless explicitly instructed:
    - `eslint.config.mjs`, `knip.json`, `tsconfig.json`, `tauri.conf.json`, `Cargo.toml`, `vite.config.ts`, `vitest.config.ts`
- Never disable linting rules without direct approval.

## Git Operations

- Never use `--no-verify` when committing/pushing.
- Fix hook failures instead of bypassing them.

## Documentation

- Do NOT create new docs in root or `docs/`.
- Preserve these files:
    - **Root**: `AGENTS.md`, `README.md`
    - **docs/**: `ARCHITECTURE.md`, `CONTRIBUTING.md`, `README.md`, `SECURITY.md`, `SETUP.md`, `USAGE.md`
- Add content only to existing files.
- If new doc seems necessary:
    - STOP and alert the user.
    - Explain why existing files cannot accommodate it.
