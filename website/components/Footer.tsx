const LINKS = {
  github: "https://github.com/Sallu6767/KeyboardTalks",
  privacy: "/privacy",
  terms: "/terms",
  support: "mailto:linglanboss2@gmail.com",
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="flex flex-col sm:flex-row items-center
                        justify-between gap-6 mb-8">

          <div className="flex items-center gap-2">
            <span className="text-xl">⌨️</span>
            <span className="text-sm font-bold text-gray-200">
              KeyboardTalks
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            <a
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-300
                         transition-colors"
            >
              GitHub
            </a>
            <a
              href={LINKS.privacy}
              className="text-sm text-gray-500 hover:text-gray-300
                         transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href={LINKS.terms}
              className="text-sm text-gray-500 hover:text-gray-300
                         transition-colors"
            >
              Terms of Service
            </a>
            <a
              href={LINKS.support}
              className="text-sm text-gray-500 hover:text-gray-300
                         transition-colors"
            >
              Support
            </a>
          </nav>
        </div>

        <div className="border-t border-gray-800/50 mb-8" />

        <div className="flex flex-col sm:flex-row items-center
                        justify-between gap-4 text-xs text-gray-600">

          <p>
            © {currentYear} KeyboardTalks. All rights reserved.
          </p>

          <p className="flex items-center gap-1">
            Payments processed by
            <a
              href="https://lemonsqueezy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-400
                         transition-colors underline"
            >
              Lemon Squeezy
            </a>
          </p>

        </div>

      </div>
    </footer>
  );
}
