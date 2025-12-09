build:
    cargo build
    cd crates/ide && npm run build

test:
    cargo test
    cd crates/ide && npm test

dev:
    cargo run --package mcp &
    cd crates/ide && bun tauri dev

dev-ide:
    cd crates/ide && bun tauri dev

clean:
    cargo clean
    cd crates/ide && rm -rf node_modules dist && bun install

lint:
    cargo clippy

format:
    bunx prettier --write .
    cargo fmt
