// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use log;
use tauri_plugin_dialog::DialogExt;
use std::fs;
use tauri::Window;
use tokio::sync::oneshot;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_os() -> Result<String, String> {
    let os = std::env::consts::OS.to_string();
    log::info!("Detected OS: {}", os);
    Ok(os)
}

#[derive(serde::Serialize)]
struct FileEntry {
    name: String,
    is_dir: bool,
    path: String,
}

#[tauri::command]
async fn open_folder(window: Window) -> Result<Option<String>, String> {
    let (tx, rx) = oneshot::channel();
    window.dialog().file().pick_folder(move |path| {
        let _ = tx.send(path);
    });
    match rx.await {
        Ok(Some(path)) => Ok(Some(path.to_string())),
        Ok(None) => Ok(None),
        Err(_) => Err("Dialog channel error".to_string()),
    }
}

#[tauri::command]
fn list_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let entries = fs::read_dir(&path).map_err(|e| format!("Failed to read directory: {}", e))?;
    let mut result = Vec::new();
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let name = entry.file_name().to_string_lossy().to_string();
        let is_dir = entry.file_type().map_err(|e| format!("Failed to get file type: {}", e))?.is_dir();
        let path = entry.path().to_string_lossy().to_string();
        result.push(FileEntry { name, is_dir, path });
    }
    Ok(result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![greet, get_os, open_folder, list_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
