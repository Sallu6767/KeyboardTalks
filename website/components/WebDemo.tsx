"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const DEMO_PACKS = [
    { id: "mechanical", label: "⌨️ Mechanical" },
    { id: "typewriter", label: "📰 Typewriter" },
    { id: "8bit", label: "🎮 8-Bit" },
];

const KEY_CATEGORIES: Record<string, string> = {
    " ": "space",
    Enter: "enter",
    Backspace: "backspace",
    Shift: "shift",
    Control: "shift",
    Alt: "shift",
    CapsLock: "shift",
    Tab: "shift",
};

const KEYBOARD_ROWS = [
    [
        { code: "KeyQ", label: "Q", size: "normal" },
        { code: "KeyW", label: "W", size: "normal" },
        { code: "KeyE", label: "E", size: "normal" },
        { code: "KeyR", label: "R", size: "normal" },
        { code: "KeyT", label: "T", size: "normal" },
        { code: "KeyY", label: "Y", size: "normal" },
        { code: "KeyU", label: "U", size: "normal" },
        { code: "KeyI", label: "I", size: "normal" },
        { code: "KeyO", label: "O", size: "normal" },
        { code: "KeyP", label: "P", size: "normal" },
        { code: "Backspace", label: "⌫ Backspace", size: "wide" },
    ],
    [
        { code: "KeyA", label: "A", size: "normal" },
        { code: "KeyS", label: "S", size: "normal" },
        { code: "KeyD", label: "D", size: "normal" },
        { code: "KeyF", label: "F", size: "normal" },
        { code: "KeyG", label: "G", size: "normal" },
        { code: "KeyH", label: "H", size: "normal" },
        { code: "KeyJ", label: "J", size: "normal" },
        { code: "KeyK", label: "K", size: "normal" },
        { code: "KeyL", label: "L", size: "normal" },
        { code: "Enter", label: "↵ Enter", size: "wide" },
    ],
    [
        { code: "ShiftLeft", label: "⇧ Shift", size: "extra-wide" },
        { code: "KeyZ", label: "Z", size: "normal" },
        { code: "KeyX", label: "X", size: "normal" },
        { code: "KeyC", label: "C", size: "normal" },
        { code: "KeyV", label: "V", size: "normal" },
        { code: "KeyB", label: "B", size: "normal" },
        { code: "KeyN", label: "N", size: "normal" },
        { code: "KeyM", label: "M", size: "normal" },
        { code: "ShiftRight", label: "Shift ⇧", size: "extra-wide" },
    ],
    [
        { code: "Space", label: "Spacebar", size: "spacebar" },
    ],
];

type SoundBuffers = Record<string, AudioBuffer>;
type PackCache = Record<string, SoundBuffers>;

export default function WebDemo() {
    const [activePack, setActivePack] = useState("mechanical");
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [typedText, setTypedText] = useState("");
    const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
    const [isFocused, setIsFocused] = useState(false);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const packCacheRef = useRef<PackCache>({});
    const buffersRef = useRef<SoundBuffers>({});
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    function getAudioContext(): AudioContext {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext ||
                (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }

    function generateFallbackBuffer(ctx: AudioContext, freq = 440, duration = 0.15): AudioBuffer {
        const sampleRate = ctx.sampleRate;
        const frameCount = sampleRate * duration;
        const buffer = ctx.createBuffer(1, frameCount, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) {
            const t = i / sampleRate;
            data[i] = Math.sin(2 * Math.PI * freq * t) * 0.5;
        }
        return buffer;
    }

    const loadPack = useCallback(async (packId: string) => {
        if (packCacheRef.current[packId]) {
            buffersRef.current = packCacheRef.current[packId];
            return;
        }

        setIsLoading(true);
        setLoadError(false);

        const ctx = getAudioContext();
        const categories = ["default", "space", "enter", "backspace", "shift"];
        const buffers: SoundBuffers = {};

        try {
            await Promise.all(
                categories.map(async (category) => {
                    const url = `/sounds/${packId}/key_${category}.wav`;
                    try {
                        const response = await fetch(url);
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        const arrayBuffer = await response.arrayBuffer();
                        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                        buffers[category] = audioBuffer;
                    } catch (err) {
                        console.warn(`Could not load ${url}, using fallback sine wave:`, err);
                        buffers[category] = generateFallbackBuffer(ctx);
                    }
                })
            );

            packCacheRef.current[packId] = buffers;
            buffersRef.current = buffers;
        } catch (err) {
            console.error("Failed to load sound pack:", err);
            setLoadError(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPack(activePack);
    }, [activePack, loadPack]);

    const playSound = useCallback((key: string) => {
        const ctx = getAudioContext();
        const buffers = buffersRef.current;

        if (!buffers || Object.keys(buffers).length === 0) return;

        let category = "default";
        if (KEY_CATEGORIES[key]) {
            category = KEY_CATEGORIES[key];
        }

        const buffer = buffers[category] || buffers["default"];
        if (!buffer) return;

        try {
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
        } catch (err) {
            console.error("Audio playback error:", err);
        }
    }, []);

    const getLayoutCode = (event: React.KeyboardEvent): string => {
        if (event.key === " ") return "Space";
        if (event.key === "Enter") return "Enter";
        if (event.key === "Backspace") return "Backspace";
        if (event.key === "Shift" && event.location === 1) return "ShiftLeft";
        if (event.key === "Shift" && event.location === 2) return "ShiftRight";
        if (event.key === "Shift") return "ShiftLeft";

        if (/^[a-zA-Z]$/.test(event.key)) {
            return `Key${event.key.toUpperCase()}`;
        }
        return "";
    };

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            playSound(e.key);

            const layoutCode = getLayoutCode(e);
            if (layoutCode) {
                setActiveKeys((prev) => ({ ...prev, [layoutCode]: true }));
            }
        },
        [playSound]
    );

    const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
        const layoutCode = getLayoutCode(e);
        if (layoutCode) {
            setTimeout(() => {
                setActiveKeys((prev) => {
                    const copy = { ...prev };
                    delete copy[layoutCode];
                    return copy;
                });
            }, 80);
        }
    }, []);

    function switchPack(packId: string) {
        setActivePack(packId);
        textareaRef.current?.focus();
    }

    const handleClearText = useCallback(() => {
        setTypedText("");
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.value = "";
                textareaRef.current.focus();
            }
        });
    }, []);

    const getKeySizeClass = (size: string) => {
        switch (size) {
            case "wide":
                return "flex-1 min-w-[70px] sm:min-w-[85px] bg-[#18181B] hover:bg-[#27272A] text-[10px] font-bold text-[#A1A1AA] border border-[#27272A]";
            case "extra-wide":
                return "flex-1 min-w-[80px] sm:min-w-[100px] bg-[#18181B] hover:bg-[#27272A] text-[10px] font-bold text-[#A1A1AA] border border-[#27272A]";
            case "spacebar":
                return "w-full max-w-[280px] sm:max-w-[400px] bg-[#27272A] border border-white text-white text-xs py-2.5 font-black uppercase tracking-wider";
            default:
                return "w-8 h-8 sm:w-10 sm:h-10 text-xs font-semibold text-[#A1A1AA] border border-[#27272A] bg-[#18181B]";
        }
    };

    return (
        <section className="py-20 px-4">
            <div className="max-w-2xl mx-auto">

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        Try it right now
                    </h2>
                    <p className="mt-3 text-sm text-[#A1A1AA]">
                        Pick a sound pack, click inside the box, and start typing on
                        your physical keyboard.
                    </p>
                </div>

                <div className="bg-[#18181B] border border-[#27272A] overflow-hidden">

                    <div className="flex border-b border-[#27272A] bg-[#09090B]">
                        {DEMO_PACKS.map((pack) => (
                            <button
                                key={pack.id}
                                onClick={() => switchPack(pack.id)}
                                className={`
                                    flex-1 py-3 text-sm font-bold transition-all duration-200
                                    ${activePack === pack.id
                                        ? "bg-[#18181B] text-white border-b-2 border-white"
                                        : "text-[#A1A1AA] hover:text-white hover:bg-[#18181B]"
                                    }
                                `}
                            >
                                {pack.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">

                        {isLoading && (
                            <div className="flex items-center justify-center gap-2 mb-4 text-xs text-[#A1A1AA]">
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" />
                                Pre-loading sound buffers...
                            </div>
                        )}

                        {loadError && !isLoading && (
                            <div className="mb-4 text-xs text-[#A1A1AA] text-center font-medium">
                                Some sound assets could not be loaded – fallback tones are used.
                            </div>
                        )}

                        {!isFocused && (
                            <div className="mb-3 text-center">
                                <span className="text-xs text-white font-bold bg-[#09090B] px-3 py-1 border border-[#27272A] animate-pulse">
                                    👆 Click below to activate typing demo
                                </span>
                            </div>
                        )}

                        <div className="relative">
                            <textarea
                                ref={textareaRef}
                                value={typedText}
                                onChange={(e) => setTypedText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onKeyUp={handleKeyUp}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="Start typing on your real keyboard right here..."
                                rows={4}
                                className={`
                                    w-full bg-[#09090B] border px-4 py-3
                                    text-white text-sm font-mono resize-none
                                    placeholder:text-[#A1A1AA]
                                    focus:outline-none transition-all duration-300
                                    ${isFocused
                                        ? "border-white"
                                        : "border-[#27272A]"
                                    }
                                `}
                            />
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-[#A1A1AA]">
                                {typedText.length} characters typed
                            </span>
                            {typedText.length > 0 && (
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={handleClearText}
                                    className="text-xs text-[#A1A1AA] hover:text-white transition-colors font-medium cursor-pointer"
                                >
                                    Clear Text
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="px-6 pb-4 pt-2 border-t border-[#27272A] bg-[#09090B]">
                        <div className="flex flex-col gap-1.5 justify-center items-center">
                            {KEYBOARD_ROWS.map((row, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    className="flex gap-1.5 w-full justify-center"
                                >
                                    {row.map((key) => {
                                        const isPressed = !!activeKeys[key.code];
                                        return (
                                            <div
                                                key={key.code}
                                                className={`
                                                    h-9 sm:h-10 flex items-center justify-center
                                                    border transition-all duration-75 select-none
                                                    ${isPressed
                                                        ? "bg-white border-white text-[#09090B] scale-95"
                                                        : "bg-[#18181B] border-[#27272A] text-[#A1A1AA]"
                                                    }
                                                    ${getKeySizeClass(key.size)}
                                                `}
                                            >
                                                {key.label}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        <p className="mt-4 text-center text-xs text-[#A1A1AA] italic leading-relaxed">
                            * The virtual layout shows common keys, but typing on your
                            physical keyboard works system-wide for every character.
                        </p>
                    </div>

                    <div className="mx-6 mb-6 bg-[#09090B] border border-white p-4">
                        <p className="text-center text-sm text-white">
                            <span className="font-bold text-white">✨ Like this?</span>{" "}
                            Assign any sound to any key with the{" "}
                            <span className="font-bold text-white">Pro Pass</span> on the
                            desktop app.
                        </p>
                    </div>

                    <div className="px-6 py-4 border-t border-[#27272A] bg-[#09090B]">
                        <p className="text-center text-sm text-[#A1A1AA]">
                            Satisfying typing feedback starts here.{" "}
                            <a
                                href="#pricing"
                                className="text-white hover:text-[#A1A1AA] font-bold transition-colors"
                            >
                                Download the App Free →
                            </a>
                        </p>
                    </div>
                </div>

                <p className="mt-4 text-center text-xs text-[#A1A1AA] leading-relaxed">
                    Browser audio engine has typical platform delays. The desktop
                    companion runs native Rust audio engines for an imperceptible{" "}
                    <span className="text-white font-semibold">~3-8ms latency</span>.
                </p>
            </div>
        </section>
    );
}
