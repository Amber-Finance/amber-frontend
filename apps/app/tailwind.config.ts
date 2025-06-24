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
        background: 'var(--background)',
        'primary-text': 'var(--primary-text)',
        'muted-text': 'var(--muted-text)',
        // Hero component colors
        'hero-border': 'var(--hero-border)',
        'hero-gradient-from': 'var(--hero-gradient-from)',
        'hero-gradient-to': 'var(--hero-gradient-to)',
        // Button colors
        'button-gradient-from': 'var(--button-gradient-from)',
        'button-gradient-via': 'var(--button-gradient-via)',
        'button-border-top': 'var(--button-border-top)',
        'button-border-x': 'var(--button-border-x)',
        'button-span-gradient': 'var(--button-span-gradient)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
