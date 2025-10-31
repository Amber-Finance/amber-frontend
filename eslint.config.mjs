import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    files: ['apps/**/*.{js,jsx,ts,tsx}', '*.{js,jsx,ts,tsx}'],
    rules: {
      // React/JSX rules
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      // Enforce alias imports instead of relative
      'no-restricted-imports': [
        'error',
        {
          patterns: ['./*', '../*'],
        },
      ],
    },
  },
  {
    files: [
      'apps/*/tailwind.config.js',
      'apps/*/tailwind.config.ts',
      'tailwind.config.js',
      'tailwind.config.ts',
      '**/theme/**/*.js',
      '**/theme/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['apps/*/next.config.js', 'apps/*/next.config.ts', 'next.config.js', 'next.config.ts'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.turbo/**',
      'dist/**',
      'build/**',
      '**/health_computer/*',
      '**/.next/**',
      '**/node_modules/**',
      '**/dist/**',
    ],
  },
]

export default eslintConfig
