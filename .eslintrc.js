/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
    "prettier",
    "plugin:promise/recommended",
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier", "promise"],
  root: true,
  ignorePatterns: [
    "node_modules",
    "/dist",
    "/client/dist",
    "vite.config.ts",
    "vitest.config.ts",
    "tailwind.config.js",
    "tsconfig*",
  ],
  rules: {
    "prettier/prettier": 2,
    "no-warning-comments": [1, { terms: ["todo", "fixme"] }],
    semi: ["error", "always"],
    "no-trailing-spaces": ["error", { skipBlankLines: true }],
    "vue/multi-word-component-names": 0,
  },
  overrides: [
    {
      files: ["src/pages/**/*.vue"],
      rules: {
        "vue/multi-word-component-names": "off",
      },
    },
  ],
};
