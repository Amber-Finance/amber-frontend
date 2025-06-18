import type { Config } from "tailwindcss";
import { grayColors } from "./src/theme/themeColors";

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      fontSize: {
        xxs: ["0.625rem", { lineHeight: "0.75rem" }], // 10px with 12px line height
      },
      colors: {
        black: {
          DEFAULT: "#0E111D", // Aave's background
          50: "#F2F2F2",
          100: "#E6E6E6",
          200: "#CCCCCC",
          300: "#B3B3B3",
          400: "#999999",
          500: "#808080",
          600: "#666666",
          700: "#4D4D4D",
          800: "#333333",
          900: "#1A1A1A",
        },
        // Use the shared gray colors
        gray: {
          50: grayColors.gray50,
          100: grayColors.gray100,
          200: grayColors.gray200,
          300: grayColors.gray300,
          400: grayColors.gray400,
          500: grayColors.gray500,
          600: grayColors.gray600,
          700: grayColors.gray700,
          800: grayColors.gray800,
          900: grayColors.gray900,
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
