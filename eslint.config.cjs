// ESLint v9 - flat config (CommonJS)
const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  // Fichiers à ignorer
  { ignores: ["node_modules/", "coverage/", "dist/"] },

  // Base JS
  js.configs.recommended,

  // Règles projet Node
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        process: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Laisse les console.log en back (tu peux passer à 'warn' si tu veux)
      "no-console": "off"
    },
  },

  // Contexte tests
  {
    files: ["tests/**/*.js", "**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
];
