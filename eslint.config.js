import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '**/node_modules', 'server/data', 'api']),

  // Browser code: the React app.
  {
    files: ['src/**/*.{js,jsx}'],
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

  // Server code: CommonJS on Node. Previously linted with the browser config,
  // which flagged every require/module/process as no-undef and buried the real
  // findings under a few hundred false positives.
  {
    files: ['server/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: { ...globals.node },
      sourceType: 'commonjs',
      ecmaVersion: 2023,
    },
  },

  // The prerender entry is a Node-side module, never loaded by the browser, so
  // Fast Refresh's component-export rule does not apply to it.
  {
    files: ['src/prerender-entry.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  // Build/tooling config files run on Node too.
  {
    files: ['*.config.js', 'vite.config.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
])
