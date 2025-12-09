# Setup Instructions

## Running the MCP Server

The MCP server is a Rust binary that exposes tools via stdio JSON-RPC.

To run it:

1. Build the server:

   ```
   cargo build --manifest-path crates/mcp-server/Cargo.toml
   ```

2. Run with --exec flag:
   ```
   cargo run --manifest-path crates/mcp-server/Cargo.toml -- --exec
   ```

The server reads JSON-RPC requests from stdin and writes responses to stdout.

Example request:

```json
{ "jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {} }
```

Available tools: read_file, write_file, list_files, run_command.
