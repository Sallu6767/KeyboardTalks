const Dashboard = (() => {

    const URLS = {
        buy_pro: "https://keyboardtalks.lemonsqueezy.com/buy",
    };

    function init() {
        renderSoundpacks();
        setupMuteButton();
        setupStartupToggle();
        setupTrayToggle();
        setupProBanner();
        initVolumeSlider();
        subscribeToState();
    }

    function renderSoundpacks() {
        const container = document.getElementById("soundpack-list");
        if (!container) return;

        const packs = AppState.get("soundpacks") || [];
        const activePack = AppState.get("active_soundpack");

        container.innerHTML = "";

        for (const pack of packs) {
            const card = document.createElement("div");
            card.className = "soundpack-card" +
                (pack.id === activePack ? " selected" : "");
            card.dataset.packId = pack.id;

            card.innerHTML = `
                <span class="text-2xl">${pack.icon}</span>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white">
                        ${escapeText(pack.name)}
                    </p>
                    <p class="text-xs text-[#A1A1AA] truncate">
                        ${escapeText(pack.description)}
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <button class="preview-btn text-[#A1A1AA] hover:text-white transition-colors text-sm" title="Preview">
                        ▶
                    </button>
                    ${pack.id === activePack
                        ? '<span class="text-xs text-white font-medium">Active</span>'
                        : ""
                    }
                </div>
            `;

            card.addEventListener("click", (e) => {
                if (e.target.classList.contains("preview-btn")) return;
                selectSoundpack(pack.id);
            });

            const previewBtn = card.querySelector(".preview-btn");
            previewBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                previewSoundpack(pack.id);
            });

            container.appendChild(card);
        }
    }

    async function selectSoundpack(packId) {
        try {
            await invoke("set_soundpack", { packId: packId });
            AppState.set("active_soundpack", packId);
            renderSoundpacks();

            const packs = AppState.get("soundpacks") || [];
            const pack = packs.find(p => p.id === packId);
            showToast(`Switched to ${pack ? pack.name : packId}`, "success");
        } catch (error) {
            showToast("Failed to switch soundpack", "error");
        }
    }

    async function previewSoundpack(packId) {
        try {
            await invoke("play_test_sound", { packId, category: "default" });
        } catch (error) {
            console.error("[Dashboard] Preview error:", error);
        }
    }

    function setupMuteButton() {
        const btn = document.getElementById("btn-mute");
        if (!btn) return;

        updateMuteIcon(AppState.get("muted"));

        btn.addEventListener("click", async () => {
            try {
                const newMuted = await invoke("toggle_mute");
                AppState.set("muted", newMuted);
                updateMuteIcon(newMuted);
                showToast(newMuted ? "Sounds muted" : "Sounds unmuted", "info");
            } catch (error) {
                showToast("Failed to toggle mute", "error");
            }
        });
    }

    function updateMuteIcon(muted) {
        const btn = document.getElementById("btn-mute");
        if (btn) btn.textContent = muted ? "🔇" : "🔊";
    }

    function initVolumeSlider() {
        VolumeSlider.init();
        VolumeSlider.setValue(AppState.get("volume") || 0.8);
    }

    function setupStartupToggle() {
        const btn = document.getElementById("btn-startup");
        if (!btn) return;

        updateToggle(btn, AppState.get("run_on_startup"));

        btn.addEventListener("click", async () => {
            try {
                const newState = await invoke("toggle_startup");
                AppState.set("run_on_startup", newState);
                updateToggle(btn, newState);
                showToast(newState ? "Will start on boot" : "Won't start on boot", "info");
            } catch (error) {
                showToast("Failed to update startup setting", "error");
            }
        });
    }

    function setupTrayToggle() {
        const btn = document.getElementById("btn-tray");
        if (!btn) return;

        const initial = AppState.get("minimize_to_tray");
        updateToggle(btn, initial);

        btn.addEventListener("click", async () => {
            const newState = !AppState.get("minimize_to_tray");
            try {
                const result = await invoke("set_minimize_to_tray", { enabled: newState });
                AppState.set("minimize_to_tray", result);
                updateToggle(btn, result);
                showToast(result ? "Will minimize to tray" : "Will close normally", "info");
            } catch (error) {
                showToast("Failed to update minimize to tray setting", "error");
                console.error(error);
            }
        });
    }

    function updateToggle(btn, isOn) {
        if (!btn) return;
        btn.classList.toggle("on", isOn);
        btn.classList.toggle("off", !isOn);
    }

    function setupProBanner() {
        const banner = document.getElementById("pro-banner");
        if (!banner) return;

        if (AppState.get("is_pro")) {
            banner.style.display = "none";
            return;
        }

        const buyBtn = document.getElementById("btn-buy-pro-banner");
        if (buyBtn) {
            buyBtn.addEventListener("click", () => {
                TauriBridge.openExternal(URLS.buy_pro);
            });
        }

        const showActivateBtn = document.getElementById("btn-show-activate");
        const activatePanel = document.getElementById("banner-activate-panel");

        if (showActivateBtn && activatePanel) {
            showActivateBtn.addEventListener("click", () => {
                const isHidden = activatePanel.classList.contains("hidden");

                if (isHidden) {
                    activatePanel.classList.remove("hidden");
                    showActivateBtn.textContent = "Hide ▴";
                } else {
                    activatePanel.classList.add("hidden");
                    showActivateBtn.textContent = "Already have a key? Activate here ▸";
                }
            });
        }

        const activateBtn = document.getElementById("banner-btn-activate");
        const licenseInput = document.getElementById("banner-license-input");

        if (activateBtn && licenseInput) {
            activateBtn.addEventListener("click", () => {
                bannerActivateLicense(licenseInput.value.trim());
            });

            licenseInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    bannerActivateLicense(licenseInput.value.trim());
                }
            });

            licenseInput.addEventListener("input", () => {
                const msg = document.getElementById("banner-license-message");
                if (msg) msg.classList.add("hidden");
            });
        }
    }

    async function bannerActivateLicense(key) {
        const activateBtn = document.getElementById("banner-btn-activate");
        const licenseInput = document.getElementById("banner-license-input");
        const message = document.getElementById("banner-license-message");

        if (!key) {
            showBannerMessage("Please paste your license key.", "error");
            return;
        }

        if (activateBtn) {
            activateBtn.textContent = "Checking...";
            activateBtn.disabled = true;
        }
        if (licenseInput) licenseInput.disabled = true;

        try {
            const result = await invoke("validate_license", { key });

            if (result.valid) {
                AppState.set("is_pro", true);
                AppState.set("license_key", key);

                showToast("Pro Pass activated! 🎉", "success");

                const banner = document.getElementById("pro-banner");
                if (banner) banner.style.display = "none";

                try {
                    const files = await invoke("get_custom_sound_files");
                    AppState.set("custom_sound_files", files);
                } catch (e) {}

            } else {
                showBannerMessage(result.message, "error");
                showToast("Invalid license key", "error");

                if (activateBtn) {
                    activateBtn.textContent = "Activate";
                    activateBtn.disabled = false;
                }
                if (licenseInput) licenseInput.disabled = false;
            }

        } catch (error) {
            showBannerMessage("Could not connect. Check your internet.", "error");

            if (activateBtn) {
                activateBtn.textContent = "Activate";
                activateBtn.disabled = false;
            }
            if (licenseInput) licenseInput.disabled = false;
        }
    }

    function showBannerMessage(text, type) {
        const msg = document.getElementById("banner-license-message");
        if (!msg) return;

        msg.textContent = text;
        msg.classList.remove("hidden", "text-emerald-400", "text-red-400");
        msg.classList.add(type === "success" ? "text-emerald-400" : "text-red-400");
    }

    function subscribeToState() {
        AppState.on("is_pro", (isPro) => {
            const banner = document.getElementById("pro-banner");
            if (banner) banner.style.display = isPro ? "none" : "block";
        });

        AppState.on("muted", (muted) => {
            updateMuteIcon(muted);
        });

        AppState.on("active_soundpack", () => {
            renderSoundpacks();
        });
    }

    function escapeText(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    return { init };

})();

window.Dashboard = Dashboard;
