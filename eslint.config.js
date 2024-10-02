// Import the necessary packages
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const typescriptParser = require('@typescript-eslint/parser');
const typescriptEslintPlugin = require('@typescript-eslint/eslint-plugin');
const prettierPlugin = require('eslint-plugin-prettier');
const playwrightPlugin = require('eslint-plugin-playwright');

// Set up FlatCompat to handle older configs
const compat = new FlatCompat({
  baseDirectory: __dirname, // Ensures paths are resolved correctly
});

module.exports = [
  js.configs.recommended, // Use the recommended JavaScript configuration from ESLint
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**'], // Ignore unnecessary directories
  },
  {
    // Target TypeScript files for linting
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser, // Use TypeScript parser
      sourceType: 'module', // Treat code as modules
      ecmaVersion: 'latest', // Support the latest ECMAScript version
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin, // TypeScript linting rules
      prettier: prettierPlugin, // Prettier integration
      playwright: playwrightPlugin, // Playwright-specific linting rules
    },
    rules: {
      'prettier/prettier': 'error', // Enforce Prettier formatting
      '@typescript-eslint/no-unused-vars': 'warn', // Warn about unused variables
    },
  },
];
