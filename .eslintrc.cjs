module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: "eslint:recommended",
  overrides: [
    {
      env: {
        node: true,
        "jest/globals": true,
      },
      plugins: ["jest"],
      extends: ["plugin:jest/recommended"],
      files: ["**/*.test.js", "**/*.spec.js", "**/*.test.ts", "**/*.spec.ts"],
      parserOptions: {
        sourceType: "module",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {},
};
