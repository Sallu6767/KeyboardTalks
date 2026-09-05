const AppState = (() => {

    const state = {
        active_soundpack: "mechanical",
        volume: 0.8,
        muted: false,
        run_on_startup: false,
        minimize_to_tray: true,
        is_pro: false,
        license_key: null,
        custom_mappings: {},
        current_tab: "dashboard",
        selected_key: null,
        soundpacks: [],
        custom_sound_files: [],
        is_turned_off: false,
    };

    const subscribers = {};

    function get(key) {
        return state[key];
    }

    function getAll() {
        return { ...state };
    }

    function set(key, value) {
        const oldValue = state[key];
        if (oldValue === value) {
            return;
        }
        state[key] = value;
        notify(key, value, oldValue);
    }

    function setMany(updates) {
        for (const [key, value] of Object.entries(updates)) {
            set(key, value);
        }
    }

    function on(key, callback) {
        if (!subscribers[key]) {
            subscribers[key] = [];
        }
        subscribers[key].push(callback);
        return () => {
            subscribers[key] = subscribers[key].filter(cb => cb !== callback);
        };
    }

    function notify(key, newValue, oldValue) {
        if (!subscribers[key]) {
            return;
        }
        for (const callback of subscribers[key]) {
            try {
                callback(newValue, oldValue);
            } catch (error) {
                console.error(`[State] Subscriber error for "${key}":`, error);
            }
        }
    }

    async function loadFromBackend() {
        try {
            const config = await invoke("get_config");

            setMany({
                active_soundpack: config.active_soundpack,
                volume: config.volume,
                muted: config.muted,
                run_on_startup: config.run_on_startup,
                minimize_to_tray: config.minimize_to_tray,
                is_pro: config.is_pro,
                license_key: config.license_key,
                custom_mappings: config.custom_mappings,
                is_turned_off: config.is_turned_off || false,
            });

            const packs = await invoke("get_soundpacks");
            set("soundpacks", packs);

            if (config.is_pro) {
                const files = await invoke("get_custom_sound_files");
                set("custom_sound_files", files);
            }

            console.log("[State] Loaded from backend:", getAll());

        } catch (error) {
            console.error("[State] Failed to load from backend:", error);
        }
    }

    return {
        get,
        getAll,
        set,
        setMany,
        on,
        loadFromBackend,
    };

})();

window.AppState = AppState;
