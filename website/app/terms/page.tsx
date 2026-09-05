import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0A1128] text-[#94A3B8] py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        <Link href="/" className="text-sm text-[#4ADE80] hover:text-white transition-colors">
          ← Back to home
        </Link>

        <h1 className="text-3xl font-black text-white">Terms of Service</h1>
        <p className="text-xs text-[#94A3B8]">Last updated: August 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">1. Agreement to Terms</h2>
          <p className="text-sm leading-relaxed">
            By downloading, installing, or purchasing KeyboardTalks, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our software.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">2. Pro Pass License</h2>
          <p className="text-sm leading-relaxed">
            The Pro Pass is a one-time purchase of $5.99 that grants you a non-exclusive, non-transferable, lifetime license to use premium features (such as custom sound imports and per-key mapping). Each license supports activation on up to <strong>two (2) personal devices</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">3. Refund Policy</h2>
          <p className="text-sm leading-relaxed font-semibold text-[#4ADE80]">
            We offer a no-questions-asked refund within three (3) days of your purchase. To request a refund, please contact us at linglanboss2@gmail.com with your order email or request it directly through Lemon Squeezy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">4. Disclaimer of Warranty</h2>
          <p className="text-sm leading-relaxed">
            The software is provided &quot;as is&quot;, without warranty of any kind. We do not guarantee that the software will be completely uninterrupted or free from minor operating system conflicts.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white">5. Governing Law</h2>
          <p className="text-sm leading-relaxed">
            These terms shall be governed by and construed in accordance with local regulations, without regard to its conflict of law provisions.
          </p>
        </section>

        <div className="border-t border-[rgba(255,255,255,0.06)] pt-8 text-center text-xs text-[#94A3B8]">
          © {new Date().getFullYear()} KeyboardTalks. All rights reserved.
        </div>
      </div>
    </div>
  );
}
