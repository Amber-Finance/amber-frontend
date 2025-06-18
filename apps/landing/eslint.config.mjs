import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: [
      "tailwind.config.js",
      "tailwind.config.ts",
      "src/theme/**/*.js",
      "src/theme/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  {
    ignores: ["src/utils/health_computer/*"],
  },
];

export default eslintConfig;
