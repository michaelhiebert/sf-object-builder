export default {
  displayName: "server",
  testEnvironment: "node",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!jsforce|csv-parse)"],
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  testMatch: ["<rootDir>/__tests__/**/*.test.js"],
  setupFiles: ["<rootDir>/jest.setup.js"],
};