/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#fde6e7',
          200: '#fcc8ca',
          300: '#f9a8ab',
          400: '#F78A8C',
          500: '#f06b6e',
          600: '#e04548',
          700: '#c0313a',
          800: '#9e2d34',
          900: '#832b31',
        },
        accent1: {
          400: '#F48AB7',
          500: '#f06da3',
          600: '#e44f8e',
        },
        accent2: {
          400: '#DA7BB4',
          500: '#d060a3',
          600: '#c04592',
        },
        accent3: {
          400: '#C871C4',
          500: '#b85ab4',
          600: '#a843a4',
        },
        'neutral-light': '#F6F6F6',
        'neutral-dark': '#4A4A4A',
        'cyan-border': '#00F0FF',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
