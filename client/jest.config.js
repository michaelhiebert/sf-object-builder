export default {
  displayName: "client",
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.[jt]sx?$": [
      "babel-jest",
      { 
        presets: ["@babel/preset-env", "@babel/preset-react"],
        targets: { node: 'current' }
      },
    ],
  },
  extensionsToTreatAsEsm: [".jsx"],
  moduleDirectories: ["node_modules", "../node_modules"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testMatch: ["<rootDir>/__tests__/**/*.test.jsx"],
  setupFiles: ["<rootDir>/jest.setup.js"],
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
  
  // Important for ESM
  transformIgnorePatterns: [
    "/node_modules/(?!react-router|react-router-dom|@remix-run).+\\.js$"
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    "<rootDir>/components/**/*.{js,jsx}",
    "!<rootDir>/components/api/**",
    "!**/node_modules/**"
  ],
  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "<rootDir>/coverage",
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    }
  }
};
