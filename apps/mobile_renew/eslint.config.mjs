import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactNative from 'eslint-plugin-react-native';

import pluginBoundaries from 'eslint-plugin-boundaries';
import pluginImport from 'eslint-plugin-import';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginUnusedImports from 'eslint-plugin-unused-imports';

import configPrettier from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'eslint.config.mjs',
      'dist/',
      'build/',
      'coverage/',
      'android/',
      'ios/',
      '*.min.*',
      'supabase',
      '.#',
      'babel.config.js',
      'metro.config.js',
      '.pnpm/',
      '**/.pnpm/**',
      '**/node_modules/**',
    ],
  }, 

  js.configs.recommended,

  configPrettier,

  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: false,
        ecmaFeatures: { jsx: true },
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.es2021,
        ...globals.node,
        ...globals.jest,
        __DEV__: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        XMLHttpRequest: 'readonly',
        ErrorUtils: 'readonly',
      },
    },

    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'react-native': pluginReactNative,
      import: pluginImport,
      'simple-import-sort': pluginSimpleImportSort,
      'unused-imports': pluginUnusedImports,
      boundaries: pluginBoundaries,
      prettier: pluginPrettier,
    },

    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'boundaries/elements': [
        { type: 'shared', pattern: 'src/shared/**' },
        { type: 'entities', pattern: 'src/entities/**' },
        { type: 'features', pattern: 'src/features/**' },
        { type: 'pages', pattern: 'src/pages/**' },
        { type: 'app', pattern: 'src/app/**' },
      ],
    },

    rules: {
      'react/jsx-no-target-blank': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react/no-unknown-property': 'error',
      'react/jsx-key': 'error',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Native
      'react-native/no-inline-styles': 'off',
      'react-native/no-unused-styles': 'warn',
      'react-native/no-color-literals': 'off',

      // React 일반
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-no-bind': ['warn', { ignoreRefs: true, allowArrowFunctions: true }],

      // Import 정렬 및 최적화
      'import/order': 'off',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'import/no-unresolved': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
      'import/no-cycle': ['error', { maxDepth: 2 }],

      // FSD 아키텍처 경계 설정
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'shared', allow: ['shared'] },
            { from: 'entities', allow: ['shared', 'entities'] },
            { from: 'features', allow: ['shared', 'entities', 'features'] },
            { from: 'pages', allow: ['shared', 'entities', 'features', 'pages'] },
            { from: 'app', allow: ['shared', 'entities', 'features', 'pages', 'app'] },
          ],
        },
      ],

      // 기타
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-redeclare': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off',
    },
  },
);
