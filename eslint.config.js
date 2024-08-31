// @ts-check

import { flatConfig } from "@linkedmink/eslint-config";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
  {
    ignores: ["test/app.e2e-spec.ts"],
  },
  ...flatConfig,
  {
    files: ["src/**/*.module.ts"],
    rules: {
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
  {
    files: ["types/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: ["types/tsconfig.json"],
      },
    },
  }
);
