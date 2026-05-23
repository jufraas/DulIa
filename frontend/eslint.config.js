import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    '.vite/**',
    'ReBrand/**',
    'node_modules/**',
    /** Prototipos kit Joufra (window.DK) — no son la app Vite/React Router */
    'src/pages/Landing.jsx',
    'src/pages/Results.jsx',
    'src/pages/Vacancies.jsx',
    'src/pages/Wizard.jsx',
    'src/components/components.jsx',
    'src/kit.css',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['vite.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
