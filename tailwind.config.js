/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        blueprint: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        }
      }
    }
  },
  plugins: [],
}
