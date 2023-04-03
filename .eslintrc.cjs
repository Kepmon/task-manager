/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin: vitest-globals/recommended',
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    'airbnb-base'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
    semi: ['error', 'never'],
    'no-trailing-spaces': ['error', { skipBlankLines: true }],
    'comma-dangle': ['error', 'never']
  }
}
