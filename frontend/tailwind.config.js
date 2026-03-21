/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nge: {
          black:  '#0A0A0F',
          navy:   '#0D0D1A',
          dark:   '#12121F',
          orange: '#FF6600',
          cyan:   '#00FFFF',
          red:    '#FF0033',
          yellow: '#FFD700',
          green:  '#00FF41',
          gray:   '#666680',
        }
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Rajdhani', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
