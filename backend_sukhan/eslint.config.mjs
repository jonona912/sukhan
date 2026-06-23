import globals from 'globals' // so that eslint doesn't complain about node globals like `require` and `module`
import js from '@eslint/js' // the recommended ESLint rules for JavaScript, which we extend and customize below
import stylisticJs from '@stylistic/eslint-plugin' // the Stylistic ESLint plugin, which provides rules for enforcing code style and formatting in JavaScript files

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
      ecmaVersion: 'latest',
    },
    plugins: { 
      '@stylistic/js': stylisticJs,
    },
    rules: { 
      '@stylistic/js/indent': ['error', 2],
      '@stylistic/js/linebreak-style': ['error', 'unix'],
      '@stylistic/js/quotes': ['error', 'single'],
      '@stylistic/js/semi': ['error', 'never'],
      'no-console': 'off', // or 'warn' / 'error' to trigger reports
    }, 
  },
  { 
    ignores: ['dist/**'], 
  },
]
