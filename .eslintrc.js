/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
    'plugin:promise/recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'prettier', 'promise'],
  root: true,
  ignorePatterns: [
    'node_modules',
    '/dist',
    '/client/dist',
    'vite.config.ts',
    'vitest.config.ts',
    'tailwind.config.js',
    'tsconfig*'
  ],
  rules: {
    'prettier/prettier': [
      2,
      { singleQuote: true, trailingComma: 'none', semi: false }
    ],
    'no-warning-comments': [1, { terms: ['todo', 'fixme'] }],
    'no-trailing-spaces': ['error', { skipBlankLines: true }],
    'comma-dangle': ['error', 'never'],
    semi: ['error', 'never'],
    'vue/multi-word-component-names': 0,
    'vue/attribute-hyphenation': ['error', 'never'],
    'vue/attributes-order': [
      'error',
      {
        order: [
          'CONDITIONALS',
          'EVENTS',
          'DEFINITION',
          'LIST_RENDERING',
          'RENDER_MODIFIERS',
          'GLOBAL',
          ['UNIQUE', 'SLOT'],
          'TWO_WAY_BINDING',
          'OTHER_DIRECTIVES',
          'OTHER_ATTR',
          'CONTENT'
        ],
        alphabetical: false
      }
    ]
  },
  overrides: [
    {
      files: ['src/pages/**/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off'
      }
    }
  ]
}
