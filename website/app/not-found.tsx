"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      header.style.display = "none";
    }
    return () => {
      if (header) {
        header.style.display = "";
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1128] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-black text-[#4ADE80]">404</p>
        <h1 className="mt-4 text-2xl font-bold text-white">
          Page not found
        </h1>
        <p className="mt-2 text-[#94A3B8]">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block px-6 py-3 bg-[#4ADE80] hover:bg-[#22C55E] text-[#0A1128] font-bold transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
