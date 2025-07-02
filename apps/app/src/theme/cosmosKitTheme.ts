// Import the shared theme colors
import { grayColors } from '@/theme/themeColors'

// Define the Theme interface based on the CosmosKit theme structure
export interface Theme {
  overrides: Record<string, Record<string, Record<string, string>>>
  themeDefs: Array<{
    name: string
    vars: {
      colors: Record<string, string>
      radii: Record<string, string>
      [key: string]: Record<string, string>
    }
  }>
  customTheme?: string
  modalContentStyles?: Record<string, unknown>
}

// Define the theme overrides for CosmosKit
export const cosmosKitOverrides = {
  'connect-modal': {
    bg: {
      light: '#ffffff',
      dark: '#18181b',
    },
    shadow: {
      light: '0px 4px 12px rgba(24, 24, 27, 0.1)',
      dark: '0px 4px 12px rgba(24, 24, 27, 0.3)',
    },
  },
  'connect-modal-qr-code-shadow': {
    bg: {
      light: '#ffffff',
      dark: '#18181b',
    },
  },
  'connect-modal-wallet-button-sublogo': {
    bg: {
      light: '#ffffff',
      dark: '#18181b',
    },
    borderColor: {
      light: '#f4f4f5',
      dark: '#27272a',
    },
  },
  'connect-modal-head-title': {
    color: {
      light: '#3f3f46',
      dark: '#e4e4e7',
    },
  },
  'connect-modal-wallet-button': {
    bg: {
      light: '#f4f4f5',
      dark: '#27272a',
    },
    hoverBg: {
      light: '#e4e4e7',
      dark: '#3f3f46',
    },
    color: {
      light: '#3f3f46',
      dark: '#f4f4f5',
    },
    focusedShadow: {
      light: '0 0 0 2px #00786f',
      dark: '0 0 0 2px #00786f',
    },
    hoverShadow: {
      light: '0 0 0 2px #00786f',
      dark: '0 0 0 2px #00786f',
    },
  },
  button: {
    bg: {
      light: '#71717a',
      dark: '#71717a',
    },
    color: {
      light: '#ffffff',
      dark: '#ffffff',
    },
    hoverBg: {
      light: '#52525b',
      dark: '#52525b',
    },
    hoverColor: {
      light: '#ffffff',
      dark: '#ffffff',
    },
    focusedShadow: {
      light: '0 0 0 2px #00786f',
      dark: '0 0 0 2px #00786f',
    },
    hoverShadow: {
      light: '0 0 0 2px #00786f',
      dark: '0 0 0 2px #00786f',
    },
  },
  'connect-modal-qr-code': {
    bg: {
      light: '#ffffff',
      dark: '#18181b',
    },
  },
  'connect-modal-qr-code-loading': {
    bg: {
      light: '#ffffff',
      dark: '#18181b',
    },
  },
  'connect-modal-qr-code-error': {
    bg: {
      light: '#ffffff',
      dark: '#18181b',
    },
  },
  'clipboard-copy-text': {
    color: {
      light: '#3f3f46',
      dark: '#e4e4e7',
    },
    borderColor: {
      light: '#f4f4f5',
      dark: '#27272a',
    },
  },
  'connect-modal-install-button': {
    bg: {
      light: '#ffffff',
      dark: '#18181b',
    },
    borderColor: {
      light: '#f4f4f5',
      dark: '#27272a',
    },
    color: {
      light: '#3f3f46',
      dark: '#e4e4e7',
    },
    shadow: {
      light: '0px 4px 12px rgba(24, 24, 27, 0.1)',
      dark: '0px 4px 12px rgba(24, 24, 27, 0.3)',
    },
    focusedShadow: {
      light: '0 0 0 2px #00786f',
      dark: '0 0 0 2px #00786f',
    },
    hoverShadow: {
      light: '0 0 0 2px #00786f',
      dark: '0 0 0 2px #00786f',
    },
  },
  'connect-modal-qr-code-error-button': {
    bg: {
      light: '#71717a',
      dark: '#71717a',
    },
    color: {
      light: '#ffffff',
      dark: '#ffffff',
    },
    focusedShadow: {
      light: '0 0 0 2px #00786f',
      dark: '0 0 0 2px #00786f',
    },
    hoverShadow: {
      light: '0 0 0 2px #00786f',
      dark: '0 0 0 2px #00786f',
    },
  },
  'connect-modal-wallet-button-label': {
    color: {
      light: '#3f3f46',
      dark: '#e4e4e7',
    },
  },
}

// Define the theme definitions, matching Tailwind colors where possible
export const cosmosKitThemeDefs = [
  {
    name: 'btc-outpost-theme',
    vars: {
      colors: {
        background: '#ffffff',
        body: '#18181b',
        transparent: 'transparent',
        current: 'currentColor',
        ...grayColors,
      },
      radii: {
        base: '0.375rem',
        md: '0.5rem',
      },
    },
  },
]

// Helper to get the CosmosKit theme
export const getCosmosKitTheme = (): Theme => {
  return {
    overrides: cosmosKitOverrides,
    themeDefs: cosmosKitThemeDefs,
    customTheme: 'btc-outpost-theme',
    modalContentStyles: {},
  }
}
