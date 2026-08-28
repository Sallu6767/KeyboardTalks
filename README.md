# ⌨️ KeyboardTalks

**Make every keystroke satisfying.**

KeyboardTalks is a lightweight desktop application that plays beautiful mechanical keyboard sounds for every key you press — system-wide, in any app, with near-zero latency (~3-8ms).

![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-green)
![Size](https://img.shields.io/badge/size-~10MB-orange)

---

## ✨ Features

### Free
- 🎵 **5 built-in soundpacks** — Mechanical, Typewriter, 8-Bit, Arcade, Click
- 🔊 **Master volume control** with mute toggle
- 🪟 **System-wide** — works in any app, game, or browser
- ⚡ **Near-zero latency** (~3-8ms) powered by native Rust audio
- 🔇 **System tray** — runs silently in the background
- 🚀 **Auto-start** — optionally launch on system boot

### Pro Pass ($5.99 one-time)
- 📁 **Custom sound import** — drag & drop your own .wav or .mp3 files
- 🎹 **Per-key mapping** — assign any sound to any individual key
- ♾️ **Unlimited custom sounds**
- 🔑 **Lifetime license** — pay once, own forever

---

## 📥 Download

Grab the latest release for your platform:

| Platform | Download |
|----------|----------|
| 🪟 Windows | [Download .exe](../../releases/latest) |
| 🐧 Linux | [Download .AppImage](../../releases/latest) |

Or visit **[keyboardtalks.vercel.app](https://keyboardtalks.vercel.app)** to try the sounds in your browser before downloading.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Framework | [Tauri v2](https://tauri.app/) |
| Backend | [Rust](https://www.rust-lang.org/) |
| Keyboard Hooks | [rdev](https://github.com/Narsil/rdev) |
| Audio Engine | [rodio](https://github.com/RustAudio/rodio) |
| Frontend UI | HTML / Tailwind CSS / Vanilla JS |
| Website | [Next.js](https://nextjs.org/) / React / TypeScript |
| Payments | [Lemon Squeezy](https://lemonsqueezy.com/) |
| CI/CD | GitHub Actions |
| Hosting | [Vercel](https://vercel.com/) |

---

## 🔨 Build from Source

### Prerequisites
- [Rust](https://rustup.rs/) (stable)
- [Node.js](https://nodejs.org/) (v18+)
- [Tauri CLI](https://tauri.app/v2/guides/getting-started/prerequisites/)

### Steps

```bash
# Clone the repository
git clone https://github.com/Sallu6767/KeyboardTalks.git
cd KeyboardTalks

# Install frontend dependencies and build CSS
npm install
npx tailwindcss -i src/styles/main.css -o src/styles/output.css

# Run in development mode
cd src-tauri
cargo tauri dev

# Build for production
cargo tauri build
```

### Linux Dependencies (Ubuntu/Debian)
```bash
sudo apt-get install -y \
  pkg-config libglib2.0-dev libgtk-3-dev \
  libwebkit2gtk-4.1-dev libayatana-appindicator3-dev \
  librsvg2-dev libssl-dev libasound2-dev \
  libxdo-dev libx11-dev libxtst-dev
```

---

## 🔒 Privacy & Security

- **No keystrokes are recorded, stored, or transmitted.** The app only detects *which key* was pressed to trigger a sound — it never reads what you type.
- **No telemetry or analytics** in the desktop app.
- **No internet connection required** after initial license activation.
- All audio processing happens locally on your machine.
- Source code is open for anyone to audit.

Read our full [Privacy Policy](https://keyboardtalks.vercel.app/privacy) and [Terms of Service](https://keyboardtalks.vercel.app/terms).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 💬 Support

- **Email:** linglanboss2@gmail.com
- **Website:** [keyboardtalks.vercel.app](https://keyboardtalks.vercel.app)

---

<p align="center">
  Made with ❤️ and lots of ⌨️ clicking
</p>
