/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0E1117',
        surface: '#1E1E1E',
        accent: {
          DEFAULT: '#8B5CF6', // Purple
          dark: '#7C3AED',
          light: '#A78BFA',
        },
      },
    },
  },
  plugins: [],
}
