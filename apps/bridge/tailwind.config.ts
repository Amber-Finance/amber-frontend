import type { Config } from 'tailwindcss'

const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      screens: {
        md: '850px', // Override default md breakpoint to 850px
      },
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
        'gradient-start': 'var(--gradient-start)',
        'gradient-end': 'var(--gradient-end)',
      },
      fontFamily: {
        sans: ['SourceSans', 'sans-serif'],
        funnel: ['Funnel', 'sans-serif'],
        mono: ['SF Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
