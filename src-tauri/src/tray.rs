use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, Runtime,
};

use crate::config;
use crate::keyboard;

pub fn init<R: Runtime>(app: &tauri::App<R>) -> Result<(), Box<dyn std::error::Error>> {
    let menu = create_menu(app)?;

    let _tray = TrayIconBuilder::with_id("main")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .tooltip("KeyboardTalks")
        .on_menu_event(handle_menu_event)
        .on_tray_icon_event(handle_tray_event)
        .build(app)?;

    println!("System tray initialized");

    Ok(())
}

fn create_menu<R: Runtime>(
    app: &tauri::App<R>,
) -> Result<Menu<R>, Box<dyn std::error::Error>> {
    let cfg = config::get();
    let mute_label = if cfg.muted { "Unmute" } else { "Mute" };

    let show = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
    let mute = MenuItem::with_id(app, "mute", mute_label, true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show, &mute, &quit])?;

    Ok(menu)
}

pub fn update_tray_menu<R: Runtime>(app: &AppHandle<R>) -> Result<(), Box<dyn std::error::Error>> {
    let cfg = config::get();
    let mute_label = if cfg.muted { "Unmute" } else { "Mute" };

    let show = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
    let mute = MenuItem::with_id(app, "mute", mute_label, true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &mute, &quit])?;

    if let Some(tray) = app.tray_by_id("main") {
        tray.set_menu(Some(menu))?;
    }

    Ok(())
}

fn handle_menu_event<R: Runtime>(app: &AppHandle<R>, event: tauri::menu::MenuEvent) {
    match event.id().as_ref() {
        "show" => {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }

        "mute" => {
            let is_muted = config::get().muted;

            if is_muted {
                config::update(|c| c.muted = false);
                keyboard::resume();
            } else {
                config::update(|c| c.muted = true);
                keyboard::pause();
            }

            let _ = app.emit("mute-changed", config::get().muted);

            let _ = update_tray_menu(app);
        }

        "quit" => {
            app.exit(0);
        }

        _ => {}
    }
}

fn handle_tray_event<R: Runtime>(
    tray: &tauri::tray::TrayIcon<R>,
    event: TrayIconEvent,
) {
    if let TrayIconEvent::Click {
        button: MouseButton::Left,
        button_state: MouseButtonState::Up,
        ..
    } = event
    {
        let app = tray.app_handle();

        if let Some(window) = app.get_webview_window("main") {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}
