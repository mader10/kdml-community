/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',
      },
      fontFamily: {
        arabic: ['Noto Naskh Arabic', 'serif'],
        malayalam: ['Manjari', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}; 