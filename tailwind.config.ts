import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0d1117",
        foreground: "#f0f6fc",
        card: {
          DEFAULT: "#161b22",
          hover: "#1c2128",
          subtle: "#0f141c",
        },
        border: {
          DEFAULT: "#30363d",
          muted: "#21262d",
        },
        muted: {
          DEFAULT: "#8b949e",
          foreground: "#6e7681",
        },
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        yes: {
          DEFAULT: "#10b981", // emerald-500
          light: "#34d399",
          dark: "#059669",
          bg: "#064e3b",
        },
        no: {
          DEFAULT: "#ef4444", // red-500
          light: "#f87171",
          dark: "#dc2626",
          bg: "#450a0a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
