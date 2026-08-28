mod config;
mod audio;
mod soundpack;
mod keyboard;
mod tray;
mod license;
mod commands;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]),
        ))
        .setup(|app| {
            config::init();
            audio::init();
            tray::init(app)?;
            keyboard::init();

            let window = app.get_webview_window("main").unwrap();
            window.webview().open_devtools();
            let window_clone = window.clone();

            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    let cfg = config::get();
                    if cfg.minimize_to_tray {
                        api.prevent_close();
                        window_clone.hide().unwrap();
                    } else {
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_config,
            commands::set_soundpack,
            commands::set_volume,
            commands::toggle_mute,
            commands::toggle_startup,
            commands::set_minimize_to_tray,
            commands::get_soundpacks,
            commands::play_test_sound,
            commands::validate_license,
            commands::check_pro_status,
            commands::import_custom_sound,
            commands::set_key_mapping,
            commands::remove_mapping,
            commands::get_custom_mappings,
            commands::get_custom_sound_files,
            commands::open_file_dialog,
        ])
        .run(tauri::generate_context!())
        .expect("error while running KeyboardTalks");
}
