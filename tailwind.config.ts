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
          50: "#eff6ff",
          100: "#dbeafe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        yes: {
          DEFAULT: "#3b82f6", // blue-500
          light: "#60a5fa",
          dark: "#2563eb",
          bg: "#1e3a8a",
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
