# Suggested Commands for Zinc Development

## Development Workflow

- `bun install`: Install dependencies
- `bun run dev`: Start Vite dev server for frontend
- `bun tauri dev`: Start Tauri app in development mode
- `bun run build`: Build frontend for production
- `bun tauri build`: Build complete Tauri app

## Code Quality

- `bun run lint`: Run ESLint with auto-fix
- `bun run format`: Format all files with Prettier
- `bun run typecheck`: Check TypeScript types
- `bun run storybook`: Develop components with Storybook

## Testing

- `bun run test`: Run Vitest tests (assuming script exists)
- `bun run test:watch`: Run tests in watch mode (if configured)

## Utility

- `bun run backlog`: Manage tasks with Backlog.md
- `git status`: Check git status
- `git add . && git commit -m "message"`: Commit changes
- `git push`: Push to remote

## System Commands (macOS)

- `ls -la`: List files with details
- `cd <dir>`: Change directory
- `grep -r "pattern" .`: Search for patterns in files
- `find . -name "*.ts"`: Find TypeScript files
- `open .`: Open current directory in Finder
