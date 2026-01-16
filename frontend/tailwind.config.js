/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#40acd3',
        'brand-bg': '#d9eef6',
        'brand-text': '#2f3416',
        'brand-secondary': 'rgba(64, 172, 211, 0.2)',
        'brand-highlight': '#b0da54',
        'brand-dark': '#2f3416',
        // Figma Design Colors
        'Color': '#7b8d28ff',
        'Color-3': '#9cbc12',
        'Color-4': '#075b1f',
        'green-900': '#075b1f',
        'lime-300': '#b4c860',
      },
      fontFamily: {
        'road-rage': ['Road Rage', 'sans-serif'],
        'rubik-mono': ['Rubik Mono One', 'sans-serif'],
        'be-vietnam-pro': ['Be Vietnam Pro', 'sans-serif'],
        'braah-one': ['Braah One', 'sans-serif'],
      },
      boxShadow: {
        'hard': '8px 8px 0px #2f3416',
        'hard-sm': '4px 4px 0px #2f3416',
        'hard-md': '6px 6px 0px #2f3416',
      }
    },
  },
  plugins: [],
}
