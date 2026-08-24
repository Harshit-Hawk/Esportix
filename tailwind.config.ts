import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Light & Electric Blue / Yellow Palette
        esports: {
          light: {
            bg: "#F8FAFC",
            card: "#FFFFFF",
            subtle: "#F1F5F9",
            border: "#E2E8F0",
            hover: "#F8FAFC",
          },
          // Electric Blue accents
          blue: {
            DEFAULT: "#0066FF",
            light: "#38BDF8",
            dark: "#0052CC",
            glow: "rgba(0, 102, 255, 0.25)",
          },
          // Electric Yellow accents
          yellow: {
            DEFAULT: "#FFDE00",
            light: "#FEF08A",
            dark: "#EAB308",
            gold: "#F59E0B",
            glow: "rgba(255, 222, 0, 0.35)",
          },
          // Legacy mappings mapped to new Light & Electric palette
          navy: {
            DEFAULT: "#FFFFFF",
            dark: "#F8FAFC",
            card: "#FFFFFF",
            light: "#F1F5F9",
            border: "#E2E8F0",
            deep: "#F8FAFC",
          },
          orange: "#0066FF", // Electric Blue is the primary action color
          gold: "#FFDE00",   // Electric Yellow is the primary reward color
          silver: "#64748B", // High contrast dark slate text
          bronze: "#B45309",
          cream: "#0F172A",  // Deep slate for readable headers
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Outfit", "sans-serif"],
        athletic: ["var(--font-athletic)", "Teko", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
