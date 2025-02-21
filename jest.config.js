export default {
  testEnvironment: "node",
  testTimeout: 30000,
  verbose: true,
  collectCoverage: false,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  transform: {
    "^.+\\.js$": ["babel-jest", { configFile: "./babel.config.cjs" }],
  },
  transformIgnorePatterns: [
    // This tells Jest to transform chalk and other ESM modules
    "node_modules/(?!(chalk|ansi-styles|supports-color))",
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "#ansi-styles": "<rootDir>/node_modules/ansi-styles/index.js",
    "#supports-color": "<rootDir>/node_modules/supports-color/index.js",
  },
};
