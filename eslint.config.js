import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        pdfjsLib: 'readonly',
        html2pdf: 'readonly',
        FileReader: 'readonly',
        AbortController: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
      eqeqeq: 'warn',
      'no-var': 'error',
      'prefer-const': 'warn',
    },
  },
  {
    files: ['backend/**/*.js'],
    languageOptions: {
      globals: {
        global: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
      },
    },
  },
];
