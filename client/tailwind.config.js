/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'], // For sleek, high-end headings
        playfair: ['Playfair Display', 'serif'], // For the western glam elegance
        inter: ['Inter', 'sans-serif'], // Clean body copy
      },
      colors: {
        'wh-pink': '#ff2a75', // Hot Pink Paris Hilton vibe
        'wh-dark': '#0f0f13', // Deep charcoal / leather tones
        'wh-card': '#1a1a20',
        'wh-gold': '#d4af37', // A touch of luxury western glam
      },
    },
  },
  plugins: [],
}
