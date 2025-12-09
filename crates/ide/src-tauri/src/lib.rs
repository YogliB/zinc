// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::{AppHandle, Manager};

#[derive(Serialize, Deserialize)]
pub struct Settings {
    pub api_key: String,
    pub model: String,
    pub ai_enabled: bool,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn open_file() -> Result<String, String> {
    Ok("Dummy file content".to_string())
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
        let content = fs::read_to_string(&settings_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
    } else {
        let defaults = Settings {
            api_key: "".to_string(),
            model: "anthropic/claude-3-haiku".to_string(),
            ai_enabled: true,
        };
        let content = serde_json::to_string_pretty(&defaults).map_err(|e| e.to_string())?;
        fs::write(&settings_path, &content).map_err(|e| e.to_string())?;
        Ok(defaults)
    }
}

#[tauri::command]
async fn save_settings(app: AppHandle, settings: Settings) -> Result<(), String> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;
    let settings_path = app_data_dir.join("settings.json");
    let content = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(&settings_path, content).map_err(|e| e.to_string())
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
            save_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
