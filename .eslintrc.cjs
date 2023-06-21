module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:svelte/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2019,
    extraFileExtensions: [".svelte"],
  },
  plugins: ['@typescript-eslint', 'simple-import-sort', 'prettier'],
  ignorePatterns: ['*.cjs'],
  overrides: [
    // { files: ['*.svelte'], processor: 'svelte3/svelte3' }
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      // Parse the `<script>` in `.svelte` as TypeScript by adding the following configuration.
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  ],
  // settings: {
  //   'svelte3/typescript': () => require('typescript'),
  // },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  rules: {
    'simple-import-sort/imports': ['error'],
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};
