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
        // Clean neutral palette
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        accent: {
          50: "#FEFCE8",
          100: "#FEF9C3",
          400: "#FACC15",
          500: "#EAB308",
          600: "#CA8A04",
        },
        esports: {
          navy: {
            DEFAULT: "#FFFFFF",
            dark: "#F8FAFC",
            card: "#FFFFFF",
            light: "#F1F5F9",
            border: "#E2E8F0",
            deep: "#F8FAFC",
          },
          orange: "#2563EB",
          gold: "#EAB308",
          silver: "#64748B",
          bronze: "#B45309",
          cream: "#0F172A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
        display: ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
        athletic: ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
