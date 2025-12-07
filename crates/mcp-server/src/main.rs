// This MCP server implementation uses the rmcp SDK for protocol handling,
// providing a standardized and maintainable way to implement MCP tools.
use rmcp::{ErrorData, ServiceExt, ServerHandler, model::{InitializeRequestParam, InitializeResult, ServerCapabilities, ToolsCapability, Implementation, ListToolsResult, PaginatedRequestParam, CallToolRequestParam, CallToolResult, Tool, Content, ProtocolVersion}, service::{RequestContext, RoleServer}};
use tokio::io::{stdin, stdout};
use agent_core;
use serde::Deserialize;
use schemars::JsonSchema;
use std::sync::Arc;
use serde_json::{Value, Map};


#[derive(Default)]
struct ZincServer;

impl ZincServer {
    async fn read_file(&self, path: String) -> Result<String, ErrorData> {
        agent_core::read_file(agent_core::ReadFileParams { path })
            .map_err(|e| ErrorData::internal_error(format!("Failed to read file: {}", e), None))
    }

    async fn write_file(&self, path: String, content: String) -> Result<(), ErrorData> {
        agent_core::write_file(agent_core::WriteFileParams { path, content })
            .map_err(|e| ErrorData::internal_error(format!("Failed to write file: {}", e), None))
    }

    async fn list_files(&self, path: String) -> Result<Vec<String>, ErrorData> {
        agent_core::list_files(agent_core::ListFilesParams { path })
            .map_err(|e| ErrorData::internal_error(format!("Failed to list files: {}", e), None))
    }

    async fn run_command(&self, command: String, args: Vec<String>) -> Result<String, ErrorData> {
        agent_core::run_command(agent_core::RunCommandParams { command, args })
            .map_err(|e| ErrorData::internal_error(format!("Failed to run command: {}", e), None))
    }
}

impl ServerHandler for ZincServer {
    fn get_info(&self) -> InitializeResult {
        InitializeResult {
            protocol_version: ProtocolVersion::V_2024_11_05,
            capabilities: ServerCapabilities {
                tools: Some(ToolsCapability::default()),
                ..Default::default()
            },
            server_info: Implementation {
                name: "zinc-mcp-server".into(),
                version: "0.1.0".into(),
                icons: None,
                title: None,
                website_url: None,
            },
            instructions: None,
        }
    }

    fn initialize(
        &self,
        _request: InitializeRequestParam,
        _context: RequestContext<RoleServer>,
    ) -> impl std::future::Future<Output = Result<InitializeResult, ErrorData>> + Send + '_ {
        async move {
            eprintln!("initialize called");
            Ok(self.get_info())
        }
    }

    fn list_tools(
        &self,
        _cursor: Option<PaginatedRequestParam>,
        _context: RequestContext<RoleServer>,
    ) -> impl std::future::Future<Output = Result<ListToolsResult, ErrorData>> + Send + '_ {
        async move {
            let tools = vec![
                Tool {
                    name: "read_file".into(),
                    description: Some("Read the contents of a file".into()),
                    input_schema: {
                        let value = serde_json::to_value(schemars::schema_for!(ReadFileInput)).unwrap();
                        if let Value::Object(map) = value {
                            Arc::new(map)
                        } else {
                            Arc::new(Map::new())
                        }
                    },
                    annotations: None,
                    icons: None,
                    output_schema: None,
                    title: None,
                },
                Tool {
                    name: "write_file".into(),
                    description: Some("Write content to a file".into()),
                    input_schema: {
                        let value = serde_json::to_value(schemars::schema_for!(WriteFileInput)).unwrap();
                        if let Value::Object(map) = value {
                            Arc::new(map)
                        } else {
                            Arc::new(Map::new())
                        }
                    },
                    annotations: None,
                    icons: None,
                    output_schema: None,
                    title: None,
                },
                Tool {
                    name: "list_files".into(),
                    description: Some("List files in a directory".into()),
                    input_schema: {
                        let value = serde_json::to_value(schemars::schema_for!(ListFilesInput)).unwrap();
                        if let Value::Object(map) = value {
                            Arc::new(map)
                        } else {
                            Arc::new(Map::new())
                        }
                    },
                    annotations: None,
                    icons: None,
                    output_schema: None,
                    title: None,
                },
                Tool {
                    name: "run_command".into(),
                    description: Some("Run a shell command".into()),
                    input_schema: {
                        let value = serde_json::to_value(schemars::schema_for!(RunCommandInput)).unwrap();
                        if let Value::Object(map) = value {
                            Arc::new(map)
                        } else {
                            Arc::new(Map::new())
                        }
                    },
                    annotations: None,
                    icons: None,
                    output_schema: None,
                    title: None,
                },
            ];
            eprintln!("list_tools called, returning {} tools", tools.len());
            Ok(ListToolsResult { tools, next_cursor: None })
        }
    }

    fn call_tool(
        &self,
        param: CallToolRequestParam,
        _context: RequestContext<RoleServer>,
    ) -> impl std::future::Future<Output = Result<CallToolResult, ErrorData>> + Send + '_ {
        async move {
            match param.name.as_ref() {
                "read_file" => {
                    if let Some(args) = param.arguments {
                        let value = Value::Object(args);
                        let input: ReadFileInput = serde_json::from_value(value).map_err(|_| ErrorData::invalid_params("Invalid arguments for read_file", None))?;
                        let content = self.read_file(input.path).await?;
                        Ok(CallToolResult {
                            content: vec![Content::text(content)],
                            meta: None,
                            is_error: Some(false),
                            structured_content: None,
                        })
                    } else {
                        Err(ErrorData::invalid_params("Missing arguments for read_file", None))
                    }
                }
                "write_file" => {
                    if let Some(args) = param.arguments {
                        let value = Value::Object(args);
                        let input: WriteFileInput = serde_json::from_value(value).map_err(|_| ErrorData::invalid_params("Invalid arguments for write_file", None))?;
                        self.write_file(input.path, input.content).await?;
                        Ok(CallToolResult {
                            content: vec![Content::text("File written successfully".to_string())],
                            meta: None,
                            is_error: Some(false),
                            structured_content: None,
                        })
                    } else {
                        Err(ErrorData::invalid_params("Missing arguments for write_file", None))
                    }
                }
                "list_files" => {
                    if let Some(args) = param.arguments {
                        let value = Value::Object(args);
                        let input: ListFilesInput = serde_json::from_value(value).map_err(|_| ErrorData::invalid_params("Invalid arguments for list_files", None))?;
                        let files = self.list_files(input.path).await?;
                        Ok(CallToolResult {
                            content: vec![Content::text(format!("{:?}", files))],
                            meta: None,
                            is_error: Some(false),
                            structured_content: None,
                        })
                    } else {
                        Err(ErrorData::invalid_params("Missing arguments for list_files", None))
                    }
                }
                "run_command" => {
                    if let Some(args) = param.arguments {
                        let value = Value::Object(args);
                        let input: RunCommandInput = serde_json::from_value(value).map_err(|_| ErrorData::invalid_params("Invalid arguments for run_command", None))?;
                        let output = self.run_command(input.command, input.args).await?;
                        Ok(CallToolResult {
                            content: vec![Content::text(output)],
                            meta: None,
                            is_error: Some(false),
                            structured_content: None,
                        })
                    } else {
                        Err(ErrorData::invalid_params("Missing arguments for run_command", None))
                    }
                }
                _ => Err(ErrorData::invalid_request("Tool not found", None)),
            }
        }
    }
}

#[derive(Deserialize, JsonSchema)]
struct ReadFileInput {
    path: String,
}

#[derive(Deserialize, JsonSchema)]
struct WriteFileInput {
    path: String,
    content: String,
}

#[derive(Deserialize, JsonSchema)]
struct ListFilesInput {
    path: String,
}

#[derive(Deserialize, JsonSchema)]
struct RunCommandInput {
    command: String,
    #[serde(default)]
    args: Vec<String>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() > 1 && args[1] == "--exec" {
        let service = ZincServer::default();
        let transport = (stdin(), stdout());
        service.serve(transport).await?;
    } else {
        eprintln!("Usage: {} --exec", args[0]);
    }
    Ok(())
}
