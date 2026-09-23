import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

const eslintConfig = defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs["recommended-latest"],
  reactRefresh.configs.vite,
  prettierConfig,
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  globalIgnores([
    "dist/**",
    "build/**",
    // Firebase Functions（有自己的 tsconfig，不由前端 ESLint 管）
    "functions/**",
  ]),
]);

export default eslintConfig;
