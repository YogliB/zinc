build:
    cargo build
    cd crates/ide && bun run build

test:
    cargo test
    cd crates/ide && bun run test

test-ide-ui:
    cd crates/ide && bun run test

dev:
    cargo run --package mcp &
    cd crates/ide && bun run tauri dev

dev-ide:
    cd crates/ide && bun run tauri dev

clean:
    cargo clean
    cd crates/ide && rm -rf node_modules dist && bun install

lint:
    cargo clippy

format:
    bunx prettier --write .
    cargo fmt

format-ide:
    cd crates/ide && bunx prettier --write .

storybook:
    cd crates/ide && bun run storybook
