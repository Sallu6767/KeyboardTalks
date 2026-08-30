use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter};
use tauri_plugin_autostart::ManagerExt;
use tauri_plugin_dialog::DialogExt;

use crate::audio;
use crate::config;
use crate::keyboard;
use crate::license;
use crate::soundpack;
use crate::tray;

#[tauri::command]
pub fn get_config() -> config::AppConfig {
    config::get()
}

#[tauri::command]
pub fn set_soundpack(pack_id: String) -> Result<String, String> {
    if !soundpack::is_valid_pack(&pack_id) {
        return Err(format!("Unknown soundpack: {}", pack_id));
    }
    audio::switch_soundpack(&pack_id)?;
    config::update(|c| c.active_soundpack = pack_id.clone());
    Ok(format!("Switched to {} soundpack", pack_id))
}

#[tauri::command]
pub fn set_volume(volume: f32) -> Result<String, String> {
    let clamped = volume.clamp(0.0, 1.0);
    config::update(|c| c.volume = clamped);
    Ok(format!("Volume set to {:.0}%", clamped * 100.0))
}

#[tauri::command]
pub fn toggle_mute(app: AppHandle) -> bool {
    let currently_muted = config::get().muted;
    let new_state = !currently_muted;
    config::update(|c| c.muted = new_state);
    if new_state {
        keyboard::pause();
    } else {
        keyboard::resume();
    }
    let _ = app.emit("mute-changed", new_state);
    let _ = tray::update_tray_menu(&app);
    new_state
}

#[tauri::command]
pub fn toggle_startup(app: AppHandle) -> Result<bool, String> {
    let current = config::get().run_on_startup;
    let new_state = !current;
    let result = if new_state {
        app.autolaunch().enable()
    } else {
        app.autolaunch().disable()
    };
    match result {
        Ok(_) => {
            config::update(|c| c.run_on_startup = new_state);
            Ok(new_state)
        }
        Err(e) => {
            let error_str = e.to_string();
            if !new_state && (error_str.contains("cannot find the file") || error_str.contains("os error 2")) {
                config::update(|c| c.run_on_startup = false);
                Ok(false)
            } else {
                config::update(|c| c.run_on_startup = current);
                Err(format!("Failed to toggle autostart: {}", e))
            }
        }
    }
}

#[tauri::command]
pub fn set_minimize_to_tray(enabled: bool) -> Result<bool, String> {
    config::update(|c| c.minimize_to_tray = enabled);
    Ok(enabled)
}

#[tauri::command]
pub fn get_soundpacks() -> Vec<soundpack::SoundPackInfo> {
    soundpack::get_all_packs()
}

#[tauri::command]
pub fn play_test_sound(pack_id: String, category: String) -> Result<(), String> {
    if !soundpack::is_valid_pack(&pack_id) {
        return Err(format!("Unknown soundpack: {}", pack_id));
    }
    audio::play_specific(&pack_id, &category)?;
    Ok(())
}

#[tauri::command]
pub fn play_key(key_name: String) -> Result<(), String> {
    let category = soundpack::get_key_category(&key_name);
    audio::play(&key_name, category);
    Ok(())
}

#[tauri::command]
pub async fn validate_license(key: String) -> license::LicenseResult {
    license::validate_key(&key).await
}

#[tauri::command]
pub fn check_pro_status() -> bool {
    license::is_pro()
}

#[tauri::command]
pub fn turn_off() -> Result<(), String> {
    keyboard::pause();
    Ok(())
}

#[tauri::command]
pub fn turn_on() -> Result<(), String> {
    keyboard::resume();
    Ok(())
}

#[tauri::command]
pub fn set_default_custom_sound(filename: String) -> Result<(), String> {
    if !license::is_pro() {
        return Err("Pro Pass required.".to_string());
    }
    let custom_dir = config::AppConfig::custom_sounds_dir();
    let file_path = custom_dir.join(&filename);
    if !file_path.exists() {
        return Err(format!("Sound file '{}' not found.", filename));
    }
    config::update(|c| {
        c.default_custom_sound = Some(filename.clone());
    });
    audio::reload_custom_sounds();
    Ok(())
}

#[tauri::command]
pub fn clear_default_custom_sound() -> Result<(), String> {
    config::update(|c| c.default_custom_sound = None);
    audio::reload_custom_sounds();
    Ok(())
}

#[tauri::command]
pub fn play_custom_sound(filename: String) -> Result<(), String> {
    if !license::is_pro() {
        return Err("Pro Pass required.".to_string());
    }
    let custom_dir = config::AppConfig::custom_sounds_dir();
    let file_path = custom_dir.join(&filename);
    if !file_path.exists() {
        return Err(format!("File '{}' not found.", filename));
    }
    audio::play_custom_file(&file_path)?;
    Ok(())
}

#[tauri::command]
pub fn clear_all_mappings() -> Result<(), String> {
    if !license::is_pro() {
        return Err("Pro Pass required.".to_string());
    }
    config::update(|c| c.custom_mappings.clear());
    audio::reload_custom_sounds();
    Ok(())
}

#[tauri::command]
pub fn delete_custom_sound(filename: String) -> Result<(), String> {
    if !license::is_pro() {
        return Err("Pro Pass required.".to_string());
    }
    let custom_dir = config::AppConfig::custom_sounds_dir();
    let file_path = custom_dir.join(&filename);
    if !file_path.exists() {
        return Err(format!("File '{}' not found.", filename));
    }

    config::update(|c| {
        c.custom_mappings.retain(|_, fname| fname != &filename);
        if c.default_custom_sound.as_deref() == Some(&filename) {
            c.default_custom_sound = None;
        }
    });

    fs::remove_file(file_path).map_err(|e| format!("Could not delete file: {}", e))?;
    audio::reload_custom_sounds();
    Ok(())
}

#[tauri::command]
pub fn import_custom_sound(file_path: String) -> Result<String, String> {
    if !license::is_pro() {
        return Err("Pro Pass required to import custom sounds.".to_string());
    }

    let source_path = PathBuf::from(&file_path);
    if !source_path.exists() {
        return Err("File not found.".to_string());
    }

    let extension = source_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    if extension != "wav" && extension != "mp3" {
        return Err("Only .wav and .mp3 files are supported.".to_string());
    }

    audio::validate_sound_file(&source_path)?;

    let original_name = source_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("custom_sound.wav")
        .to_string();

    let safe_name = sanitize_filename(&original_name);
    let dest_dir = config::AppConfig::custom_sounds_dir();
    let dest_path = dest_dir.join(&safe_name);
    let final_path = get_unique_path(dest_path);
    let final_name = final_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or(&safe_name)
        .to_string();

    fs::copy(&source_path, &final_path).map_err(|e| format!("Could not copy sound file: {}", e))?;
    println!("Custom sound imported: {}", final_name);
    audio::reload_custom_sounds();
    Ok(final_name)
}

#[tauri::command]
pub fn set_key_mapping(key_name: String, file_name: String) -> Result<String, String> {
    if !license::is_pro() {
        return Err("Pro Pass required for per-key mapping.".to_string());
    }

    let custom_dir = config::AppConfig::custom_sounds_dir();
    let file_path = custom_dir.join(&file_name);
    if !file_path.exists() {
        return Err(format!("Sound file '{}' not found. Import it first.", file_name));
    }

    config::update(|c| {
        c.custom_mappings.insert(key_name.clone(), file_name.clone());
    });
    audio::reload_custom_sounds();
    Ok(format!("Mapped {} → {}", key_name, file_name))
}

#[tauri::command]
pub fn remove_mapping(key_name: String) -> Result<String, String> {
    if !license::is_pro() {
        return Err("Pro Pass required.".to_string());
    }
    config::update(|c| {
        c.custom_mappings.remove(&key_name);
    });
    audio::reload_custom_sounds();
    Ok(format!("Removed custom mapping for {}", key_name))
}

#[tauri::command]
pub fn get_custom_mappings() -> std::collections::HashMap<String, String> {
    config::get().custom_mappings
}

#[tauri::command]
pub fn get_custom_sound_files() -> Vec<String> {
    let custom_dir = config::AppConfig::custom_sounds_dir();
    match fs::read_dir(&custom_dir) {
        Ok(entries) => {
            entries
                .filter_map(|entry| {
                    let entry = entry.ok()?;
                    let path = entry.path();
                    let name = path.file_name()?.to_str()?.to_string();
                    let lower_name = name.to_lowercase();
                    if !lower_name.ends_with(".wav") && !lower_name.ends_with(".mp3") {
                        return None;
                    }
                    match audio::validate_sound_file(&path) {
                        Ok(_) => Some(name),
                        Err(_) => {
                            eprintln!("Skipping unplayable or invalid file: {}", name);
                            None
                        }
                    }
                })
                .collect()
        }
        Err(_) => Vec::new(),
    }
}

#[tauri::command]
pub async fn open_file_dialog(app: AppHandle) -> Result<Option<String>, String> {
    let (tx, rx) = tokio::sync::oneshot::channel();
    app.dialog()
        .file()
        .add_filter("Audio Files", &["wav", "mp3"])
        .pick_file(move |file_path| {
            let path_str = file_path.map(|p| p.to_string());
            let _ = tx.send(path_str);
        });
    rx.await.map_err(|e| format!("Dialog closed: {}", e))
}

fn sanitize_filename(name: &str) -> String {
    name.chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '-' || c == '_' || c == '.' || c == ' ' {
                c
            } else {
                '_'
            }
        })
        .collect()
}

fn get_unique_path(path: PathBuf) -> PathBuf {
    if !path.exists() {
        return path;
    }
    let stem = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("sound");
    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("wav");
    let parent = path.parent().unwrap_or(std::path::Path::new("."));
    let mut counter = 1;
    loop {
        let new_name = format!("{}_{}.{}", stem, counter, ext);
        let new_path = parent.join(&new_name);
        if !new_path.exists() {
            return new_path;
        }
        counter += 1;
        if counter > 999 {
            return parent.join(format!("{}_{}.{}", stem, uuid::Uuid::new_v4(), ext));
        }
    }
}
