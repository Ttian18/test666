export default {
  preset: 'ts-jest',
  testEnvironment: "node",
  transform: {
    '^.+\.ts$': 'ts-jest',
  },
  testMatch: ["**/tests/**/*.test.js", "**/tests/**/*.spec.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/**/*.spec.js",
  ],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  moduleFileExtensions: ["js", "json", "ts"],
  moduleNameMapper: {
    '^@your-project/schema$': '<rootDir>/../schema/dist/index.js',
  },
  testTimeout: 30000,
};
