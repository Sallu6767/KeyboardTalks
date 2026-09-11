const KeyboardVisual = (() => {

    let selectedKey = null;
    let onKeySelectedCallback = null;

    const KEYBOARD_LAYOUT = [

        [
            { id: "Escape", label: "Esc", width: 1 },
            { id: "F1", label: "F1", width: 1 },
            { id: "F2", label: "F2", width: 1 },
            { id: "F3", label: "F3", width: 1 },
            { id: "F4", label: "F4", width: 1 },
            { id: "F5", label: "F5", width: 1 },
            { id: "F6", label: "F6", width: 1 },
            { id: "F7", label: "F7", width: 1 },
            { id: "F8", label: "F8", width: 1 },
            { id: "F9", label: "F9", width: 1 },
            { id: "F10", label: "F10", width: 1 },
            { id: "F11", label: "F11", width: 1 },
            { id: "F12", label: "F12", width: 1 },
        ],

        [
            { id: "Backquote", label: "`", width: 1 },
            { id: "Digit1", label: "1", width: 1 },
            { id: "Digit2", label: "2", width: 1 },
            { id: "Digit3", label: "3", width: 1 },
            { id: "Digit4", label: "4", width: 1 },
            { id: "Digit5", label: "5", width: 1 },
            { id: "Digit6", label: "6", width: 1 },
            { id: "Digit7", label: "7", width: 1 },
            { id: "Digit8", label: "8", width: 1 },
            { id: "Digit9", label: "9", width: 1 },
            { id: "Digit0", label: "0", width: 1 },
            { id: "Minus", label: "-", width: 1 },
            { id: "Equal", label: "=", width: 1 },
            { id: "BackSpace", label: "⌫", width: 1.5 },
        ],

        [
            { id: "Tab", label: "Tab", width: 1.5 },
            { id: "KeyQ", label: "Q", width: 1 },
            { id: "KeyW", label: "W", width: 1 },
            { id: "KeyE", label: "E", width: 1 },
            { id: "KeyR", label: "R", width: 1 },
            { id: "KeyT", label: "T", width: 1 },
            { id: "KeyY", label: "Y", width: 1 },
            { id: "KeyU", label: "U", width: 1 },
            { id: "KeyI", label: "I", width: 1 },
            { id: "KeyO", label: "O", width: 1 },
            { id: "KeyP", label: "P", width: 1 },
            { id: "BracketLeft", label: "[", width: 1 },
            { id: "BracketRight", label: "]", width: 1 },
            { id: "Backslash", label: "\\", width: 1 },
        ],

        [
            { id: "CapsLock", label: "Caps", width: 1.7 },
            { id: "KeyA", label: "A", width: 1 },
            { id: "KeyS", label: "S", width: 1 },
            { id: "KeyD", label: "D", width: 1 },
            { id: "KeyF", label: "F", width: 1 },
            { id: "KeyG", label: "G", width: 1 },
            { id: "KeyH", label: "H", width: 1 },
            { id: "KeyJ", label: "J", width: 1 },
            { id: "KeyK", label: "K", width: 1 },
            { id: "KeyL", label: "L", width: 1 },
            { id: "Semicolon", label: ";", width: 1 },
            { id: "Quote", label: "'", width: 1 },
            { id: "Return", label: "Enter", width: 1.8 },
        ],

        [
            { id: "ShiftLeft", label: "Shift", width: 2.2 },
            { id: "KeyZ", label: "Z", width: 1 },
            { id: "KeyX", label: "X", width: 1 },
            { id: "KeyC", label: "C", width: 1 },
            { id: "KeyV", label: "V", width: 1 },
            { id: "KeyB", label: "B", width: 1 },
            { id: "KeyN", label: "N", width: 1 },
            { id: "KeyM", label: "M", width: 1 },
            { id: "Comma", label: ",", width: 1 },
            { id: "Period", label: ".", width: 1 },
            { id: "Slash", label: "/", width: 1 },
            { id: "ShiftRight", label: "Shift", width: 2.3 },
        ],

        [
            { id: "ControlLeft", label: "Ctrl", width: 1.5 },
            { id: "MetaLeft", label: "Win", width: 1.2 },
            { id: "Alt", label: "Alt", width: 1.2 },
            { id: "Space", label: "Space", width: 5.5 },
            { id: "AltGr", label: "Alt", width: 1.2 },
            { id: "MetaRight", label: "Win", width: 1.2 },
            { id: "ControlRight", label: "Ctrl", width: 1.5 },
        ],
    ];

    function init() {
        render();
        subscribeToState();
    }

    function render() {
        const container = document.getElementById("keyboard-visual");
        if (!container) return;

        const mappings = AppState.get("custom_mappings") || {};

        container.innerHTML = "";

        for (const row of KEYBOARD_LAYOUT) {
            const rowDiv = document.createElement("div");
            rowDiv.className = "flex gap-0.5 mb-0.5";

            for (const key of row) {
                const keyEl = document.createElement("button");

                let classes = "key-btn";

                if (mappings[key.id]) {
                    classes += " mapped";
                }

                if (key.id === selectedKey) {
                    classes += " selected";
                }

                keyEl.className = classes;

                const widthPx = Math.round(key.width * 28);
                keyEl.style.width = widthPx + "px";
                keyEl.style.height = "28px";
                keyEl.style.fontSize = "9px";
                keyEl.style.flexShrink = "0";

                keyEl.textContent = key.label;

                keyEl.dataset.keyId = key.id;

                if (mappings[key.id]) {
                    keyEl.title = `${key.id} → ${mappings[key.id]}`;
                } else {
                    keyEl.title = key.id;
                }

                keyEl.addEventListener("click", () => {
                    selectKey(key.id);
                });

                rowDiv.appendChild(keyEl);
            }

            container.appendChild(rowDiv);
        }
    }

    function selectKey(keyId) {

        if (selectedKey === keyId) {
            selectedKey = null;
        } else {
            selectedKey = keyId;
        }

        AppState.set("selected_key", selectedKey);

        render();

        if (onKeySelectedCallback) {
            onKeySelectedCallback(selectedKey);
        }
    }

    function refresh() {
        render();
    }

    function getSelectedKey() {
        return selectedKey;
    }

    function clearSelection() {
        selectedKey = null;
        AppState.set("selected_key", null);
        render();
    }

    function onKeySelected(callback) {
        onKeySelectedCallback = callback;
    }

    function subscribeToState() {
        AppState.on("custom_mappings", () => {
            render();
        });
    }

    return {
        init,
        refresh,
        getSelectedKey,
        clearSelection,
        onKeySelected,
    };

})();

window.KeyboardVisual = KeyboardVisual;
