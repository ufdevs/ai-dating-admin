/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F0C20",
        surface: "#161230",
        primary: "#FF007F",
        secondary: "#7F00FF",
      }
    },
  },
  plugins: [],
}
