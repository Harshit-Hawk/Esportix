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
        background: "#05050A",
        foreground: "#FCEE0A",
        // Authentic Cyberpunk 2077 Palette
        cyber: {
          yellow: "#FCEE0A",
          gold: "#FFE600",
          cyan: "#00F0FF",
          pink: "#FF0055",
          magenta: "#FF007F",
          green: "#00FF66",
          purple: "#9D4EDD",
          dark: "#05050A",
          panel: "#0A0A12",
          card: "#0E0E1A",
          border: "#252538",
          borderYellow: "#FCEE0A",
          borderCyan: "#00F0FF",
          borderPink: "#FF0055",
          text: "#E2E8F0",
          muted: "#8A8A9E",
        },
        brand: {
          50: "#FEFFE5",
          100: "#FDFFCC",
          500: "#FCEE0A",
          600: "#E5D700",
          700: "#B8AC00",
        },
      },
      fontFamily: {
        sans: ["var(--font-rajdhani)", "Rajdhani", "Chakra Petch", "sans-serif"],
        display: ["var(--font-cyber)", "Orbitron", "Rajdhani", "sans-serif"],
        orbitron: ["var(--font-orbitron)", "Orbitron", "sans-serif"],
        rajdhani: ["var(--font-rajdhani)", "Rajdhani", "sans-serif"],
        chakra: ["var(--font-chakra)", "Chakra Petch", "sans-serif"],
        oswald: ["var(--font-oswald)", "Oswald", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
