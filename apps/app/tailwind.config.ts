import type { Config } from 'tailwindcss'

const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      fontSize: {
        xxs: ['0.625rem', { lineHeight: '0.75rem' }], // 10px with 12px line height
      },
      keyframes: {
        'rotate-border': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'rotate-border': 'rotate-border 15s linear infinite',
      },
      colors: {
        'gradient-start': 'rgb(var(--gradient-start))',
        'gradient-end': 'rgb(var(--gradient-end))',
      },
      fontFamily: {
        sans: ['var(--font-space-mono)', 'monospace'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
