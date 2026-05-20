import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ice-white': '#F4F6FB',
        'pure-white': '#FFFFFF',
        'frost': '#EEF1F8',
        'mist': '#DDE2EE',
        'calm-indigo': '#4A5BE0',
        'deep-indigo': '#3A4BC8',
        'soft-indigo': '#EEF0FC',
        'warm-terracotta': '#D95F3B',
        'deep-terracotta': '#C04E2C',
        'blush': '#FBF0EC',
        'midnight': '#1C1E2E',
        'slate-text': '#5A5F7A',
        'silver': '#6D7A99',
        'forest-green': '#1A7F5A',
        'owl-amber': '#D4880A',
        'crimson': '#C0392B',
        'ocean-blue': '#2E6DB4',
      },
      borderRadius: {
        'btn': '12px',
        'card': '16px',
      },
      fontFamily: {
        sans: ['var(--font-atkinson)', 'system-ui', 'sans-serif'],
      },
    },
  },
}

export default config
