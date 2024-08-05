import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coveragePathIgnorePatterns: ["cli/.*", ".*\\.module.ts"],
  coverageDirectory: "../coverage",
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

export default config;
