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
        'admin-bg': '#f4f2ef',
        'admin-surface': '#ffffff',
        'admin-border': 'rgba(13, 11, 8, 0.08)',
        'admin-muted': '#6f6a64',
        'admin-text': '#1c1917',
        'admin-accent': '#6b2737',
      },
      boxShadow: {
        'admin-card': '0 1px 2px rgba(13, 11, 8, 0.04), 0 4px 24px rgba(13, 11, 8, 0.06)',
        'admin-sidebar': '1px 0 0 rgba(13, 11, 8, 0.06)',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        jost: ['var(--font-jost)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-jost)', 'system-ui', 'sans-serif'],
      },
      spacing: {
        section: 'clamp(6rem, 12vw, 14rem)',
      },
    },
  },
  plugins: [],
}
export default config
