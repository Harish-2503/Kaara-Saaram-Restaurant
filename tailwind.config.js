/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50:  '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d0d8',
          300: '#f4aab7',
          400: '#ec7589',
          500: '#e04d67',
          600: '#cc2d4e',
          700: '#ac2040',
          800: '#8f1e3b',
          900: '#7a1d38',
          950: '#500d1e',
          DEFAULT: '#7a1d38',
          deep: '#500d1e',
          rich: '#6b1a33',
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#c9962a',
          light: '#e8b84b',
          pale:  '#f5d98c',
          dark:  '#a07820',
        },
        cream: {
          DEFAULT: '#faf6ef',
          warm:    '#f5ede0',
          deep:    '#ede0cc',
          text:    '#c8b89a',
        },
        charcoal: {
          DEFAULT: '#2a2a2a',
          light:   '#3d3d3d',
          mid:     '#1e1e1e',
          deep:    '#141414',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Lato"', 'system-ui', 'sans-serif'],
        tamil:   ['"Noto Serif Tamil"', '"Latha"', 'serif'],
        accent:  ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      backgroundImage: {
        'gold-gradient':   'linear-gradient(135deg, #c9962a 0%, #e8b84b 50%, #a07820 100%)',
        'maroon-gradient': 'linear-gradient(135deg, #500d1e 0%, #7a1d38 60%, #8f1e3b 100%)',
        'dark-gradient':   'linear-gradient(180deg, #141414 0%, #2a2a2a 100%)',
        'hero-overlay':    'linear-gradient(to bottom, rgba(20,0,8,0.55) 0%, rgba(80,13,30,0.75) 100%)',
        'card-overlay':    'linear-gradient(to top, rgba(20,0,8,0.9) 0%, transparent 60%)',
      },
      boxShadow: {
        'gold':      '0 4px 24px rgba(201,150,42,0.25)',
        'gold-lg':   '0 8px 48px rgba(201,150,42,0.35)',
        'maroon':    '0 4px 24px rgba(122,29,56,0.35)',
        'maroon-lg': '0 8px 48px rgba(122,29,56,0.5)',
        'luxury':    '0 16px 64px rgba(0,0,0,0.4)',
      },
      animation: {
        'shimmer':      'shimmer 2.5s infinite',
        'float':        'float 4s ease-in-out infinite',
        'fade-in-up':   'fadeInUp 0.7s ease forwards',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0.6 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
