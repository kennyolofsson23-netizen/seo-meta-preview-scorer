import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  {
    // Ignore generated files and build artifacts
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'build/**', 'coverage/**'],
  },
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      'no-unused-vars': 'off',
      // Allow <img> in preview/embed components — we need raw img for SERP simulation
      '@next/next/no-img-element': 'off',
    },
  },
]

export default eslintConfig
