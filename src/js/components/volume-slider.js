const VolumeSlider = (() => {
    let track = null;
    let fill = null;
    let thumb = null;
    let label = null;

    let isDragging = false;
    let currentValue = 0.8;
    let debounceTimer = null;

    function init() {
        const container = document.getElementById("volume-slider-container");
        if (!container) {
            console.warn("[VolumeSlider] Container not found");
            return;
        }

        container.innerHTML = "";

        track = document.createElement("div");
        track.className = "volume-track";

        fill = document.createElement("div");
        fill.className = "volume-fill";

        thumb = document.createElement("div");
        thumb.className = "volume-thumb";

        track.appendChild(fill);
        track.appendChild(thumb);
        container.appendChild(track);

        label = document.getElementById("volume-label");

        currentValue = AppState.get("volume") || 0.8;
        updateDisplay();

        attachEvents();

        AppState.on("muted", () => updateDisplay());

        AppState.on("volume", (newValue) => {
            currentValue = newValue;
            updateDisplay();
        });
    }

    function attachEvents() {
        track.addEventListener("mousedown", (e) => {
            isDragging = true;
            handleMove(e);
            document.body.style.cursor = "grabbing";
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            handleMove(e);
        });

        document.addEventListener("mouseup", () => {
            if (!isDragging) return;
            isDragging = false;
            document.body.style.cursor = "";
            sendToBackend(currentValue);
        });

        track.addEventListener("touchstart", (e) => {
            isDragging = true;
            handleTouch(e);
        }, { passive: true });

        document.addEventListener("touchmove", (e) => {
            if (!isDragging) return;
            handleTouch(e);
        }, { passive: true });

        document.addEventListener("touchend", () => {
            if (!isDragging) return;
            isDragging = false;
            sendToBackend(currentValue);
        });
    }

    function handleMove(e) {
        const rect = track.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        let value = x / width;
        value = Math.max(0, Math.min(1, value));
        value = Math.round(value * 100) / 100;

        currentValue = value;
        updateDisplay();
        AppState.set("volume", value);

        if (AppState.get("muted")) {
            unmuteAndSetVolume(value);
        } else {
            debouncedSend(value);
        }
    }

    function handleTouch(e) {
        if (e.touches.length === 0) return;

        const rect = track.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const width = rect.width;

        let value = x / width;
        value = Math.max(0, Math.min(1, value));
        value = Math.round(value * 100) / 100;

        currentValue = value;
        updateDisplay();
        AppState.set("volume", value);

        if (AppState.get("muted")) {
            unmuteAndSetVolume(value);
        } else {
            debouncedSend(value);
        }
    }

    async function unmuteAndSetVolume(value) {
        try {
            const newMuted = await invoke("toggle_mute");
            AppState.set("muted", newMuted);
            debouncedSend(value);
        } catch (error) {
            console.error("[VolumeSlider] Failed to unmute:", error);
        }
    }

    function updateDisplay() {
        if (!fill || !thumb || !label) return;

        const muted = AppState.get("muted");
        const displayValue = muted ? 0 : currentValue;
        const percent = displayValue * 100;

        fill.style.width = percent + "%";
        thumb.style.left = `calc(${percent}% - 7px)`;
        label.textContent = Math.round(percent) + "%";
    }

    function debouncedSend(value) {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
            sendToBackend(value);
        }, 50);
    }

    async function sendToBackend(value) {
        try {
            await invoke("set_volume", { volume: value });
        } catch (error) {
            console.error("[VolumeSlider] Failed to set volume:", error);
        }
    }

    function setValue(value) {
        currentValue = value;
        updateDisplay();
    }

    return {
        init,
        setValue,
    };
})();

window.VolumeSlider = VolumeSlider;
