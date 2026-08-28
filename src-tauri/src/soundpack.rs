use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoundPackInfo {

    pub id: String,

    pub name: String,

    pub description: String,

    pub icon: String,

    pub is_free: bool,
}

pub fn get_key_category(key_name: &str) -> &'static str {
    match key_name {

        "Space" => "space",

        "Return" | "Enter" | "KpReturn" => "enter",

        "BackSpace" | "Delete" | "KpDelete" => "backspace",

        "ShiftLeft"
        | "ShiftRight"
        | "ControlLeft"
        | "ControlRight"
        | "Alt"
        | "AltGr"
        | "MetaLeft"
        | "MetaRight"
        | "CapsLock"
        | "Tab"
        | "Escape"
        | "Function" => "shift",

        _ => "default",
    }
}

pub fn get_all_packs() -> Vec<SoundPackInfo> {
    vec![
        SoundPackInfo {
            id: "mechanical".to_string(),
            name: "Mechanical".to_string(),
            description: "Satisfying clicky mechanical switches".to_string(),
            icon: "⌨️".to_string(),
            is_free: true,
        },
        SoundPackInfo {
            id: "typewriter".to_string(),
            name: "Typewriter".to_string(),
            description: "Vintage typewriter with a carriage return".to_string(),
            icon: "📰".to_string(),
            is_free: true,
        },
        SoundPackInfo {
            id: "8bit".to_string(),
            name: "8-Bit".to_string(),
            description: "Retro chiptune blips and bloops".to_string(),
            icon: "🎮".to_string(),
            is_free: true,
        },
        SoundPackInfo {
            id: "arcade".to_string(),
            name: "Arcade".to_string(),
            description: "Classic arcade game sound effects".to_string(),
            icon: "🕹️".to_string(),
            is_free: true,
        },
        SoundPackInfo {
            id: "click".to_string(),
            name: "Click".to_string(),
            description: "Clean minimal click sounds".to_string(),
            icon: "🖱️".to_string(),
            is_free: true,
        },
    ]
}

pub fn get_pack_by_id(id: &str) -> Option<SoundPackInfo> {
    get_all_packs().into_iter().find(|p| p.id == id)
}

pub fn is_valid_pack(id: &str) -> bool {
    get_all_packs().iter().any(|p| p.id == id)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_packs_have_required_fields() {
        let packs = get_all_packs();

        assert_eq!(packs.len(), 5);

        for pack in &packs {
            assert!(!pack.id.is_empty());
            assert!(!pack.name.is_empty());
            assert!(!pack.description.is_empty());
            assert!(!pack.icon.is_empty());

            assert!(pack.is_free);
        }
    }

    #[test]
    fn test_pack_ids_match_folder_names() {

        let expected_ids = vec![
            "mechanical",
            "typewriter",
            "8bit",
            "arcade",
            "click",
        ];

        let packs = get_all_packs();
        let actual_ids: Vec<&str> =
            packs.iter().map(|p| p.id.as_str()).collect();

        assert_eq!(actual_ids, expected_ids);
    }

    #[test]
    fn test_get_pack_by_id() {

        assert!(get_pack_by_id("mechanical").is_some());
        assert!(get_pack_by_id("8bit").is_some());

        assert!(get_pack_by_id("doesnotexist").is_none());
        assert!(get_pack_by_id("").is_none());
    }

    #[test]
    fn test_is_valid_pack() {
        assert!(is_valid_pack("mechanical"));
        assert!(is_valid_pack("typewriter"));
        assert!(is_valid_pack("8bit"));
        assert!(is_valid_pack("arcade"));
        assert!(is_valid_pack("click"));

        assert!(!is_valid_pack("custom"));
        assert!(!is_valid_pack(""));
        assert!(!is_valid_pack("MECHANICAL"));
    }

    #[test]
    fn test_key_categories() {

        assert_eq!(get_key_category("Space"), "space");

        assert_eq!(get_key_category("Return"), "enter");
        assert_eq!(get_key_category("KpReturn"), "enter");

        assert_eq!(get_key_category("BackSpace"), "backspace");
        assert_eq!(get_key_category("Delete"), "backspace");

        assert_eq!(get_key_category("ShiftLeft"), "shift");
        assert_eq!(get_key_category("ControlLeft"), "shift");
        assert_eq!(get_key_category("Tab"), "shift");
        assert_eq!(get_key_category("Escape"), "shift");

        assert_eq!(get_key_category("KeyA"), "default");
        assert_eq!(get_key_category("KeyZ"), "default");
        assert_eq!(get_key_category("Digit1"), "default");
        assert_eq!(get_key_category("F1"), "default");
        assert_eq!(get_key_category("ArrowUp"), "default");
    }
}
