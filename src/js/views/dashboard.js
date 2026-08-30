const Dashboard = (() => {

    const URLS = {
        buy_pro: "https://keyboardtalks.lemonsqueezy.com/buy",
    };

    let customSoundsVisible = 6;

    function init() {
        renderSoundpacks();
        setupMuteButton();
        setupStartupToggle();
        setupTrayToggle();
        setupProBanner();
        initVolumeSlider();
        setupTurnOffButton();
        subscribeToState();
    }

    function renderSoundpacks() {
        const container = document.getElementById("soundpack-list");
        if (!container) return;

        const packs = AppState.get("soundpacks") || [];
        const activePack = AppState.get("active_soundpack");
        const customFiles = AppState.get("custom_sound_files") || [];
        const isPro = AppState.get("is_pro");

        container.innerHTML = "";

        for (const pack of packs) {
            const card = createSoundpackCard(pack, activePack);
            container.appendChild(card);
        }

        if (isPro && customFiles.length > 0) {
            const divider = document.createElement("div");
            divider.className = "border-t border-[#27272A] my-2";
            container.appendChild(divider);

            const label = document.createElement("p");
            label.className = "text-xs text-[#A1A1AA] uppercase tracking-wider mb-2";
            label.textContent = "Custom Sounds";
            container.appendChild(label);

            const visibleFiles = customFiles.slice(0, customSoundsVisible);
            for (const file of visibleFiles) {
                const card = createCustomSoundCard(file, activePack);
                container.appendChild(card);
            }

            if (customFiles.length > customSoundsVisible) {
                const showMoreBtn = document.createElement("button");
                showMoreBtn.className = "w-full py-2 mt-2 border border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:bg-[#27272A] hover:text-white transition-colors text-sm";
                showMoreBtn.textContent = `Show More (${customFiles.length - customSoundsVisible} remaining)`;
                showMoreBtn.addEventListener("click", () => {
                    customSoundsVisible += 6;
                    renderSoundpacks();
                });
                container.appendChild(showMoreBtn);
            }
        }
    }

    function createSoundpackCard(pack, activePack) {
        const card = document.createElement("div");
        card.className = "soundpack-card" + (pack.id === activePack ? " selected" : "");
        card.dataset.packId = pack.id;

        card.innerHTML = `
            <span class="text-2xl">${pack.icon}</span>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white">${escapeText(pack.name)}</p>
                <p class="text-xs text-[#A1A1AA] truncate">${escapeText(pack.description)}</p>
            </div>
            <div class="flex items-center gap-2">
                <button class="preview-btn text-[#A1A1AA] hover:text-white transition-colors text-sm" title="Preview">▶</button>
                ${pack.id === activePack ? '<span class="text-xs text-white font-medium">Active</span>' : ""}
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

        return card;
    }

    function createCustomSoundCard(filename, activePack) {
        const card = document.createElement("div");
        const isActive = activePack === `custom:${filename}`;
        card.className = "soundpack-card" + (isActive ? " selected" : "");
        card.dataset.packId = `custom:${filename}`;

        card.innerHTML = `
            <span class="text-2xl">🎵</span>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white">${escapeText(filename)}</p>
                <p class="text-xs text-[#A1A1AA] truncate">Custom sound</p>
            </div>
            <div class="flex items-center gap-2">
                <button class="preview-btn text-[#A1A1AA] hover:text-white transition-colors text-sm" title="Preview">▶</button>
                <button class="delete-custom-btn text-[#A1A1AA] hover:text-red-400 transition-colors text-sm" title="Delete">✕</button>
                ${isActive ? '<span class="text-xs text-white font-medium">Active</span>' : ""}
            </div>
        `;

        card.addEventListener("click", (e) => {
            if (e.target.classList.contains("preview-btn")) return;
            if (e.target.classList.contains("delete-custom-btn")) return;
            selectCustomSound(filename);
        });

        const previewBtn = card.querySelector(".preview-btn");
        previewBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            previewCustomSound(filename);
        });

        const deleteBtn = card.querySelector(".delete-custom-btn");
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteCustomSound(filename);
        });

        return card;
    }

    async function selectSoundpack(packId) {
        try {
            if (packId.startsWith("custom:")) {
                return;
            }
            await invoke("set_soundpack", { packId });
            AppState.set("active_soundpack", packId);
            renderSoundpacks();
            const packs = AppState.get("soundpacks") || [];
            const pack = packs.find(p => p.id === packId);
            showToast(`Switched to ${pack ? pack.name : packId}`, "success");
        } catch (error) {
            showToast("Failed to switch soundpack", "error");
        }
    }

    async function selectCustomSound(filename) {
        try {
            await invoke("set_default_custom_sound", { filename });
            AppState.set("active_soundpack", `custom:${filename}`);
            renderSoundpacks();
            showToast(`Default sound set to ${filename}`, "success");
        } catch (error) {
            showToast("Failed to set custom sound", "error");
        }
    }

    async function deleteCustomSound(filename) {
        const confirmed = confirm(`Are you sure you want to delete "${filename}"?`);
        if (!confirmed) return;

        try {
            await invoke("delete_custom_sound", { filename });
            // Update local state
            const files = AppState.get("custom_sound_files") || [];
            const newFiles = files.filter(f => f !== filename);
            AppState.set("custom_sound_files", newFiles);
            if (AppState.get("active_soundpack") === `custom:${filename}`) {
                AppState.set("active_soundpack", "mechanical");
            }
            renderSoundpacks();
            showToast(`Deleted ${filename}`, "success");
        } catch (error) {
            showToast(`Failed to delete: ${error.message || error}`, "error");
        }
    }

    async function previewSoundpack(packId) {
        try {
            await invoke("play_test_sound", { packId, category: "default" });
        } catch (error) {
            console.error("[Dashboard] Preview error:", error);
        }
    }

    async function previewCustomSound(filename) {
        try {
            await invoke("play_custom_sound", { filename });
        } catch (error) {
            console.error("[Dashboard] Preview custom sound error:", error);
        }
    }

    function setupTurnOffButton() {
        const btn = document.getElementById("btn-turn-off");
        if (!btn) return;

        const isOff = AppState.get("is_turned_off") || false;
        updateToggle(btn, !isOff);

        btn.addEventListener("click", async () => {
            const currentlyOff = AppState.get("is_turned_off") || false;
            const newState = !currentlyOff;

            try {
                if (newState) {
                    await invoke("turn_off");
                } else {
                    await invoke("turn_on");
                }
                AppState.set("is_turned_off", newState);
                const settingsBtn = document.getElementById("btn-turn-off-settings");
                if (settingsBtn) updateToggle(settingsBtn, !newState);
                updateToggle(btn, !newState);
                showToast(newState ? "KeyboardTalks turned off" : "KeyboardTalks turned on", "info");
            } catch (error) {
                showToast("Failed to toggle", "error");
            }
        });

        AppState.on("is_turned_off", (isOff) => {
            updateToggle(btn, !isOff);
            const settingsBtn = document.getElementById("btn-turn-off-settings");
            if (settingsBtn) updateToggle(settingsBtn, !isOff);
        });
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
                renderSoundpacks();

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
            renderSoundpacks();
        });

        AppState.on("muted", (muted) => {
            updateMuteIcon(muted);
        });

        AppState.on("active_soundpack", () => {
            renderSoundpacks();
        });

        AppState.on("custom_sound_files", () => {
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
