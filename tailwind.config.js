/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
       // Define dark mode specific colors if needed (optional)
       // colors: {
       //   'dark-bg': '#1a202c',
       //   'dark-card': '#2d3748',
       //   'dark-text': '#e2e8f0',
       // }
    
    },
  },
  plugins: [],
}
