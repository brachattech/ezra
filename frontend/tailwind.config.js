/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,css}",
    "./pages/**/*.{js,ts,jsx,tsx,css}",
    "./components/**/*.{js,ts,jsx,tsx,css}",
    "./app/**/*.{js,ts,jsx,tsx,css}",
    "./styles/**/*.{css}"
  ],
  safelist: [
    'bg-purple-900',
    'bg-purple-800',
    'bg-purple-700',
    'bg-purple-600',
    'text-white',
    'placeholder-purple-300',
    'text-purple-300'
  ],
  theme: {
    extend: {},
  },
  plugins: []
}
