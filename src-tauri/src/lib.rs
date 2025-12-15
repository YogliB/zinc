// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use log;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_os() -> String {
    let os = std::env::consts::OS.to_string();
    log::info!("Detected OS: {}", os);
    os
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
        .invoke_handler(tauri::generate_handler![greet, get_os])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
