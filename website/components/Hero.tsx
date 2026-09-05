"use client";

import { useState, useEffect } from "react";

const GITHUB_OWNER = "Sallu6767";
const GITHUB_REPO = "KeyboardTalks";

const FALLBACK_WINDOWS_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
const FALLBACK_LINUX_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubRelease {
  tag_name: string;
  assets: ReleaseAsset[];
}

export default function Hero() {
  const [windowsUrl, setWindowsUrl] = useState(FALLBACK_WINDOWS_URL);
  const [linuxUrl, setLinuxUrl] = useState(FALLBACK_LINUX_URL);
  const [version, setVersion] = useState("latest");
  const [loadingUrls, setLoadingUrls] = useState(true);

  useEffect(() => {
    async function fetchLatestRelease() {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (!response.ok) {
          console.warn(
            `GitHub releases not available yet (${response.status}). ` +
            `Using fallback URLs. This is normal before your first release.`
          );
          setLoadingUrls(false);
          return;
        }

        const release: GitHubRelease = await response.json();
        setVersion(release.tag_name);

        const windowsAsset = release.assets.find(
          (asset) =>
            asset.name.endsWith(".exe") ||
            asset.name.endsWith(".msi") ||
            asset.name.includes("setup")
        );

        const linuxAsset = release.assets.find(
          (asset) =>
            asset.name.endsWith(".AppImage") ||
            asset.name.endsWith(".deb")
        );

        if (windowsAsset) setWindowsUrl(windowsAsset.browser_download_url);
        if (linuxAsset) setLinuxUrl(linuxAsset.browser_download_url);

      } catch (error) {
        console.warn("Could not fetch GitHub release info:", error);
      } finally {
        setLoadingUrls(false);
      }
    }

    fetchLatestRelease();
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#4ADE80]/5" />
      </div>

      <div className="relative mb-6 flex items-center gap-2 px-3 py-1.5 bg-[#111D3A] border border-[rgba(255,255,255,0.06)] text-xs text-[#94A3B8]">
        <span className="w-1.5 h-1.5 bg-[#4ADE80] animate-pulse" />
        Free for Windows &amp; Linux
      </div>

      <h1 className="relative text-center text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-3xl leading-tight">
        Make Every Keystroke
        <span className="block text-[#94A3B8]">
          Satisfying
        </span>
      </h1>

      <p className="relative mt-6 text-center text-[#94A3B8] text-lg max-w-xl leading-relaxed">
        KeyboardTalks plays beautiful mechanical keyboard sounds for every
        key you press — system-wide, any app, near-zero latency. (Scroll down to try it out.)
      </p>

      <div className="relative mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-md">

        <a
          href={windowsUrl}
          className="flex items-center justify-center gap-2 flex-1 px-6 py-3.5 bg-[#4ADE80] hover:bg-[#22C55E] text-[#0A1128] font-bold transition-all duration-200 hover:-translate-y-0.5"
        >
          <WindowsIcon />
          <div className="text-left">
            <div className="text-sm font-bold">Download for Windows</div>
            <div className="text-xs text-[#0A1128] font-normal opacity-80">
              {loadingUrls ? "..." : `Free · ${version}`}
            </div>
          </div>
        </a>

        <a
          href={linuxUrl}
          className="flex items-center justify-center gap-2 flex-1 px-6 py-3.5 bg-[#111D3A] hover:bg-[#1A2A4A] text-white font-bold transition-all duration-200 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-0.5"
        >
          <LinuxIcon />
          <div className="text-left">
            <div className="text-sm font-bold">Download for Linux</div>
            <div className="text-xs text-[#94A3B8] font-normal">
              {loadingUrls ? "..." : `Free · ${version}`}
            </div>
          </div>
        </a>
      </div>

      <p className="relative mt-4 text-xs text-[#94A3B8]">
        No account needed · No data collected · Runs silently in background
      </p>

      <div className="relative mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
        {[
          { icon: "⚡", label: "~3-8ms latency" },
          { icon: "🎵", label: "5 soundpacks" },
          { icon: "🔇", label: "Mute anytime" },
          { icon: "🪟", label: "System-wide" },
        ].map((feature) => (
          <div
            key={feature.label}
            className="flex flex-col items-center gap-2 p-4 bg-[#111D3A] border border-[rgba(255,255,255,0.06)] text-center"
          >
            <span className="text-2xl">{feature.icon}</span>
            <span className="text-xs text-[#94A3B8]">{feature.label}</span>
          </div>
        ))}
      </div>

    </section>
  );
}

function WindowsIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0"
    >
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  );
}

function LinuxIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0"
    >
      <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.138.97-.457 1.308-.953a2.315 2.315 0 00.933.53c.4.116.824.077 1.207-.013.306-.074.612-.221.849-.45a3.142 3.142 0 001.068.585c.457.13.905.077 1.29-.045.314-.1.603-.25.88-.43.166.115.333.17.5.194.496.072.95-.168 1.293-.47.33-.3.573-.72.688-1.12.113-.395.13-.814.04-1.186-.063-.253-.162-.48-.27-.686a4.2 4.2 0 00-.026-.116c-.015-.065-.03-.130-.044-.195l-.004-.016-.006-.025c-.031-.14-.06-.278-.09-.416-.03-.14-.062-.28-.094-.419-.063-.28-.124-.56-.186-.838-.056-.253-.106-.506-.16-.76a9.67 9.67 0 01-.153-.87c-.03-.237-.05-.474-.055-.712-.006-.377.014-.752.06-1.12a8.8 8.8 0 01.27-1.355 7.87 7.87 0 01.598-1.521 6.43 6.43 0 01.97-1.443 5.76 5.76 0 011.39-1.108 5.58 5.58 0 011.773-.605 5.92 5.92 0 011.976.02c.336.063.666.16.986.293v-.001a6.32 6.32 0 011.654 1.009c.477.42.86.93 1.122 1.5.264.573.393 1.2.38 1.835-.012.634-.166 1.264-.453 1.843a5.1 5.1 0 01-1.12 1.562 5.8 5.8 0 01-1.65 1.045c-.63.264-1.305.41-1.986.428a5.93 5.93 0 01-2.018-.29 5.62 5.62 0 01-1.728-.966 5.3 5.3 0 01-1.217-1.48 5.17 5.17 0 01-.527-1.854 5.21 5.21 0 01.115-1.963 5.4 5.4 0 01.765-1.75 5.68 5.68 0 011.303-1.365 5.95 5.95 0 011.73-.843z" />
    </svg>
  );
}
