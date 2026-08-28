const Dropzone = (() => {

    const ALLOWED_EXTENSIONS = ["wav", "mp3"];
    let dropzone = null;
    let isPro = false;

    function init() {
        dropzone = document.getElementById("dropzone");
        if (!dropzone) {
            console.warn("[Dropzone] Element not found");
            return;
        }

        AppState.on("is_pro", (pro) => {
            isPro = pro;
            updateVisualState();
        });
        isPro = AppState.get("is_pro");
        updateVisualState();

        dropzone.addEventListener("click", () => {
            openFileDialog();
        });

        setupNativeDragDrop();
    }

    function updateVisualState() {
        if (!dropzone) return;
        if (isPro) {
            dropzone.classList.remove("opacity-50", "cursor-not-allowed");
            dropzone.classList.add("cursor-pointer");
        } else {
            dropzone.classList.add("opacity-50", "cursor-not-allowed");
            dropzone.classList.remove("cursor-pointer");
        }
    }

    async function setupNativeDragDrop() {
        try {
            if (typeof window === "undefined" || !window.__TAURI__) return;

            const { getCurrentWebviewWindow } = window.__TAURI__.webviewWindow;
            const webview = getCurrentWebviewWindow();

            await webview.onDragDropEvent((event) => {
                if (!isPro) return;

                if (event.payload.type === "hover") {
                    dropzone.classList.add("dropzone-active");
                } else if (event.payload.type === "drop") {
                    dropzone.classList.remove("dropzone-active");
                    const paths = event.payload.paths;
                    if (paths && paths.length > 0) {
                        handleFilesFromPaths(paths);
                    }
                } else {
                    dropzone.classList.remove("dropzone-active");
                }
            });
        } catch (error) {
            console.warn("[Dropzone] Native drag-drop setup failed:", error);
        }
    }

    async function openFileDialog() {
        if (!isPro) {
            showToast("Pro Pass required to import sounds", "error");
            return;
        }

        try {
            const path = await invoke("open_file_dialog");
            if (path) {
                await processFilePath(path);
            }
        } catch (error) {
            showToast("Failed to open file browser", "error");
            console.error("[Dropzone] Dialog error:", error);
        }
    }

    async function handleFilesFromPaths(paths) {
        for (const path of paths) {
            await processFilePath(path);
        }
    }

    async function processFilePath(filePath) {
        if (!isPro) {
            showToast("Pro Pass required to import sounds", "error");
            return;
        }

        const fileName = filePath.split(/[\\/]/).pop() || "unknown";
        const extension = getExtension(fileName);

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            showToast(
                `Invalid file type: .${extension} (only .wav and .mp3)`,
                "error"
            );
            return;
        }

        showToast(`Importing ${fileName}...`, "info", 1500);

        try {
            const savedName = await invoke("import_custom_sound", {
                filePath: filePath,
            });

            const currentFiles = AppState.get("custom_sound_files") || [];
            if (!currentFiles.includes(savedName)) {
                AppState.set("custom_sound_files", [...currentFiles, savedName]);
            }

            showToast(`Imported: ${savedName}`, "success");

        } catch (error) {
            showToast(`Import failed: ${error.message || error}`, "error");
            console.error("[Dropzone] Import error:", error);
        }
    }

    function getExtension(filename) {
        const parts = filename.split(".");
        if (parts.length < 2) return "";
        return parts[parts.length - 1].toLowerCase();
    }

    return {
        init,
    };

})();

window.Dropzone = Dropzone;
