import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: { DEFAULT: '#007BFF', dark: '#0069D9' },
        ink: '#E9ECEF',
        muted: '#ADB5BD',
        page: '#212529',
        surface: '#2B3036',
        line: 'rgba(255, 255, 255, 0.1)',
        'line-strong': '#6C757D',
        success: '#28A745',
        warning: '#FFC107',
        danger: '#DC3545',
        info: '#17A2B8',
      },
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
    },
  },
  plugins: [],
}

export default config