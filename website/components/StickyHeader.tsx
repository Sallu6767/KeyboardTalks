"use client";

const FREEMIUS_CHECKOUT_URL = "https://checkout.freemius.com/app/39189/";

export default function StickyHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A1128]/95 backdrop-blur-sm border-b border-[rgba(255,255,255,0.06)]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⌨️</span>
          <span className="text-sm font-bold text-white tracking-wide">
            KeyboardTalks
          </span>
        </div>
        <a
          href={FREEMIUS_CHECKOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[#4ADE80] hover:bg-[#22C55E] text-[#0A1128] text-sm font-bold transition-colors"
        >
          Buy Pro — $5.99
        </a>
      </div>
    </header>
  );
}
