const Mapper = (() => {

    function getDisplayKeyName(keyId) {
        const displayMap = {
            "Return": "Enter",
        };
        return displayMap[keyId] || keyId;
    }

    function init() {
        updateLockOverlay();
        Dropzone.init();
        KeyboardVisual.init();
        setupKeyboardCallback();
        renderCustomSoundsList();
        renderMappingsList();
        setupClearMappingsButton();
        subscribeToState();

        const buyBtn = document.getElementById("btn-buy-pro-mapper");
        if (buyBtn) {
            buyBtn.addEventListener("click", () => {
                TauriBridge.openExternal("https://keyboardtalks.lemonsqueezy.com/buy");
            });
        }

        const goSettingsBtn = document.getElementById("btn-mapper-go-settings");
        if (goSettingsBtn) {
            goSettingsBtn.addEventListener("click", () => {
                const settingsTab = document.getElementById("tab-settings");
                if (settingsTab) settingsTab.click();
            });
        }

        const myinstantsLink = document.getElementById("link-myinstants");
        if (myinstantsLink) {
            myinstantsLink.addEventListener("click", (e) => {
                e.preventDefault();
                TauriBridge.openExternal("https://www.myinstants.com");
            });
        }
    }

    function setupClearMappingsButton() {
        const btn = document.getElementById("btn-clear-mappings");
        if (!btn) return;

        btn.addEventListener("click", async () => {
            let confirmed = false;
            if (window.__TAURI__ && window.__TAURI__.dialog) {
                const { confirm } = window.__TAURI__.dialog;
                confirmed = await confirm("Are you sure you want to clear ALL key mappings? This cannot be undone.", "Clear All Mappings");
            } else {
                confirmed = confirm("Are you sure you want to clear ALL key mappings? This cannot be undone.");
            }
            if (!confirmed) return;

            try {
                await invoke("clear_all_mappings");
                AppState.set("custom_mappings", {});
                renderMappingsList();
                KeyboardVisual.refresh();
                showToast("All mappings cleared", "success");
            } catch (error) {
                showToast(`Failed to clear mappings: ${error.message || error}`, "error");
            }
        });
    }

    function updateLockOverlay() {
        const overlay = document.getElementById("mapper-lock");
        if (!overlay) return;

        const isPro = AppState.get("is_pro");

        if (isPro) {
            overlay.style.display = "none";
        } else {
            overlay.style.display = "flex";
        }
    }

    function setupKeyboardCallback() {
        KeyboardVisual.onKeySelected((keyId) => {
            if (keyId === null) {
                hideAssignPanel();
                return;
            }

            showAssignPanel(keyId);
        });
    }

    function showAssignPanel(keyId) {
        hideAssignPanel();

        const container = document.getElementById("keyboard-visual");
        if (!container) return;

        const files = AppState.get("custom_sound_files") || [];
        const currentMappings = AppState.get("custom_mappings") || {};
        const currentMapping = currentMappings[keyId] || null;

        const panel = document.createElement("div");
        panel.id = "assign-panel";
        panel.className = "mt-2 bg-[#111D3A] border border-[rgba(255,255,255,0.06)] p-3";

        const displayName = getDisplayKeyName(keyId);

        let html = `
            <div class="flex items-center justify-between mb-2">
                <p class="text-xs font-medium text-[#94A3B8]">
                    Assign sound to: <span class="text-white font-bold">${escapeText(displayName)}</span>
                </p>
                <button id="btn-close-assign" class="text-[#94A3B8] hover:text-white text-sm">✕</button>
            </div>
        `;

        if (currentMapping) {
            const fileExists = files.includes(currentMapping);
            html += `
                <div class="flex items-center justify-between bg-[#0A1128] px-3 py-2 mb-2 border border-[rgba(255,255,255,0.06)]">
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-[#94A3B8]">Current:</span>
                        <span class="text-xs text-white">${escapeText(currentMapping)}</span>
                        ${!fileExists ? '<span class="text-xs text-[#94A3B8] ml-1">⚠️ missing</span>' : ''}
                    </div>
                    <button class="remove-current-btn text-xs text-[#94A3B8] hover:text-white">
                        Remove
                    </button>
                </div>
            `;
        }

        if (files.length === 0) {
            html += `
                <p class="text-xs text-[#94A3B8] italic">
                    No sounds imported yet. Drop files in the import zone above.
                </p>
            `;
        } else {
            html += `<div class="space-y-1 max-h-32 overflow-y-auto">`;

            for (const file of files) {
                const isActive = file === currentMapping;
                html += `
                    <button
                        class="assign-file-btn w-full flex items-center justify-between
                               px-3 py-1.5 text-xs transition-colors
                               ${isActive
                                   ? "bg-[#4ADE80] text-[#0A1128]"
                                   : "bg-[#0A1128] text-[#94A3B8] hover:bg-[#1A2A4A] hover:text-white"
                               }"
                        data-filename="${escapeText(file)}"
                    >
                        <span class="truncate">${escapeText(file)}</span>
                        ${isActive
                            ? '<span class="text-[#0A1128]">✓</span>'
                            : '<span class="text-[#94A3B8]">Assign</span>'
                        }
                    </button>
                `;
            }

            html += `</div>`;
        }

        panel.innerHTML = html;
        container.appendChild(panel);

        const closeBtn = panel.querySelector("#btn-close-assign");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                KeyboardVisual.clearSelection();
                hideAssignPanel();
            });
        }

        const removeBtn = panel.querySelector(".remove-current-btn");
        if (removeBtn) {
            removeBtn.addEventListener("click", () => {
                removeMapping(keyId);
            });
        }

        const assignBtns = panel.querySelectorAll(".assign-file-btn");
        for (const btn of assignBtns) {
            btn.addEventListener("click", () => {
                const filename = btn.dataset.filename;
                assignSound(keyId, filename);
            });
        }
    }

    function hideAssignPanel() {
        const existing = document.getElementById("assign-panel");
        if (existing && existing.parentNode) {
            existing.parentNode.removeChild(existing);
        }
    }

    async function assignSound(keyId, filename) {
        try {
            await invoke("set_key_mapping", {
                keyName: keyId,
                fileName: filename,
            });

            const mappings = { ...(AppState.get("custom_mappings") || {}) };
            mappings[keyId] = filename;
            AppState.set("custom_mappings", mappings);

            const displayName = getDisplayKeyName(keyId);
            showToast(`Mapped ${displayName} → ${filename}`, "success");

            KeyboardVisual.clearSelection();
            hideAssignPanel();
            renderMappingsList();

        } catch (error) {
            showToast(`Mapping failed: ${error.message || error}`, "error");
            console.error("[Mapper] Assign error:", error);
        }
    }

    async function removeMapping(keyId) {
        try {
            await invoke("remove_mapping", { keyName: keyId });

            const mappings = { ...(AppState.get("custom_mappings") || {}) };
            delete mappings[keyId];
            AppState.set("custom_mappings", mappings);

            showToast(`Removed mapping for ${getDisplayKeyName(keyId)}`, "info");

            KeyboardVisual.clearSelection();
            hideAssignPanel();
            renderMappingsList();

        } catch (error) {
            showToast(`Remove failed: ${error.message || error}`, "error");
            console.error("[Mapper] Remove error:", error);
        }
    }

    function renderCustomSoundsList() {
        const container = document.getElementById("custom-sounds-list");
        if (!container) return;

        const files = AppState.get("custom_sound_files") || [];

        if (files.length === 0) {
            container.innerHTML = `
                <p class="text-xs text-[#94A3B8] italic">
                    No custom sounds imported yet
                </p>
            `;
            return;
        }

        container.innerHTML = "";

        for (const file of files) {
            const item = document.createElement("div");
            item.className = "sound-file-item";

            item.innerHTML = `
                <div class="flex items-center gap-2 min-w-0">
                    <span class="text-[#94A3B8]">🔊</span>
                    <span class="truncate text-xs text-white">${escapeText(file)}</span>
                </div>
            `;

            container.appendChild(item);
        }
    }

    function renderMappingsList() {
        const container = document.getElementById("mappings-list");
        if (!container) return;

        const mappings = AppState.get("custom_mappings") || {};
        const files = AppState.get("custom_sound_files") || [];
        const keys = Object.keys(mappings);

        if (keys.length === 0) {
            container.innerHTML = `
                <p class="text-xs text-[#94A3B8] italic">
                    No keys mapped yet
                </p>
            `;
            return;
        }

        container.innerHTML = "";

        for (const keyName of keys) {
            const fileName = mappings[keyName];
            const fileExists = files.includes(fileName);
            const displayName = getDisplayKeyName(keyName);

            const item = document.createElement("div");
            item.className = "mapping-item";

            item.innerHTML = `
                <div class="flex items-center gap-2 min-w-0">
                    <span class="text-xs font-mono text-white font-bold bg-[#0A1128] px-1.5 py-0.5 border border-[rgba(255,255,255,0.06)]">
                        ${escapeText(displayName)}
                    </span>
                    <span class="text-xs text-[#94A3B8]">→</span>
                    <span class="text-xs text-white truncate">
                        ${escapeText(fileName)}
                        ${!fileExists ? '<span class="text-[#94A3B8] ml-1">⚠️ missing</span>' : ''}
                    </span>
                </div>
                <button
                    class="mapping-remove-btn text-xs text-[#94A3B8] hover:text-white transition-colors ml-2"
                    data-key="${escapeText(keyName)}"
                >
                    ✕
                </button>
            `;

            const removeBtn = item.querySelector(".mapping-remove-btn");
            removeBtn.addEventListener("click", () => {
                removeMapping(keyName);
            });

            container.appendChild(item);
        }
    }

    function subscribeToState() {
        AppState.on("is_pro", () => {
            updateLockOverlay();
        });

        AppState.on("custom_sound_files", () => {
            renderCustomSoundsList();
            renderMappingsList();
        });

        AppState.on("custom_mappings", () => {
            renderMappingsList();
        });
    }

    function escapeText(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        init,
    };

})();

window.Mapper = Mapper;
