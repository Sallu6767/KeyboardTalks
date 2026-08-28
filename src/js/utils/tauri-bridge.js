(function() {
    function isTauri() {
        return typeof window !== "undefined" &&
               typeof window.__TAURI__ !== "undefined";
    }

    async function invoke(command, args = {}) {
        if (!isTauri()) {
            console.warn(`[TauriBridge] Not running in Tauri. Command "${command}" skipped.`);
            return getMockResponse(command, args);
        }

        try {
            const result = await window.__TAURI__.core.invoke(command, args);
            return result;
        } catch (error) {
            console.error(`[TauriBridge] Command "${command}" failed:`, error);
            throw new Error(`Command "${command}" failed: ${error}`);
        }
    }

    async function openExternal(url) {
        if (!isTauri()) {
            console.warn(`[TauriBridge] Opening URL in browser: ${url}`);
            window.open(url, "_blank");
            return;
        }

        try {
            await window.__TAURI__.shell.open(url);
        } catch (error) {
            console.error(`[TauriBridge] Failed to open URL: ${error}`);
            window.open(url, "_blank");
        }
    }

    function getMockResponse(command, args) {
        if (command === "toggle_mute") {
            const newState = !window.AppState.get("muted");
            return newState;
        }

        if (command === "toggle_startup") {
            const newState = !window.AppState.get("run_on_startup");
            return newState;
        }

        if (command === "set_minimize_to_tray") {
            return args.enabled;
        }

        if (command === "set_soundpack") {
            return `Switched to ${args.packId}`;
        }

        if (command === "set_volume") {
            return "Volume set";
        }

        const mocks = {
            get_config: {
                active_soundpack: "mechanical",
                volume: 0.8,
                muted: false,
                run_on_startup: false,
                minimize_to_tray: true,
                is_pro: false,
                license_key: null,
                instance_id: "mock-instance-id",
                custom_mappings: {},
            },
            get_soundpacks: [
                { id: "mechanical", name: "Mechanical", description: "Satisfying clicky mechanical switches", icon: "⌨️", is_free: true },
                { id: "typewriter", name: "Typewriter", description: "Vintage typewriter with a carriage return", icon: "📰", is_free: true },
                { id: "8bit", name: "8-Bit", description: "Retro chiptune blips and bloops", icon: "🎮", is_free: true },
                { id: "arcade", name: "Arcade", description: "Classic arcade game sound effects", icon: "🕹️", is_free: true },
                { id: "click", name: "Click", description: "Clean minimal click sounds", icon: "🖱️", is_free: true },
            ],
            check_pro_status: false,
            play_test_sound: null,
            validate_license: {
                valid: true,
                message: "Mock Pass activated! enjoy Pro features.",
            },
            get_custom_mappings: {},
            get_custom_sound_files: ["mock_laser.wav", "game_over.mp3"],
            import_custom_sound: "imported_sound.wav",
            set_key_mapping: "Mapping set",
            remove_mapping: "Mapping removed",
        };

        if (command in mocks) {
            return mocks[command];
        }

        console.warn(`[TauriBridge] No mock defined for "${command}"`);
        return null;
    }

    window.TauriBridge = {
        invoke,
        openExternal,
        isTauri,
    };

    window.invoke = invoke;
})();
