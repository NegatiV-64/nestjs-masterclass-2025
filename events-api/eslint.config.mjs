import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

const ignoreConfig = {
  ignores: ["eslint.config.mjs", "pretter.config.cjs"],
};

/** @type {import('eslint').Linter.Config} */
const coreConfig = {
  languageOptions: {
    globals: {
      ...globals.node,
    },
    sourceType: "commonjs",
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unsafe-argument": "warn",
    "@typescript-eslint/no-floating-promises": "off",
  },
};

export default defineConfig(
  ignoreConfig,
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  coreConfig,
);
