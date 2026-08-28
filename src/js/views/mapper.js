const Mapper = (() => {

    function init() {
        updateLockOverlay();
        Dropzone.init();
        KeyboardVisual.init();
        setupKeyboardCallback();
        renderCustomSoundsList();
        renderMappingsList();
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
        panel.className = "mt-2 bg-gray-800 rounded-lg p-3 border border-gray-700";

        let html = `
            <div class="flex items-center justify-between mb-2">
                <p class="text-xs font-medium text-gray-300">
                    Assign sound to: <span class="text-indigo-400 font-bold">${escapeText(keyId)}</span>
                </p>
                <button id="btn-close-assign" class="text-gray-500 hover:text-white text-sm">✕</button>
            </div>
        `;

        if (currentMapping) {
            const fileExists = files.includes(currentMapping);
            html += `
                <div class="flex items-center justify-between bg-gray-900 rounded-md px-3 py-2 mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500">Current:</span>
                        <span class="text-xs text-indigo-300">${escapeText(currentMapping)}</span>
                        ${!fileExists ? '<span class="text-xs text-red-400 ml-1">⚠️ missing</span>' : ''}
                    </div>
                    <button class="remove-current-btn text-xs text-red-400 hover:text-red-300">
                        Remove
                    </button>
                </div>
            `;
        }

        if (files.length === 0) {
            html += `
                <p class="text-xs text-gray-600 italic">
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
                               px-3 py-1.5 rounded text-xs transition-colors
                               ${isActive
                                   ? "bg-indigo-600 text-white"
                                   : "bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white"
                               }"
                        data-filename="${escapeText(file)}"
                    >
                        <span class="truncate">${escapeText(file)}</span>
                        ${isActive
                            ? '<span class="text-indigo-200">✓</span>'
                            : '<span class="text-gray-600">Assign</span>'
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

            showToast(`Mapped ${keyId} → ${filename}`, "success");

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

            showToast(`Removed mapping for ${keyId}`, "info");

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
                <p class="text-xs text-gray-600 italic">
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
                    <span class="text-gray-500">🔊</span>
                    <span class="truncate text-xs">${escapeText(file)}</span>
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
                <p class="text-xs text-gray-600 italic">
                    No keys mapped yet
                </p>
            `;
            return;
        }

        container.innerHTML = "";

        for (const keyName of keys) {
            const fileName = mappings[keyName];
            const fileExists = files.includes(fileName);

            const item = document.createElement("div");
            item.className = "mapping-item";

            item.innerHTML = `
                <div class="flex items-center gap-2 min-w-0">
                    <span class="text-xs font-mono text-indigo-400 font-bold
                                 bg-indigo-950/50 px-1.5 py-0.5 rounded">
                        ${escapeText(keyName)}
                    </span>
                    <span class="text-xs text-gray-500">→</span>
                    <span class="text-xs text-gray-300 truncate">
                        ${escapeText(fileName)}
                        ${!fileExists ? '<span class="text-red-400 ml-1">⚠️ missing</span>' : ''}
                    </span>
                </div>
                <button
                    class="mapping-remove-btn text-xs text-red-400
                           hover:text-red-300 transition-colors ml-2"
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
