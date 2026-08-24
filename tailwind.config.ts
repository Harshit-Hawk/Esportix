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
        background: "#F8FAFC",
        foreground: "#0F172A",
        // BGIS Official Broadcast Colors
        bgis: {
          dark: "#141414",
          header: "#1C1C1C",
          gold: "#F5C400",
          yellow: "#FFCC00",
          cream: "#EDE7CE",
          creambg: "#F3EED9",
          rowEven: "#EDE8D2",
          rowOdd: "#E5DEC3",
          border: "#D8D0B5",
          text: "#171717",
        },
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
        display: ["var(--font-oswald)", "Oswald", "Bebas Neue", "sans-serif"],
        bebas: ["var(--font-bebas)", "Bebas Neue", "Impact", "sans-serif"],
        oswald: ["var(--font-oswald)", "Oswald", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
