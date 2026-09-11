use once_cell::sync::Lazy;
use parking_lot::RwLock;
use rdev::{listen, Event, EventType, Key};
use std::thread;
use std::time::Duration;

use crate::audio;
use crate::soundpack;

pub static LISTENER_ACTIVE: Lazy<RwLock<bool>> = Lazy::new(|| {
    RwLock::new(true)
});

pub fn init() {
    thread::spawn(|| {
        println!("Keyboard listener started on background thread");
        run_listener_with_retry();
    });
}

fn run_listener_with_retry() {
    let max_attempts = 5;
    let mut attempt = 0;
    let mut delay = Duration::from_millis(500);

    while attempt < max_attempts {
        match listen(callback) {
            Ok(_) => {
                println!("Keyboard listener stopped.");
                break;
            }
            Err(e) => {
                attempt += 1;
                eprintln!(
                    "Keyboard listener error (attempt {}/{}): {:?}",
                    attempt, max_attempts, e
                );

                if attempt >= max_attempts {
                    eprintln!("Keyboard listener reached max retry attempts.");
                    break;
                }

                thread::sleep(delay);
                delay = delay.saturating_mul(2);
            }
        }
    }
}

fn callback(event: Event) {
    if let EventType::KeyPress(key) = event.event_type {
        handle_key_press(key);
    }
}

fn handle_key_press(key: Key) {
    let active = LISTENER_ACTIVE.read();
    if !*active {
        return;
    }
    drop(active);

    let key_name = key_to_name(key);
    let key_category = soundpack::get_key_category(&key_name);

    audio::play(&key_name, key_category);
}

fn key_to_name(key: Key) -> String {
    match key {
        Key::KeyA => "KeyA".to_string(),
        Key::KeyB => "KeyB".to_string(),
        Key::KeyC => "KeyC".to_string(),
        Key::KeyD => "KeyD".to_string(),
        Key::KeyE => "KeyE".to_string(),
        Key::KeyF => "KeyF".to_string(),
        Key::KeyG => "KeyG".to_string(),
        Key::KeyH => "KeyH".to_string(),
        Key::KeyI => "KeyI".to_string(),
        Key::KeyJ => "KeyJ".to_string(),
        Key::KeyK => "KeyK".to_string(),
        Key::KeyL => "KeyL".to_string(),
        Key::KeyM => "KeyM".to_string(),
        Key::KeyN => "KeyN".to_string(),
        Key::KeyO => "KeyO".to_string(),
        Key::KeyP => "KeyP".to_string(),
        Key::KeyQ => "KeyQ".to_string(),
        Key::KeyR => "KeyR".to_string(),
        Key::KeyS => "KeyS".to_string(),
        Key::KeyT => "KeyT".to_string(),
        Key::KeyU => "KeyU".to_string(),
        Key::KeyV => "KeyV".to_string(),
        Key::KeyW => "KeyW".to_string(),
        Key::KeyX => "KeyX".to_string(),
        Key::KeyY => "KeyY".to_string(),
        Key::KeyZ => "KeyZ".to_string(),

        Key::Num0 => "Digit0".to_string(),
        Key::Num1 => "Digit1".to_string(),
        Key::Num2 => "Digit2".to_string(),
        Key::Num3 => "Digit3".to_string(),
        Key::Num4 => "Digit4".to_string(),
        Key::Num5 => "Digit5".to_string(),
        Key::Num6 => "Digit6".to_string(),
        Key::Num7 => "Digit7".to_string(),
        Key::Num8 => "Digit8".to_string(),
        Key::Num9 => "Digit9".to_string(),

        Key::F1 => "F1".to_string(),
        Key::F2 => "F2".to_string(),
        Key::F3 => "F3".to_string(),
        Key::F4 => "F4".to_string(),
        Key::F5 => "F5".to_string(),
        Key::F6 => "F6".to_string(),
        Key::F7 => "F7".to_string(),
        Key::F8 => "F8".to_string(),
        Key::F9 => "F9".to_string(),
        Key::F10 => "F10".to_string(),
        Key::F11 => "F11".to_string(),
        Key::F12 => "F12".to_string(),

        Key::Space => "Space".to_string(),
        Key::Return => "Return".to_string(),
        Key::Backspace => "BackSpace".to_string(),
        Key::Tab => "Tab".to_string(),
        Key::Escape => "Escape".to_string(),
        Key::Delete => "Delete".to_string(),
        Key::CapsLock => "CapsLock".to_string(),

        Key::ShiftLeft => "ShiftLeft".to_string(),
        Key::ShiftRight => "ShiftRight".to_string(),
        Key::ControlLeft => "ControlLeft".to_string(),
        Key::ControlRight => "ControlRight".to_string(),
        Key::Alt => "Alt".to_string(),
        Key::AltGr => "AltGr".to_string(),
        Key::MetaLeft => "MetaLeft".to_string(),
        Key::MetaRight => "MetaRight".to_string(),

        Key::UpArrow => "ArrowUp".to_string(),
        Key::DownArrow => "ArrowDown".to_string(),
        Key::LeftArrow => "ArrowLeft".to_string(),
        Key::RightArrow => "ArrowRight".to_string(),

        Key::Comma => "Comma".to_string(),
        Key::Dot => "Period".to_string(),
        Key::Slash => "Slash".to_string(),
        Key::SemiColon => "Semicolon".to_string(),
        Key::Quote => "Quote".to_string(),
        Key::LeftBracket => "BracketLeft".to_string(),
        Key::RightBracket => "BracketRight".to_string(),
        Key::BackSlash => "Backslash".to_string(),
        Key::Minus => "Minus".to_string(),
        Key::Equal => "Equal".to_string(),
        Key::BackQuote => "Backquote".to_string(),

        Key::Home => "Home".to_string(),
        Key::End => "End".to_string(),
        Key::PageUp => "PageUp".to_string(),
        Key::PageDown => "PageDown".to_string(),
        Key::Insert => "Insert".to_string(),
        Key::PrintScreen => "PrintScreen".to_string(),
        Key::ScrollLock => "ScrollLock".to_string(),
        Key::Pause => "Pause".to_string(),

        Key::Kp0 => "Numpad0".to_string(),
        Key::Kp1 => "Numpad1".to_string(),
        Key::Kp2 => "Numpad2".to_string(),
        Key::Kp3 => "Numpad3".to_string(),
        Key::Kp4 => "Numpad4".to_string(),
        Key::Kp5 => "Numpad5".to_string(),
        Key::Kp6 => "Numpad6".to_string(),
        Key::Kp7 => "Numpad7".to_string(),
        Key::Kp8 => "Numpad8".to_string(),
        Key::Kp9 => "Numpad9".to_string(),
        Key::KpReturn => "KpReturn".to_string(),
        Key::KpMinus => "KpMinus".to_string(),
        Key::KpPlus => "KpPlus".to_string(),
        Key::KpMultiply => "KpMultiply".to_string(),
        Key::KpDivide => "KpDivide".to_string(),
        Key::KpDelete => "KpDelete".to_string(),
        Key::NumLock => "NumLock".to_string(),

        Key::Unknown(code) => format!("Unknown_{}", code),

        #[allow(unreachable_patterns)]
        _ => "Unknown".to_string(),
    }
}

pub fn pause() {
    let mut active = LISTENER_ACTIVE.write();
    *active = false;
    println!("Keyboard listener paused");
}

pub fn resume() {
    let mut active = LISTENER_ACTIVE.write();
    *active = true;
    println!("Keyboard listener resumed");
}

pub fn is_active() -> bool {
    *LISTENER_ACTIVE.read()
}
