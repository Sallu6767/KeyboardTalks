"use client";

const LEMON_SQUEEZY_URL = "https://keyboardtalks.lemonsqueezy.com/buy";

const FREE_FEATURES = [
    { text: "5 built-in soundpacks", included: true },
    { text: "Mechanical keyboard sounds", included: true },
    { text: "Typewriter sounds", included: true },
    { text: "8-Bit chiptune sounds", included: true },
    { text: "Arcade sounds", included: true },
    { text: "Click sounds", included: true },
    { text: "Master volume control", included: true },
    { text: "Mute toggle", included: true },
    { text: "Run on startup", included: true },
    { text: "System tray support", included: true },
    { text: "Custom sound import", included: false },
    { text: "Per-key sound mapping", included: false },
    { text: "Unlimited sound files", included: false },
];

const PRO_FEATURES = [
    { text: "Everything in Free", included: true, bold: true },
    { text: "Import .wav and .mp3 files", included: true },
    { text: "Per-key sound mapping", included: true },
    { text: "Assign any sound to any key", included: true },
    { text: "Unlimited custom sounds", included: true },
    { text: "Lifetime license", included: true },
    { text: "All future soundpacks", included: true },
    { text: "Works on phone purchase", included: true },
    { text: "Email license key delivery", included: true },
];

export default function PricingGrid() {
    return (
        <section id="pricing" className="py-20 px-4">
            <div className="max-w-4xl mx-auto">

                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-white">
                        Simple, honest pricing
                    </h2>
                    <p className="mt-3 text-[#94A3B8] max-w-lg mx-auto">
                        Free forever for the essentials.
                        One small payment to unlock everything.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="bg-[#111D3A] border border-[rgba(255,255,255,0.06)] p-6 flex flex-col">

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">🎵</span>
                                <h3 className="text-lg font-bold text-white">Free</h3>
                            </div>
                            <div className="flex items-end gap-1 mb-3">
                                <span className="text-4xl font-black text-white">$0</span>
                                <span className="text-[#94A3B8] mb-1">forever</span>
                            </div>
                            <p className="text-sm text-[#94A3B8]">
                                Everything you need for a satisfying
                                typing experience.
                            </p>
                        </div>

                        <ul className="space-y-2.5 flex-1 mb-6">
                            {FREE_FEATURES.map((feature) => (
                                <li key={feature.text} className="flex items-center gap-2.5">
                                    {feature.included ? (
                                        <span className="text-[#94A3B8] text-sm shrink-0">
                                            ✓
                                        </span>
                                    ) : (
                                        <span className="text-[rgba(255,255,255,0.06)] text-sm shrink-0">
                                            ✕
                                        </span>
                                    )}
                                    <span className={`text-sm ${
                                        feature.included
                                            ? "text-[#94A3B8]"
                                            : "text-[rgba(255,255,255,0.06)]"
                                    }`}>
                                        {feature.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <a
                            href="#hero"
                            className="block w-full py-3 text-center bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-white font-bold transition-colors duration-200"
                        >
                            Download Free
                        </a>

                    </div>

                    <div className="relative bg-[#111D3A] border border-[#4ADE80] p-6 flex flex-col">

                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="px-3 py-1 bg-[#4ADE80] text-[#0A1128] text-xs font-bold">
                                ONE-TIME PAYMENT
                            </span>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">✨</span>
                                <h3 className="text-lg font-bold text-white">Pro Pass</h3>
                            </div>
                            <div className="flex items-end gap-1 mb-3">
                                <span className="text-4xl font-black text-white">$5.99</span>
                                <span className="text-[#94A3B8] mb-1">one-time</span>
                            </div>
                            <p className="text-sm text-[#94A3B8]">
                                Unlock custom sounds and per-key mapping.
                                Pay once, own forever.
                            </p>
                        </div>

                        <ul className="space-y-2.5 flex-1 mb-6">
                            {PRO_FEATURES.map((feature) => (
                                <li key={feature.text} className="flex items-center gap-2.5">
                                    <span className="text-[#4ADE80] text-sm shrink-0">
                                        ✓
                                    </span>
                                    <span className={`text-sm ${
                                        feature.bold
                                            ? "text-white font-semibold"
                                            : "text-[#94A3B8]"
                                    }`}>
                                        {feature.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <a
                            href={LEMON_SQUEEZY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-3 text-center bg-[#4ADE80] hover:bg-[#22C55E] text-[#0A1128] font-bold transition-all duration-200 hover:-translate-y-0.5 mb-4"
                        >
                            🛒 Get Pro Pass — $5.99
                        </a>

                        <div className="p-3 bg-[#0A1128] border border-[rgba(255,255,255,0.06)] text-xs text-[#94A3B8] leading-relaxed mb-4">
                            <span className="text-white font-bold">💡 Tip:</span> Wondering what sounds to map? You can download thousands of free meme, gaming, and viral sound effects from
                            <a
                                href="https://www.myinstants.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#4ADE80] hover:text-white font-bold underline ml-1"
                            >
                                MyInstants.com
                            </a>.
                            <span className="block mt-1 text-[10px] text-[#94A3B8]">
                                * We are in no way affiliated with myinstants.com
                            </span>
                        </div>

                        <div className="mt-auto space-y-1.5 border-t border-[rgba(255,255,255,0.06)] pt-4">
                            <p className="text-center text-xs text-[#94A3B8]">
                                💳 Secure checkout via Lemon Squeezy
                            </p>
                            <p className="text-center text-xs text-[#94A3B8]">
                                📧 License key sent to your email instantly
                            </p>
                            <p className="text-center text-xs text-[#94A3B8]">
                                📱 Buy on any device — activate on your PC
                            </p>
                        </div>

                    </div>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-sm text-[#94A3B8]">
                        Questions?{" "}
                        <a
                            href="#faq"
                            className="text-[#4ADE80] hover:text-white transition-colors"
                        >
                            See the FAQ below ↓
                        </a>
                    </p>
                </div>

            </div>
        </section>
    );
}
