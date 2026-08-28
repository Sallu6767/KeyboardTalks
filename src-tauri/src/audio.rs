use once_cell::sync::Lazy;
use parking_lot::Mutex;
use rodio::{Decoder, OutputStream, OutputStreamHandle, Sink, Source};
use std::collections::HashMap;
use std::fs;
use std::io::{BufReader, Cursor, Write};
use std::path::PathBuf;
use std::sync::Arc;

use crate::config;

pub const MAX_SOUND_DURATION_SECS: f32 = 2.0;
pub const MAX_SOUND_FILE_SIZE: u64 = 2_097_152;

pub const KEY_CATEGORIES: [&str; 5] = [
    "default",
    "space",
    "enter",
    "backspace",
    "shift",
];

pub struct AudioEngine {
    stream_handle: OutputStreamHandle,
    sounds: HashMap<String, Arc<Vec<u8>>>,
    custom_sounds: HashMap<String, Arc<Vec<u8>>>,
}

struct EngineWrapper(Option<AudioEngine>);

unsafe impl Send for EngineWrapper {}
unsafe impl Sync for EngineWrapper {}

pub static ENGINE: Lazy<Mutex<EngineWrapper>> = Lazy::new(|| {
    Mutex::new(EngineWrapper(None))
});

impl AudioEngine {
    pub fn new(soundpack_name: &str) -> Result<Self, String> {
        let (stream, stream_handle) = OutputStream::try_default()
            .map_err(|e| format!("Could not open audio device: {}", e))?;

        std::mem::forget(stream);

        let mut engine = AudioEngine {
            stream_handle,
            sounds: HashMap::new(),
            custom_sounds: HashMap::new(),
        };

        engine.load_soundpack(soundpack_name)?;
        engine.load_custom_sounds();

        Ok(engine)
    }

    pub fn load_soundpack(&mut self, pack_name: &str) -> Result<(), String> {
        let mut new_sounds = HashMap::new();

        for category in KEY_CATEGORIES {
            let filename = format!("key_{}.wav", category);
            let bytes = self.load_bundled_sound_or_fallback(pack_name, &filename, category)?;
            new_sounds.insert(category.to_string(), Arc::new(bytes));
        }

        self.sounds = new_sounds;

        println!(
            "Soundpack '{}' loaded: {} sounds in memory",
            pack_name,
            self.sounds.len()
        );

        Ok(())
    }

    fn load_bundled_sound_or_fallback(
        &self,
        pack_name: &str,
        filename: &str,
        category: &str,
    ) -> Result<Vec<u8>, String> {
        let mut possible_paths = Vec::new();

        possible_paths.push(PathBuf::from(format!("sounds/{}/{}", pack_name, filename)));
        possible_paths.push(PathBuf::from(format!(
            "../src-tauri/sounds/{}/{}",
            pack_name, filename
        )));
        possible_paths.push(PathBuf::from(format!(
            "src-tauri/sounds/{}/{}",
            pack_name, filename
        )));

        if let Ok(exe_path) = std::env::current_exe() {
            if let Some(exe_dir) = exe_path.parent() {
                let res_dir = exe_dir.join("resources");
                let resource_path = res_dir.join("sounds").join(pack_name).join(filename);
                possible_paths.push(resource_path);
            }
        }

        for path in &possible_paths {
            if path.exists() {
                return fs::read(path).map_err(|e| {
                    format!("Could not read sound file {:?}: {}", path, e)
                });
            }
        }

        eprintln!(
            "Sound file not found: {}/{}, generating fallback sine wave for category '{}'",
            pack_name, filename, category
        );
        Ok(generate_sine_wave_wav(440.0, 0.15, 44100))
    }

    pub fn load_custom_sounds(&mut self) {
        self.custom_sounds.clear();

        let cfg = config::get();

        if !cfg.is_pro || cfg.custom_mappings.is_empty() {
            return;
        }

        let custom_dir = config::AppConfig::custom_sounds_dir();
        let mut loaded_count = 0;
        let mut skipped_count = 0;

        for (key_name, filename) in &cfg.custom_mappings {
            let file_path = custom_dir.join(filename);

            if !file_path.exists() {
                eprintln!("Custom sound file not found: {}", filename);
                skipped_count += 1;
                continue;
            }

            match validate_sound_file(&file_path) {
                Ok(_) => {
                    match fs::read(&file_path) {
                        Ok(bytes) => {
                            self.custom_sounds
                                .insert(key_name.clone(), Arc::new(bytes));
                            loaded_count += 1;
                        }
                        Err(e) => {
                            eprintln!("Could not read custom sound {}: {}", filename, e);
                            skipped_count += 1;
                        }
                    }
                }
                Err(e) => {
                    eprintln!(
                        "Skipping invalid custom sound '{}': {}",
                        filename, e
                    );
                    skipped_count += 1;
                }
            }
        }

        println!(
            "Custom sounds loaded: {} mappings ({} loaded, {} skipped/invalid)",
            cfg.custom_mappings.len(),
            loaded_count,
            skipped_count
        );
    }

    pub fn play_sound(&self, key_name: &str, key_category: &str) {
        let cfg = config::get();

        if cfg.muted {
            return;
        }

        if cfg.is_pro {
            if let Some(buffer) = self.custom_sounds.get(key_name) {
                self.play_buffer(buffer.clone(), cfg.volume);
                return;
            }
        }

        if let Some(buffer) = self.sounds.get(key_category) {
            self.play_buffer(buffer.clone(), cfg.volume);
            return;
        }

        if let Some(buffer) = self.sounds.get("default") {
            self.play_buffer(buffer.clone(), cfg.volume);
        }
    }

    pub fn play_specific(&self, pack_id: &str, category: &str) -> Result<(), String> {
        let filename = format!("key_{}.wav", category);
        let bytes = self.load_bundled_sound_or_fallback(pack_id, &filename, category)?;
        self.play_buffer(Arc::new(bytes), config::get().volume);
        Ok(())
    }

    fn play_buffer(&self, buffer: Arc<Vec<u8>>, volume: f32) {
        let cursor = Cursor::new((*buffer).clone());

        match Decoder::new(BufReader::new(cursor)) {
            Ok(source) => {
                match Sink::try_new(&self.stream_handle) {
                    Ok(sink) => {
                        sink.set_volume(volume);
                        sink.append(source);
                        sink.detach();
                    }
                    Err(e) => eprintln!("Could not create audio sink: {}", e),
                }
            }
            Err(e) => eprintln!("Could not decode audio: {}", e),
        }
    }
}

fn generate_sine_wave_wav(freq: f32, duration_secs: f32, sample_rate: u32) -> Vec<u8> {
    let num_samples = (sample_rate as f32 * duration_secs) as usize;
    let mut samples = Vec::with_capacity(num_samples);

    for i in 0..num_samples {
        let t = i as f32 / sample_rate as f32;
        let val = (2.0 * std::f32::consts::PI * freq * t).sin();
        let sample = (val * i16::MAX as f32) as i16;
        samples.push(sample);
    }

    let mut wav = Vec::new();
    let channels: u16 = 1;
    let bits_per_sample: u16 = 16;
    let byte_rate = sample_rate * channels as u32 * (bits_per_sample / 8) as u32;
    let block_align = channels * (bits_per_sample / 8);
    let data_size = (samples.len() * std::mem::size_of::<i16>()) as u32;

    wav.write_all(b"RIFF").unwrap();
    wav.write_all(&(36 + data_size).to_le_bytes()).unwrap();
    wav.write_all(b"WAVE").unwrap();

    wav.write_all(b"fmt ").unwrap();
    wav.write_all(&16u32.to_le_bytes()).unwrap();
    wav.write_all(&1u16.to_le_bytes()).unwrap();
    wav.write_all(&channels.to_le_bytes()).unwrap();
    wav.write_all(&sample_rate.to_le_bytes()).unwrap();
    wav.write_all(&byte_rate.to_le_bytes()).unwrap();
    wav.write_all(&block_align.to_le_bytes()).unwrap();
    wav.write_all(&bits_per_sample.to_le_bytes()).unwrap();

    wav.write_all(b"data").unwrap();
    wav.write_all(&data_size.to_le_bytes()).unwrap();

    for sample in samples {
        wav.write_all(&sample.to_le_bytes()).unwrap();
    }

    wav
}

pub fn init() {
    let cfg = config::get();
    match AudioEngine::new(&cfg.active_soundpack) {
        Ok(engine) => {
            let mut lock = ENGINE.lock();
            lock.0 = Some(engine);
            println!("Audio engine initialized");
        }
        Err(e) => {
            eprintln!("Failed to initialize audio engine: {}", e);
        }
    }
}

pub fn play(key_name: &str, key_category: &str) {
    let lock = ENGINE.lock();
    if let Some(engine) = lock.0.as_ref() {
        engine.play_sound(key_name, key_category);
    }
}

pub fn switch_soundpack(pack_name: &str) -> Result<(), String> {
    let mut lock = ENGINE.lock();
    if let Some(engine) = lock.0.as_mut() {
        engine.load_soundpack(pack_name)?;
    }
    Ok(())
}

pub fn reload_custom_sounds() {
    let mut lock = ENGINE.lock();
    if let Some(engine) = lock.0.as_mut() {
        engine.load_custom_sounds();
    }
}

pub fn validate_sound_file(file_path: &PathBuf) -> Result<f32, String> {
    let metadata = fs::metadata(file_path)
        .map_err(|e| format!("Could not read file: {}", e))?;

    if metadata.len() > MAX_SOUND_FILE_SIZE {
        return Err(format!(
            "File too large: {:.1}MB (max 2MB)",
            metadata.len() as f64 / 1_048_576.0
        ));
    }

    let bytes = fs::read(file_path)
        .map_err(|e| format!("Could not read file: {}", e))?;

    let cursor = Cursor::new(bytes);
    let decoder = Decoder::new(BufReader::new(cursor))
        .map_err(|e| format!("Could not decode audio file: {}", e))?;

    let sample_rate = decoder.sample_rate() as f32;
    let channels = decoder.channels() as f32;
    let total_samples = decoder.into_iter().count() as f32;
    let duration_secs = total_samples / (sample_rate * channels);

    if duration_secs > MAX_SOUND_DURATION_SECS {
        return Err(format!(
            "Sound too long: {:.1}s (max 2s)",
            duration_secs
        ));
    }

    Ok(duration_secs)
}

pub fn play_specific(pack_id: &str, category: &str) -> Result<(), String> {
    let lock = ENGINE.lock();
    if let Some(engine) = lock.0.as_ref() {
        engine.play_specific(pack_id, category)
    } else {
        Err("Audio engine not initialized".to_string())
    }
}
