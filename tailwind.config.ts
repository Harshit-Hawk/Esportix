import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        esports: {
          navy: {
            DEFAULT: "#101C34",
            dark: "#0B132B",
            deep: "#070C1E",
            light: "#1A2B50",
            card: "#12203F",
            border: "#1F3563",
          },
          orange: {
            DEFAULT: "#E96D2F",
            hover: "#D65C1F",
            glow: "rgba(233, 109, 47, 0.4)",
            light: "#FF8C53",
          },
          gold: {
            DEFAULT: "#FFB703",
            glow: "rgba(255, 183, 3, 0.4)",
            light: "#FCD34D",
          },
          silver: {
            DEFAULT: "#94A3B8",
            light: "#CBD5E1",
          },
          bronze: {
            DEFAULT: "#B45309",
            light: "#D97706",
          },
          cream: {
            DEFAULT: "#F8F3E7",
            dim: "#E8E2D5",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Impact", "Chakra Petch", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "live-glow": "liveGlow 2s ease-in-out infinite alternate",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        liveGlow: {
          "0%": { opacity: "0.6", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1.03)", filter: "drop-shadow(0 0 10px rgba(233, 109, 47, 0.8))" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
