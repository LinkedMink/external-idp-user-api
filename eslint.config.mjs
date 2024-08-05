// @ts-check

import eslint from "@eslint/js";
// import globals from "globals";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
  {
    ignores: ["coverage/**", "dist/**"],
  },
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    extends: [eslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/*.mjs"],
    languageOptions: {
      sourceType: "module",
    },
  },
  {
    files: ["**/*.ts"],
    extends: [eslint.configs.recommended, ...tsEslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      parserOptions: {
        project: ["tsconfig.json"],
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["src/**/*.ts"],
    ignores: ["src/**/*.spec.ts", "src/cli/**", "src/index.ts"],
    // TODO incorrect type checking for eslint only "Unsafe call of an `error` type typed value."
    // Uncommented this line, but the CLI is still not giving same result as VS Code plugin, why?
    extends: [eslint.configs.recommended, ...tsEslint.configs.strictTypeChecked],
    languageOptions: {
      ecmaVersion: 2022,
      parserOptions: {
        project: ["src/tsconfig.json"],
      },
    },
    rules: {
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowAny: false,
          allowArray: false,
          allowBoolean: true,
          allowNever: false,
          allowNullish: true,
          allowNumber: true,
          allowRegExp: false,
        },
      ],
    },
  },
  {
    files: ["src/**/*.module.ts"],
    rules: {
      "@typescript-eslint/no-extraneous-class": "off",
    },
  }
);
