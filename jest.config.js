export default {
  testEnvironment: "node",
  testTimeout: 30000,
  verbose: true,
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};
