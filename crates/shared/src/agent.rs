use reqwest::Client;

#[derive(Debug)]
pub struct Agent {
    openrouter_api_key: String,
    model: String,
    client: Client,
}

impl Agent {
    pub fn new(openrouter_api_key: String, model: String) -> Self {
        Self {
            openrouter_api_key,
            model,
            client: Client::new(),
        }
    }

    pub async fn handle_message(
        &self,
        message: String,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let response = self.client
            .post("https://openrouter.ai/api/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", self.openrouter_api_key))
            .json(&serde_json::json!({
                "model": self.model,
                "messages": [{"role": "user", "content": message}],
                "tools": [
                    {
                        "type": "function",
                        "function": {
                            "name": "read_file",
                            "description": "Read the contents of a file",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "path": {"type": "string", "description": "The file path to read"}
                                },
                                "required": ["path"]
                            }
                        }
                    },
                    {
                        "type": "function",
                        "function": {
                            "name": "write_file",
                            "description": "Write content to a file",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "path": {"type": "string", "description": "The file path to write to"},
                                    "content": {"type": "string", "description": "The content to write"}
                                },
                                "required": ["path", "content"]
                            }
                        }
                    },
                    {
                        "type": "function",
                        "function": {
                            "name": "list_files",
                            "description": "List files in a directory",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "path": {"type": "string", "description": "The directory path to list"}
                                },
                                "required": ["path"]
                            }
                        }
                    },
                    {
                        "type": "function",
                        "function": {
                            "name": "run_command",
                            "description": "Run a command",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "command": {"type": "string", "description": "The command to run"},
                                    "args": {"type": "array", "items": {"type": "string"}, "description": "The arguments for the command"}
                                },
                                "required": ["command", "args"]
                            }
                        }
                    }
                ]
            }))
            .send()
            .await?
            .json::<serde_json::Value>()
            .await?;

        // Parse response and call tool if needed
        if let Some(tool_calls) = response["choices"][0]["message"]["tool_calls"].as_array() {
            for tool_call in tool_calls {
                let function_name = tool_call["function"]["name"].as_str().unwrap();
                let args: serde_json::Value =
                    serde_json::from_str(tool_call["function"]["arguments"].as_str().unwrap())?;
                match function_name {
                    "read_file" => {
                        let params: crate::tools::ReadFileParams = serde_json::from_value(args)?;
                        let result = crate::tools::read_file(params)?;
                        return Ok(result);
                    }
                    "write_file" => {
                        let params: crate::tools::WriteFileParams = serde_json::from_value(args)?;
                        crate::tools::write_file(params)?;
                        return Ok("File written successfully".to_string());
                    }
                    "list_files" => {
                        let params: crate::tools::ListFilesParams = serde_json::from_value(args)?;
                        let result = crate::tools::list_files(params)?;
                        return Ok(serde_json::to_string(&result)?);
                    }
                    "run_command" => {
                        let params: crate::tools::RunCommandParams = serde_json::from_value(args)?;
                        let result = crate::tools::run_command(params)?;
                        return Ok(result);
                    }
                    _ => {}
                }
            }
        }

        // If no tool call, return the content
        Ok(response["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("No response")
            .to_string())
    }
}
