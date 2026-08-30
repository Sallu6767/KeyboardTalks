const App = (() => {
    async function boot() {
        console.log("[App] KeyboardTalks starting...");

        await AppState.loadFromBackend();
        console.log("[App] Config loaded from backend");

        Dashboard.init();
        console.log("[App] Dashboard initialized");

        Mapper.init();
        console.log("[App] Mapper initialized");

        Settings.init();
        console.log("[App] Settings initialized");

        setupTabs();
        console.log("[App] Tabs initialized");

        setupEventListeners();
        console.log("[App] Event listeners initialized");

        document.addEventListener("keydown", (e) => {
            const keyName = e.code;

            if (window.__TAURI__ && window.__TAURI__.core) {
                const { invoke } = window.__TAURI__.core;
                
                invoke("play_key", { keyName }).catch(err => {
                    console.warn("[App] play_key error:", err);
                });
            } else {
                console.warn("[App] Tauri core not found. Keypress sound skipped.");
            }
        });

        switchTab("dashboard");

        console.log("[App] KeyboardTalks ready ✓");
    }

    function setupTabs() {
        const tabButtons = document.querySelectorAll(".tab-btn");

        for (const btn of tabButtons) {
            btn.addEventListener("click", () => {
                const tabName = btn.dataset.tab;
                if (tabName) {
                    switchTab(tabName);
                }
            });
        }
    }

    function switchTab(tabName) {
        const screens = {
            dashboard: document.getElementById("screen-dashboard"),
            mapper: document.getElementById("screen-mapper"),
            settings: document.getElementById("screen-settings"),
        };

        for (const [name, screen] of Object.entries(screens)) {
            if (!screen) continue;

            if (name === tabName) {
                screen.classList.remove("hidden");
            } else {
                screen.classList.add("hidden");
            }
        }

        const tabButtons = document.querySelectorAll(".tab-btn");

        for (const btn of tabButtons) {
            if (btn.dataset.tab === tabName) {
                btn.classList.add("active");
                btn.classList.remove("bg-gray-800", "text-gray-400");
            } else {
                btn.classList.remove("active");
                btn.classList.add("bg-gray-800", "text-gray-400");
            }
        }

        AppState.set("current_tab", tabName);
    }

    function setupEventListeners() {
        if (!window.__TAURI__) return;

        if (window.__TAURI__.event) {
            window.__TAURI__.event.listen("mute-changed", (event) => {
                const muted = event.payload;
                AppState.set("muted", muted);
            }).catch((err) => {
                console.warn("[App] Failed to listen for mute-changed event:", err);
            });
        } else {
            console.warn("[App] Tauri event API not available");
        }
    }

    return {
        boot,
        switchTab,
    };

})();

window.App = App;

document.addEventListener("DOMContentLoaded", () => {
    App.boot().catch((error) => {
        console.error("[App] Boot failed:", error);
    });
});
