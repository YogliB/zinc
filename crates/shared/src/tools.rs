use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ReadFileParams {
    pub path: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WriteFileParams {
    pub path: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ListFilesParams {
    pub path: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RunCommandParams {
    pub command: String,
    pub args: Vec<String>,
}

pub fn read_file(params: ReadFileParams) -> Result<String, std::io::Error> {
    std::fs::read_to_string(&params.path)
}

pub fn write_file(params: WriteFileParams) -> Result<(), std::io::Error> {
    std::fs::write(&params.path, &params.content)
}

pub fn list_files(params: ListFilesParams) -> Result<Vec<String>, std::io::Error> {
    let entries = std::fs::read_dir(&params.path)?;
    let mut files = Vec::new();
    for entry in entries {
        let entry = entry?;
        files.push(entry.file_name().to_string_lossy().to_string());
    }
    Ok(files)
}

pub fn run_command(params: RunCommandParams) -> Result<String, std::io::Error> {
    let output = std::process::Command::new(&params.command)
        .args(&params.args)
        .output()?;
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
