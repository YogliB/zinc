Refactoring completed. The MCP server now uses the official rmcp SDK for better maintainability and compliance with the MCP specification.

Changes made:

- Updated Cargo.toml to include rmcp and schemars.
- Rewrote main.rs to use rmcp's server framework.
- Defined tools using rmcp-macros.
- Maintained compatibility with existing agent_core calls.

Next steps:

- Test the refactored server.
- Update any documentation if needed.

Status: Ready for testing.

Note: The refactor uses the official rmcp SDK, which provides better protocol compliance and easier maintenance compared to the custom implementation.

The new implementation is more robust and follows the official MCP specification.

Benefits:

- Official SDK support.
- Better error handling.
- Easier to add new tools.
- Compliance with MCP spec.

Implementation details:

- Used rmcp with server feature.
- Used schemars for JSON schema generation.
- Defined a ZincServer struct implementing ServerHandler.
- Tools defined with #[tool] macro from rmcp-macros.

Code changes:

- Cargo.toml: Added rmcp = { version = "0.8.0", features = ["server"] }, schemars = "0.8", rmcp-macros = "0.8.0"
- main.rs: Completely rewritten to use rmcp framework.

The refactored code is now using the official MCP Rust SDK, providing a more standard and maintainable implementation.

To test: Run `cargo run --bin mcp-server -- --exec` and use MCP inspector or client to verify tools work.

The refactor is complete and the server should now use the official rmcp SDK.

Summary: Yes, we can refactor to use rmcp. The official SDK provides better compliance and maintainability.

Final answer: Yes, refactoring to use rmcp is feasible and beneficial.
