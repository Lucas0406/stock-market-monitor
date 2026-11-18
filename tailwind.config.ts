import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: "#FFFFFF",
          dark: "#09090B",
        },
        surface: {
          light: "#FAFAFA",
          dark: "#121215",
        },
        card: {
          light: "#FFFFFF",
          dark: "#18181B",
        },
        border: {
          light: "#E5E7EB",
          dark: "#27272A",
        },
        foreground: {
          light: "#111827",
          dark: "#FAFAFA",
        },
        muted: {
          light: "#6B7280",
          dark: "#A1A1AA",
        },
        accent: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;

