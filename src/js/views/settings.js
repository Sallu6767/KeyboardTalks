const Settings = (() => {

    const URLS = {
        buy_pro: "https://keyboardtalks.lemonsqueezy.com/buy",
        website: "https://keyboardtalks.vercel.app",
        github: "https://github.com/Sallu6767/KeyboardTalks",
        privacy: "https://keyboardtalks.vercel.app/privacy",
    };

    function init() {
        updateProStatus();
        setupLicenseInput();
        setupBuyLink();
        setupExternalLinks();
        subscribeToState();
    }

    function updateProStatus() {
        const dot = document.getElementById("pro-status-dot");
        const text = document.getElementById("pro-status-text");
        const input = document.getElementById("license-input");
        const btn = document.getElementById("btn-validate");
        const buySection = document.getElementById("btn-buy-pro");

        if (!dot || !text) return;

        const isPro = AppState.get("is_pro");
        const licenseKey = AppState.get("license_key");

        if (isPro) {
            dot.className = "w-2 h-2 rounded-full bg-emerald-500";
            text.className = "text-sm text-emerald-400 font-medium";
            text.textContent = "Pro Pass Active ✓";

            if (input && licenseKey) {
                input.value = maskKey(licenseKey);
                input.disabled = true;
                input.classList.add("opacity-50");
            }

            if (btn) {
                btn.textContent = "Activated ✓";
                btn.disabled = true;
                btn.classList.add("opacity-50", "cursor-not-allowed");
                btn.classList.remove("hover:bg-indigo-500");
            }

            const buyParent = buySection?.closest("div");
            if (buyParent) buyParent.style.display = "none";

            const howItWorks = document.getElementById("how-it-works-section");
            if (howItWorks) howItWorks.style.display = "none";

        } else {
            dot.className = "w-2 h-2 rounded-full bg-gray-600";
            text.className = "text-sm text-gray-400";
            text.textContent = "Free Plan";

            if (input) {
                input.value = "";
                input.disabled = false;
                input.classList.remove("opacity-50");
            }

            if (btn) {
                btn.textContent = "Activate";
                btn.disabled = false;
                btn.classList.remove("opacity-50", "cursor-not-allowed");
                btn.classList.add("hover:bg-indigo-500");
            }
        }
    }

    function setupLicenseInput() {
        const input = document.getElementById("license-input");
        const btn = document.getElementById("btn-validate");
        const message = document.getElementById("license-message");

        if (!input || !btn) return;

        btn.addEventListener("click", () => {
            validateLicense(input.value.trim());
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") validateLicense(input.value.trim());
        });

        input.addEventListener("input", () => {
            if (message) message.classList.add("hidden");
        });
    }

    async function validateLicense(key) {
        const input = document.getElementById("license-input");
        const btn = document.getElementById("btn-validate");

        if (!key) {
            showMessage("Please paste your license key from the email.", "error");
            return;
        }

        if (btn) {
            btn.textContent = "Validating...";
            btn.disabled = true;
        }
        if (input) input.disabled = true;

        try {
            const result = await invoke("validate_license", { key });

            if (result.valid) {
                AppState.set("is_pro", true);
                AppState.set("license_key", key);

                showMessage(result.message, "success");
                showToast("Pro Pass activated! 🎉", "success");
                updateProStatus();

                try {
                    const files = await invoke("get_custom_sound_files");
                    AppState.set("custom_sound_files", files);
                } catch (e) {}

            } else {
                showMessage(result.message, "error");
                showToast("License validation failed", "error");

                if (btn) {
                    btn.textContent = "Activate";
                    btn.disabled = false;
                }
                if (input) input.disabled = false;
            }

        } catch (error) {
            showMessage(
                "Could not validate. Check your internet connection.",
                "error"
            );

            if (btn) {
                btn.textContent = "Activate";
                btn.disabled = false;
            }
            if (input) input.disabled = false;
        }
    }

    function showMessage(text, type) {
        const message = document.getElementById("license-message");
        if (!message) return;

        message.textContent = text;
        message.classList.remove("hidden", "text-emerald-400", "text-red-400");
        message.classList.add(type === "success" ? "text-emerald-400" : "text-red-400");
    }

    function maskKey(key) {
        if (!key || key.length < 8) return key;
        const first = key.substring(0, 4);
        const last = key.substring(key.length - 4);
        const middle = "•".repeat(Math.max(key.length - 8, 4));
        return first + middle + last;
    }

    function setupBuyLink() {
        const buyBtn = document.getElementById("btn-buy-pro");
        if (!buyBtn) return;

        buyBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (AppState.get("is_pro")) {
                showToast("You already have Pro!", "info");
                return;
            }
            TauriBridge.openExternal(URLS.buy_pro);
        });
    }

    function setupExternalLinks() {
        const links = [
            { id: "link-website", url: URLS.website },
            { id: "link-github", url: URLS.github },
            { id: "link-privacy", url: URLS.privacy },
        ];

        for (const link of links) {
            const el = document.getElementById(link.id);
            if (!el) continue;
            el.addEventListener("click", (e) => {
                e.preventDefault();
                TauriBridge.openExternal(link.url);
            });
        }
    }

    function subscribeToState() {
        AppState.on("is_pro", () => updateProStatus());
    }

    return { init };

})();

window.Settings = Settings;
