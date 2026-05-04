import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        deep: 'var(--deep)',
        body: 'var(--body)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-light': 'var(--accent-light)',
        gold: 'var(--gold)',
        'gold-light': 'var(--gold-light)',
        ivory: 'var(--white)',
        'admin-bg': 'var(--admin-app-bg)',
        'admin-surface': 'var(--admin-app-surface)',
        'admin-border': 'var(--admin-app-border)',
        'admin-muted': 'var(--admin-app-muted)',
        'admin-text': 'var(--admin-app-text)',
        'admin-accent': 'var(--admin-app-accent)',
      },
      boxShadow: {
        'admin-card': '0 1px 2px rgba(13, 11, 8, 0.04), 0 4px 24px rgba(13, 11, 8, 0.06)',
        'admin-sidebar': '1px 0 0 rgba(13, 11, 8, 0.06)',
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'serif'],
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        baskerville: ['var(--font-baskerville)', 'Georgia', 'serif'],
        jost: ['var(--font-jost)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-jost)', 'system-ui', 'sans-serif'],
      },
      spacing: {
        section: 'clamp(6rem, 12vw, 14rem)',
      },
      keyframes: {
        lineGrow: {
          '0%': { transform: 'scaleX(0)' },
          '50%': { transform: 'scaleX(1)' },
          '100%': { transform: 'scaleX(0)' },
        },
      },
      animation: {
        lineGrow: 'lineGrow 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
