import type { Config } from 'tailwindcss'

// Dizayn tokenlari CSS o'zgaruvchilar orqali (src/styles/tailwind.css).
// Brend ranglari (--brand-*) maktabning primaryColor idan dinamik hisoblanadi.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: token('brand-50'),
          100: token('brand-100'),
          200: token('brand-200'),
          300: token('brand-300'),
          400: token('brand-400'),
          500: token('brand-500'),
          600: token('brand-600'),
          700: token('brand-700'),
          800: token('brand-800'),
          900: token('brand-900'),
          DEFAULT: token('brand-500'),
          fg: token('brand-fg'),
        },
        'on-brand': token('on-brand'),
        page: token('page'),
        surface: token('surface'),
        'surface-muted': token('surface-muted'),
        border: token('border'),
        fg: token('fg'),
        'fg-muted': token('fg-muted'),
        success: token('success'),
        danger: token('danger'),
        gold: '#f5b301',
        silver: '#a3acb9',
        bronze: '#c77d3a',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px rgb(0 0 0 / 0.05)',
        pop: '0 10px 40px -10px rgb(var(--brand-500) / 0.45)',
      },
      keyframes: {
        slidein: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
        progress: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
      },
      animation: {
        slidein: 'slidein 0.5s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config
