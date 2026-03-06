import { defineConfig } from 'eslint-define-config';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default defineConfig([
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'array-bracket-spacing': ['error', 'never'],
      'arrow-body-style': ['error', 'as-needed'],
      'comma-dangle': ['error', 'always-multiline'],
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'eol-last': ['error', 'always'],
      'keyword-spacing': 'warn',
      'linebreak-style': ['warn', 'unix'],
      'object-curly-spacing': ['warn', 'always'],
      quotes: ['warn', 'single'],
      'no-console': 'warn',
      'no-else-return': 'error',
      'no-empty': 'warn',
      'no-extra-semi': 'error',
      'no-multiple-empty-lines': ['warn', { max: 1 }],
      'no-multi-spaces': ['warn'],
      'no-trailing-spaces': 'warn',
      'no-use-before-define': 'error',
      'react/self-closing-comp': ['error', { component: true, html: true }],
      semi: ['error', 'always'],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]);
