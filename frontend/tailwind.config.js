/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        steam: {
          blue: '#1b2838',
          darkBlue: '#171a21',
          lightBlue: '#66c0f4',
          gray: '#c7d5e0',
          accent: '#107c10'
        }
      }
    },
  },
  plugins: [],
}
