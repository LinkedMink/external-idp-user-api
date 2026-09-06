// @ts-check

import { flatConfig } from "@linkedmink/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig(
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
);
