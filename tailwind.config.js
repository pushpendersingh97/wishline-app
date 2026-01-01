/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00a36c',
          hover: '#008f5a',
          light: '#00c47a',
        },
        secondary: {
          DEFAULT: '#004d40',
          hover: '#003d33',
          light: '#006b5c',
        },
        accent: {
          DEFAULT: '#55e68c',
          hover: '#4dd47a',
          light: '#6ef8a3',
        },
      },
    },
  },
  plugins: [],
}
