import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0A1128] text-[#94A3B8] py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        <Link href="/" className="text-sm text-[#4ADE80] hover:text-white transition-colors">
          ← Back to home
        </Link>

        <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
        <p className="text-xs text-[#94A3B8]">Last updated: August 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">1. Introduction</h2>
          <p className="text-sm leading-relaxed">
            Welcome to KeyboardTalks. We are committed to protecting your privacy. KeyboardTalks is a lightweight desktop utility designed to play audio feedback on keystrokes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">2. Keystroke Privacy &amp; Data Security</h2>
          <p className="text-sm leading-relaxed font-semibold text-[#4ADE80]">
            KeyboardTalks processes key events locally on your device to play corresponding sound files. Your keystrokes are NEVER recorded, stored, logged, or transmitted over the internet.
          </p>
          <p className="text-sm leading-relaxed">
            The application operates entirely offline, except during the single, one-time license key validation process with our merchant of record, Lemon Squeezy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">3. Information Collected During Purchase</h2>
          <p className="text-sm leading-relaxed">
            When you purchase our Pro Pass, billing information, email address, and payment details are processed securely by our reseller, <strong>Lemon Squeezy</strong>. We do not store or have access to your raw credit card numbers or banking information. We only receive your purchase email and the associated license activation status.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">4. Updates to this Policy</h2>
          <p className="text-sm leading-relaxed">
            We may update our Privacy Policy from time to time. Any changes will be posted directly on this page.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">5. Contact Us</h2>
          <p className="text-sm leading-relaxed">
            If you have any questions or concerns about your privacy, feel free to contact us at: <a href="mailto:linglanboss2@gmail.com" className="text-[#4ADE80] hover:text-white underline">linglanboss2@gmail.com</a>.
          </p>
        </section>

        <div className="border-t border-[rgba(255,255,255,0.06)] pt-8 text-center text-xs text-[#94A3B8]">
          © {new Date().getFullYear()} KeyboardTalks. All rights reserved.
        </div>
      </div>
    </div>
  );
}
