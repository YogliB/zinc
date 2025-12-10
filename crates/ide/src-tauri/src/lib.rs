// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use rfd::FileDialog;
use serde::{Deserialize, Serialize};
use shared::Agent;
use std::fs;
use std::path;
use tauri::{AppHandle, Manager};

#[derive(Serialize, Deserialize)]
pub struct Settings {
    pub api_key: String,
    pub model: String,
    pub ai_enabled: bool,
}

#[derive(Serialize, Deserialize)]
pub struct FileNode {
    pub name: String,
    pub r#type: String,
    pub children: Option<Vec<FileNode>>,
    pub path: String,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn open_folder() -> Result<String, String> {
    let folder_path = FileDialog::new().pick_folder();
    match folder_path {
        Some(path) => Ok(path.to_string_lossy().to_string()),
        None => Err("No folder selected".to_string()),
    }
}

#[tauri::command]
fn read_directory(path: String) -> Result<Vec<FileNode>, String> {
    fn build_tree(dir_path: &path::Path) -> Result<Vec<FileNode>, String> {
        let mut nodes = Vec::new();
        for entry in fs::read_dir(dir_path).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            let name = path.file_name().unwrap().to_string_lossy().to_string();
            let node_path = path.to_string_lossy().to_string();
            if path.is_dir() {
                let children = build_tree(&path)?;
                nodes.push(FileNode {
                    name,
                    r#type: "folder".to_string(),
                    children: Some(children),
                    path: node_path,
                });
            } else {
                nodes.push(FileNode {
                    name,
                    r#type: "file".to_string(),
                    children: None,
                    path: node_path,
                });
            }
        }
        Ok(nodes)
    }
    let root_path = path::Path::new(&path);
    build_tree(root_path)
}

#[tauri::command]
fn open_file() -> Result<String, String> {
    let file_path = FileDialog::new().pick_file();
    match file_path {
        Some(path) => {
            let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
            if metadata.len() > 1_000_000 {
                return Err("File is too large (>1MB). Please select a smaller file.".to_string());
            }
            let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
            Ok(content)
        }
        None => Err("No file selected".to_string()),
    }
}

#[tauri::command]
fn save_file(_content: String) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
async fn load_settings(app: AppHandle) -> Result<Settings, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;
    let settings_path = app_data_dir.join("settings.json");
    if settings_path.exists() {
        let content = tokio::fs::read_to_string(&settings_path)
            .await
            .map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
    } else {
        let defaults = Settings {
            api_key: "".to_string(),
            model: "anthropic/claude-3-haiku".to_string(),
            ai_enabled: true,
        };
        let content = serde_json::to_string_pretty(&defaults).map_err(|e| e.to_string())?;
        tokio::fs::write(&settings_path, &content)
            .await
            .map_err(|e| e.to_string())?;
        Ok(defaults)
    }
}

#[tauri::command]
async fn save_settings(app: AppHandle, settings: Settings) -> Result<(), String> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;
    let settings_path = app_data_dir.join("settings.json");
    let content = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    tokio::fs::write(&settings_path, content)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn agent_message(app: AppHandle, message: String) -> Result<String, String> {
    let settings = load_settings(app).await?;
    if !settings.ai_enabled {
        return Err("AI is disabled".to_string());
    }
    let agent = Agent::new(settings.api_key, settings.model);
    agent
        .handle_message(message)
        .await
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            open_file,
            save_file,
            load_settings,
            save_settings,
            agent_message,
            open_folder,
            read_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
