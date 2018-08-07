module.exports = {
  env: {
    browser: true,
    module: true,
    es6: true
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    "no-console": ["off"]
  }
};
