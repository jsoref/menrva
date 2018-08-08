module.exports = {
  preset: "jest-preset-menrva",
  setupFiles: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  setupTestFrameworkScriptFile: "<rootDir>/jest.setupFramework.js",
  testURL: "http://localhost",
};
