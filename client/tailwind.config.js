/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#6366f1',
          DEFAULT: '#4f46e5',
          dark: '#4338ca',
        },
        secondary: {
          light: '#f97316',
          DEFAULT: '#ea580c',
          dark: '#c2410c',
        },
        dark: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}