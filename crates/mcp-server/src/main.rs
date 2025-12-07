use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use serde::{Deserialize, Serialize};
use serde_json;

#[derive(Deserialize)]
struct Request {
    jsonrpc: String,
    id: Option<u64>,
    method: String,
    params: Option<serde_json::Value>,
}

#[derive(Serialize)]
struct Response {
    jsonrpc: String,
    id: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    result: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<Error>,
}

#[derive(Serialize)]
struct Error {
    code: i32,
    message: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() > 1 && args[1] == "--exec" {
        run_stdio().await?;
    } else {
        eprintln!("Usage: {} --exec", args[0]);
    }
    Ok(())
}

async fn run_stdio() -> Result<(), Box<dyn std::error::Error>> {
    let stdin = tokio::io::stdin();
    let mut stdout = tokio::io::stdout();
    let mut reader = BufReader::new(stdin);
    let mut line = String::new();

    loop {
        line.clear();
        match reader.read_line(&mut line).await {
            Ok(0) => break, // EOF
            Ok(_) => {
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    continue;
                }
                eprintln!("Received: {}", trimmed);
                match serde_json::from_str::<Request>(trimmed) {
                    Ok(req) => {
                        let response = handle_request(req).await;
                        let response_json = serde_json::to_string(&response)?;
                        stdout.write_all(response_json.as_bytes()).await?;
                        stdout.write_all(b"\n").await?;
                        stdout.flush().await?;
                        eprintln!("Sent: {}", response_json);
                    }
                    Err(e) => {
                        eprintln!("Parse error: {}", e);
                        let error_resp = Response {
                            jsonrpc: "2.0".to_string(),
                            id: None,
                            result: None,
                            error: Some(Error {
                                code: -32700,
                                message: "Parse error".to_string(),
                            }),
                        };
                        let error_json = serde_json::to_string(&error_resp)?;
                        stdout.write_all(error_json.as_bytes()).await?;
                        stdout.write_all(b"\n").await?;
                        stdout.flush().await?;
                    }
                }
            }
            Err(e) => {
                eprintln!("Read error: {}", e);
                break;
            }
        }
    }
    Ok(())
}

async fn handle_request(req: Request) -> Response {
    match req.method.as_str() {
        "initialize" => {
            // Basic initialize response
            let result = serde_json::json!({
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {}
                },
                "serverInfo": {
                    "name": "zinc-mcp-server",
                    "version": "0.1.0"
                }
            });
            Response {
                jsonrpc: "2.0".to_string(),
                id: req.id,
                result: Some(result),
                error: None,
            }
        }
        "tools/list" => {
            let tools = vec![
                serde_json::json!({
                    "name": "read_file",
                    "description": "Read the contents of a file",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "path": {"type": "string"}
                        },
                        "required": ["path"]
                    }
                }),
                serde_json::json!({
                    "name": "write_file",
                    "description": "Write content to a file",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "path": {"type": "string"},
                            "content": {"type": "string"}
                        },
                        "required": ["path", "content"]
                    }
                }),
                serde_json::json!({
                    "name": "list_files",
                    "description": "List files in a directory",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "path": {"type": "string"}
                        },
                        "required": ["path"]
                    }
                }),
                serde_json::json!({
                    "name": "run_command",
                    "description": "Run a shell command",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "command": {"type": "string"},
                            "args": {"type": "array", "items": {"type": "string"}}
                        },
                        "required": ["command"]
                    }
                }),
            ];
            let result = serde_json::json!({ "tools": tools });
            Response {
                jsonrpc: "2.0".to_string(),
                id: req.id,
                result: Some(result),
                error: None,
            }
        }
        "tools/call" => {
            if let Some(params) = req.params {
                if let Some(tool_name) = params.get("name").and_then(|v| v.as_str()) {
                    let args = params.get("arguments").cloned();
                    match handle_tool_call(tool_name, args).await {
                        Ok(result) => Response {
                            jsonrpc: "2.0".to_string(),
                            id: req.id,
                            result: Some(result),
                            error: None,
                        },
                        Err(e) => Response {
                            jsonrpc: "2.0".to_string(),
                            id: req.id,
                            result: None,
                            error: Some(Error {
                                code: -32603,
                                message: e.to_string(),
                            }),
                        },
                    }
                } else {
                    Response {
                        jsonrpc: "2.0".to_string(),
                        id: req.id,
                        result: None,
                        error: Some(Error {
                            code: -32602,
                            message: "Invalid params".to_string(),
                        }),
                    }
                }
            } else {
                Response {
                    jsonrpc: "2.0".to_string(),
                    id: req.id,
                    result: None,
                    error: Some(Error {
                        code: -32602,
                        message: "Invalid params".to_string(),
                    }),
                }
            }
        }
        _ => Response {
            jsonrpc: "2.0".to_string(),
            id: req.id,
            result: None,
            error: Some(Error {
                code: -32601,
                message: "Method not found".to_string(),
            }),
        },
    }
}

async fn handle_tool_call(tool_name: &str, args: Option<serde_json::Value>) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
    match tool_name {
        "read_file" => {
            if let Some(args) = args {
                let path: String = serde_json::from_value(args.get("path").unwrap().clone())?;
                let content = agent_core::read_file(agent_core::ReadFileParams { path })?;
                Ok(serde_json::json!({ "content": content }))
            } else {
                Err("Missing arguments".into())
            }
        }
        "write_file" => {
            if let Some(args) = args {
                let path: String = serde_json::from_value(args.get("path").unwrap().clone())?;
                let content: String = serde_json::from_value(args.get("content").unwrap().clone())?;
                agent_core::write_file(agent_core::WriteFileParams { path, content })?;
                Ok(serde_json::json!({ "success": true }))
            } else {
                Err("Missing arguments".into())
            }
        }
        "list_files" => {
            if let Some(args) = args {
                let path: String = serde_json::from_value(args.get("path").unwrap().clone())?;
                let files = agent_core::list_files(agent_core::ListFilesParams { path })?;
                Ok(serde_json::json!({ "files": files }))
            } else {
                Err("Missing arguments".into())
            }
        }
        "run_command" => {
            if let Some(args) = args {
                let command: String = serde_json::from_value(args.get("command").unwrap().clone())?;
                let args_vec: Vec<String> = args.get("args").map(|a| serde_json::from_value(a.clone()).unwrap_or_default()).unwrap_or_default();
                let output = agent_core::run_command(agent_core::RunCommandParams { command, args: args_vec })?;
                Ok(serde_json::json!({ "output": output }))
            } else {
                Err("Missing arguments".into())
            }
        }
        _ => Err("Unknown tool".into()),
    }
}
