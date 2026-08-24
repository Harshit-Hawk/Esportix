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
        background: "#090A10",
        foreground: "#F8FAFC",
        // Retro Futurism Synthwave Palette
        retro: {
          dark: "#090A10",
          card: "#11131F",
          panel: "#16192B",
          border: "#242945",
          borderHover: "#00F0FF",
          cyan: "#00F0FF",
          pink: "#FF2A85",
          purple: "#9D4EDD",
          yellow: "#FFE600",
          amber: "#FF9E00",
          green: "#00FF66",
          text: "#E2E8F0",
          muted: "#94A3B8",
        },
        bgis: {
          dark: "#090A10",
          header: "#10121E",
          gold: "#FFE600",
          yellow: "#FFCC00",
          cream: "#16192B",
          creambg: "#11131F",
          rowEven: "#11131F",
          rowOdd: "#0D0E18",
          border: "#242945",
          text: "#F8FAFC",
        },
        brand: {
          50: "#ECFEFF",
          100: "#CFFAFE",
          500: "#06B6D4",
          600: "#00F0FF",
          700: "#0891B2",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
        display: ["var(--font-orbitron)", "Orbitron", "Chakra Petch", "sans-serif"],
        orbitron: ["var(--font-orbitron)", "Orbitron", "sans-serif"],
        chakra: ["var(--font-chakra)", "Chakra Petch", "sans-serif"],
        oswald: ["var(--font-oswald)", "Oswald", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
