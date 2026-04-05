// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: { 400: '#4DD9C0', 500: '#36CEB4', 600: '#29B09A' },
        yellow: { 400: '#FFD84D', 500: '#FFC800', 600: '#E6B400' },
        navy: { 800: '#1a2340', 900: '#111827' },
      },
      fontFamily: {
        kanit: ['Kanit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
