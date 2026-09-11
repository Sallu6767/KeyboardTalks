module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary palette
                navy: "#0A1128",
                "navy-light": "#111D3A",
                "navy-mid": "#1A2A4A",
                green: "#4ADE80",
                "green-dark": "#22C55E",
                text: "#FFFFFF",
                muted: "#94A3B8",
                border: "rgba(255, 255, 255, 0.06)",
                "border-light": "rgba(255, 255, 255, 0.12)",
            },
        },
    },
    plugins: [],
};
