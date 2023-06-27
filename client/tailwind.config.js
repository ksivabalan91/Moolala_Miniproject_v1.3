/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,js}"
  ],
  theme: {
    extend: {
      fontFamily:{
        DM: ['DM Serif Text', 'serif'],
        Noto: ['Noto Serif JP', 'serif'],
      }
    },
  },
  plugins: [],
}

