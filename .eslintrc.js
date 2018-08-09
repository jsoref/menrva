module.exports = {
  env: {
    browser: true,
    node: true,
    jest: true,
    es6: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:react/recommended",
    "prettier",
    // "prettier/react",
  ],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2018,
  },
  rules: {
    "no-console": ["off"],
  },
};
