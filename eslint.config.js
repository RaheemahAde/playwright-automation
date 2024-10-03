import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser'; // Import TypeScript parser
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import playwrightPlugin from 'eslint-plugin-playwright';

// eslint-disable-next-line no-unused-vars
const compat = new FlatCompat({
  baseDirectory: import.meta.url, // Ensure this is set correctly for resolving paths
});

export default [
  js.configs.recommended,
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'], // Add .tsx if using React with TypeScript
    languageOptions: {
      parser: typescriptParser,
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      prettier: prettierPlugin,
      playwright: playwrightPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
