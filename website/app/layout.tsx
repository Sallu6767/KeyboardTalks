import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KeyboardTalks — Mechanical Keyboard Sounds for Every Keystroke",
  description:
    "Make every keystroke satisfying. KeyboardTalks plays beautiful mechanical keyboard sounds system-wide. Free for Windows & Linux.",
  keywords: [
    "keyboard sounds",
    "mechanical keyboard",
    "typing sounds",
    "keystroke sounds",
    "keyboard app",
    "typewriter sounds",
    "ASMR typing",
  ],
  authors: [{ name: "KeyboardTalks" }],

  openGraph: {
    title: "KeyboardTalks — Mechanical Keyboard Sounds for Every Keystroke",
    description:
      "Make every keystroke satisfying. 5 built-in soundpacks. Custom sound mapping with Pro.",
    url: "https://keyboardtalks.vercel.app",
    siteName: "KeyboardTalks",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KeyboardTalks - Mechanical keyboard sounds",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "KeyboardTalks — Mechanical Keyboard Sounds",
    description:
      "Make every keystroke satisfying. Free for Windows & Linux.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#0A1128] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
