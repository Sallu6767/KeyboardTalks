"use client";

import { useState } from "react";

interface FAQItem {
    question: string;
    answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
    {
        question: "Is this a keylogger? Is it safe?",
        answer:
            "Absolutely Safe. KeyboardTalks only listens to which KEY was pressed — not what you type. It never records, stores, or sends your keystrokes anywhere. The app has no internet connection except for one-time license validation with Lemon Squeezy. All your data stays on your own PC. The source code is open on GitHub so you can verify this yourself.",
    },
    {
        question: "How does it work in the background?",
        answer:
            "KeyboardTalks uses a low-level OS keyboard hook (SetWindowsHookEx on Windows, XRecord on Linux) to detect key presses system-wide. This is the same technology used by accessibility tools and hotkey managers. It works in any app — your browser, Word, games, anywhere — without needing admin rights on Windows.",
    },
    {
        question: "What OS versions are supported?",
        answer:
            "Windows 10 and Windows 11 are fully supported. Linux works on X11 desktop environments (Ubuntu, Fedora, Debian, etc.). Wayland support is limited due to security restrictions in the Wayland protocol itself — this is a known Linux limitation, not specific to KeyboardTalks. macOS is not currently supported.",
    },
    {
        question: "How does the Pro license work?",
        answer:
            "You buy a Pro Pass once for $5.99 on this website. Lemon Squeezy (our payment processor) sends a license key to your email immediately after purchase. You open the KeyboardTalks app, go to the Settings tab or use the Activate button on the home screen, paste your key, and click Activate. Pro features unlock instantly — no ongoing subscription, no recurring charges.",
    },
    {
        question: "Can I buy on my phone and use on my PC?",
        answer:
            "Yes, this is fully supported and a common flow. Visit this website on your phone, click Get Pro Pass, complete the purchase. Lemon Squeezy emails you a license key. Later, open KeyboardTalks on your PC, paste the key in the app, and activate. The license key is just a text string — it works on any device.",
    },
    {
        question: "Can I use it on multiple PCs?",
        answer:
            "Each Pro Pass license supports up to 2 device activations. This covers your home PC and work PC, or a desktop and a laptop. If you need more activations, simply purchase an additional license. If you reinstall Windows or switch computers, your license key can be reused on the new machine.",
    },
    {
        question: "What if I lose my license key?",
        answer:
            "Check your email inbox (and spam folder) for the purchase confirmation from Lemon Squeezy. That email always contains your license key. If you still cannot find it, email us at linglanboss2@gmail.com with your purchase email and we will retrieve it for you.",
    },
    {
        question: "What custom sound formats are supported?",
        answer:
            "The Pro tier supports .wav and .mp3 files. Sound files must be under 2 seconds long and under 2MB in size. This keeps playback instant and prevents overlap chaos during fast typing. Longer files would cause multiple overlapping sounds at normal typing speeds.",
    },
    {
        question: "Where can I find free sounds to use with Pro?",
        answer:
            "You can download thousands of free meme, gaming, and viral sound effects from myinstants.com. Simply create a free account, find a sound you like, download it as an MP3 or WAV file, and drag it into the KeyboardTalks app. Please note: we are in no way affiliated with myinstants.com — we just think it's a great resource for finding fun sounds!",
    },
    {
        question: "Will it slow down my PC or affect performance?",
        answer:
            "No. KeyboardTalks is built in Rust, which is one of the fastest and most memory-efficient programming languages. The app uses about 30-60MB of RAM when running, which is less than a single browser tab. All sound files are pre-loaded into memory at startup so there is zero disk I/O during typing. It runs silently in the system tray and has no noticeable impact on CPU.",
    },
    {
        question: "Can I get a refund?",
        answer:
            "Yes. We offer a no-questions-asked refund within 3 days of purchase. Email us at linglanboss2@gmail.com with your order details and we will process it promptly. The free tier is fully functional, so we encourage you to try it before purchasing Pro.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    function toggleQuestion(index: number) {
        setOpenIndex(openIndex === index ? null : index);
    }

    return (
        <section id="faq" className="py-20 px-4">
            <div className="max-w-2xl mx-auto">

                <div className="text-center mb-12">
                    <h2 className="text-3xl font-black text-white">
                        Frequently asked questions
                    </h2>
                    <p className="mt-3 text-[#A1A1AA]">
                        Everything you need to know before downloading.
                    </p>
                </div>

                <div className="space-y-2">
                    {FAQ_ITEMS.map((item, index) => (
                        <div
                            key={index}
                            className={`
                                border transition-colors duration-200
                                ${openIndex === index
                                    ? "border-white bg-[#18181B]"
                                    : "border-[#27272A] bg-[#18181B]"
                                }
                            `}
                        >
                            <button
                                onClick={() => toggleQuestion(index)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left"
                            >
                                <span className={`text-sm font-medium pr-4 ${
                                    openIndex === index
                                        ? "text-white"
                                        : "text-[#A1A1AA]"
                                }`}>
                                    {item.question}
                                </span>

                                <span className={`
                                    shrink-0 text-[#A1A1AA] transition-transform duration-200
                                    ${openIndex === index ? "rotate-180" : ""}
                                `}>
                                    <ChevronIcon />
                                </span>
                            </button>

                            <div className={`
                                overflow-hidden transition-all duration-300
                                ${openIndex === index
                                    ? "max-h-96 opacity-100"
                                    : "max-h-0 opacity-0"
                                }
                            `}>
                                <div className="px-5 pb-5">
                                    <div className="border-t border-[#27272A] pt-4">
                                        <p className="text-sm text-[#A1A1AA] leading-relaxed">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

                <div className="mt-10 text-center p-6 bg-[#18181B] border border-[#27272A]">
                    <p className="text-sm text-[#A1A1AA]">
                        Still have questions?
                    </p>
                    <a
                        href="mailto:linglanboss2@gmail.com"
                        className="mt-2 inline-block text-sm text-white hover:text-[#A1A1AA] transition-colors font-medium"
                    >
                        linglanboss2@gmail.com →
                    </a>
                </div>

            </div>
        </section>
    );
}

function ChevronIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}
