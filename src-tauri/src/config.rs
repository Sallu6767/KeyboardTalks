use once_cell::sync::Lazy;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

pub static CONFIG: Lazy<RwLock<AppConfig>> = Lazy::new(|| {
    RwLock::new(AppConfig::load())
});

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub active_soundpack: String,
    pub volume: f32,
    pub muted: bool,
    pub run_on_startup: bool,
    pub minimize_to_tray: bool,
    pub is_pro: bool,
    pub license_key: Option<String>,
    pub instance_id: String,
    pub custom_mappings: HashMap<String, String>,
    pub default_custom_sound: Option<String>,
    pub is_turned_off: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            active_soundpack: "mechanical".to_string(),
            volume: 0.8,
            muted: false,
            run_on_startup: true,
            minimize_to_tray: true,
            is_pro: true,
            license_key: None,
            instance_id: uuid::Uuid::new_v4().to_string(),
            custom_mappings: HashMap::new(),
            default_custom_sound: None,
            is_turned_off: false,
        }
    }
}

impl AppConfig {
    pub fn config_dir() -> PathBuf {
        let dir = dirs::config_dir()
            .expect("Could not find config directory")
            .join("keyboardtalks");
        if !dir.exists() {
            fs::create_dir_all(&dir)
                .expect("Could not create config directory");
        }
        dir
    }

    pub fn config_file_path() -> PathBuf {
        Self::config_dir().join("config.json")
    }

    pub fn custom_sounds_dir() -> PathBuf {
        let dir = Self::config_dir().join("custom_sounds");
        if !dir.exists() {
            fs::create_dir_all(&dir)
                .expect("Could not create custom sounds directory");
        }
        dir
    }

    pub fn load() -> Self {
        let path = Self::config_file_path();
        if path.exists() {
            match fs::read_to_string(&path) {
                Ok(contents) => {
                    match serde_json::from_str::<AppConfig>(&contents) {
                        Ok(config) => return config,
                        Err(e) => {
                            eprintln!("Config file corrupted, resetting to defaults: {}", e);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Could not read config file: {}", e);
                }
            }
        }
        let config = AppConfig::default();
        config.save();
        config
    }

    pub fn save(&self) {
        let path = Self::config_file_path();
        match serde_json::to_string_pretty(self) {
            Ok(json) => {
                if let Err(e) = fs::write(&path, json) {
                    eprintln!("Could not save config file: {}", e);
                }
            }
            Err(e) => {
                eprintln!("Could not serialize config: {}", e);
            }
        }
    }
}

pub fn init() {
    let config = CONFIG.read();
    println!(
        "Config loaded: soundpack={}, volume={}, muted={}, pro={}, turned_off={}",
        config.active_soundpack,
        config.volume,
        config.muted,
        config.is_pro,
        config.is_turned_off
    );
}

pub fn get() -> AppConfig {
    CONFIG.read().clone()
}

pub fn update<F>(f: F)
where
    F: FnOnce(&mut AppConfig),
{
    let mut config = CONFIG.write();
    f(&mut config);
    config.save();
}
