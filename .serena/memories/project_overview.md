# Zinc Project Overview

Zinc is an IDE application built using Tauri (Rust backend) and Preact (frontend). It's designed as a code editor with a focus on functional programming principles and atomic design for UI components.

## Tech Stack

- **Backend**: Rust with Tauri framework
- **Frontend**: Preact (React-compatible library), TypeScript
- **Styling**: TailwindCSS with utility-first approach
- **UI Components**: Shadcn/ui components
- **State Management**: Signals (Preact signals)
- **Build Tool**: Vite
- **Testing**: Vitest
- **Linting/Formatting**: ESLint, Prettier
- **Package Manager**: Bun

## Code Style and Conventions

- **Functional Programming**: Pure functions, composition, immutable data, map/filter/reduce over loops, closures for encapsulation
- **Atomic Design**: Components organized as atoms → molecules → organisms → templates → pages
- **No Comments**: Code must explain itself, no inline comments or docstrings
- **Naming**: Clear, intention-revealing names; functions as verbs, types as nouns; include units/context
- **Clean Code**: SRP, DRY, KISS, pure functions, readable > optimal, consistent style
- **Component Structure**: Each component in own subdirectory with component.tsx, stories.tsx, test.tsx, and index.ts export

## Development Commands

- `bun run dev`: Start development server
- `bun run build`: Build for production
- `bun run lint`: Run ESLint with auto-fix
- `bun run format`: Format code with Prettier
- `bun run typecheck`: TypeScript type checking
- `bun run storybook`: Run Storybook for component development
- `bun tauri dev`: Run Tauri app in development
- `bun tauri build`: Build Tauri app

## Testing

- Use Vitest for all tests
- Each .ts/.tsx file must have corresponding .test.tsx file
- Run tests after implementation

## Project Structure

- `src/`: Frontend source code
    - `atoms/`, `molecules/`, etc.: Atomic design directories
    - `lib/`: Utility libraries
    - `stories/`: Storybook stories
- `src-tauri/`: Tauri backend
- `docs/`: Documentation (currently empty)
- `backlog/`: Backlog.md files

## Guidelines

- Prefer native tooling over third-party libraries
- Do not modify ESLint/Vite configs without permission
- Do not add new docs without permission
- Use Husky for pre-commit hooks (lint-staged)
