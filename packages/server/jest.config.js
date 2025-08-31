export default {
  preset: "ts-jest",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      useESM: true
    }],
  },
  testMatch: ["**/test/**/*.test.ts", "**/test/**/*.test.js", "**/tests/**/*.test.ts", "**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "src/**/*.js",
    "!src/**/*.test.ts",
    "!src/**/*.test.js",
    "!src/**/*.spec.ts",
    "!src/**/*.spec.js",
  ],
  moduleFileExtensions: ["ts", "js", "json"],
  moduleNameMapper: {
    "^schema$": "<rootDir>/../schema/src/index.ts",
    "^schema/(.*)$": "<rootDir>/../schema/src/$1",
  },
  testTimeout: 30000,
};
