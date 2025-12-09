# Build the entire monorepo (Rust + JS)
build:
    cargo build
    cd crates/ide && npm run build

# Run tests for Rust and JS
test:
    cargo test
    cd crates/ide && npm test

# Start development servers (MCP in background, Tauri dev)
dev:
    cargo run --package mcp &
    cd crates/ide && npm run dev

# Clean build artifacts and dependencies
clean:
    cargo clean
    cd crates/ide && rm -rf node_modules dist

# Lint code (Rust clippy + JS eslint)
lint:
    cargo clippy
    cd crates/ide && npm run lint

# Format code (Rust fmt + JS prettier)
format:
    bunx prettier --write .
    cargo fmt

# Full CI check (build, test, lint)
check: build test lint
