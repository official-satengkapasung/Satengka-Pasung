/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./login.html",
    "./register.html",
    "./src/**/*.{js,html}"
  ],
  theme: {
    extend: {
      colors: {
        satengka: {
          50: '#f0fcfc',
          100: '#def9fa',
          200: '#a3f6f8',
          300: '#6deaf0',
          400: '#3cd2dc',
          500: '#2ca3ab',
          600: '#23848b',
          700: '#1c6a70',
          800: '#17565b',
          900: '#14474b',
          950: '#0a2a2d'
        },
        emerald: {
          50: '#f0fcfc',
          100: '#def9fa',
          200: '#a3f6f8',
          300: '#6deaf0',
          400: '#3cd2dc',
          500: '#2ca3ab',
          600: '#23848b',
          700: '#1c6a70',
          800: '#17565b',
          900: '#14474b',
          950: '#0a2a2d'
        }
      }
    }
  },
  plugins: [],
};
