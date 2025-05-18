import pkg from 'globals';
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import { fileURLToPath } from 'url';
const { browser, node } = pkg;
import { dirname, resolve } from 'path';

// Import root configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootConfigPath = resolve(__dirname, '../../eslint.config.mjs');
const rootConfigModule = await import(rootConfigPath);
const rootConfig = rootConfigModule.default;

// Import Next.js config
const nextjsConfig = nextPlugin.configs;

// Define plugins separately to avoid duplication
const reactPlugins = {
  react: reactPlugin,
  'react-hooks': reactHooksPlugin
};

const nextAppConfig = [
  // Base JS config
  js.configs.recommended,

  // Global variables and basic rules
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...browser,
        ...node,
        NodeJS: 'readonly',
        React: 'readonly',
        google: 'readonly',
        gtag: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'error'
    }
  },

  // React config
  {
    files: ['**/*.jsx', '**/*.tsx'],
    plugins: reactPlugins,
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },

  // Next.js config - explicitly using the plugin as expected by Next.js
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      ...nextjsConfig.recommended.rules,
      ...nextjsConfig['core-web-vitals'].rules
    }
  },

  // TypeScript config
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'no-unused-vars': ['warn', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'args': 'none',
        'vars': 'all',
        'ignoreRestSiblings': true
      }]
    }
  },

  // Pages Router Configuration
  {
    files: ['pages/**/*.js', 'pages/**/*.jsx'],
    plugins: {
      react: reactPlugin,
      '@next/next': nextPlugin
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...browser,
        ...node,
        React: 'readonly',
        google: 'readonly'
      }
    },
    rules: {
      ...nextjsConfig.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off'
    }
  }
];

export default [...rootConfig, ...nextAppConfig];