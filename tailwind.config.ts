import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F7F3EC',
        surface: '#EDE8DF',
        deep: '#0D0B08',
        body: '#2A2520',
        muted: '#8A7F72',
        accent: '#6B2737',
        'accent-light': '#A03848',
        gold: '#8B6914',
        'gold-light': '#C9A84C',
        ivory: '#FDFAF5',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        baskerville: ['var(--font-baskerville)', 'Georgia', 'serif'],
        jost: ['var(--font-jost)', 'system-ui', 'sans-serif'],
      },
      spacing: {
        section: 'clamp(6rem, 12vw, 14rem)',
      },
    },
  },
  plugins: [],
}
export default config
