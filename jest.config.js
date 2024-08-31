// @ts-check

/**
 * @type {import("ts-jest").JestConfigWithTsJest}
 */
export default {
  moduleFileExtensions: ["js", "json", "ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "@linkedmink/eip-4361-parser/zod":
      "<rootDir>/node_modules/@linkedmink/eip-4361-parser/dist/cjs/zod/index.js",
  },
  testMatch: ["<rootDir>/test/**/*.(spec|test).ts"],
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: "test/tsconfig.json",
      },
    ],
  },
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coveragePathIgnorePatterns: [".*\\.module.ts"],
  coverageDirectory: "./coverage",
  // coverageThreshold: {
  //   global: {
  //     branches: 75,
  //     functions: 75,
  //     lines: 75,
  //     statements: 75,
  //   },
  // },
  reporters: [["github-actions", { silent: false }], "summary"],
  testEnvironment: "node",
};
